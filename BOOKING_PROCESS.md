# Booking process (real world vs this site)

Small TCM / acupuncture clinics usually confirm appointments in a **calendar tool** (Calendly, Fresha, Jane, Cliniko, etc.), not in a static website form. This site follows that model.

## Primary mode: Calendly (default)

`contactConfig.features`: `calendlyEnabled: true`, `bookingFormEnabled: false`, `freshaEnabled: false`.

**Patient flow**

1. Choose visit type, service, clinic, optional add-ons on `/bookings`
2. Pick a live time in the Calendly embed → **instant confirmed booking**
3. Calendly sends confirmation / reminders (configured in Calendly)
4. Phone / email remain as fallback

**Ops checklist (configure in Calendly — not in this repo)**

1. Separate event types: **Initial** (~75 min) and **Follow-up** (~45 min), with clear prices
2. Point Admin / `calendlyInitialUrl` and `calendlyFollowUpUrl` at those events
3. Invitee questions: preferred clinic (Celbridge / Carlow), add-ons, chief complaint / new patient
4. Enable email (and SMS if available) confirmations + reminders
5. Optional: intake / “what to expect” link in the confirmation email for first visits
6. One Calendly user for both clinics; add buffers if travel time is needed between sites

## Alternative: Fresha

Enable only Fresha **or** Calendly in Admin (not both). Fresha owns schedule, confirmation, and reminders. On-page service selections are for pricing context; the patient finishes booking on Fresha.

## Legacy stepper form = appointment *request* only

When `bookingFormEnabled` is on, the multi-step UI collects preferred time and details. It does **not** lock a calendar slot. Copy must say **request**; confirmation happens when the clinic replies (or when email is configured via Web3Forms — see [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md)).

**After submit (legacy form)**

| Outcome | What the patient sees |
|---------|------------------------|
| Success | `/bookings/thank-you/` — appreciation + request summary |
| Send / config failure | `/bookings/unable-to-process/` — apologetic page with **Call** / **Email** and a close control back to `/bookings/` (no technical error text) |
| Incomplete security check (hCaptcha) | Stay on form — inline security-check message |
| Field validation | Stay on form — inline errors (desktop may also show a summary toast) |

Technical failure details are logged to the browser console only.

## Call / email

Always available on `/bookings` (and on the unable-to-process page) for patients who prefer to book offline.
