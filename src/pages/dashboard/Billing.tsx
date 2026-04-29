import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CreditCard, Calendar, CheckCircle, Loader2, ExternalLink, Apple, RotateCw } from "lucide-react";
import { format } from "date-fns";
import { isNative, isIOS } from "@/lib/platform";
import { purchaseApplePlan, restoreApplePurchases } from "@/lib/platform/iap";

interface Subscription {
  id: string;
  status: string;
  plan_type: string;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
}

const Billing = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [iapLoading, setIapLoading] = useState<null | "monthly" | "yearly" | "restore">(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error opening portal:", error);
      toast.error("Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  const handleUpgrade = async (planType: 'monthly' | 'yearly') => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Failed to start checkout");
    }
  };

  const handleApplePurchase = async (planType: 'monthly' | 'yearly') => {
    setIapLoading(planType);
    try {
      await purchaseApplePlan(planType);
      toast.success("Purchase started — complete the prompt from Apple.");
      // Subscription row is updated by verify-apple-iap once Apple finalizes the txn.
      setTimeout(fetchSubscription, 4000);
    } catch (err) {
      console.error("[IAP] purchase error:", err);
      toast.error("Could not start purchase. Please try again.");
    } finally {
      setIapLoading(null);
    }
  };

  const handleRestore = async () => {
    setIapLoading("restore");
    try {
      await restoreApplePurchases();
      toast.success("Restoring previous purchases…");
      setTimeout(fetchSubscription, 4000);
    } catch (err) {
      console.error("[IAP] restore error:", err);
      toast.error("Could not restore purchases.");
    } finally {
      setIapLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isActive = subscription?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <Card className="p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Current Plan</h3>
              <p className="text-muted-foreground">
                {isActive 
                  ? `${subscription?.plan_type === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
                  : 'Free Plan'}
              </p>
            </div>
          </div>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Free"}
          </Badge>
        </div>

        {isActive && subscription?.current_period_end && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Next billing date: {format(new Date(subscription.current_period_end), 'MMMM d, yyyy')}
              </span>
            </div>
          </div>
        )}

        {isActive && (
          <div className="mt-6">
            <Button variant="outline" onClick={handleManageSubscription} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          </div>
        )}
      </Card>

      {/* iOS app: Stripe upgrade hidden — Apple App Store rules require In-App Purchase for digital subscriptions.
          IAP wiring will be added in a later phase once Apple product IDs exist. */}
      {!isActive && isNative && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">Upgrade on the web</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            To upgrade your plan, please visit scanbusinesscard.com from your browser.
            In-app purchases are coming soon.
          </p>
        </Card>
      )}

      {/* Upgrade Options — web only */}
      {!isActive && !isNative && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-2">Monthly Plan</h3>
            <div className="text-3xl font-bold mb-4">
              $9<span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                30 scans per month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Up to 20 cards per scan
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Export to CSV
              </li>
            </ul>
            <Button className="w-full" variant="outline" onClick={() => handleUpgrade('monthly')}>
              Subscribe Monthly
            </Button>
          </Card>

          <Card className="p-6 border-primary relative">
            <Badge className="absolute -top-3 left-6">Best Value</Badge>
            <h3 className="font-semibold text-lg mb-2">Yearly Plan</h3>
            <div className="text-3xl font-bold mb-4">
              $49<span className="text-lg font-normal text-muted-foreground">/year</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                30 scans per month
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Up to 20 cards per scan
              </li>
              <li className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Export to CSV
              </li>
              <li className="flex items-center gap-2 text-sm text-primary font-medium">
                <CheckCircle className="h-4 w-4 text-primary" />
                Live WhatsApp support forever
              </li>
            </ul>
            <Button className="w-full" onClick={() => handleUpgrade('yearly')}>
              Subscribe Yearly — Save $59
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Billing;
