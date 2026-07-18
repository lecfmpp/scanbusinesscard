# Scan Business Cards

Capture contacts from business cards in bulk and export them to a CRM using
ScanBusinessCard.

## What this skill does

Turns photos of business cards into structured leads (name, title, company,
email, phone) and pushes them to Slack, HubSpot, or Google Sheets. A single
photo can contain 20+ cards.

## Authentication

All API calls require a Supabase-issued bearer token. See
<https://scanbusinesscard.com/auth.md> and the OAuth metadata at
<https://scanbusinesscard.com/.well-known/oauth-protected-resource>.

Base URL: `https://jyduaqgmcerjvrpshgap.supabase.co/functions/v1`

## Steps

1. **Authenticate.** Obtain an access token from the authorization server
   (`https://jyduaqgmcerjvrpshgap.supabase.co/auth/v1`). Send it as
   `Authorization: Bearer <token>` on every request.
2. **Scan.** `POST /scan-business-cards` with a JSON body
   `{ "images": ["<base64-or-url>"], "eventId": "<optional>" }`.
   Returns extracted leads.
3. **Export.** Send captured leads to a connected destination:
   - `POST /send-to-slack`
   - `POST /send-to-hubspot`
4. **Check plan limits.** `GET /check-subscription` returns the caller's
   subscription tier and remaining quota.

## Notes

- The OpenAPI description is at
  <https://scanbusinesscard.com/.well-known/openapi.json>.
- Free accounts have scan limits; upgrade via `POST /create-checkout` (web).
- To delete all data: `POST /delete-account`.
