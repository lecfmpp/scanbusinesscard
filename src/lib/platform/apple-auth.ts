/**
 * Native Apple Sign In shim.
 *
 * Web: returns false — caller should fall back to Lovable Cloud OAuth flow.
 * iOS: uses @capacitor-community/apple-sign-in (Apple's native UI), then exchanges
 *      the identity token for a Supabase session via signInWithIdToken.
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
