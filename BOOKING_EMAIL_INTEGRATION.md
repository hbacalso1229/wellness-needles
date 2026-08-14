# Booking Email Integration

This site is a **static Next.js export** (`output: 'export'`).

| Email | Transport | Notes |
|-------|-----------|--------|
| Clinic booking request | [Web3Forms](https://web3forms.com) | To `info@wellnessneedles.ie` (Zoho) |
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
| Trigger | Legacy booking form → **Request appointment** |
| Captcha (production) | hCaptcha checkbox → browser `POST` to Web3Forms |
| Captcha (staging) | hCaptcha checkbox → browser `POST` to Web3Forms |
| Code | `src/lib/send-booking-email.ts`, `src/lib/send-patient-thank-you.ts`, `src/lib/booking-features.ts` |

**Production (`www.wellnessneedles.ie`)**

1. Client completes the stepper and submits (hCaptcha checkbox).
2. App validates fields (including Irish phone + email format).
3. Browser `POST` to `https://api.web3forms.com/submit` with `h-captcha-response` (same path as staging).
4. Production Web3Forms **hCaptcha must be ON**. Autoresponder **OFF**.
5. On clinic success, the client requests `/api/booking-thank-you` (Resend) then redirects to `/bookings/thank-you/`. Resend failure does **not** show the apology page.
6. On Web3Forms failure, the client redirects to `/bookings/unable-to-process/`. Incomplete hCaptcha stays on the form.

Turnstile + `/api/booking-request` was rolled back: the Function still sent clinic mail after the browser had already shown the apology page.

**Staging (`wellness-needles.vercel.app`)**

1. Same stepper; visitor taps the **hCaptcha** checkbox.
2. Browser `POST` to `https://api.web3forms.com/submit` with `h-captcha-response`.
3. Staging Web3Forms form keeps **hCaptcha ON**. Patient Resend is skipped (no Pages Function).

Build flag: `NEXT_PUBLIC_CAPTCHA_PROVIDER` = `hcaptcha` (staging and production Release).

---

## Spam protection

### Production and staging — hCaptcha

1. Open [Web3Forms dashboard](https://app.web3forms.com) for that environment’s form / access key.
2. Set spam protection to **hCaptcha** (enable / make mandatory).
3. Keep **Autoresponder OFF**.

Site uses the Web3Forms free hCaptcha sitekey in `BookingForm.tsx`.

Production clinic send no longer uses Turnstile or `/api/booking-request`. Patient thank-you still uses `/api/booking-thank-you` (Resend) on Cloudflare Pages.

---

## Environment / secrets

| Env / secret | Where |
|--------------|--------|
| `NEXT_PUBLIC_CAPTCHA_PROVIDER` | `hcaptcha` (staging and production Release) |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging GHA + local `.env.local` |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | GitHub — baked into the production Release as `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` |
| `RESEND_API_KEY` | Cloudflare Pages Production secret (patient thank-you) |

Localhost skips the live send but still opens thank-you for UI testing.

Use **separate Web3Forms forms** for staging vs production. Turn hCaptcha **ON** on the production form before the next Release.

---

## Failure behaviour (locked)

| Env | Host | Clinic mail | Patient Resend | Apology page |
|-----|------|-------------|----------------|--------------|
| Staging | `*.vercel.app` | Yes (hCaptcha + staging key) | Skipped (no Pages Function) | Yes |
| Production | `www.wellnessneedles.ie` | Yes (hCaptcha + prod key) | `/api/booking-thank-you` | Yes |
| Localhost | `localhost` | Skipped | Skipped | Yes (UI) |

Thank-you page only shows “confirmation email is on its way” when Resend returns success (production).

| Outcome | Site |
|---------|------|
| Clinic send success | `/bookings/thank-you/` (+ Resend on production) |
| Clinic send **failure** | **`/bookings/unable-to-process/`** |
| Incomplete captcha | Stay on form (inline message) |
| Resend fails / skipped after clinic OK | Still thank-you (clinic has the request) |

---

## Related files

- [`src/lib/send-booking-email.ts`](src/lib/send-booking-email.ts) — browser Web3Forms call (hCaptcha)
- [`src/lib/send-patient-thank-you.ts`](src/lib/send-patient-thank-you.ts) — client → Pages Function
- [`functions/api/booking-thank-you.ts`](functions/api/booking-thank-you.ts) — Resend HTML ≈ thank-you page
- [`src/lib/booking-features.ts`](src/lib/booking-features.ts) — flags + captcha provider
