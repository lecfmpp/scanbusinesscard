import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = origin === 'https://scanbusinesscard.com' || origin.endsWith('.scanbusinesscard.com') || origin.endsWith('.netlify.app') || origin.endsWith('.lovable.app') || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://scanbusinesscard.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

interface Lead {
  id: string;
  full_name: string;
  job_title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
}

interface SlackChannel {
  id: string;
  name: string;
}

const DEFAULT_TEMPLATE = `📇 *New Lead from ScanBusinessCard*

👤 *Name:* {name}
💼 *Title:* {title}
🏢 *Company:* {company}
📧 *Email:* {email}
📱 *Phone:* {phone}
🌐 *Website:* {website}`;

function formatMessage(template: string, lead: Lead): string {
  return template
    .replace(/{name}/g, lead.full_name || 'N/A')
    .replace(/{title}/g, lead.job_title || 'N/A')
    .replace(/{company}/g, lead.company || 'N/A')
    .replace(/{email}/g, lead.email || 'N/A')
    .replace(/{phone}/g, lead.phone || 'N/A')
    .replace(/{website}/g, lead.website || 'N/A');
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

    const body = await req.json();
    const { leadIds, channelId, action } = body;

    // OAuth tokens are reachable only by the service role — `authenticated` has
    // no SELECT on public.integrations. Reading this with the caller's JWT fails
    // outright, which made the function report Slack as disconnected even when
    // it was connected. Still filtered by the caller's own user_id below, so
    // this reads nothing the caller does not already own.
    const serviceSupabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    const { data: integration, error: integrationError } = await serviceSupabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'slack')
      .maybeSingle();

    if (integrationError || !integration) {
      console.error('Integration not found');
      return new Response(
        JSON.stringify({ error: 'Slack is not connected. Please connect it first.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = integration.access_token;
    const extraData = integration.extra_data as { message_template?: string } | null;
    const messageTemplate = extraData?.message_template || DEFAULT_TEMPLATE;

    if (action === 'list-channels') {
      const channelsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel&exclude_archived=true&limit=200', {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      const channelsData = await channelsResponse.json();
      
      if (!channelsData.ok) {
        console.error('Failed to fetch channels');
        return new Response(
          JSON.stringify({ error: 'Failed to fetch Slack channels. Please try again.' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const channels: SlackChannel[] = channelsData.channels.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
      }));

      return new Response(
        JSON.stringify({ channels }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No leads provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!channelId) {
      return new Response(
        JSON.stringify({ error: 'No channel selected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending ${leadIds.length} leads to Slack for user:`, user.id);

    const { data: leads, error: leadsError } = await supabase
      .from('business_cards')
      .select('*')
      .in('id', leadIds);

    if (leadsError || !leads) {
      console.error('Failed to fetch leads');
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leads. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let successCount = 0;
    let failCount = 0;

    for (const lead of leads as Lead[]) {
      const formattedMessage = formatMessage(messageTemplate, lead);

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          text: formattedMessage,
          mrkdwn: true,
        }),
      });

      const result = await response.json();

      if (result.ok) {
        successCount++;
      } else {
        failCount++;
        console.error('Failed to send message for lead:', lead.full_name);
      }
    }

    console.log(`Slack sync complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: successCount, 
        failed: failCount,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send leads to Slack. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
