import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, Check, Loader2, Sparkles, Workflow, X, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { isNative, isIOS } from "@/lib/platform";
import { getApplePrices, purchaseApplePlan, restoreApplePurchases } from "@/lib/platform/iap";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Web pricing. On iOS these are replaced by the localized StoreKit strings —
// Apple bills in the user's own currency and tier, so showing these there would
// misstate the real charge.
const WEB_MONTHLY = 9;
const WEB_YEARLY = 49;
const WEB_YEARLY_SAVINGS_PCT = Math.round((1 - WEB_YEARLY / (WEB_MONTHLY * 12)) * 100);

type Plan = "monthly" | "yearly";

const BENEFITS = [
  { icon: Camera, text: "Scan 20+ cards in a single photo" },
  { icon: Sparkles, text: "AI reads every field — no typing" },
  { icon: Workflow, text: "Leads flow straight into HubSpot & Slack" },
  { icon: Zap, text: "Export to CSV or Sheets anytime" },
];

interface PaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** `quota` is shown when the user just ran out of scans; it converts far
   *  better than a generic upsell because the value is top of mind. */
  reason?: "quota" | "upgrade";
  scansLimit?: number;
  onPurchased?: () => void;
}

export function Paywall({
  open,
  onOpenChange,
  reason = "upgrade",
  scansLimit,
  onPurchased,
}: PaywallProps) {
  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [storePrices, setStorePrices] = useState<{ monthly: string | null; yearly: string | null }>({
    monthly: null,
    yearly: null,
  });

  const onApple = isNative && isIOS;

  useEffect(() => {
    if (!open || !onApple) return;
    getApplePrices().then(setStorePrices);
  }, [open, onApple]);

  const monthlyLabel = storePrices.monthly ?? `$${WEB_MONTHLY}`;
  const yearlyLabel = storePrices.yearly ?? `$${WEB_YEARLY}`;
  // Only claim a saving when both sides come from the same source; mixing a
  // StoreKit price with a hardcoded one would produce a bogus percentage.
  const savingsPct =
    onApple && (storePrices.monthly || storePrices.yearly) ? null : WEB_YEARLY_SAVINGS_PCT;

  const handleSubscribe = async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in first");
        window.location.href = "/auth";
        return;
      }

      if (onApple) {
        // Guideline 3.1.1: digital subscriptions inside the iOS app must go
        // through In-App Purchase. The receipt is verified server-side by
        // verify-apple-iap, which is what actually flips the subscription on.
        await purchaseApplePlan(plan);
        onPurchased?.();
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { planType: plan },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Checkout session missing a URL");

      // Same-tab navigation, not window.open: a popup is blocked inside an
      // in-app webview and silently does nothing.
      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Could not start checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      await restoreApplePurchases();
      toast.success("Purchases restored");
      onPurchased?.();
    } catch {
      toast.error("Nothing to restore on this Apple ID.");
    } finally {
      setRestoring(false);
    }
  };

  const outOfScans = reason === "quota";
  let delay = 0;
  const step = () => ({ animationDelay: `${(delay += 60)}ms` });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // Full-bleed sheet on phones so it reads as a native screen, a compact
        // card from sm up. The default close button is hidden in favour of the
        // larger tap target below.
        className={cn(
          "gap-0 overflow-y-auto p-0 [&>button]:hidden",
          "h-[100dvh] max-w-none rounded-none border-0",
          "sm:h-auto sm:max-h-[92vh] sm:max-w-md sm:rounded-2xl sm:border"
        )}
      >
        <div className="flex min-h-full flex-col px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] sm:pb-6 sm:pt-5">
          {/* Dismiss. Apple rejects paywalls without an obvious way out. */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="-mr-2 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="animate-rise-in" style={step()}>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold leading-tight">
              {outOfScans ? "You're out of scans" : "Never lose a lead again"}
            </DialogTitle>
            <DialogDescription className="mt-2 text-center text-base">
              {outOfScans
                ? `You've used all ${scansLimit ?? 0} scans in this period. Upgrade to keep capturing leads.`
                : "Turn a pile of business cards into CRM-ready leads in seconds."}
            </DialogDescription>
          </div>

          <ul className="my-6 space-y-3">
            {BENEFITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 animate-rise-in" style={step()}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {/* Two plans, annual preselected. More than two options measurably
              depresses conversion — this is a yes/no, not a comparison. */}
          <div className="grid gap-3 animate-rise-in" style={step()}>
            <PlanOption
              selected={plan === "yearly"}
              onSelect={() => setPlan("yearly")}
              title="Yearly"
              price={yearlyLabel}
              period="per year"
              caption={!onApple ? `Just $${(WEB_YEARLY / 12).toFixed(2)}/month` : undefined}
              badge={savingsPct ? `SAVE ${savingsPct}%` : undefined}
            />
            <PlanOption
              selected={plan === "monthly"}
              onSelect={() => setPlan("monthly")}
              title="Monthly"
              price={monthlyLabel}
              period="per month"
            />
          </div>

          <div className="mt-6 animate-rise-in" style={step()}>
            <Button size="lg" className="h-12 w-full text-base" onClick={handleSubscribe} disabled={busy}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Start 7-day free trial"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              No charge today · Cancel anytime
            </p>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Trusted by 10,000+ sales pros
            </p>
          </div>

          <div className="mt-auto pt-6 animate-rise-in" style={step()}>
            {onApple && (
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring}
                className="mb-3 w-full text-center text-sm font-medium text-primary disabled:opacity-60"
              >
                {restoring ? "Restoring…" : "Restore purchases"}
              </button>
            )}
            {/* Guideline 3.1.2 requires the renewal terms and both links to sit
                on the purchase screen itself. */}
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Subscription renews automatically until cancelled. Manage or cancel in{" "}
              {onApple ? "your Apple ID settings" : "billing settings"} at any time.{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                Terms
              </Link>{" "}
              ·{" "}
              <Link to="/privacy" className="underline hover:text-foreground">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlanOption({
  selected,
  onSelect,
  title,
  price,
  period,
  caption,
  badge,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  price: string;
  period: string;
  caption?: string;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
      )}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      )}
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        {caption && <span className="block text-xs text-muted-foreground">{caption}</span>}
      </span>
      <span className="flex items-center gap-3">
        <span className="text-right">
          <span className="block text-lg font-bold leading-none">{price}</span>
          <span className="block text-[11px] text-muted-foreground">{period}</span>
        </span>
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-primary bg-primary" : "border-muted-foreground/40"
          )}
        >
          {selected && <Check className="h-3 w-3 text-primary-foreground" />}
        </span>
      </span>
    </button>
  );
}
