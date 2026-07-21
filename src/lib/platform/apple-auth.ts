/**
 * Native Apple Sign In shim.
 *
 * Web: returns false — the caller falls back to supabase.auth.signInWithOAuth.
 * iOS: uses @capacitor-community/apple-sign-in (Apple's native UI), then exchanges
 *      the identity token for a Supabase session via signInWithIdToken.
 *
 * On iOS the native flow authenticates against the app's Bundle ID, so
 * `clientId` is app.scanbusinesscard.com (matches appId in capacitor.config.ts).
 * `redirectURI` is only consulted by the plugin's non-native fallback, but it
 * must still be registered as a Return URL on the Apple Services ID.
 *
 * For Supabase to accept the resulting identity token, the Bundle ID has to be
 * listed as an authorized client id on the Apple provider — the token's
 * audience is the Bundle ID, not the Services ID used by the web flow.
 */
import { isNative, isIOS } from "./index";
import { supabase } from "@/integrations/supabase/client";

export async function signInWithAppleNative(): Promise<boolean> {
  if (!isNative || !isIOS) return false;

  const { SignInWithApple } = await import(
    /* @vite-ignore */ "@capacitor-community/apple-sign-in"
  );

  const res: any = await SignInWithApple.authorize({
    clientId: "app.scanbusinesscard.com",
    redirectURI: "https://scanbusinesscard.com/auth",
    scopes: "email name",
    state: crypto.randomUUID(),
  });

  const idToken: string | undefined = res?.response?.identityToken;
  if (!idToken) throw new Error("Apple did not return an identity token");

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: idToken,
  });
  if (error) throw error;

  return true;
}
