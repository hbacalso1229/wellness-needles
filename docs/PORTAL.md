# Owner portal

Public site: `https://www.wellnessneedles.ie`  
Owner portal: `https://portal.wellnessneedles.ie` (Cloudflare Access)

How website bookings work for the clinic: [OWNER-BOOKINGS.md](OWNER-BOOKINGS.md).  
System architecture (runtimes, Confirm pipeline, ICS): [ARCHITECTURE.md](ARCHITECTURE.md).

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
| Patient SMS | **off** | Shows the booking-form text opt-in and allows Twilio on confirm / reschedule / day-before reminder / cancel. Email still sends when this is off. |

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
npm run test:unit           # ICS, Dublin times, duration, 15-minute snap
```

## How bookings work (clinic owner)

Plain-language process: [OWNER-BOOKINGS.md](OWNER-BOOKINGS.md). Architecture: [ARCHITECTURE.md](ARCHITECTURE.md). Appointments inbox, Confirm (exact Ireland time), Reschedule on Confirmed, automatic day-before reminder, optional SMS.

## Patient booking request flow (technical)

Overlay-on **website booking form** only. Calendly / Fresha / phone bookings do not enter the portal Appointments inbox. Runtimes and Confirm order: [ARCHITECTURE.md](ARCHITECTURE.md).

```mermaid
flowchart TD
  patient[Patient submits booking form]
  captcha[Turnstile check]
  clinicEmail[Clinic email via Web3Forms]
  persist[Save pending row to D1]
  thankYou[Patient thank-you email via Resend]
  page[Thank-you page]
  inbox[Portal Appointments inbox]
  confirm[Owner Confirm + 15-min Dublin start]
  cancel[Owner Cancel]
  combined{Already in reminder window?}
  confirmMail[Patient card + invite.ics]
  combinedMail[Patient see-you-then + invite.ics]
  saveD1[D1 status confirmed]
  clinicCopy[waitUntil clinic ICS to info@]
  cron[Reminder Worker every 15 min]
  remindMail[Reminder card no ICS]
  smsGate{Patient SMS On and opted in?}

  patient --> captcha --> clinicEmail
  clinicEmail -->|success| persist
  persist --> thankYou --> page
  persist --> inbox
  inbox --> confirm
  inbox --> cancel
  confirm --> combined
  combined -->|no| confirmMail --> saveD1
  combined -->|yes| combinedMail --> saveD1
  saveD1 --> clinicCopy
  clinicCopy --> afterConfirm{Last-minute Confirm?}
  afterConfirm -->|no| cron --> remindMail
  afterConfirm -->|yes| done[Done]
  confirmMail --> smsGate
  combinedMail --> smsGate
  remindMail --> smsGate
  cancel --> smsGate
  smsGate -->|yes| twilio[Twilio SMS same text]
  smsGate -->|no| emailOnly[Email only]
```

Patient SMS, when on, is sent with the patient email **before** D1 is updated. Clinic ICS is `waitUntil` **after** D1. Last-minute Confirm sets reminder flags so the Worker does not send again.

1. **Patient request (www).** Preferred date/time window, not an exact slot. SMS checkbox only if overlay is on **and** Patient SMS is published on. Turnstile must pass, then clinic email (`/api/booking-request` → Web3Forms). If that fails, the patient sees unable-to-process; nothing is saved to the portal.
2. **Persist.** On clinic-email success, if overlay is on, the browser fire-and-forget posts to `/api/bff/booking-persist`. Persist failure does **not** block the clinic email.
3. **Thank-you.** Resend `/api/booking-thank-you` is “request received”, not a confirmed appointment. Patient lands on `/bookings/thank-you/`.
4. **Portal inbox.** D1 row `status = pending` with preferred date/time and `sms_opt_in`. Appointments → **Pending** shows Confirm / Cancel. After Confirm, the row moves to **Confirmed** (Reschedule / Cancel).
5. **Confirm.** Owner sets an exact Europe/Dublin start (portal picker and API snap to 15-minute steps). Sets `starts_at` and `remind_at` = 09:00 Dublin on the calendar day before. Before that window: HTML appointment card + `invite.ics`; Worker reminds later. Already in the window: same card with heading “See you then.”; cron does not send again. Greeting is “Hi {first name}, we look forward to seeing you.” (does not repeat “confirmed”). Actions: Add to Calendar (Google template) and Get Directions on one row, Call Wellness Needles below. Patient email is awaited; D1 is updated next; clinic ICS copy is `waitUntil` after that so a slow `info@` send cannot leave the row pending. Cc `info@` plus that clinic copy of the same ICS UID if self-CC is dropped. Duration: Initial 75 min, follow-up/package 45 min, else 60. ICS failure retries the email without the attachment.
6. **Reschedule.** Confirmed rows only. `{ action: 'reschedule', startsAtLocal, serviceType, locationLabel, serviceLabel }`. Same 15-minute snap. Same notify order (patient mail → D1 → `waitUntil` clinic ICS). Heading **Appointment updated**. ICS same UID, `SEQUENCE = ics_sequence + 1`. Current service/location stay valid if later unpublished. Recomputes `remind_at`; clears reminder flags if the new slot is still before the day-before window, otherwise sets them so the Worker does not send again.
7. **Cancel.** Pending: “we could not confirm this request” (plain text, no ICS). Already confirmed: “appointment cancelled” plus `METHOD:CANCEL` with the same UID and `SEQUENCE = ics_sequence + 1` (still 1 if never rescheduled).
8. **Day-before reminder.** Worker `wellness-needles-reminders` (`*/15`) emails confirmed rows where `remind_at <= now` and `reminder_email_sent = 0`. Same HTML card as Confirm (heading “See you tomorrow”); Google Calendar link only (no second ICS). There is no same-day reminder.

**SMS (optional, steps 5–8).** Twilio only if Patient SMS is published on, the patient opted in, and Twilio secrets are on **portal** (confirm/reschedule/cancel) and **Worker** (reminder). Same words as email (first 160 characters). SMS failure does not block email. www has no Twilio.

**Gates.** Overlay off: Turnstile + clinic email + thank-you still run; **no** D1 persist, **no** portal card. Patient SMS off: checkbox hidden; confirm/reschedule/cancel/reminder stay email-only.

### Sequence diagrams

Same style as the thank-you-email sequence (Patient → Site_bookings → Web3Forms → Zoho_info → Resend). Overlay-on production uses Turnstile, then adds D1 persist, portal Confirm/Reschedule/Cancel, day-before reminder, and optional Twilio. Confirm and Reschedule order is patient mail → D1 → clinic ICS `waitUntil` ([ARCHITECTURE.md](ARCHITECTURE.md#confirm-pipeline)).

![Patient booking request sequence](booking-sequence-request.png)

![Owner Confirm, reminder, optional SMS](booking-sequence-confirm.png)

![Owner Reschedule sequence](booking-sequence-reschedule.png)

![Owner Cancel sequence](booking-sequence-cancel.png)

Mermaid source: [booking-sequence-request.mmd](booking-sequence-request.mmd), [booking-sequence-confirm.mmd](booking-sequence-confirm.mmd), [booking-sequence-reschedule.mmd](booking-sequence-reschedule.mmd), [booking-sequence-cancel.mmd](booking-sequence-cancel.mmd). System diagram: [architecture-system.mmd](architecture-system.mmd).

## Patient messages

Submit-time **thank-you** (`/api/booking-thank-you`) is “request received”, not a confirmed appointment.

After owner **Confirm** (exact Europe/Dublin start):

| Event | Email | Heading | SMS | Subject |
|-------|-------|---------|-----|---------|
| Confirm, still before 09:00 Dublin the calendar day before | Card + calendar invite (Cc `info@` / Zoho, then `waitUntil` clinic copy) | Appointment confirmed | Same, only if Patient SMS is on **and** the patient opted in | `Wellness Needles — appointment confirmed` |
| Confirm on that day-before window, or on the appointment day | Same card + invite (no later reminder) | See you then | Same, if opted in | `Confirmed, see you then` |
| Reschedule confirmed appointment | Same card + replacement invite (`SEQUENCE` + 1) | Appointment updated | Same, if opted in | `Wellness Needles — appointment updated` |
| 09:00 Dublin on the calendar day before (Cron Worker `*/15`) | Reminder card (no ICS) | See you tomorrow | Same, if opted in | `Reminder — your appointment is tomorrow` |
| Cancel pending request | Cancel notice (no ICS) | — | Same, if opted in | `Wellness Needles — we could not confirm this request` |
| Cancel confirmed appointment | Cancel notice + calendar cancel | — | Same, if opted in | `Wellness Needles — appointment cancelled` |

Example: confirmed Wednesday 14:00 Dublin → confirmation now; reminder Tuesday from 09:00.

SMS is a short labeled text (first 160 characters), not the HTML card. Failure must not block email. ICS failure must not block email. E2E never sends live email/SMS (`NEXT_PUBLIC_E2E`).

Confirm / reminder HTML is the branded appointment card (same tokens as `/api/booking-thank-you`). Thank-you copy and layout are unchanged aside from sharing those helpers.

Not implemented: same-day reminder subject.

Zoho: Calendar must be on for `info@`. The owner may need to tap **Add** on the first invite. If From `info@` Cc `info@` is dropped as self-mail, the clinic still gets a second Resend to `info@` with the same UID.

Website booking-form requests persist to the portal Appointments inbox only when overlay is on and www has `/api/bff/booking-persist`. Existing email/phone/Calendly bookings are not imported. Persist failure must not block the clinic email.

## Deploy

Release deploys www with booking Functions (`booking-request`, `booking-thank-you`, `booking-captcha`, `review-submit`, `reviews`). When the overlay kill switch is `"true"`, www also gets public BFF: `/api/bff/site`, `/api/bff/booking-persist`, `/api/bff/insurance-logo`. `/api/admin` is never uploaded to www. Portal and the reminder Worker are extra steps and must not fail the www deploy.

Go-live overlay: deploy with the kill switch `"true"`, confirm `https://www.wellnessneedles.ie/api/bff/site` is 200, then Publish overlay on in the portal.

Go-live SMS: Twilio secrets on portal + Worker, redeploy both, Settings → Patient SMS On → Publish. Overlay stays on.

Confirm / Reschedule / reminder card + calendar invite: deploy **portal** (Confirm/Reschedule/Cancel). Run [d1/alter-bookings-ics-sequence.sql](../d1/alter-bookings-ics-sequence.sql) **once** on D1 `wellness-needles` **before** that portal deploy. Do not re-run full `d1/schema.sql`. www is only required for the thank-you helper extract (`functions/_lib/email-brand.ts`). Worker unchanged. Shared modules and deploy matrix: [ARCHITECTURE.md](ARCHITECTURE.md#shared-code).
