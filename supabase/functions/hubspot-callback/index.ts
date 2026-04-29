import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const NATIVE_SCHEME = 'scanbusinesscard://oauth-callback';

function buildRedirect(platform: string, frontendUrl: string, path: string, query: string) {
  if (platform === 'ios') {
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
      console.error('HubSpot OAuth error:', error);
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
      .eq('provider', 'hubspot')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (stateError || !stateRecord) {
      console.error('Invalid or expired OAuth state');
      await supabase.from('oauth_states').delete().lt('expires_at', new Date().toISOString());
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Invalid+or+expired+session`);
    }

    const userId = stateRecord.user_id;
    const platform = stateRecord.platform || 'web';

    // Delete used state immediately
    await supabase.from('oauth_states').delete().eq('state', state);

    console.log('Processing callback for user:', userId);

    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.error('HubSpot credentials not configured');
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Integration+not+configured'));
    }

    const redirectUri = `${supabaseUrl}/functions/v1/hubspot-callback`;

    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenResponse.status);
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Failed+to+connect'));
    }

    const tokens = await tokenResponse.json();

    // Get HubSpot portal ID
    const accessInfoResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + tokens.access_token);
    let hubId = null;
    if (accessInfoResponse.ok) {
      const accessInfo = await accessInfoResponse.json();
      hubId = accessInfo.hub_id;
    }

    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const { error: upsertError } = await supabase
      .from('integrations')
      .upsert({
        user_id: userId,
        provider: 'hubspot',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        extra_data: { hub_id: hubId },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,provider',
      });

    if (upsertError) {
      console.error('Failed to store tokens:', upsertError);
      return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/integrations', '?error=Failed+to+save+connection'));
    }

    console.log('HubSpot integration saved successfully');
    return Response.redirect(buildRedirect(platform, frontendUrl, '/dashboard/leads', '?success=hubspot'));
  } catch (error) {
    console.error('Callback error:', error);
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';
    return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Connection+failed`);
  }
});
