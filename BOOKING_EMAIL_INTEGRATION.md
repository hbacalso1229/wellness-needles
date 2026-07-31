# Booking Email Integration (Web3Forms)

This site is a **static Next.js export** (`output: 'export'`), so booking emails are sent from the browser via [Web3Forms](https://web3forms.com) — no backend API route required.

Legacy stepper form submissions go to the configured inbox (default `info@wellnessneedles.ie`) when email is configured. **Calendly / Fresha confirmed bookings do not use Web3Forms.**

For the real-world booking model and Calendly/Fresha ops checklist, see [BOOKING_PROCESS.md](BOOKING_PROCESS.md).

Setup checklists for shared deploys live in [README → Production deployment](README.md#production-deployment). Admin UI is intentionally lean (recipient / local key only).

---

## Overview

| Item | Detail |
|------|--------|
| Provider | [Web3Forms](https://web3forms.com) |
| Trigger | Legacy booking form → **Submit Appointment Request** |
| Admin UI | `/admin` → enable **Legacy stepper form** → **Booking email setup** |
| Code | `src/lib/send-booking-email.ts`, `src/lib/booking-features.ts` |

Flow:

1. Client completes the stepper and submits.
2. App validates fields (including Irish phone + email format).
3. On the final step, when booking email is configured, the client completes an **hCaptcha** security check.
4. If booking email is enabled and configured, `POST` to `https://api.web3forms.com/submit` (includes `h-captcha-response`).
5. Clinic receives an email with visit type, location, service, add-ons, schedule, and health details.
6. Success toast is shown (or an error toast if send fails). Form resets after success.

---

## Spam protection (hCaptcha)

Legacy email submits use **Web3Forms hCaptcha** (interactive checkbox on the final step).

### UX on `/bookings`
- Panel title: **Quick security check**
- Shown only when booking email is configured (same gate as sending mail)
- Reserved space while the widget loads; verified / expired / error messages under the widget
- Submit without solving → toast + panel highlight; failed send resets the captcha (tokens are one-time)

### Dashboard (required)
1. Open [Web3Forms dashboard](https://app.web3forms.com) and select the booking form / access key
2. Set spam protection to **hCaptcha** (enable / make mandatory)
3. Save — without this, the client widget alone is not enforced server-side

Site uses the Web3Forms free hCaptcha sitekey in code (`BookingForm.tsx`). Paid plans can use a custom sitekey if you change that constant.

---

## Preferred setup: env key (local + `dev` + `main`)

Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` so every visitor uses the same key — do not rely on Admin localStorage for shared URLs.

When this variable is set:

- It **always wins** over an Admin-saved key (and is not persisted to localStorage).
- Booking email is **always on** for that build (Admin email toggle is locked; access-key field is hidden).
- Recipient defaults to `info@wellnessneedles.ie` (overridable in Admin per browser).

### Local

1. Copy [`.env.example`](.env.example) → `.env.local`
2. Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=your_access_key_here`
3. Restart `npm run dev`

### Vercel (Preview + Production)

| Git branch | Vercel environment |
|------------|--------------------|
| `main` | **Production** |
| `dev` | **Preview** |

1. Project → **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` for **Production** and **Preview**
3. **Redeploy** both — `NEXT_PUBLIC_*` is baked into the static client at build time

Do **not** put this in GitHub Secrets unless a GitHub Action builds the site itself. With Vercel builds, use Vercel env vars.

Checklist:

- [ ] `.env.local` works locally
- [ ] Preview (`dev`) redeployed with the var
- [ ] Production (`main`) redeployed with the var
- [ ] Legacy form enabled + test submit delivers email on each environment

---

## Local-only fallback: Admin

Use when the env key is **not** set (e.g. quick local testing):

1. Open `/admin` (also in Header; **no auth**).
2. Turn on **Legacy stepper form** (turns Calendly off).
3. Under **Booking email setup**:
   - Turn on **Email appointment requests**
   - Set **Recipient email**
   - Paste **Web3Forms access key**
   - **Save email settings**
4. Status should show **Ready to send**

Settings are stored in **this browser’s `localStorage`** (`wellness-needles-booking-features`). They do not apply to other devices or visitors.

Create a key at [web3forms.com](https://web3forms.com) for the inbox that should receive bookings.

---

## Test

1. Enable **Legacy stepper form** on `/admin`.
2. Ensure email is ready (env key **or** Admin key + recipient).
3. Enable **hCaptcha** for that access key in the Web3Forms dashboard.
4. Open `/bookings`, complete a test booking, solve the security check, submit.
5. Confirm success toast and inbox delivery (check spam).
6. If email is on but the key/recipient is missing, submit shows an error toast (not a false “submitted” success).
7. Submit without solving captcha → error toast asking to complete the security check.

---

## Payload

- Visit type (In Clinic / Home Visit)
- Location, service / package, add-ons
- Preferred date & time, practitioner
- Name, email, phone, date of birth
- Chief complaint, previous treatment, medications, allergies

Also sent as Web3Forms dashboard fields: `visit_type`, `location`, `service`, `add_ons`, `preferred_date`, `preferred_time`, `phone`, `chief_complaint`.

---

## Free plan notes

Web3Forms free plan (as of their public pricing): ~**250 submissions / month**, no card required to start, basic spam protection. Upgrade on Web3Forms for higher limits or extras.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Toast: please complete the security check | Solve hCaptcha on the final step; enable hCaptcha in Web3Forms dashboard |
| Toast: email enabled but not configured | Add access key + valid recipient (Admin) or set env key and redeploy |
| Toast: could not send email | Check key, Web3Forms dashboard, network, free-plan quota; reset captcha and retry |
| Captcha missing on final step | Email is not configured — panel only shows when email can send |
| No email, but success toast | Email is **off** — only toast (+ console.log); enable email or set env key |
| Works locally, not on another device | localStorage is per browser; set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` on the host |
| Wrong inbox | Update **Recipient email** in Admin (and match Web3Forms linked email) |
| Env set but Admin still asks for key | Hard-refresh / confirm the build was redeployed after adding the var |

---

## Related files

- [`src/app/admin/page.tsx`](src/app/admin/page.tsx) — toggles + recipient / local key
- [`src/components/BookingForm.tsx`](src/components/BookingForm.tsx) — submit → hCaptcha + send email
- [`src/lib/send-booking-email.ts`](src/lib/send-booking-email.ts) — Web3Forms API call (`h-captcha-response`)
- [`src/lib/booking-features.ts`](src/lib/booking-features.ts) — flags, env key, localStorage
- [`src/hooks/useBookingFeatures.ts`](src/hooks/useBookingFeatures.ts) — React hook
- [`.env.example`](.env.example) — env template
- [README.md](README.md) — deployment checklists
