# ScanBusinessCard

Scan a pile of business cards in one photo and get the contacts into your CRM.

**Live site:** https://scanbusinesscard.com

## Stack

- **Frontend:** Vite + React + TypeScript + shadcn-ui + Tailwind CSS
- **Backend:** Supabase (Postgres, auth, edge functions) — project `yvfutrzyckkeikwstovq`
- **Card OCR:** Google Gemini (`gemini-2.5-flash`), called directly from the
  `scan-business-cards` edge function
- **Hosting:** Netlify, built from `main` in this repo
- **Native:** Capacitor (iOS)

## Local development

Requires Node.js and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)).

```sh
npm install
npm run dev
```

`.env` holds the Supabase URL, project id, and the publishable (anon) key. Those
are safe to commit — the anon key carries no privileges of its own and every
table is protected by row-level security. Never commit a service_role key,
Stripe key, or OAuth client secret; this repository is public.

## Configuration

Environment variables are split across two places, and putting them in the wrong
one either does nothing or fails the build:

**Netlify** (Site configuration → Environment variables) — these five only:

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | baked into the client bundle at build time |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | anon key, baked into the bundle |
| `VITE_SUPABASE_PROJECT_ID` | baked into the bundle |
| `SUPABASE_URL` | read by the `/blog` Netlify edge function |
| `SUPABASE_ANON_KEY` | read by the `/blog` Netlify edge function |

**Supabase** (Edge Functions → Secrets) — everything the server needs:

`GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `HUBSPOT_CLIENT_ID`,
`HUBSPOT_CLIENT_SECRET`, `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`,
`APPLE_SHARED_SECRET`, `FRONTEND_URL`.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are
injected into edge functions automatically — do not set them by hand.
`LOVABLE_API_KEY` is deliberately left unset: that is what makes
`scan-business-cards` use Gemini directly rather than the old Lovable gateway.

## Deploying

Pushing to `main` builds and deploys via Netlify. There is no manual publish
step. `VITE_*` values are compiled into the bundle at build time, so changing
one in the Netlify UI has no effect until the next build runs.

## Edge functions

The 15 functions in `supabase/functions/` deploy to the Supabase project.
`supabase/config.toml` sets `verify_jwt` per function — `hubspot-callback` and
`slack-callback` are public because they receive redirects from the OAuth
provider; every other function requires a valid JWT.

```sh
supabase link --project-ref yvfutrzyckkeikwstovq
supabase functions deploy
```

## iOS app

The native platform is not checked into this repo. To work on it:

```sh
npm run build      # Capacitor ships whatever is in dist/
npx cap add ios    # first time only, generates ios/
npx cap sync ios
npx cap open ios   # requires Xcode
```

`capacitor.config.ts` intentionally has no `server` block, so the app runs from
the assets bundled out of `dist/`. Adding a `server.url` makes the installed app
load its web content from a remote origin at runtime — useful for live reload
locally, but it must never be committed.
