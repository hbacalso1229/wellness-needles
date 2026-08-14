# Production captcha rollback

Production can switch between **Cloudflare Turnstile** and the existing **hCaptcha checkbox** without a new GitHub Release. Both paths are baked into the production export.

Do **not** pick Turnstile in the Web3Forms Captcha Protection dropdown (that is a Web3Forms Pro feature). Turnstile is verified by our Pages Function; clinic mail is always sent from the **browser** to Web3Forms.

Leave **Advanced Spam Filter** as-is (locked on Free). You cannot turn it off, and you do not need to.

| Mode | Site widget | Pages variable | Production Web3Forms Captcha Protection |
|------|-------------|----------------|------------------------------------------|
| **Normal** | Cloudflare badge | `BOOKING_CAPTCHA_PROVIDER=turnstile` (or unset) | **None** |
| **Rollback** | I am human checkbox | `BOOKING_CAPTCHA_PROVIDER=hcaptcha` | **hCaptcha** |

After changing `BOOKING_CAPTCHA_PROVIDER`, re-run **Deploy — Production** (Direct Upload does not pick up Pages vars until a new deploy).

Staging (`wellness-needles.vercel.app`) always stays on hCaptcha. Do not change the staging Web3Forms form.

## Roll back (Turnstile failing)

Do both dashboard steps, then redeploy.

1. Cloudflare Dashboard → **Workers & Pages** → **wellness-needles** → **Settings** → **Variables and secrets**.
2. Set **Production** text variable **`BOOKING_CAPTCHA_PROVIDER`** to `hcaptcha`. Save.
3. [Web3Forms](https://app.web3forms.com) → **production** form → **Spam & Security** → Captcha Protection → **hCaptcha** → Save.
4. GitHub Actions → **Deploy — Production** → latest successful run → **Re-run all jobs**.
5. Private window on www: **I am human** → test submit.

## Restore Turnstile

1. Pages: `BOOKING_CAPTCHA_PROVIDER=turnstile`.
2. Web3Forms production form: Captcha Protection → **None** → Save.
3. Re-run **Deploy — Production**.
4. Private window on www: Cloudflare **Success!** badge, then a test submit.

## Pages variables (Production)

| Name | Type | Role |
|------|------|------|
| `BOOKING_CAPTCHA_PROVIDER` | Text | `turnstile` or `hcaptcha` |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile siteverify |
| `WEB3FORMS_ACCESS_KEY` | Secret | Unused for clinic send (browser uses baked public key) |
| `RESEND_API_KEY` | Secret | Patient thank-you |
