# Owner portal

Public site: `https://www.wellnessneedles.ie`  
Owner portal: `https://portal.wellnessneedles.ie` (Cloudflare Access)

www stays on baked marketing content until **both** are true:

1. Production Release bakes `NEXT_PUBLIC_SITE_OVERLAY_ENABLED=true` (allows www to fetch `/api/bff/site`).
2. Settings → **Public website overlay** is published on.

If the overlay API fails, www keeps the baked site automatically. You do not redeploy for that.

## Overlay off-ramps

1. **Automatic.** Fetch/parse/BFF failure → baked `contactConfig`, catalogs, and Google review cards. Booking email still uses Turnstile + Web3Forms.
2. **Owner switch (no Release).** Turn off **Public website overlay** and Publish. www returns to baked content on the next fetch (KV/CDN up to ~60s).
3. **Release kill switch.** Set `NEXT_PUBLIC_SITE_OVERLAY_ENABLED: "false"` in `.github/workflows/deploy-production.yml` (build **and** deploy steps) and cut a production Release. Client never fetches overlay, and www deploys **booking Functions only** (no `/api/bff`), same as live today.

Do not set this in the Cloudflare dashboard — `NEXT_PUBLIC_*` is baked at build time. The workflow line is the switch.

## Settings

| Switch | Default | Effect after Publish |
|--------|---------|----------------------|
| Public website overlay | off until you turn it on | www uses portal hours, contact, pricing, locations, insurers, booking mode |
| Booking form / Calendly / Fresha | one channel required | mutually exclusive |
| Patient SMS | **off** | Shows the booking-form text opt-in and allows Twilio on confirm / day-before reminder / cancel. Email still sends when this is off. |

Footer tagline, footer description, emergency note, and About insurance paragraphs are not edited in the portal (baked copy). Clinic name, hours, locations, insurance **logos** (add / remove / website URL), and pricing are.

## Cloudflare dashboard (before first production use)

1. D1 database (EU), bind as `DB` on **both** Pages projects **and** Worker `wellness-needles-reminders`
2. KV namespace, bind as `SITE_CACHE` on both Pages projects (not required on the Worker)
3. Pages project `wellness-needles-portal` (Git disconnected), custom domain `portal.wellnessneedles.ie`
4. Zero Trust Access on `portal.wellnessneedles.ie` and `*.wellness-needles-portal.pages.dev`
5. Portal secrets: `CF_ACCESS_AUD`, `CF_ACCESS_TEAM_DOMAIN`, `RESEND_API_KEY` (same key as www)
6. Worker `wellness-needles-reminders` secret: `RESEND_API_KEY` (day-before email)
7. Optional Twilio (patient SMS): `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM` on **portal** and **the Worker**. `TWILIO_FROM` is the Twilio number (E.164). A branded name needs a ComReg-registered alphanumeric Sender ID (max 11 characters — “Wellness Needles” is too long). Do not put Twilio on www.
8. Apply schema: `npx wrangler d1 execute wellness-needles --file=d1/schema.sql` (re-run after schema changes; `site_change_history` is portal-only). System Settings shows published FROM → TO history (not draft typing). Do **not** re-run schema to enable overlay, SMS, or reminders.

Do **not** change apex, www, or Zoho MX. Do **not** put Access on www.

## Local

```bash
npm run dev                 # marketing site
npm --prefix portal install
npm --prefix portal run dev # portal UI on :3001 (APIs need wrangler pages dev)
```

## Patient messages

Submit-time **thank-you** (`/api/booking-thank-you`) is “request received”, not a confirmed appointment.

After owner **Confirm** (exact Europe/Dublin start):

| Event | Email | SMS |
|-------|-------|-----|
| Confirm, still before 09:00 Dublin the calendar day before | Confirmation | Same, only if Patient SMS is on **and** the patient opted in |
| Confirm on that day-before window, or on the appointment day | One combined “see you then” (no later reminder) | Same, if opted in |
| 09:00 Dublin on the calendar day before (Cron Worker `*/15`) | Reminder | Same, if opted in |
| Cancel | Cancel notice | Same, if opted in |

Example: confirmed Wednesday 14:00 Dublin → confirmation now; reminder Tuesday from 09:00.

SMS uses the same words as email (first 160 characters). Failure must not block email. E2E never sends live email/SMS (`NEXT_PUBLIC_E2E`).

Website booking-form requests persist to the portal Appointments inbox only when overlay is on and www has `/api/bff/booking-persist`. Existing email/phone/Calendly bookings are not imported. Persist failure must not block the clinic email.

## Deploy

Release deploys www with booking Functions (`booking-request`, `booking-thank-you`, `booking-captcha`, `review-submit`, `reviews`). When the overlay kill switch is `"true"`, www also gets public BFF: `/api/bff/site`, `/api/bff/booking-persist`, `/api/bff/insurance-logo`. `/api/admin` is never uploaded to www. Portal and the reminder Worker are extra steps and must not fail the www deploy.

Go-live overlay: deploy with the kill switch `"true"`, confirm `https://www.wellnessneedles.ie/api/bff/site` is 200, then Publish overlay on in the portal.

Go-live SMS: Twilio secrets on portal + Worker, redeploy both, Settings → Patient SMS On → Publish. Overlay stays on.
