import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SubscriptionState {
  subscribed: boolean;
  inTrial: boolean;
  planType: "monthly" | "yearly" | null;
  subscriptionEnd: string | null;
  trialEnd: string | null;
  scansUsed: number;
  scansLimit: number;
}

const SIGNED_OUT: SubscriptionState = {
  subscribed: false,
  inTrial: false,
  planType: null,
  subscriptionEnd: null,
  trialEnd: null,
  scansUsed: 0,
  scansLimit: 0,
};

/**
 * Subscription + scan quota for the signed-in user.
 *
 * The server is the authority here — `scan-business-cards` refuses to scan past
 * the quota on its own. This hook exists so the UI can show the remaining
 * balance and open the paywall *before* the user burns a scan attempt, not to
 * enforce anything: a client-side gate is trivially bypassable.
 */
export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>(SIGNED_OUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setState(SIGNED_OUT);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("check-subscription");
      if (fnError) throw fnError;

      setState({
        subscribed: Boolean(data?.subscribed),
        inTrial: Boolean(data?.inTrial),
        planType: data?.planType ?? null,
        subscriptionEnd: data?.subscriptionEnd ?? null,
        trialEnd: data?.trialEnd ?? null,
        scansUsed: Number(data?.scansUsed ?? 0),
        scansLimit: Number(data?.scansLimit ?? 0),
      });
      setError(null);
    } catch (err) {
      // Leave the previous state in place. Blanking it out would flash the
      // paywall at a paying subscriber just because one request failed.
      const message = err instanceof Error ? err.message : String(err);
      console.error("[useSubscription] failed to load subscription:", message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => subscription.unsubscribe();
  }, [refresh]);

  const scansRemaining = Math.max(0, state.scansLimit - state.scansUsed);

  return {
    ...state,
    scansRemaining,
    // Only block on a *known* exhausted quota. While loading, or after a failed
    // check, let the attempt through — the edge function still enforces it, and
    // a false paywall costs far more than one extra request.
    hasScansLeft: loading || error !== null ? true : scansRemaining > 0,
    loading,
    error,
    refresh,
  };
}
