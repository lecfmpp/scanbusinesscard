import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    console.log('Slack callback received, code present:', !!code, 'state present:', !!state);

    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';

    if (error) {
      console.error('Slack OAuth error:', error);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Missing authorization code`);
    }

    // Decode state to get user ID
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch (e) {
      console.error('Invalid state:', e);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Invalid state`);
    }

    const userId = stateData.userId;
    if (!userId) {
      console.error('No user ID in state');
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Invalid user`);
    }

    console.log('Processing callback for user:', userId);

    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!clientId || !clientSecret) {
      console.error('Slack credentials not configured');
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Slack not configured`);
    }

    const redirectUri = `${supabaseUrl}/functions/v1/slack-callback`;

    console.log('Exchanging code for tokens...');
    
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenData.ok) {
      console.error('Token exchange failed:', tokenData.error);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(tokenData.error || 'Failed to connect')}`);
    }

    console.log('Tokens received for team:', tokenData.team?.name);

    // Store tokens in database using service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'slack',
        access_token: tokenData.access_token,
        refresh_token: null, // Slack doesn't use refresh tokens by default
        expires_at: null, // Slack tokens don't expire
        extra_data: { 
          team_id: tokenData.team?.id,
          team_name: tokenData.team?.name,
          bot_user_id: tokenData.bot_user_id,
        },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Failed to save connection`);
    }

    console.log('Slack integration saved successfully');
    return Response.redirect(`${frontendUrl}/dashboard/integrations?success=slack`);
  } catch (error) {
    console.error('Callback error:', error);
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';
    return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Connection failed`);
  }
});
