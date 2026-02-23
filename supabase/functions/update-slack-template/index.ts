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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const { template } = await req.json();
    if (typeof template !== 'string' || template.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid template' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to read and update integrations table (tokens protected)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: integration, error: fetchError } = await serviceSupabase
      .from('integrations')
      .select('extra_data')
      .eq('user_id', user.id)
      .eq('provider', 'slack')
      .single();

    if (fetchError || !integration) {
      return new Response(
        JSON.stringify({ error: 'Slack not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentExtraData = (integration.extra_data as Record<string, unknown>) || {};

    const { error: updateError } = await serviceSupabase
      .from('integrations')
      .update({
        extra_data: {
          ...currentExtraData,
          message_template: template,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('provider', 'slack');

    if (updateError) {
      console.error('Failed to update template:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to save template' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating slack template:', error);
    return new Response(
      JSON.stringify({ error: 'An error occurred. Please try again.' }),
      { status: 500, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } }
    );
  }
});
