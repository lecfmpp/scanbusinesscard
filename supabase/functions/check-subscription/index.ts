import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type StripeSubscription = Stripe.Subscription;

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = origin === 'https://scanbusinesscard.com' || origin.endsWith('.scanbusinesscard.com') || origin.endsWith('.netlify.app') || origin.endsWith('.lovable.app') || origin.startsWith('http://localhost:');
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : 'https://scanbusinesscard.com',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  };
}

const PRODUCTS = {
  monthly: "prod_TXMZt0qfhx94Jc",
  yearly: "prod_TXMapCdiBJurER",
};

const TRIAL_SCANS = 1;
const PAID_SCANS = 30;

/** Scans consumed in the live window. A lapsed window reads as zero, matching
 *  scan-business-cards, which opens a fresh one on the next scan. */
async function readScansUsed(admin: any, userId: string): Promise<number> {
  const { data } = await admin
    .from("scan_usage")
    .select("scan_count, period_end")
    .eq("user_id", userId)
    .order("period_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return 0;
  if (data.period_end && new Date(data.period_end) <= new Date()) return 0;
  return data.scan_count ?? 0;
}

/**
 * Mirror the Stripe answer into public.subscriptions.
 *
 * scan-business-cards enforces the quota off that table alone — it cannot call
 * Stripe on every scan. Without this sync a paying Stripe customer would have
 * no row, be treated as trial, and get blocked at one scan. Apple IAP already
 * writes the same table from verify-apple-iap, so this makes the table the one
 * place both billing paths agree on.
 */
async function syncSubscriptionRow(
  admin: any,
  userId: string,
  fields: {
    status: string;
    planType?: string;
    periodStart?: string | null;
    periodEnd?: string | null;
  }
) {
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      status: fields.status,
      plan_type: fields.planType ?? "monthly",
      current_period_start: fields.periodStart ?? null,
      current_period_end: fields.periodEnd ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );
  if (error) console.error("[CHECK-SUB] could not sync subscription row:", error);
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not set");
      return new Response(JSON.stringify({ error: "Service configuration error" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user?.email) {
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    const user = userData.user;
    const scansUsed = await readScansUsed(supabaseClient, user.id);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      // No Stripe customer does not mean unsubscribed: the user may have bought
      // through Apple IAP, which verify-apple-iap records directly. Report that
      // row rather than overwriting it with an inactive Stripe verdict.
      const { data: existing } = await supabaseClient
        .from("subscriptions")
        .select("status, plan_type, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      const appleActive =
        existing?.status === "active" &&
        (!existing.current_period_end || new Date(existing.current_period_end) > new Date());

      return new Response(JSON.stringify({
        subscribed: appleActive,
        inTrial: false,
        planType: appleActive ? existing?.plan_type : undefined,
        subscriptionEnd: appleActive ? existing?.current_period_end : undefined,
        scansUsed,
        scansLimit: appleActive ? PAID_SCANS : TRIAL_SCANS,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s: StripeSubscription) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      await syncSubscriptionRow(supabaseClient, user.id, { status: "inactive" });
      return new Response(JSON.stringify({
        subscribed: false,
        inTrial: false,
        scansUsed,
        scansLimit: TRIAL_SCANS,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const productId = activeSub.items.data[0].price.product;
    const planType = productId === PRODUCTS.yearly ? "yearly" : "monthly";
    const inTrial = activeSub.status === "trialing";
    const subscriptionEnd = new Date(activeSub.current_period_end * 1000).toISOString();
    const trialEnd = activeSub.trial_end ? new Date(activeSub.trial_end * 1000).toISOString() : null;
    const scansLimit = inTrial ? TRIAL_SCANS : PAID_SCANS;

    // Record trialing distinctly from active. scan-business-cards grants the
    // paid allowance only to status 'active', so collapsing the two here would
    // hand a 7-day trial the full 30 scans instead of the 1 it is sold with.
    await syncSubscriptionRow(supabaseClient, user.id, {
      status: inTrial ? "trialing" : "active",
      planType,
      periodStart: new Date(activeSub.current_period_start * 1000).toISOString(),
      periodEnd: subscriptionEnd,
    });

    return new Response(JSON.stringify({
      subscribed: true,
      inTrial,
      planType,
      subscriptionEnd,
      trialEnd,
      scansUsed,
      scansLimit,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CHECK-SUB] Error:", error);
    return new Response(JSON.stringify({ error: "Failed to check subscription status. Please try again." }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
