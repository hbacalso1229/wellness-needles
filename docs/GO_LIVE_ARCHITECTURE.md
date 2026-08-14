# Wellness Needles — Phase 1 Go-Live Architecture & Design

**Status:** Locked for Phase 1 (updated 2026-08-13)  
**Working branch for engineering:** `dev` first (verify on Vercel staging) → then `main` → **GitHub Release** for production  
**Do not commit** until explicitly asked  

**Canonical production URL:** `https://www.wellnessneedles.ie`  
**Apex:** `https://wellnessneedles.ie` → **301** → www  
**Staging:** `https://wellness-needles.vercel.app`  
**Skipped this phase:** Supabase, owner portal (`portal.wellnessneedles.ie`), moderated reviews, live settings editor  

---

## 1. Goals (Phase 1)

1. Host marketing site on **Cloudflare Pages** (project: `wellness-needles`)
2. Deploy production **only** via **GitHub Release published** (merge to `main` = CI only)
3. Clinic receives booking emails at **`info@wellnessneedles.ie`** (Zoho via Web3Forms)
4. Patient receives thank-you email **≈ thank-you page**, **From `info@`** (Resend)
5. Remove marketing **`/admin`**
6. On booking **submit failure** → show **apology page** `/bookings/unable-to-process/`

---

## 2. System architecture

```mermaid
flowchart TB
  subgraph registrar [Registrar]
    HI[HostingIreland]
  end

  subgraph cloudflare [Cloudflare]
    DNS[DNS_Zone]
    Pages[Cloudflare_Pages]
    TS[Turnstile]
    FnBook[api_booking_request]
    FnThanks[api_booking_thank_you]
  end

  subgraph mail [Mail]
    Zoho[Zoho_info_inbox]
    Resend[Resend_outbound]
  end

  subgraph forms [Forms]
    W3prod[Web3Forms_prod]
    W3stage[Web3Forms_staging]
  end

  subgraph ci [CI]
    GH[GitHub_Release]
    Dev[Push_dev]
  end

  subgraph stagingHost [Staging]
    Vercel[Vercel_preview]
  end

  HI -->|nameservers| DNS
  GH -->|deploy_out_plus_functions| Pages
  DNS --> Pages
  DNS -->|MX_SPF_DKIM| Zoho
  DNS -->|send_subdomain| Resend
  Pages -->|hosts| Site[www.wellnessneedles.ie]
  Site --> TS
  Site -->|POST_token_plus_payload| FnBook
  FnBook -->|siteverify| TS
  FnBook -->|clinic_email_server_key| W3prod
  W3prod -->|To_info| Zoho
  Site -->|POST_after_clinic_ok| FnThanks
  FnThanks --> Resend
  Resend -->|From_info| Patient[Patient_inbox]
  Dev --> Vercel
  Vercel -->|POST_hCaptcha_checkbox| W3stage
  W3stage -->|To_info| Zoho
```

### Who owns what

| Component | Role |
|-----------|------|
| Hosting Ireland | Domain registrar only |
| Cloudflare DNS | Apex, www, Zoho mail records, Resend send records |
| Cloudflare Pages | Static Next.js `out/` host — project `wellness-needles` |
| Pages Function `/api/booking-thank-you` | Production patient thank-you (Resend) |
| Pages Function `/api/booking-request` | Unused (Turnstile hop rolled back) |
| Web3Forms (staging) | Clinic booking from Vercel; hCaptcha **ON**; Autoresponder **OFF** |
| Web3Forms (production) | Clinic booking from www; hCaptcha **ON**; Autoresponder **OFF** |
| Zoho Mail | Inbound `info@wellnessneedles.ie` |
| Resend | Patient thank-you From `info@` |
| GitHub Actions | Staging → Vercel on `dev`; Prod → CF Pages on **Release** |

### Custom domains (Pages)

| Hostname | Role | Status (owner) |
|----------|------|----------------|
| `www.wellnessneedles.ie` | Canonical site visitors use | **Active** |
| `wellnessneedles.ie` | Apex; must 301 → www | **Active** |

Visitors / links / sitemap / OG / email CTAs: **`https://www.wellnessneedles.ie`**.

---

## 3. Deploy design

```mermaid
flowchart LR
  pushDev[Push_to_dev] --> staging[Vercel_staging]
  mergeMain[Merge_to_main] --> ciOnly[CI_quality_only]
  publish[Publish_Release_vX.Y.Z] --> prodGHA[deploy_production_yml]
  prodGHA --> build[Build_out_with_prod_secrets]
  build --> cfPages[Cloudflare_Pages]
  cfPages --> live[www.wellnessneedles.ie]
  apex[wellnessneedles.ie] -->|301| live
```

| Event | Effect |
|-------|--------|
| Push / work on `dev` | Staging only (`https://wellness-needles.vercel.app`) |
| Merge `main` | CI only — **no** live deploy |
| **Publish GitHub Release** | Production deploy to Cloudflare Pages |

Production Release already uses `on: release: types: [published]` and `wrangler pages deploy`. Do **not** connect Cloudflare “GitHub auto-deploy” (fights the release-only gate).

Staging build: `NEXT_PUBLIC_CAPTCHA_PROVIDER=hcaptcha`. Production Release: `hcaptcha` + `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION`.

### Dev-first engineering rule (LOCKED)

1. Implement Phase 1 code/workflow changes on **`dev`**
2. Verify on **Vercel staging** (booking paths, apology page, no broken routes)
3. Only then merge to `main` and publish a **Release** for Cloudflare production
4. **Do not commit** until the owner explicitly asks

---

## 4. Booking UX & email design

### Happy path (production)

```mermaid
sequenceDiagram
  participant P as Patient
  participant S as Bookings_page
  participant H as hCaptcha
  participant W as Web3Forms_prod
  participant Z as Zoho_info
  participant R as Resend
  P->>S: Submit plus checkbox
  S->>H: Tap
  H-->>S: Token
  S->>W: Payload plus h-captcha-response
  W->>Z: To info@
  W-->>S: ok
  S->>R: POST /api/booking-thank-you
  R->>P: Email
  S->>P: Navigate /bookings/thank-you/
```

### Happy path (staging)

```mermaid
sequenceDiagram
  participant P as Patient
  participant S as Staging_bookings
  participant H as hCaptcha
  participant W as Web3Forms_staging
  participant Z as Zoho_info
  P->>S: Submit plus checkbox
  S->>H: Tap
  H-->>S: Token
  S->>W: Payload plus h-captcha-response
  W->>Z: To info@
  W-->>S: ok
  S->>P: Navigate /bookings/thank-you/
```

Staging skips Resend (no Pages Function on Vercel).

### Failure path (LOCKED — apology page)

```mermaid
sequenceDiagram
  participant P as Patient
  participant S as Bookings_page
  participant Fn as ClinicSend
  P->>S: Submit
  S->>Fn: Clinic booking send
  Fn-->>S: error_or_missing_key_or_captcha_block
  S->>P: Navigate /bookings/unable-to-process/
```

| Outcome | Site page | Clinic email | Patient email |
|---------|-----------|--------------|---------------|
| Clinic send **success** | `/bookings/thank-you/` | Yes → `info@` | Resend ≈ thank-you page (production only) |
| Clinic send **failure** / not configured | **`/bookings/unable-to-process/`** | No | No |
| Captcha incomplete (Turnstile token / hCaptcha tick) | Stay on form (inline error) | No | No |
| Resend fails **after** clinic OK | Still `/bookings/thank-you/` (clinic has request) | Yes | Retry/log; do not show apology |

**Apology page:** `src/app/bookings/unable-to-process/page.tsx`  
**Submit helper:** `goToUnableToProcess()` in `src/components/BookingForm.tsx`

**Must keep:** any failed clinic booking send → `window.location.replace('/bookings/unable-to-process/')`. Never soft-fail to thank-you if the clinic never got the request.

### Web3Forms (prod) — locked settings

| Setting | Value |
|---------|--------|
| Website URL | `https://www.wellnessneedles.ie/bookings/` |
| Redirect | `https://www.wellnessneedles.ie/bookings/thank-you/` |
| Recipient | `info@wellnessneedles.ie` |
| Subject | `New booking request — Wellness Needles` |
| hCaptcha | **On** (browser → Web3Forms, same as staging) |
| Autoresponder | **OFF** |

### Patient email (Resend)

| Field | Value |
|-------|--------|
| From | `Wellness Needles <info@wellnessneedles.ie>` |
| To | Patient email |
| Body | ≈ `/bookings/thank-you/` — logo, confirmation rows, Need help card |
| Transport | Resend API (Pages Function / Worker — key **not** in browser) |
| Free tier | ~3k/mo, ~100/day — OK for clinic volume |

---

## 5. DNS design

| Record class | Keep / set |
|--------------|------------|
| Zoho MX + SPF + DKIM | Keep — **DNS only** |
| `mail` A | Keep — **DNS only** (never proxied) |
| `www` | CNAME → Pages (`wellness-needles.pages.dev`) — Active |
| Apex | Attached to Pages — Active; **301 → www** (Single Redirect, Free plan) |

> **Post-live (2026-08-13):** Phones typing `https://www.wellnessneedles.ie` still hit Azure via stale DNS → blue 404 / bad cert. Permanent fix: Cloudflare DNS lock + **decommission Azure custom domains** + Hosting Ireland **NS only**. See [POST_LIVE_WWW_DNS_SSL.md](./POST_LIVE_WWW_DNS_SSL.md). Ops: `Ops — Fix www DNS` (token needs **Zone → DNS → Edit**).
| Resend `send.*` | Keep alongside Zoho — do **not** remove Zoho root MX |

### Apex → www redirect (Free — no extra cost)

| | |
|--|--|
| Match | `https://wellnessneedles.ie/*` |
| Target | `https://www.wellnessneedles.ie/${1}` |
| Status | **301** |
| Preserve query string | On |

---

## 6. Production GitHub secrets

| Secret | Purpose | Status |
|--------|---------|--------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | Prod Web3Forms UUID (hCaptcha rollback) | **Done** |
| `CLOUDFLARE_ACCOUNT_ID` | CF deploy | **Done** |
| `CLOUDFLARE_API_TOKEN` | CF deploy | **Done** |
| `RESEND_API_KEY` | Pages: patient thank-you | **Done** |
| `TURNSTILE_SECRET_KEY` | Pages: Turnstile siteverify | **Done** |
| `WEB3FORMS_ACCESS_KEY` | Pages: clinic send from Function | Add before Release |

Staging-only (unchanged): `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`, `VERCEL_*`. Staging and production Release both set `NEXT_PUBLIC_CAPTCHA_PROVIDER=hcaptcha`.

---

## 7. Phase 1 checklist

### Done (owner)

- [x] Domain at Hosting Ireland; NS → Cloudflare (`anderson` / `erin`); zone Active
- [x] Zoho `info@` + MX/SPF/DKIM
- [x] Pages project `wellness-needles`
- [x] Custom domains: **www** Active + **apex** Active
- [x] Prod Web3Forms (To `info@`, Autoresponder off; **turn hCaptcha ON before the next Release**)
- [x] GitHub secrets: Web3Forms prod, Cloudflare ID/token, Resend API key
- [x] Resend account + domain verified

**Verified 2026-08-13:** Zoho MX present (`mx.zoho.eu`, `mx2.zoho.eu`, `mx3.zoho.eu`).  
**Pages status:** Custom domains Active; site returns **522** until the first Release deploy uploads assets.  
**Apex → www:** `public/_redirects` ships with the deploy; also add a zone **Redirect Rule** (Free) as defense in depth.

### Remaining owner

- [ ] Confirm apex → www **301** after first deploy (and/or zone Redirect Rule)
- [x] Spot-check Zoho MX still present

### Remaining engineering (on `dev` first — no commit until asked)

- [x] Rewrite `deploy-production.yml`: `on: release: types: [published]` → build `out/` → `wrangler pages deploy`
- [x] Wire `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` in release build
- [x] Remove `/admin` + Admin nav; update docs/e2e as needed
- [x] Resend thank-you ≈ page From `info@` (Pages Function; key not in browser)
- [x] Keep / verify apology path on Web3Forms failure
- [ ] Pages Production secret `WEB3FORMS_ACCESS_KEY` (same value as prod Web3Forms UUID)
- [ ] After Release: production Web3Forms hCaptcha **OFF** (staging form stays ON)
- [ ] Verify on Vercel staging from `dev` (**after push** — local e2e passed)
- [ ] Merge → publish first Release → QA on `https://www.wellnessneedles.ie`

### Explicitly out of Phase 1

- Supabase schema/UI
- `portal.wellnessneedles.ie`
- Moderated reviews / live settings editor

---

## 8. QA acceptance (go-live)

1. Changes verified on **staging** (`dev`) before production Release  
2. Merge to `main` does **not** change live site  
3. Publishing `vX.Y.Z` updates `https://www.wellnessneedles.ie`  
4. Apex redirects to www  
5. Successful **www** booking → hCaptcha checkbox → clinic email at `info@` + patient email From `info@` + site thank-you page  
6. Successful **staging** booking → hCaptcha checkbox still required → clinic email; no Resend  
7. Failed clinic send → **apology** `/bookings/unable-to-process/`  
8. No `/admin` on production  
9. `info@` still receives normal mail (Zoho intact)  

---

## 9. Cost notes (Phase 1)

| Item | Notes |
|------|--------|
| Cloudflare Pages + DNS | Free tier for this site |
| Cloudflare Turnstile | Free (Non-interactive widget) |
| Pages Functions | Free Workers quota (booking-request + thank-you) |
| Single Redirect (apex→www) | Free (10 rules/zone; need 1) |
| Vercel staging | Existing staging on `dev` |
| Resend | Free tier sufficient for thank-yous |
| Zoho / Web3Forms | Existing clinic mail + form |
| Vercel **production** Pro | Avoided by moving prod to CF Pages |
