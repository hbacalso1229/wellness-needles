# Production Release checklist (Phase 1)

Do this **after** you commit + push `dev`, verify staging, merge to `main`, then publish a GitHub Release.

## Pre-flight

- [ ] Changes committed and pushed on `dev`
- [ ] Staging (`https://wellness-needles.vercel.app`) smoke: `/bookings/`, thank-you, unable-to-process
- [ ] Staging test booking → Zoho `info@` (patient Resend only on Cloudflare Pages)
- [ ] Merge `dev` → `main` (CI only — no live deploy)
- [ ] Optional zone Redirect Rule: apex → www 301 (also covered by `public/_redirects`)

## Publish Release

1. GitHub → **Releases** → **Draft a new release**
2. Create tag e.g. `v0.3.0` on `main`
3. Publish release → triggers **Deploy — Production**
4. Workflow builds `out/`, syncs `RESEND_API_KEY` to Pages, deploys with Wrangler

## QA on production

- [ ] `https://www.wellnessneedles.ie/` returns 200
- [ ] `https://wellnessneedles.ie/` → 301 → www
- [ ] Booking success → clinic email in Zoho + patient email From `info@` (Resend) + thank-you page
- [ ] Forced/failed Web3Forms → `/bookings/unable-to-process/`
- [ ] `/admin/` not present (404)
- [ ] Normal mail to `info@` still works (Zoho MX)

Canonical: `https://www.wellnessneedles.ie`

## Post-live incidents

- [POST_LIVE_WWW_DNS_SSL.md](./POST_LIVE_WWW_DNS_SSL.md) — www still pointed at Azure → cert / load failures (2026-08-13)
