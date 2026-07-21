/**
 * Native Apple Sign In shim.
 *
 * Web: returns false — the caller falls back to supabase.auth.signInWithOAuth.
 * iOS: uses @capacitor-community/apple-sign-in (Apple's native UI), then exchanges
 *      the identity token for a Supabase session via signInWithIdToken.
 *
 * NOTE: `clientId` must equal the app's bundle id (see appId in
 * capacitor.config.ts) and `redirectURI` must be registered as a Return URL on
 * the Apple Services ID. `redirectURI` still points at the retired
 * *.lovable.app domain and needs to move to https://scanbusinesscard.com/auth,
 * which has to be changed in the Apple Developer console at the same time or
 * Apple rejects the authorize call.
 */
import { isNative, isIOS } from "./index";
import { supabase } from "@/integrations/supabase/client";

export async function signInWithAppleNative(): Promise<boolean> {
  if (!isNative || !isIOS) return false;

  const { SignInWithApple } = await import(
    /* @vite-ignore */ "@capacitor-community/apple-sign-in"
  );

  const res: any = await SignInWithApple.authorize({
    clientId: "app.lovable.ae0d1a377afd4717a989caa75593f819", // replace with your real bundle ID
    redirectURI: "https://scanbusinesscard.lovable.app/auth",
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
