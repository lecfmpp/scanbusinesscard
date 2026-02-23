import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = origin.endsWith('.lovable.app') || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://scanbusinesscard.lovable.app',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    if (!clientId) {
      console.error('SLACK_CLIENT_ID not configured');
      return new Response(
        JSON.stringify({ error: 'Integration not configured. Please try again later.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const redirectUri = `${supabaseUrl}/functions/v1/slack-callback`;
    const scopes = ['channels:read', 'chat:write', 'users:read'];
    const state = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
    
    const authUrl = new URL('https://slack.com/oauth/v2/authorize');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', scopes.join(','));
    authUrl.searchParams.set('state', state);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start connection. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
