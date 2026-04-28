# Plan: Publish Scan Business Card as a Native iOS App (Web-Safe)

Goal: Wrap the existing React app with **Capacitor** to ship a native iOS app on the App Store, **without changing how the web app behaves for any current user**. The same codebase serves both — but every native-only branch is gated so web traffic is byte-for-byte unchanged.

Important: Building and submitting to the App Store requires a **Mac with Xcode** and an **Apple Developer Program account ($99/year)**. Lovable handles the codebase; the final build/upload happens on your Mac.

---

## Core principle: platform isolation

Every native-only behavior lives behind one of these gates:

```ts
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform(); // false on web, true on iOS shell
```

Rule: **if `isNative` is false, the app must execute the exact same code path it does today.** No new imports, no new effects, no new UI. We enforce this by:

1. **Dynamic imports** for every Capacitor plugin (`await import('@capacitor/camera')`) so web bundles never load native code.
2. **A single `src/lib/platform.ts` shim** that exports either the native implementation or the existing web implementation per feature. Components call the shim, never the plugin directly.
3. **A web smoke-test pass** after every native change — listed in the QA section below.

This means: published web app = unchanged. iOS app = adds native capabilities on top.

---

## Phase 1 — Capacitor scaffolding (zero web impact)

1. Add deps: `@capacitor/core`, `@capacitor/cli` (dev), `@capacitor/ios`.
2. Create `capacitor.config.ts` with appId `app.lovable.ae0d1a377afd4717a989caa75593f819`, appName `scanbusinesscard`, and the Lovable sandbox URL for hot-reload during dev.
3. Add `ios/` to `.gitignore`-equivalent rules so generated Xcode files don't pollute web builds (the Vite build ignores them anyway).

**Web impact check:** none — Capacitor is dormant in browsers; `Capacitor.isNativePlatform()` returns false and no plugin code runs.

## Phase 2 — Platform shim layer (the safety net)

Create `src/lib/platform/` with one file per capability:

- `camera.ts` — `pickImages(): Promise<string[]>`
  - Web: returns existing `<input type="file">` flow (current behavior, untouched)
  - Native: dynamic-imports `@capacitor/camera` and uses `Camera.pickImages()`
- `oauth.ts` — `startOAuth(provider): Promise<void>`
  - Web: existing `window.location` redirect (untouched)
  - Native: opens `@capacitor/browser` and listens for deep link return
- `storage.ts` — Supabase auth storage adapter
  - Web: `localStorage` (untouched — current behavior)
  - Native: `@capacitor/preferences`-backed adapter

The Supabase client at `src/integrations/supabase/client.ts` is auto-generated and **must not be edited**. Instead, we wrap it: create `src/integrations/supabase/index.ts` that re-exports the client, and on native injects the Preferences storage by re-creating the client with native options. Web imports continue to get the original client unchanged.

**Web impact check:** the shim defaults to current behavior. We will diff `Network` tab and console output before/after on the web preview.

## Phase 3 — Native-only feature wiring

Touch as few existing files as possible. Each touched file gets a single `if (isNative)` branch, with the existing code as the `else`.

- `useScanCards.tsx` — call `platform.camera.pickImages()` (which returns existing behavior on web)
- `Integrations.tsx` (Slack/HubSpot connect) — call `platform.oauth.startOAuth()` (returns existing redirect on web)
- `DashboardLayout.tsx` — add iOS safe-area padding via Tailwind `env(safe-area-inset-*)` classes, which are no-ops on browsers without notches

**Edge functions** (`slack-callback`, `hubspot-callback`) get a small additive change: if a `platform=ios` query param is present in the OAuth state, redirect to `scanbusinesscard://oauth-callback?...`. Otherwise behave exactly as today. **Web users never send `platform=ios`**, so they hit the unchanged code path.

## Phase 4 — App Store compliance (additive only, web unaffected)

These are all things that *also* improve the web app, so adding them now is safe:

1. **Account deletion** (Apple requires it): new `/dashboard/settings` page + `delete-account` edge function. Visible on web too — good practice and required by GDPR anyway.
2. **Sign in with Apple** (insurance against future Google sign-in): added as an optional button on `/auth`. Won't replace email/password; web users see one extra button.
3. **Payments on iOS** — the only real product decision: Stripe is **not allowed** for digital subscriptions inside an iOS app. Two options, both web-safe:
   - **Option A (recommended for v1):** On iOS only, hide the upgrade CTA in `Billing.tsx`. Web continues to show Stripe checkout exactly as today.
   - **Option B:** Add Apple In-App Purchase via `@capacitor-community/in-app-purchases` for iOS, keep Stripe for web. More work, 30% Apple cut, but allows in-app upgrades.
4. **Privacy manifest** (`PrivacyInfo.xcprivacy`) — iOS-only file, ignored by web.

## Phase 5 — Build, ship, monitor (on your Mac)

```text
1. git pull
2. npm install
3. npx cap add ios
4. npm run build && npx cap sync ios
5. npx cap open ios       ← Xcode
6. Set Team + Bundle ID, Archive, Distribute → App Store Connect
7. Fill listing in App Store Connect, submit for review (24–72h typical)
```

---

## QA: how we prove the web app didn't break

Before merging any native change, run this checklist on the **web preview**:

1. Visit `/`, `/auth`, `/dashboard`, `/dashboard/leads`, `/dashboard/integrations`, `/dashboard/billing` — no console errors, no failed network requests.
2. Sign up + log in (email/password) — redirects to dashboard.
3. Upload a card photo from desktop file picker — extraction works, lead saved.
4. Click "Connect Slack" and "Connect HubSpot" — OAuth opens in a new tab and returns successfully (this is the existing flow — must be untouched).
5. Stripe upgrade flow on `/dashboard/billing` — checkout opens, returns to app.
6. Diff `dist/` bundle size before vs after Phase 1–3. Capacitor adds ~0 KB to the web bundle when properly tree-shaken; if it grows >5 KB, the dynamic imports are wrong and we fix before shipping.

After Phase 1–3 land, we re-run the checklist. Any regression blocks the iOS work until fixed.

---

## Side note on the current console error

I noticed a `slack-oauth` "Failed to fetch" in your console logs from earlier today. That's an existing web bug unrelated to the iOS plan — worth flagging but I won't touch it inside this plan unless you want it bundled in.

---

## Technical details (files touched)

**New files (web-inert by default):**
- `capacitor.config.ts`
- `src/lib/platform/camera.ts`, `oauth.ts`, `storage.ts`, `index.ts`
- `src/integrations/supabase/index.ts` (wrapper around auto-generated client)
- `src/pages/dashboard/Settings.tsx`
- `supabase/functions/delete-account/index.ts`

**Modified files (single guarded branch each):**
- `src/hooks/useScanCards.tsx` — `if (isNative) ... else ${existing code}`
- `src/pages/dashboard/Integrations.tsx` — same pattern
- `src/pages/dashboard/Billing.tsx` — hide Stripe CTA when `isNative` (Option A)
- `src/components/DashboardLayout.tsx` — additive safe-area CSS classes
- `supabase/functions/slack-callback/index.ts`, `hubspot-callback/index.ts` — additive `platform` query handling
- `supabase/config.toml` — register `delete-account`
- `package.json` — add Capacitor deps

**Files explicitly NOT touched:**
- `src/integrations/supabase/client.ts` (auto-generated)
- `src/integrations/supabase/types.ts` (auto-generated)
- All marketing pages (`Index`, `AltCamcard`, `Compare*`, etc.)
- All UI primitives in `src/components/ui/`

---

## Open questions before I build

1. **Payments on iOS — Option A (free on iOS, upgrade on web) or Option B (Apple IAP)?**
2. **Add Sign in with Apple now**, or wait until needed?
3. **Want me to also fix the Slack OAuth "Failed to fetch" error** while I'm in there, or keep it separate?
