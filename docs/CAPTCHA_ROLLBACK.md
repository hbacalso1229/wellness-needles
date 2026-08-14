# Production captcha rollback

Production can switch between **Cloudflare Turnstile** and the existing **hCaptcha checkbox** without a new GitHub Release. Both paths are baked into the production export.

Do **not** pick Turnstile in the Web3Forms Captcha Protection dropdown (that is a Web3Forms Pro feature). Turnstile is verified by our Pages Function.

| Mode | Site widget | Pages variable | Production Web3Forms Captcha Protection |
|------|-------------|----------------|------------------------------------------|
| **Normal** | Cloudflare badge | `BOOKING_CAPTCHA_PROVIDER=turnstile` (or unset) | **None** |
| **Rollback** | I am human checkbox | `BOOKING_CAPTCHA_PROVIDER=hcaptcha` | **hCaptcha** |

Staging (`wellness-needles.vercel.app`) always stays on hCaptcha. Do not change the staging Web3Forms form.

## Roll back (Turnstile failing)

Do both steps in the same sitting. Hard-refresh the booking page after.

1. Cloudflare Dashboard → **Workers & Pages** → **wellness-needles** → **Settings** → **Variables and secrets**.
2. Set **Production** text variable **`BOOKING_CAPTCHA_PROVIDER`** to `hcaptcha` (add it if missing). Save.
3. [Web3Forms](https://app.web3forms.com) → **production** form → **Spam & Security** → Captcha Protection → **hCaptcha** → Save.
4. Open `https://www.wellnessneedles.ie/bookings/` in a private window. Last step should show **I am human**, not the Cloudflare badge.
5. Submit a test booking. Clinic email + thank-you should work.

## Restore Turnstile

1. Pages: `BOOKING_CAPTCHA_PROVIDER=turnstile` (or delete the variable; unset defaults to turnstile).
2. Web3Forms production form: Captcha Protection → **None** → Save.
3. Private window on www: Cloudflare **Success!** badge, then a test submit.

## If you cannot use the runtime switch

Publish a Release after setting `.github/workflows/deploy-production.yml` back to `NEXT_PUBLIC_CAPTCHA_PROVIDER: hcaptcha` (and turn production Web3Forms hCaptcha **on**). That is the slower, build-time rollback.

## Pages variables (Production)

| Name | Type | Role |
|------|------|------|
| `BOOKING_CAPTCHA_PROVIDER` | Text | `turnstile` or `hcaptcha` |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile siteverify |
| `WEB3FORMS_ACCESS_KEY` | Secret | Clinic send from Function (Turnstile mode) |
| `RESEND_API_KEY` | Secret | Patient thank-you |
