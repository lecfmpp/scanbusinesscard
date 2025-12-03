import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const body = await req.json();
    const { leadIds, channelId, action } = body;

    // Get user's Slack integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'slack')
      .maybeSingle();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Slack not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = integration.access_token;

    // If action is 'list-channels', return available channels
    if (action === 'list-channels') {
      console.log('Fetching Slack channels for user:', user.id);
      
      const channelsResponse = await fetch('https://slack.com/api/conversations.list?types=public_channel&exclude_archived=true&limit=200', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const channelsData = await channelsResponse.json();
      
      if (!channelsData.ok) {
        console.error('Failed to fetch channels:', channelsData.error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch channels' }),
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

    // Send leads to channel
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

    console.log(`Sending ${leadIds.length} leads to Slack channel ${channelId} for user:`, user.id);

    // Fetch leads from database
    const { data: leads, error: leadsError } = await supabase
      .from('business_cards')
      .select('*')
      .in('id', leadIds);

    if (leadsError || !leads) {
      console.error('Failed to fetch leads:', leadsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch leads' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send each lead to Slack
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const lead of leads as Lead[]) {
      // Build formatted message
      const blocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📇 *New Lead from ScanBusinessCard*`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*👤 Name:*\n${lead.full_name || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*💼 Title:*\n${lead.job_title || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*🏢 Company:*\n${lead.company || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*📧 Email:*\n${lead.email || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*📱 Phone:*\n${lead.phone || 'N/A'}`
            },
            {
              type: "mrkdwn",
              text: `*🌐 Website:*\n${lead.website || 'N/A'}`
            }
          ]
        },
        {
          type: "divider"
        }
      ];

      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: channelId,
          blocks: blocks,
          text: `New lead: ${lead.full_name} - ${lead.company}`, // Fallback text
        }),
      });

      const result = await response.json();

      if (result.ok) {
        successCount++;
        console.log('Message sent for lead:', lead.full_name);
      } else {
        failCount++;
        errors.push(`${lead.full_name}: ${result.error}`);
        console.error('Failed to send message for lead:', lead.full_name, result.error);
      }
    }

    console.log(`Slack sync complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: successCount, 
        failed: failCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send leads to Slack' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
