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

    const { leadIds } = await req.json();
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No leads provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending ${leadIds.length} leads to HubSpot for user:`, user.id);

    // Get user's HubSpot integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'hubspot')
      .maybeSingle();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return new Response(
        JSON.stringify({ error: 'HubSpot not connected' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if token needs refresh
    let accessToken = integration.access_token;
    const expiresAt = new Date(integration.expires_at);
    const now = new Date();
    
    if (expiresAt <= now && integration.refresh_token) {
      console.log('Token expired, refreshing...');
      const refreshResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: Deno.env.get('HUBSPOT_CLIENT_ID')!,
          client_secret: Deno.env.get('HUBSPOT_CLIENT_SECRET')!,
          refresh_token: integration.refresh_token,
        }),
      });

      if (refreshResponse.ok) {
        const newTokens = await refreshResponse.json();
        accessToken = newTokens.access_token;
        
        // Update tokens in database using service role
        const serviceSupabase = createClient(
          supabaseUrl,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        
        await serviceSupabase
          .from('integrations')
          .update({
            access_token: newTokens.access_token,
            refresh_token: newTokens.refresh_token || integration.refresh_token,
            expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', integration.id);
        
        console.log('Token refreshed successfully');
      } else {
        console.error('Token refresh failed');
        return new Response(
          JSON.stringify({ error: 'HubSpot connection expired. Please reconnect.' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

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

    // Send each lead to HubSpot
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const lead of leads as Lead[]) {
      // Parse name into first and last
      const nameParts = (lead.full_name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const contactData = {
        properties: {
          firstname: firstName,
          lastname: lastName,
          email: lead.email || '',
          phone: lead.phone || '',
          company: lead.company || '',
          jobtitle: lead.job_title || '',
          website: lead.website || '',
        },
      };

      console.log('Creating contact:', lead.full_name);

      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        successCount++;
        console.log('Contact created:', lead.full_name);
      } else {
        failCount++;
        const errorData = await response.json();
        const errorMsg = errorData.message || response.statusText;
        errors.push(`${lead.full_name}: ${errorMsg}`);
        console.error('Failed to create contact:', lead.full_name, errorData);
      }
    }

    console.log(`HubSpot sync complete: ${successCount} success, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: successCount, 
        failed: failCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending to HubSpot:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send leads to HubSpot' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
