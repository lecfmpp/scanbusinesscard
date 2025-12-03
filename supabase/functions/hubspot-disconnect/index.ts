import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    console.log('Disconnecting HubSpot for user:', user.id);

    // Get integration to optionally revoke token
    const { data: integration } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('provider', 'hubspot')
      .maybeSingle();

    // Try to revoke token with HubSpot (best effort)
    if (integration?.access_token) {
      try {
        await fetch(`https://api.hubapi.com/oauth/v1/refresh-tokens/${integration.access_token}`, {
          method: 'DELETE',
        });
        console.log('HubSpot token revoked');
      } catch (e) {
        console.log('Token revocation failed (non-critical):', e);
      }
    }

    // Delete integration from database
    const { error: deleteError } = await supabase
      .from('integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'hubspot');

    if (deleteError) {
      console.error('Failed to delete integration:', deleteError);
      return new Response(
        JSON.stringify({ error: 'Failed to disconnect' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('HubSpot disconnected successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error disconnecting HubSpot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to disconnect' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
