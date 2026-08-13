# Production Release checklist (Phase 1)

Do this **after** you commit + push `dev`, verify staging, merge to `main`, then publish a GitHub Release.

## Pre-flight

- [ ] Changes committed and pushed on `dev`
- [ ] Staging (`https://wellness-needles.vercel.app`) smoke: `/bookings/` still shows hCaptcha checkbox; thank-you; unable-to-process
- [ ] Staging test booking → Zoho `info@` (patient Resend only on Cloudflare Pages)
- [ ] Pages Production secrets: `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `WEB3FORMS_ACCESS_KEY`
- [ ] Merge `dev` → `main` (CI only — no live deploy)
- [ ] Zone Redirect Rule: apex → www 301 — create in Cloudflare UI if ops warns (also covered by `public/_redirects`)

## Publish Release

1. GitHub → **Releases** → **Draft a new release**
2. Create tag e.g. `v0.3.0` on `main`
3. Publish release → triggers **Deploy — Production**
4. Workflow builds `out/`, syncs `RESEND_API_KEY` to Pages, deploys with Wrangler

## QA on production

- [ ] `https://www.wellnessneedles.ie/` returns 200
- [ ] `https://wellnessneedles.ie/` → 301 → www
- [ ] `dig A www.wellnessneedles.ie` / apex → **Cloudflare IPs only** (never `13.70.37.114`)
- [ ] `dig NS wellnessneedles.ie` → `anderson` / `erin` (Cloudflare) only
- [ ] Booking success on **www** → Turnstile badge (no checkbox) → clinic email in Zoho + patient email From `info@` (Resend) + thank-you page
- [ ] Staging still requires the hCaptcha checkbox
- [ ] Production Web3Forms form: hCaptcha **OFF**, Autoresponder **OFF**
- [ ] Forced/failed Web3Forms → `/bookings/unable-to-process/`
- [ ] `/admin/` not present (404)
- [ ] Normal mail to `info@` still works (Zoho MX)

Canonical: `https://www.wellnessneedles.ie`

## Permanent cutover (post Azure → Cloudflare)

Do once after go-live; re-check if phones still see Azure 404:

- [ ] Cloudflare: no Azure leftovers for `www` / apex; www CNAME → `wellness-needles.pages.dev` proxied  
      (or run **Ops — Fix www DNS**)
- [ ] Azure Portal: remove custom domains `www.wellnessneedles.ie` + `wellnessneedles.ie` (or delete old app)
- [ ] Hosting Ireland: nameservers stay Cloudflare only — **do not** edit website DNS records there
- [ ] Phone check: Incognito / airplane toggle → `https://www.wellnessneedles.ie` loads live site

## Post-live incidents

- [POST_LIVE_WWW_DNS_SSL.md](./POST_LIVE_WWW_DNS_SSL.md) — www/phone still hit Azure via stale DNS → 404 / cert errors (2026-08-13)
