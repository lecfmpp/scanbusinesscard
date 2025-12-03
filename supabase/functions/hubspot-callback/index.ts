import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    console.log('HubSpot callback received, code present:', !!code, 'state present:', !!state);

    // Get the frontend URL for redirects
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';

    if (error) {
      console.error('HubSpot OAuth error:', error, errorDescription);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=${encodeURIComponent(errorDescription || error)}`);
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

    // Exchange code for tokens
    const clientId = Deno.env.get('HUBSPOT_CLIENT_ID');
    const clientSecret = Deno.env.get('HUBSPOT_CLIENT_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!clientId || !clientSecret) {
      console.error('HubSpot credentials not configured');
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=HubSpot not configured`);
    }

    const redirectUri = `${supabaseUrl}/functions/v1/hubspot-callback`;

    console.log('Exchanging code for tokens...');
    
    const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', tokenResponse.status, errorText);
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Failed to connect to HubSpot`);
    }

    const tokens = await tokenResponse.json();
    console.log('Tokens received, expires_in:', tokens.expires_in);

    // Get HubSpot portal ID (hub_id) for reference
    const accessInfoResponse = await fetch('https://api.hubapi.com/oauth/v1/access-tokens/' + tokens.access_token);
    let hubId = null;
    if (accessInfoResponse.ok) {
      const accessInfo = await accessInfoResponse.json();
      hubId = accessInfo.hub_id;
      console.log('HubSpot portal ID:', hubId);
    }

    // Store tokens in database using service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
      return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Failed to save connection`);
    }

    console.log('HubSpot integration saved successfully');
    return Response.redirect(`${frontendUrl}/dashboard/integrations?success=hubspot`);
  } catch (error) {
    console.error('Callback error:', error);
    const frontendUrl = Deno.env.get('FRONTEND_URL') || 'https://scanbusinesscard.lovable.app';
    return Response.redirect(`${frontendUrl}/dashboard/integrations?error=Connection failed`);
  }
});
