import { useState, useEffect } from "react";
import { Link2, Link2Off, ExternalLink, Check, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import hubspotIcon from "@/assets/hubspot-icon.svg";
import slackIcon from "@/assets/slack-icon.png";
import SlackTemplateModal, { DEFAULT_TEMPLATE } from "@/components/SlackTemplateModal";
import { openOAuthNative } from "@/lib/platform/oauth";
import { isNative } from "@/lib/platform";

interface Integration {
  id: string;
  provider: string;
  created_at: string;
  extra_data: { hub_id?: string; team_name?: string; message_template?: string } | null;
}

const Integrations = () => {
  // HubSpot state
  const [hubspotConnected, setHubspotConnected] = useState(false);
  const [hubspotHubId, setHubspotHubId] = useState<string | null>(null);
  const [hubspotConnecting, setHubspotConnecting] = useState(false);
  const [hubspotDisconnecting, setHubspotDisconnecting] = useState(false);
  
  // Slack state
  const [slackConnected, setSlackConnected] = useState(false);
  const [slackTeamName, setSlackTeamName] = useState<string | null>(null);
  const [slackConnecting, setSlackConnecting] = useState(false);
  const [slackDisconnecting, setSlackDisconnecting] = useState(false);
  const [slackTemplate, setSlackTemplate] = useState<string>(DEFAULT_TEMPLATE);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('integrations_safe' as any)
        .select('id, provider, created_at, extra_data')
        .eq('user_id', user.id) as { data: Integration[] | null; error: any };

      // Surface read failures instead of treating them as "nothing connected".
      // A denied read here looks identical to an empty result, which silently
      // showed every integration as disconnected even when it was connected.
      if (error) throw error;

      // Process HubSpot
      const hubspot = data?.find(i => i.provider === 'hubspot');
      if (hubspot) {
        setHubspotConnected(true);
        const extraData = hubspot.extra_data as { hub_id?: string } | null;
        setHubspotHubId(extraData?.hub_id || null);
      } else {
        setHubspotConnected(false);
        setHubspotHubId(null);
      }

      // Process Slack
      const slack = data?.find(i => i.provider === 'slack');
      if (slack) {
        setSlackConnected(true);
        const extraData = slack.extra_data as { team_name?: string; message_template?: string } | null;
        setSlackTeamName(extraData?.team_name || null);
        setSlackTemplate(extraData?.message_template || DEFAULT_TEMPLATE);
      } else {
        setSlackConnected(false);
        setSlackTeamName(null);
        setSlackTemplate(DEFAULT_TEMPLATE);
      }
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectHubspot = async () => {
    setHubspotConnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to connect HubSpot');
        return;
      }

      const { data, error } = await supabase.functions.invoke('hubspot-oauth', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { platform: isNative ? 'ios' : 'web' },
      });

      if (error) throw error;

      if (data?.url) {
        // Native: open in in-app browser; deep link returns to app. Web: redirect as before.
        const handledNatively = await openOAuthNative(data.url);
        if (!handledNatively) {
          window.location.href = data.url;
        }
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      console.error('Error connecting HubSpot:', error);
      toast.error('Failed to start HubSpot connection');
      setHubspotConnecting(false);
    }
  };

  const disconnectHubspot = async () => {
    setHubspotDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('hubspot-disconnect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setHubspotConnected(false);
      setHubspotHubId(null);
      toast.success('HubSpot disconnected');
    } catch (error) {
      console.error('Error disconnecting HubSpot:', error);
      toast.error('Failed to disconnect HubSpot');
    } finally {
      setHubspotDisconnecting(false);
    }
  };

  const connectSlack = async () => {
    setSlackConnecting(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Please sign in to connect Slack');
        setSlackConnecting(false);
        return;
      }

      console.log('Calling slack-oauth with session');
      
      const { data, error } = await supabase.functions.invoke('slack-oauth', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { platform: isNative ? 'ios' : 'web' },
      });

      if (error) {
        console.error('Slack OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        const handledNatively = await openOAuthNative(data.url);
        if (!handledNatively) {
          window.location.href = data.url;
        }
      } else {
        throw new Error('No OAuth URL returned');
      }
    } catch (error) {
      console.error('Error connecting Slack:', error);
      toast.error(`Failed to start Slack connection: ${error.message || 'Unknown error'}`);
      setSlackConnecting(false);
    }
  };

  const disconnectSlack = async () => {
    setSlackDisconnecting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { error } = await supabase.functions.invoke('slack-disconnect', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSlackConnected(false);
      setSlackTeamName(null);
      setSlackTemplate(DEFAULT_TEMPLATE);
      toast.success('Slack disconnected');
    } catch (error) {
      console.error('Error disconnecting Slack:', error);
      toast.error('Failed to disconnect Slack');
    } finally {
      setSlackDisconnecting(false);
    }
  };

  const saveSlackTemplate = async (template: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('update-slack-template', {
        body: { template },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSlackTemplate(template);
      toast.success('Message template saved!');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
      throw error;
    }
  };

  return (
    <>
      <SlackTemplateModal
        isOpen={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        template={slackTemplate}
        onSave={saveSlackTemplate}
      />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">
            Connect your favorite tools to sync leads automatically
          </p>
        </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* HubSpot Card */}
        <Card className={hubspotConnected ? "border-green-500/50" : ""}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="h-12 w-12 rounded-lg bg-[#ff7a59]/10 flex items-center justify-center">
              <img src={hubspotIcon} alt="HubSpot" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                HubSpot
                {hubspotConnected && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>CRM & Marketing Platform</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sync your scanned business cards directly to HubSpot CRM as contacts.
            </p>
            
            {hubspotConnected && hubspotHubId && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                Portal ID: {hubspotHubId}
              </div>
            )}

            {loading ? (
              <Button disabled className="w-full">
                Loading...
              </Button>
            ) : hubspotConnected ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={disconnectHubspot}
                  disabled={hubspotDisconnecting}
                >
                  <Link2Off className="h-4 w-4 mr-2" />
                  {hubspotDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                >
                  <a href="https://app.hubspot.com" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-[#ff7a59] hover:bg-[#ff7a59]/90"
                onClick={connectHubspot}
                disabled={hubspotConnecting}
              >
                <Link2 className="h-4 w-4 mr-2" />
                {hubspotConnecting ? 'Connecting...' : 'Connect HubSpot'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Slack Card */}
        <Card className={slackConnected ? "border-green-500/50" : ""}>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="h-12 w-12 rounded-lg bg-[#4A154B]/10 flex items-center justify-center">
              <img src={slackIcon} alt="Slack" className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Slack
                {slackConnected && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Team Communication</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send scanned leads directly to a Slack channel for instant team notifications.
            </p>
            
            {slackConnected && slackTeamName && (
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                Workspace: {slackTeamName}
              </div>
            )}

            {loading ? (
              <Button disabled className="w-full">
                Loading...
              </Button>
            ) : slackConnected ? (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowTemplateModal(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize Message
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={disconnectSlack}
                    disabled={slackDisconnecting}
                  >
                    <Link2Off className="h-4 w-4 mr-2" />
                    {slackDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href="https://slack.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full bg-[#4A154B] hover:bg-[#4A154B]/90"
                onClick={connectSlack}
                disabled={slackConnecting}
              >
                <Link2 className="h-4 w-4 mr-2" />
                {slackConnecting ? 'Connecting...' : 'Connect Slack'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Google Sheets - Coming Soon */}
        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
            <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Google Sheets
                <Badge variant="secondary">Coming Soon</Badge>
              </CardTitle>
              <CardDescription>Spreadsheet</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export leads directly to Google Sheets for easy collaboration.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Having trouble connecting? Make sure you're logged into the correct account
            and have the necessary permissions.
          </p>
          <p>
            Contact us at{" "}
            <a href="mailto:support@scanbusinesscard.com" className="text-primary hover:underline">
              support@scanbusinesscard.com
            </a>{" "}
            for assistance.
          </p>
        </CardContent>
      </Card>
      </div>
    </>
  );
};

export default Integrations;
