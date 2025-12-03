import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

type StripeSubscription = Stripe.Subscription;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRODUCTS = {
  monthly: "prod_TXMZt0qfhx94Jc",
  yearly: "prod_TXMapCdiBJurER",
};

serve(async (req) => {
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
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    console.log("[CHECK-SUB] Checking subscription for:", user.email);

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      console.log("[CHECK-SUB] No customer found");
      return new Response(JSON.stringify({ 
        subscribed: false,
        inTrial: false,
        scansUsed: 0,
        scansLimit: 1,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    console.log("[CHECK-SUB] Found customer:", customerId);

    // Check for active or trialing subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    const activeSub = subscriptions.data.find(
      (s: StripeSubscription) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      console.log("[CHECK-SUB] No active subscription");
      return new Response(JSON.stringify({
        subscribed: false,
        inTrial: false,
        scansUsed: 0,
        scansLimit: 1,
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

    // Calculate scans limit based on plan
    const scansLimit = inTrial ? 1 : 30;

    console.log("[CHECK-SUB] Active subscription found:", { planType, inTrial, subscriptionEnd });

    return new Response(JSON.stringify({
      subscribed: true,
      inTrial,
      planType,
      subscriptionEnd,
      trialEnd,
      scansUsed: 0, // Will be tracked separately
      scansLimit,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[CHECK-SUB] Error:", errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
