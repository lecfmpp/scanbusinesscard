# Migrating ScanBusinessCard off Lovable Cloud

**From:** `jyduaqgmcerjvrpshgap` (Lovable-managed)
**To:** `yvfutrzyckkeikwstovq` ("ScanBusinessCard", org NoBoringFunnels)

Run the phases in order. Phase 3 is the only one with downtime risk, and it is
reversible until you flip the env vars in Phase 6.

---

## Already done (in the repo / new project)

- **Schema created** in the new project: `events`, `business_cards`,
  `subscriptions`, `scan_usage`, `integrations`, `oauth_states`, `blog_posts`,
  plus the `integrations_safe` view. RLS enabled on all. Security advisors clean.
- **AI provider decoupled.** `scan-business-cards` now prefers Google Gemini
  direct (`generativelanguage.googleapis.com/v1beta/openai/chat/completions`,
  model `gemini-2.5-flash`) and falls back to the Lovable gateway only when
  `GEMINI_API_KEY` is unset. Zero-downtime cutover.
- **CORS fixed.** All 15 edge functions previously allowed only `*.lovable.app`,
  which would have rejected every call from `scanbusinesscard.com`. They now
  allow the real domain, `*.netlify.app` previews, `*.lovable.app`, and
  localhost.
- **`FRONTEND_URL` fallbacks** changed from the lovable subdomain to
  `https://scanbusinesscard.com`.
- **`supabase/config.toml`** now points at `yvfutrzyckkeikwstovq`.

---

## Phase 1 — Get both connection strings

Supabase dashboard → Project → Settings → Database → Connection string (URI).
You need the database password for each.

```bash
export OLD_DB="postgresql://postgres.jyduaqgmcerjvrpshgap:<OLD_PW>@<host>:5432/postgres"
export NEW_DB="postgresql://postgres.yvfutrzyckkeikwstovq:<NEW_PW>@<host>:5432/postgres"
```

For the old project, get this from Lovable → Cloud → the Supabase dashboard link.

Sanity check both:
```bash
psql "$OLD_DB" -c "select count(*) from public.business_cards;"   # expect 923
psql "$NEW_DB" -c "select count(*) from public.business_cards;"   # expect 0
```

If you don't have `psql`/`pg_dump`: `brew install libpq && brew link --force libpq`

---

## Phase 2 — Back up first

```bash
pg_dump "$OLD_DB" --no-owner --no-privileges -Fc -f sbc_full_backup.dump
```
Keep this. It is your rollback.

---

## Phase 3 — Move auth users (do this BEFORE app data)

`business_cards.user_id` and `events.user_id` are foreign keys into
`auth.users`. Import users first or every row will fail.

`--column-inserts` makes this resilient to auth-schema column drift between
the two GoTrue versions.

```bash
pg_dump "$OLD_DB" --data-only --no-owner --no-privileges --column-inserts \
  -t auth.users -t auth.identities \
  -f auth_data.sql

psql "$NEW_DB" -v ON_ERROR_STOP=1 -f auth_data.sql
```

Verify:
```bash
psql "$NEW_DB" -c "select count(*) from auth.users;"
```
The count must match the old project. Password hashes and OAuth identities
carry over, so users keep their logins and their existing user IDs, which is
what keeps the foreign keys intact.

> If this errors on a missing column, dump only the columns both sides share:
> compare with
> `psql "$OLD_DB" -c "\d auth.users"` and `psql "$NEW_DB" -c "\d auth.users"`.

---

## Phase 4 — Move app data

Order matters (`events` before `business_cards` for the FK).

```bash
pg_dump "$OLD_DB" --data-only --no-owner --no-privileges \
  -t public.events \
  -t public.business_cards \
  -t public.integrations \
  -t public.subscriptions \
  -t public.scan_usage \
  -f app_data.sql

psql "$NEW_DB" -v ON_ERROR_STOP=1 -f app_data.sql
```

Skip `oauth_states` — it holds short-lived OAuth handshakes and expires anyway.

Verify:
```bash
psql "$NEW_DB" -c "
  select 'business_cards' t, count(*) from public.business_cards
  union all select 'events', count(*) from public.events
  union all select 'integrations', count(*) from public.integrations;"
```
Expect 923 / 34 / 2.

Check nothing was orphaned:
```bash
psql "$NEW_DB" -c "
  select count(*) from public.business_cards b
  left join auth.users u on u.id = b.user_id
  where b.user_id is not null and u.id is null;"
```
Must be 0.

---

## Phase 5 — Deploy edge functions + secrets

```bash
cd /Users/clawdio/Documents/GitHub/ScanBusinessCard
supabase login
supabase link --project-ref yvfutrzyckkeikwstovq
supabase functions deploy          # deploys all 15
```

Then set the secrets (Supabase → Edge Functions → Secrets, or CLI):

```bash
supabase secrets set \
  GEMINI_API_KEY=...        `# NEW - from Google AI Studio` \
  STRIPE_SECRET_KEY=... \
  HUBSPOT_CLIENT_ID=...     HUBSPOT_CLIENT_SECRET=... \
  SLACK_CLIENT_ID=...       SLACK_CLIENT_SECRET=... \
  APPLE_SHARED_SECRET=... \
  FRONTEND_URL=https://scanbusinesscard.com
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically. Do not set them.

`LOVABLE_API_KEY` is deliberately NOT set: that is what activates the Gemini
path. Leave it unset and card scanning runs on your own Google key.

---

## Phase 6 — Auth providers and redirect URLs (new project)

Authentication → URL Configuration:
- Site URL: `https://scanbusinesscard.com`
- Redirect URLs: `https://scanbusinesscard.com/**`, `https://*.netlify.app/**`

Authentication → Providers → enable **Google** and **Apple** with your own
OAuth credentials.

> **This replaces Lovable's managed OAuth.** The app currently signs in through
> `@lovable.dev/cloud-auth-js` (`src/integrations/lovable/index.ts`), which
> brokers Google/Apple through Lovable. Once you leave, that must become native
> Supabase OAuth: swap the two `lovable.auth.signInWithOAuth(...)` calls in
> `src/pages/Auth.tsx` for `supabase.auth.signInWithOAuth(...)`.
> Email/password needs no change. Ask me and I'll make this edit.

Also update the OAuth redirect URIs in the Google Cloud Console, Slack app, and
HubSpot app to point at the new project's callback URLs.

---

## Phase 7 — Point the app at the new project

Update `.env` (committed) and Netlify env vars:

```
VITE_SUPABASE_URL=https://yvfutrzyckkeikwstovq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<new anon key>
VITE_SUPABASE_PROJECT_ID=yvfutrzyckkeikwstovq
```

Also add for the blog renderer:
```
SUPABASE_URL=https://yvfutrzyckkeikwstovq.supabase.co
SUPABASE_ANON_KEY=<new anon key>
```

Commit, push, let Netlify build.

---

## Phase 8 — Smoke test on the live domain

1. Log in with an existing account (proves the auth migration worked).
2. `/dashboard/events` shows your 34 events.
3. `/dashboard/leads` shows your 923 cards.
4. **Scan a card** — proves Gemini direct works. Check the function log for
   `AI provider: gemini-direct`.
5. Slack and HubSpot connect flows complete.
6. `/dashboard/billing` opens Stripe checkout.
7. `/blog` renders.

---

## Phase 9 — Decommission Lovable

Only after Phase 8 passes completely:
1. Remove the custom domain from the Lovable project.
2. Disconnect the Lovable GitHub integration so it stops pushing.
3. Cancel Lovable Cloud.

Keep `sbc_full_backup.dump` for at least a month.

---

## Rollback

Before Phase 7 the old project is untouched and still serving. To roll back,
revert the env vars and redeploy. After Phase 7, restore with:

```bash
pg_restore -d "$OLD_DB" --clean --no-owner --no-privileges sbc_full_backup.dump
```
