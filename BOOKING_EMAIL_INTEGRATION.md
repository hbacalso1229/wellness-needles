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
| Captcha (production) | Cloudflare Turnstile Non-interactive → `/api/booking-request` |
| Captcha (staging) | hCaptcha checkbox → browser `POST` to Web3Forms |
| Code | `src/lib/send-booking-email.ts`, `src/lib/send-patient-thank-you.ts`, `src/lib/booking-features.ts` |

**Production (`www.wellnessneedles.ie`)**

1. Client completes the stepper and submits (Turnstile badge, no tap).
2. App validates fields (including Irish phone + email format).
3. `POST /api/booking-request` with the Turnstile token.
4. Pages Function verifies the token (`TURNSTILE_SECRET_KEY`) then sends clinic mail (`WEB3FORMS_ACCESS_KEY`). Production Web3Forms **hCaptcha must be OFF**.
5. On clinic success, the client requests `/api/booking-thank-you` (Resend) then redirects to `/bookings/thank-you/`. Resend failure does **not** show the apology page.
6. On Function / Web3Forms failure, the client redirects to `/bookings/unable-to-process/`. Incomplete Turnstile stays on the form.

**Staging (`wellness-needles.vercel.app`)**

1. Same stepper; visitor taps the **hCaptcha** checkbox.
2. Browser `POST` to `https://api.web3forms.com/submit` with `h-captcha-response`.
3. Staging Web3Forms form keeps **hCaptcha ON**. Patient Resend is skipped (no Pages Function).

Build flag: `NEXT_PUBLIC_CAPTCHA_PROVIDER` = `turnstile` (Release) or `hcaptcha` (staging / default).

---

## Spam protection

### Production — Cloudflare Turnstile

1. Cloudflare → Application security → Turnstile → widget `booking-form` (Non-interactive).
2. Pages Production secrets: `TURNSTILE_SECRET_KEY`, `WEB3FORMS_ACCESS_KEY`.
3. Production Web3Forms form: **hCaptcha OFF**, Autoresponder **OFF**.

Sitekey is public (`NEXT_PUBLIC_TURNSTILE_SITE_KEY` on the Release build). Secret stays on Pages only.

### Staging — hCaptcha (backup path)

1. Open [Web3Forms dashboard](https://app.web3forms.com) for the **staging** form / access key.
2. Set spam protection to **hCaptcha** (enable / make mandatory).
3. Keep **Autoresponder OFF**.

Site uses the Web3Forms free hCaptcha sitekey in `BookingForm.tsx` when the provider is `hcaptcha`.

To roll production back to the checkbox: turn production Web3Forms hCaptcha **ON**, set `NEXT_PUBLIC_CAPTCHA_PROVIDER=hcaptcha` on the Release build, publish a Release.

---

## Environment / secrets

| Env / secret | Where |
|--------------|--------|
| `NEXT_PUBLIC_CAPTCHA_PROVIDER` | `hcaptcha` staging; `turnstile` production Release |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Production Release only (public sitekey) |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging GHA + local `.env.local` |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | GitHub (rollback / unused by Turnstile Function) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Pages Production secret |
| `WEB3FORMS_ACCESS_KEY` | Cloudflare Pages Production secret (clinic send) |
| `RESEND_API_KEY` | Cloudflare Pages Production secret |

Localhost skips the live send but still opens thank-you for UI testing.

Use **separate Web3Forms forms** for staging vs production. Turning hCaptcha off on production must not change the staging form.

---

## Failure behaviour (locked)

| Env | Host | Clinic mail | Patient Resend | Apology page |
|-----|------|-------------|----------------|--------------|
| Staging | `*.vercel.app` | Yes (hCaptcha + staging key) | Skipped (no Pages Function) | Yes |
| Production | `www.wellnessneedles.ie` | Yes (Turnstile Function) | `/api/booking-thank-you` | Yes |
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

- [`src/lib/send-booking-email.ts`](src/lib/send-booking-email.ts) — hCaptcha Web3Forms call + Turnstile `/api/booking-request` client
- [`src/lib/send-patient-thank-you.ts`](src/lib/send-patient-thank-you.ts) — client → Pages Function
- [`functions/api/booking-request.ts`](functions/api/booking-request.ts) — Turnstile siteverify + clinic Web3Forms
- [`functions/api/booking-thank-you.ts`](functions/api/booking-thank-you.ts) — Resend HTML ≈ thank-you page
- [`src/lib/booking-features.ts`](src/lib/booking-features.ts) — flags + captcha provider
