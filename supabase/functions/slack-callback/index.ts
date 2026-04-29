import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const NATIVE_SCHEME = 'scanbusinesscard://oauth-callback';

function buildRedirect(platform: string, frontendUrl: string, path: string, query: string) {
  // path begins with '/'; query begins with '?' or is ''
  if (platform === 'ios') {
    // Encode the intended path so the app can route appropriately
    const sep = query ? '&' : '?';
    return `${NATIVE_SCHEME}${query}${sep}path=${encodeURIComponent(path)}`;
  }
  return `${frontendUrl}${path}${query}`;
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';

    if (error) {
      console.error('Slack OAuth error:', error);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Connection+failed`);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Missing+authorization+code`);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate state against database (prevents forgery)
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('user_id, platform')
      .eq('state', state)
      .eq('provider', 'slack')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      console.error('Invalid or expired OAuth state');
      // Clean up expired states
      await supabase.from('oauth_states').delete().lt('expires_at', new Date().toISOString());
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Invalid+or+expired+session`);
    }

    const userId = stateRecord.user_id;
    const platform = stateRecord.platform || 'web';

    // Delete used state immediately
    await supabase.from('oauth_states').delete().eq('state', state);

    console.log('Processing callback for user:', userId);

    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    const clientSecret = Deno.env.get('SLACK_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('Slack credentials not configured');
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Integration+not+configured'));
    }

    const redirectUri = `${supabaseUrl}/functions/v1/slack-callback`;

    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Failed+to+connect'));
    }

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'slack',
        access_token: tokenData.access_token,
        refresh_token: null,
        expires_at: null,
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
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Failed+to+save+connection'));
    }

    console.log('Slack integration saved successfully');
    return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/leads', '?success=slack'));
  } catch (error) {
    console.error('Callback error:', error);
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';
    return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Connection+failed`);
  }
});
