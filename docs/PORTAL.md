# Owner portal

Public site: `https://www.wellnessneedles.ie`  
Owner portal: `https://portal.wellnessneedles.ie` (Cloudflare Access)

The public overlay is **off by default**, and production Releases bake `NEXT_PUBLIC_SITE_OVERLAY_ENABLED=false` so www never applies portal content. www stays as it is today until that kill switch is removed in a later Release **and** System Settings → “Show portal changes on the public website” is published on.

## Cloudflare dashboard (before first production use)

1. D1 database (EU), bind as `DB` on **both** Pages projects and the Cron Worker
2. KV namespace, bind as `SITE_CACHE` on both Pages projects
3. Pages project `wellness-needles-portal` (Git disconnected), custom domain `portal.wellnessneedles.ie`
4. Zero Trust Access on `portal.wellnessneedles.ie` and `*.wellness-needles-portal.pages.dev`
5. Portal secrets: `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, `RESEND_API_KEY` (same key as www)
6. Optional Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` on portal + Cron Worker
7. Apply schema: `npx wrangler d1 execute wellness-needles --file=d1/schema.sql` (re-run after schema changes; `site_change_history` is portal-only). System Settings shows published FROM → TO history (not draft typing).

Do **not** change apex, www, or Zoho MX. Do **not** put Access on www.

## Local

```bash
npm run dev                 # marketing site
npm --prefix portal install
npm --prefix portal run dev # portal UI on :3001 (APIs need wrangler pages dev)
```

## Patient messages

| Event | Email | SMS (if opted in) |
|-------|-------|-------------------|
| Confirm (>24h) | Confirmation | Same |
| Confirm (within 24h) | One combined “see you then” | Same |
| 24h before start | Reminder (Cron Worker `*/15`) | Same |
| Cancel | Cancel notice | Same |

SMS failure must not block email. E2E never sends live email/SMS (`NEXT_PUBLIC_E2E`).

## Deploy

Release deploys www with the **existing booking Functions only** (`booking-request`, `booking-thank-you`, `booking-captcha`). `/api/bff` and `/api/admin` are not uploaded to www while overlay is off. Portal and the reminder Worker are extra steps and must not fail the www deploy.
