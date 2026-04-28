/**
 * OAuth shim — opens provider auth flow appropriately per platform.
 *
 * Web: caller uses its existing window.location flow. This shim returns false on web
 *      so the caller knows to use its existing path. No Capacitor code is imported.
 * Native (iOS): opens the OAuth URL in an in-app browser; the deep link handler
 *      (App URL listener registered by setupDeepLinks) closes it on return.
 */
import { isNative } from "./index";

export async function openOAuthNative(url: string): Promise<boolean> {
  if (!isNative) return false;

  const { Browser } = await import(/* @vite-ignore */ "@capacitor/browser");
  await Browser.open({ url, presentationStyle: "popover" });
  return true;
}

/**
 * Register a deep-link listener that closes the in-app browser when the OAuth
 * callback returns to scanbusinesscard://oauth-callback.
 *
 * Call once at app boot. No-op on web.
 */
export async function setupDeepLinks(): Promise<void> {
  if (!isNative) return;

  const { App } = await import(/* @vite-ignore */ "@capacitor/app");
  const { Browser } = await import(/* @vite-ignore */ "@capacitor/browser");

  App.addListener("appUrlOpen", async (event: { url: string }) => {
    if (event.url.startsWith("scanbusinesscard://")) {
      await Browser.close();
      // The web app's existing /oauth-callback route logic will run if we route there.
      const path = event.url.replace("scanbusinesscard://", "/");
      window.location.href = path.startsWith("/") ? path : `/${path}`;
    }
  });
}
