/**
 * Apple In-App Purchase shim.
 *
 * Web: all functions no-op. No native code is imported in browsers.
 * Native (iOS): dynamically imports cordova-plugin-purchase and drives the IAP flow.
 *
 * IMPORTANT — placeholders to replace once you have App Store Connect set up:
 *   - APPLE_PRODUCT_IDS.monthly
 *   - APPLE_PRODUCT_IDS.yearly
 *
 * After purchase, we send the receipt to the `verify-apple-iap` edge function which
 * records/updates the user's subscription row.
 */
import { isNative, isIOS } from "./index";
import { supabase } from "@/integrations/supabase/client";

// 🔧 REPLACE these with the product IDs you create in App Store Connect.
export const APPLE_PRODUCT_IDS = {
  monthly: "com.scanbusinesscard.pro.monthly",
  yearly: "com.scanbusinesscard.pro.yearly",
} as const;

export type ApplePlan = keyof typeof APPLE_PRODUCT_IDS;

let storeReady: Promise<any> | null = null;

async function getStore() {
  if (!isNative || !isIOS) return null;
  if (storeReady) return storeReady;

  storeReady = (async () => {
    const mod: any = await (import(/* @vite-ignore */ "cordova-plugin-purchase" as any) as Promise<any>);
    const store = mod.default ?? mod.store ?? (globalThis as any).CdvPurchase?.store;
    if (!store) throw new Error("cordova-plugin-purchase store not available");

    const CdvPurchase = (globalThis as any).CdvPurchase ?? mod;

    store.register([
      {
        id: APPLE_PRODUCT_IDS.monthly,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
      {
        id: APPLE_PRODUCT_IDS.yearly,
        type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
        platform: CdvPurchase.Platform.APPLE_APPSTORE,
      },
    ]);

    store
      .when()
      .approved((transaction: any) => {
        // Forward the receipt to our backend for verification + DB update,
        // then finish() the transaction once the server has acknowledged it.
        verifyReceiptOnServer(transaction)
          .then(() => transaction.finish())
          .catch((err) => console.error("[IAP] verify failed:", err));
      });

    await store.initialize([CdvPurchase.Platform.APPLE_APPSTORE]);
    return store;
  })();

  return storeReady;
}

async function verifyReceiptOnServer(transaction: any) {
  const receipt = transaction?.parentReceipt ?? transaction;
  const payload = {
    productId: transaction?.products?.[0]?.id ?? transaction?.id,
    transactionId: transaction?.transactionId,
    rawReceipt: receipt?.nativeData ?? receipt,
  };
  const { error } = await supabase.functions.invoke("verify-apple-iap", { body: payload });
  if (error) throw error;
}

export async function purchaseApplePlan(plan: ApplePlan): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  const store = await getStore();
  if (!store) return false;

  const productId = APPLE_PRODUCT_IDS[plan];
  const offer = store.get(productId)?.getOffer();
  if (!offer) throw new Error(`Apple product not found: ${productId}`);
  await store.order(offer);
  return true;
}

export async function restoreApplePurchases(): Promise<boolean> {
  if (!isNative || !isIOS) return false;
  const store = await getStore();
  if (!store) return false;
  await store.restorePurchases();
  return true;
}
