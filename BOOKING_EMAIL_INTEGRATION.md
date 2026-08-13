# Booking Email Integration

This site is a **static Next.js export** (`output: 'export'`).

| Email | Transport | Notes |
|-------|-----------|--------|
| Clinic booking request | [Web3Forms](https://web3forms.com) from the browser | To `info@wellnessneedles.ie` (Zoho) |
| Patient thank-you | **Resend** via Cloudflare Pages Function `/api/booking-thank-you` | From `info@wellnessneedles.ie` |

**Web3Forms Autoresponder must stay OFF** — patient mail is Resend only.

Legacy stepper form submissions use this path. **Calendly / Fresha confirmed bookings do not.**

See [BOOKING_PROCESS.md](BOOKING_PROCESS.md) and [docs/GO_LIVE_ARCHITECTURE.md](docs/GO_LIVE_ARCHITECTURE.md).

---

## Overview

| Item | Detail |
|------|--------|
| Clinic provider | Web3Forms |
| Patient provider | Resend (`functions/api/booking-thank-you.ts`) |
| Trigger | Legacy booking form → **Submit Appointment Request** |
| Code | `src/lib/send-booking-email.ts`, `src/lib/send-patient-thank-you.ts`, `src/lib/booking-features.ts` |

Flow:

1. Client completes the stepper and submits.
2. App validates fields (including Irish phone + email format).
3. When booking email is configured, the client completes an **hCaptcha** security check.
4. `POST` to `https://api.web3forms.com/submit` (includes `h-captcha-response`).
5. Clinic receives an email with visit type, location, service, add-ons, schedule, and contact details.
6. On **Web3Forms success**, the client requests `/api/booking-thank-you` (Resend) then redirects to `/bookings/thank-you/`. Resend failure does **not** show the apology page.
7. On **Web3Forms / configuration failure**, the client redirects to `/bookings/unable-to-process/`. Incomplete hCaptcha stays on the form.

---

## Spam protection (hCaptcha)

1. Open [Web3Forms dashboard](https://app.web3forms.com) and select the booking form / access key
2. Set spam protection to **hCaptcha** (enable / make mandatory)
3. Keep **Autoresponder OFF**

Site uses the Web3Forms free hCaptcha sitekey in `BookingForm.tsx`.

---

## Environment / secrets

| Env / secret | Where |
|--------------|--------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging GHA + local `.env.local` |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | Production Release GHA |
| `RESEND_API_KEY` | GitHub → synced to Cloudflare Pages secret on deploy |

When the Web3Forms env key is set: booking email is always on for that build.

Localhost skips the live Web3Forms send (hCaptcha unavailable) but still opens thank-you for UI testing.

---

## Failure behaviour (locked)

| Outcome | Site |
|---------|------|
| Web3Forms success | `/bookings/thank-you/` (+ Resend best-effort) |
| Web3Forms / clinic send **failure** | **`/bookings/unable-to-process/`** |
| Resend fails after Web3Forms OK | Still thank-you (clinic has the request) |

---

## Related files

- [`src/lib/send-booking-email.ts`](src/lib/send-booking-email.ts) — Web3Forms API call
- [`src/lib/send-patient-thank-you.ts`](src/lib/send-patient-thank-you.ts) — client → Pages Function
- [`functions/api/booking-thank-you.ts`](functions/api/booking-thank-you.ts) — Resend HTML ≈ thank-you page
- [`src/lib/booking-features.ts`](src/lib/booking-features.ts) — flags + env key
