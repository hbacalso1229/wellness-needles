# Owner portal

Public site: `https://www.wellnessneedles.ie`  
Owner portal: `https://portal.wellnessneedles.ie` (Cloudflare Access)

www stays on baked marketing content until **both** are true:

1. Production Release bakes `NEXT_PUBLIC_SITE_OVERLAY_ENABLED=true` (allows www to fetch `/api/bff/site`).
2. Settings → “Show portal changes on the public website” is published on.

If the overlay API fails, www keeps the baked site automatically. You do not redeploy for that.

## Overlay off-ramps

1. **Automatic.** Fetch/parse/BFF failure → baked `contactConfig`, catalogs, and Google review cards. Booking email still uses Turnstile + Web3Forms.
2. **Owner switch (no Release).** Uncheck “Show portal changes on the public website” and Publish. www returns to baked content on the next fetch (KV/CDN up to ~60s).
3. **Release kill switch.** Set `NEXT_PUBLIC_SITE_OVERLAY_ENABLED: "false"` in `.github/workflows/deploy-production.yml` (build **and** deploy steps) and cut a production Release. Client never fetches overlay, and www deploys **booking Functions only** (no `/api/bff`), same as live today.

Do not set this in the Cloudflare dashboard — `NEXT_PUBLIC_*` is baked at build time. The workflow line is the switch.

## Cloudflare dashboard (before first production use)

1. D1 database (EU), bind as `DB` on **both** Pages projects and the Cron Worker
2. KV namespace, bind as `SITE_CACHE` on both Pages projects
3. Pages project `wellness-needles-portal` (Git disconnected), custom domain `portal.wellnessneedles.ie`
4. Zero Trust Access on `portal.wellnessneedles.ie` and `*.wellness-needles-portal.pages.dev`
5. Portal secrets: `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, `RESEND_API_KEY` (same key as www)
6. Optional Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` on portal + Cron Worker
7. Apply schema: `npx wrangler d1 execute wellness-needles --file=d1/schema.sql` (re-run after schema changes; `site_change_history` is portal-only). System Settings shows published FROM → TO history (not draft typing).

Do **not** change apex, www, or Zoho MX. Do **not** put Access on www. Do **not** re-run schema to “enable” overlay.

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

Website booking-form requests persist to the portal Bookings inbox only when overlay is on and www has `/api/bff/booking-persist`. Existing email/phone/Calendly bookings are not imported. Persist failure must not block the clinic email.

## Deploy

Release deploys www with booking Functions (`booking-request`, `booking-thank-you`, `booking-captcha`, `review-submit`, `reviews`). When the overlay kill switch is `"true"`, www also gets public BFF: `/api/bff/site`, `/api/bff/booking-persist`, `/api/bff/insurance-logo`. `/api/admin` is never uploaded to www. Portal and the reminder Worker are extra steps and must not fail the www deploy.

Go-live: deploy with the kill switch `"true"`, confirm `https://www.wellnessneedles.ie/api/bff/site` is 200 with `websiteOverlayEnabled` still false (visual site unchanged), then Publish overlay on in the portal.
