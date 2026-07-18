# auth.md — ScanBusinessCard agent authentication

This document tells AI agents how to authenticate with the ScanBusinessCard
API. It complements the machine-readable OAuth metadata linked below.

## Audience

Autonomous agents and MCP clients that want to scan business cards, read
captured leads, or export leads to Slack / HubSpot / Google Sheets on behalf
of a ScanBusinessCard user.

## Resource

- **Resource identifier:** `https://jyduaqgmcerjvrpshgap.supabase.co/functions/v1`
- **Protected Resource Metadata:** <https://scanbusinesscard.com/.well-known/oauth-protected-resource>
- **OpenAPI description:** <https://scanbusinesscard.com/.well-known/openapi.json>

## Authorization servers

- **Issuer:** `https://jyduaqgmcerjvrpshgap.supabase.co/auth/v1`
- **Authorization Server Metadata:** <https://scanbusinesscard.com/.well-known/oauth-authorization-server>
- **OpenID Connect discovery:** <https://scanbusinesscard.com/.well-known/openid-configuration>

Tokens are Supabase-issued JWTs. Present them on every request as:

```
Authorization: Bearer <access_token>
```

Bearer methods supported: `header`.

## Registration

ScanBusinessCard uses standard end-user OAuth — an agent acts on behalf of a
signed-in user rather than registering its own client.

- **Register / sign in:** <https://scanbusinesscard.com/auth>
- Supported identity types: user-delegated (Google, Apple, or email/password),
  plus anonymous read where the resource allows it.
- Credential types: `oauth_bearer_token`, `api_key`.

To obtain a token programmatically, run the OAuth 2.0 Authorization Code flow
(PKCE, `S256`) against the issuer above, or exchange user credentials at
`POST https://jyduaqgmcerjvrpshgap.supabase.co/auth/v1/token`.

## Scopes

`openid`, `email`, `profile`.

## Revocation

Revoke a session by calling
`POST https://jyduaqgmcerjvrpshgap.supabase.co/auth/v1/logout` with the bearer
token, or delete the account entirely via `POST /functions/v1/delete-account`.

## Contact

support@scanbusinesscard.com
