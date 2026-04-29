/**
 * verify-apple-iap
 *
 * Receives an Apple StoreKit receipt from the iOS app, validates it with Apple's
 * verifyReceipt endpoint, and upserts the user's subscription row.
 *
 * 🔧 BEFORE GOING LIVE:
 *   - Add the APPLE_SHARED_SECRET secret (App Store Connect → App → App Information →
 *     App-Specific Shared Secret).
 *   - Confirm APPLE_PRODUCT_IDS in src/lib/platform/iap.ts match the productIds below.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const APPLE_PRODUCT_TO_PLAN: Record<string, "monthly" | "yearly"> = {
  "com.scanbusinesscard.pro.monthly": "monthly",
  "com.scanbusinesscard.pro.yearly": "yearly",
};

const PROD_URL = "https://buy.itunes.apple.com/verifyReceipt";
const SANDBOX_URL = "https://sandbox.itunes.apple.com/verifyReceipt";

async function verifyWithApple(receiptData: string, sharedSecret: string) {
  const body = JSON.stringify({
    "receipt-data": receiptData,
    password: sharedSecret,
    "exclude-old-transactions": true,
  });

  let res = await fetch(PROD_URL, { method: "POST", body });
  let json = await res.json();

  // Apple returns 21007 when a sandbox receipt is sent to production.
  if (json.status === 21007) {
    res = await fetch(SANDBOX_URL, { method: "POST", body });
    json = await res.json();
  }
  return json;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sharedSecret = Deno.env.get("APPLE_SHARED_SECRET");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const user = userData.user;

    const { productId, rawReceipt, transactionId } = await req.json();
    if (!productId || !rawReceipt) {
      return new Response(JSON.stringify({ error: "Missing productId or receipt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const planType = APPLE_PRODUCT_TO_PLAN[productId];
    if (!planType) {
      return new Response(JSON.stringify({ error: `Unknown product: ${productId}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The plugin's nativeData typically contains { appStoreReceipt: "<base64>" }.
    const receiptData =
      typeof rawReceipt === "string"
        ? rawReceipt
        : rawReceipt?.appStoreReceipt ?? rawReceipt?.transactionReceipt;

    if (!receiptData) {
      return new Response(JSON.stringify({ error: "Receipt payload missing appStoreReceipt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!sharedSecret) {
      console.error("[verify-apple-iap] APPLE_SHARED_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const appleResp = await verifyWithApple(receiptData, sharedSecret);
    if (appleResp.status !== 0) {
      console.error("[verify-apple-iap] Apple rejected receipt:", appleResp.status);
      return new Response(JSON.stringify({ error: "Receipt invalid", status: appleResp.status }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pick the latest transaction matching our product.
    const latest = (appleResp.latest_receipt_info ?? [])
      .filter((t: any) => t.product_id === productId)
      .sort((a: any, b: any) => Number(b.expires_date_ms) - Number(a.expires_date_ms))[0];

    const expiresMs = latest ? Number(latest.expires_date_ms) : Date.now();
    const periodStartMs = latest ? Number(latest.purchase_date_ms) : Date.now();
    const isActive = expiresMs > Date.now();

    const admin = createClient(supabaseUrl, serviceKey);
    const { error: upsertErr } = await admin
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan_type: planType,
          status: isActive ? "active" : "inactive",
          current_period_start: new Date(periodStartMs).toISOString(),
          current_period_end: new Date(expiresMs).toISOString(),
          stripe_subscription_id: transactionId ? `apple:${transactionId}` : null,
          stripe_customer_id: `apple:${user.id}`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (upsertErr) {
      console.error("[verify-apple-iap] upsert error:", upsertErr);
      return new Response(JSON.stringify({ error: "Failed to record subscription" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ ok: true, planType, status: isActive ? "active" : "inactive", expiresAt: new Date(expiresMs).toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[verify-apple-iap] error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
