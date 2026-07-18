# ScanBusinessCard — Leave Lovable, Go Live on Netlify

This is the cutover runbook: how to move hosting off Lovable to Netlify (or
anywhere) and keep the website — and its backend — online with **zero downtime**.

---

## 0. The mental model (read this first)

Lovable gives you three separate things. They move independently:

| What Lovable provides | Where it goes | Does leaving Lovable break it? |
| --- | --- | --- |
| **Hosting** (scanbusinesscard.lovable.app) | → Netlify | No — this is what we're replacing. |
| **Backend** = a real Supabase project (`jyduaqgmcerjvrpshgap`) — DB + edge functions | → stays exactly where it is | No. Your frontend already calls Supabase directly with the anon key in `.env`. Lovable is not in that request path. |
| **Managed Google/Apple login** (`@lovable.dev/cloud-auth-js`) | → keep, or move to Supabase-native OAuth | **This is the only thing that can break.** Email/password login is native Supabase and is unaffected. |

**Bottom line:** moving hosting to Netlify is safe. Keep the Supabase project
alive. Test social login after cutover (details in §5).

---

## 1. Pre-flight

1. **Export the code to GitHub** (if not already). In Lovable: top-right →
   GitHub → Connect / Export. You now own the repo and can deploy anywhere.
   *(This migrated folder is that code, ready to push.)*
2. **Confirm the backend stays put.** You chose to keep the existing Supabase
   project. Do **not** delete the Lovable project or hit "Remove Lovable Cloud"
   yet — the Supabase backend lives inside the Lovable Cloud account. Keeping
   the Lovable project (even unused) keeps the backend billed and running.
   *(Optional, later: fully own the backend by migrating it to your own Supabase
   — see §7. Not required to go live.)*
3. **Grab your env values** from `.env` — you'll paste them into Netlify:
   - `VITE_SUPABASE_URL` = `https://jyduaqgmcerjvrpshgap.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = (anon key in `.env`)
   - `VITE_SUPABASE_PROJECT_ID` = `jyduaqgmcerjvrpshgap`

---

## 2. Deploy to Netlify (site goes live on a temporary URL)

1. Push this repo to GitHub.
2. Netlify → **Add new site → Import from Git** → pick the repo. Build settings
   auto-detect from `netlify.toml` (build `npm run build`, publish `dist`,
   Node 22).
3. Netlify → Site settings → **Environment variables** → add the three `VITE_*`
   values from step 1.3.
4. **Deploy.** You now have a live URL like `your-site.netlify.app`.
5. Smoke-test on that `.netlify.app` URL **before** touching the domain
   (see §5). The site is live here in parallel with Lovable — nothing has
   switched over yet, so there's no downtime risk.

---

## 3. Point Supabase Auth at the new domain (do this BEFORE the domain switch)

Auth redirects (email confirmation, password reset, OAuth returns) only work for
URLs Supabase explicitly allows. Add the new hosts now so they're ready:

Supabase dashboard → **Authentication → URL Configuration**:
- **Site URL:** `https://scanbusinesscard.com`
- **Redirect URLs (add all):**
  - `https://scanbusinesscard.com/**`
  - `https://your-site.netlify.app/**` (so you can test before the domain moves)

*(You can reach the Supabase dashboard for this project from Lovable → Cloud tab,
or log in to Supabase directly if you've been given access.)*

---

## 4. Move the domain to Netlify

Your domain (`scanbusinesscard.com`) currently resolves to Lovable. Point it at
Netlify instead. Two ways — pick one:

**Option A — Netlify DNS (simplest).**
1. Netlify → Domains → **Add a domain you already own** → `scanbusinesscard.com`.
2. Netlify shows you nameservers. At your **registrar**, change the domain's
   nameservers to Netlify's.
3. Netlify auto-creates the records and provisions HTTPS.

**Option B — External DNS (keep DNS where it is).**
1. Netlify → Domains → add the domain, choose "use external DNS".
2. At your current DNS host add what Netlify shows, typically:
   - Apex `A` record → `75.2.60.5`
   - `www` `CNAME` → `your-site.netlify.app`
3. Netlify provisions HTTPS once records propagate.

Then in Netlify set **`scanbusinesscard.com` as the primary domain** and let it
redirect `www` → apex (matches the non-www canonical URLs already in the code).

DNS propagation can take a few minutes to a few hours. Because the Netlify site
was already live and tested in §2, the switch is just a redirect of traffic.

---

## 5. Smoke test (run on .netlify.app first, then on the real domain)

Walk the same checklist the original build used:
1. Visit `/`, `/pricing`, `/auth`, `/dashboard`, `/dashboard/leads`,
   `/dashboard/integrations`, `/dashboard/billing` — no console errors, no failed
   network calls.
2. **Email/password** sign up + log in → lands on dashboard. *(Native Supabase —
   should always work.)*
3. **Google + Apple login** → completes and returns to the app. **← the coupling
   to watch.** If this fails after cutover, see the OAuth note below.
4. Upload a card photo → extraction works, lead saved.
5. Connect Slack / HubSpot → OAuth opens and returns successfully.
6. Stripe upgrade on `/dashboard/billing` → checkout opens and returns.
7. Agent files resolve: `curl -sI https://scanbusinesscard.com/ | grep -i '^link:'`
   and open `/.well-known/api-catalog`, `/llms.txt`, `/auth.md`.

**OAuth note (Google/Apple):** these currently go through Lovable's managed auth
(`@lovable.dev/cloud-auth-js`). They should keep working as long as the Lovable
project exists. If you later remove Lovable Cloud entirely and social login
breaks, fix it by configuring the Google and Apple providers **directly in
Supabase** (Authentication → Providers → paste your own OAuth client ID/secret)
and switching the two `signInWithOAuth` calls to `supabase.auth.signInWithOAuth`.
Email/password needs none of this.

---

## 6. Disconnect Lovable (only after the domain works on Netlify)

Once `https://scanbusinesscard.com` serves from Netlify and the smoke test
passes:
1. In Lovable, **stop publishing / unpublish** the Lovable-hosted site (or just
   stop using it — the `.lovable.app` URL can stay as a dead mirror harmlessly).
2. If the domain was connected inside Lovable, **remove the custom domain** from
   the Lovable project so it doesn't try to reclaim it.
3. **Keep the Lovable project itself** (don't delete it) so the Supabase backend
   keeps running — unless you've migrated the backend per §7.
4. Keep Git bi-directional sync in mind: if the Lovable↔GitHub sync is still on,
   Lovable can keep pushing to the repo. If you want Netlify to be the only
   source of truth, disconnect the GitHub integration in Lovable.

---

## 7. (Optional, later) Fully own the backend

Only if you want zero Lovable dependency. There's no automatic migration; you
move it manually:
1. Create your own Supabase project.
2. Apply the SQL in `supabase/migrations/` to it.
3. Redeploy the edge functions in `supabase/functions/` (`supabase functions
   deploy`) and re-add their secrets (Stripe, HubSpot, Slack, OpenAI/AI keys,
   `APPLE_SHARED_SECRET`, etc.).
4. Export/import your data (Supabase dashboard or `pg_dump`).
5. Reconfigure Auth providers + redirect URLs on the new project.
6. Update the three `VITE_*` env vars in Netlify to the new project, redeploy.
7. Update the hard-coded `jyduaqgmcerjvrpshgap` references in the agent files
   under `public/.well-known/` (openid-configuration, oauth-* , api-catalog,
   openapi.json, mcp/server-card.json) and `public/auth.md`.
8. Now you can safely "Remove Lovable Cloud" / delete the Lovable project.

Lovable's own path for this: Cloud tab → Overview → Advanced settings → **Export
project data + Remove Lovable Cloud**, then connect your own Supabase.

---

## 8. Rollback

If anything looks wrong after the DNS switch, revert the nameserver/records
change to point back at Lovable — the Lovable site is untouched until you
unpublish it in §6, so it's a clean fallback.

---

## Deploying somewhere other than Netlify

The app is a standard Vite SPA, so any static host works. You only need to
re-create three things this repo wires for Netlify:
- **Build:** `npm run build`, publish `dist/` (Node 18+).
- **SPA fallback:** rewrite all unmatched paths to `/index.html` (200).
- **Headers:** the `Link:` header + content types in `public/_headers`.

Vercel equivalent: a `vercel.json` with a filesystem-handle then a catch-all
rewrite to `/index.html`, plus a `headers` block mirroring `public/_headers`.
Ask and I'll generate it.
