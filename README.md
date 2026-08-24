# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## Features

- Modern tropical/jungle design system (CSS variables + Tailwind)
- Fully responsive layout (mobile hamburger nav through desktop)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Bookings via **legacy stepper form** by default (`contact-config.ts`); with overlay on, form / Calendly / Fresha come from portal Settings
- Owner portal at **`https://portal.wellnessneedles.ie`** (Cloudflare Access). www stays baked until a Release with `NEXT_PUBLIC_SITE_OVERLAY_ENABLED=true` **and** Settings → **Public website overlay** is published. API failure keeps the baked site. Patient SMS is a separate Settings switch (default off). Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Owner process: [docs/OWNER-BOOKINGS.md](docs/OWNER-BOOKINGS.md). Portal ops: [docs/PORTAL.md](docs/PORTAL.md).
- Clinic booking emails via **Web3Forms** (staging: browser + hCaptcha; production: Turnstile verify then browser Web3Forms)
- Patient thank-you email via **Resend** (Cloudflare Pages Function `/api/booking-thank-you`, From `info@`). Overlay Confirm / combined / reschedule / day-before reminder use the same branded card (date, time, location, Add to Calendar, Get Directions, Call Wellness Needles) plus a calendar invite on Confirm and Reschedule. Portal **Add appointment** uses that Confirm card only (no request-received thank-you). The booking form checks email format and, on live www, MX via `/api/booking-email-check`. Subjects and headings: [docs/PORTAL.md](docs/PORTAL.md#patient-messages)
- Feature defaults in `contact-config.ts` (marketing `/admin` removed)
- SEO-ready meta tags and semantic HTML

## Design theme

| Token | Role | Hex |
|-------|------|-----|
| Primary green | Deep forest | `#2d5016` |
| Secondary green | Medium forest | `#4a7c2a` |
| Accent green | Sage | `#7fb069` |
| Light green | Bamboo | `#a7c957` |
| Cream | Background | `#faf9f7` |
| Gold | CTA accent | `#d4af37` |
| Earth brown | Supporting | `#8b4513` |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, features, quick links, CTA |
| `/about` | Practice story, Arkinth Garcia, mission/values |
| `/acupuncture` | How acupuncture works, benefits, conditions |
| `/chinese-medicine` | TCM philosophy and methods |
| `/testimonials` | Verified Google reviews + before/after imagery |
| `/blog` | Article listing only (no detail routes yet) |
| `/contact` | Dual locations, maps, FAQ (contact form gated) |
| `/bookings` | Pricing + legacy stepper (default); overlay-on uses portal catalog and booking mode |
| `/bookings/thank-you` | Legacy form success — confirmation summary |
| `/bookings/unable-to-process` | Legacy form submit failure — apologetic call/email + close to bookings |

## Technology stack

- **Framework**: Next.js 15.5.22 (App Router, static export)
- **UI**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Fonts**: Inter & Playfair Display
- **Staging**: Vercel Preview from `dev` → `https://wellness-needles.vercel.app`
- **Production**: Cloudflare Pages on **GitHub Release published** (`Release vX.Y.Z`) → `https://www.wellnessneedles.ie`
- **Owner portal**: `https://portal.wellnessneedles.ie` (Access). Setup: [docs/PORTAL.md](docs/PORTAL.md)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For legacy booking emails locally, add your Web3Forms key to `.env.local` and restart the dev server.

## End-to-end tests (Playwright)

E2E runs against the static export (`out/`). Use the E2E build so booking submit skips captcha / live email and can reach the thank-you page (and the forced-fail path to unable-to-process).

```bash
npx playwright install chromium
npm run build:e2e
npm run test:e2e
```

Booking email helpers (ICS, Dublin times, duration, 15-minute snap, email check, Add appointment): `npm run test:unit`.

Optional UI mode: `npm run test:e2e:ui`.

## Architecture

| Doc | Audience |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Runtimes (www, portal, D1, KV, Worker), Confirm/Add appointment/Reschedule pipeline (patient email → D1 → clinic ICS `waitUntil`), shared modules |
| [docs/OWNER-BOOKINGS.md](docs/OWNER-BOOKINGS.md) | Clinic-owner process (website Pending + phone/walk-in Add appointment) |
| [docs/PORTAL.md](docs/PORTAL.md) | Overlay, Settings, sequence diagrams, deploy |
| [docs/CAPTCHA_ROLLBACK.md](docs/CAPTCHA_ROLLBACK.md) | Turnstile ↔ hCaptcha without a new Release |

## Project structure

```
src/
├── app/                      # App Router pages
│   ├── about/
│   ├── acupuncture/
│   ├── blog/
│   ├── bookings/
│   ├── chinese-medicine/
│   ├── contact/
│   ├── testimonials/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Shared UI (Header, BookingForm, …)
├── features/
├── hooks/
└── lib/
    ├── contact-config.ts
    ├── booking-catalog.ts         # In-clinic vs home-visit prices
    ├── booking-features.ts
    ├── send-booking-email.ts      # Web3Forms → clinic
    └── send-patient-thank-you.ts  # → Pages Function → Resend
functions/
├── _lib/
│   ├── email-brand.ts         # Shared thank-you / confirm HTML tokens
│   ├── notify.ts              # Confirm / reschedule / reminder / cancel + ICS
│   └── confirm-booking.ts     # Shared Confirm helper; portal Add appointment create
├── api/                       # booking-* on www (includes booking-email-check); public BFF when overlay kill switch is true. /api/admin never on www
portal/                        # Owner UI static export
workers/booking-reminders/     # Day-before reminder cron (09:00 Europe/Dublin)
shared/
├── site-snapshot.ts           # Published overlay JSON
├── quarter-hour.ts            # Confirm/reschedule slot snap :00/:15/:30/:45
├── booking-options.ts         # Allowed service/location catalogs
└── email-check.ts             # Booking-form format / typo suggestion / MX helper
d1/schema.sql
d1/alter-bookings-ics-sequence.sql
docs/
├── ARCHITECTURE.md
├── PORTAL.md
└── OWNER-BOOKINGS.md
```

## Customization

- Colors: `src/app/globals.css`
- Baked clinic details / booking defaults: `src/lib/contact-config.ts` (used when overlay is off or the overlay API fails)
- Live clinic details, hours, locations, prices, reviews, insurance logos: owner portal, then Publish (see [docs/PORTAL.md](docs/PORTAL.md))
- Booking prices when overlay is off: [`src/lib/booking-catalog.ts`](src/lib/booking-catalog.ts)
- Images: `public/`

## Booking prices

In-clinic and home visit **must stay on different prices**. Overlay-off (and API fallback) reads [`src/lib/booking-catalog.ts`](src/lib/booking-catalog.ts). Overlay-on reads portal Pricing after Publish (euro amounts, names, descriptions, durations, Cupping and Moxibustion on/off). Moxibustion defaults to **€0** (shown as Free on the booking form) until you change it.

| Service | In clinic | Home visit |
|---------|-----------|------------|
| Initial Consultation & First Treatment | €75 | €120 |
| Follow-up Sessions | €60 | €90 |
| Treatment Package (5 sessions) | €270 | €350 |
| Treatment Package (10 sessions) | €520 | €690 |
| Cupping add-on | €20 | €25 |
| Moxibustion | Free (€0) | Free (€0) |

## Production deployment

| Event | Effect |
|-------|--------|
| Push `dev` | Staging → Vercel (`https://wellness-needles.vercel.app`) |
| Merge `main` | CI only — no live deploy |
| **Actions → Create Production Release → Run workflow** (from `main`) | Publishes next `Release vX.Y.Z` **and** starts Deploy — Production → Cloudflare Pages (`https://www.wellnessneedles.ie`) |

Do not hand-write a Release for production. After CI is green on `main`, run **Create Production Release**. That workflow bumps the patch on the latest `v*` tag (`v1.1.3` → tag `v1.1.4`, title `Release v1.1.4`), fills the notes with GitHub's generated changelog (What's Changed, New Contributors, Full Changelog), then starts **Deploy — Production**. PR titles appear in What's Changed — use `[TICKET] description` on PRs if you want that ticket-style look.

**Live booking rule:** enable only one of Fresha / Calendly / legacy form. Overlay-off uses `contact-config.ts`. Overlay-on uses portal Settings (then Publish). Phone and walk-in that you take yourself use portal **Add appointment** (not Calendly/Fresha import). Patient SMS is off until Settings → Patient SMS is published on; Twilio secrets live on the portal and reminder Worker, not www.

Overlay kill switch is `NEXT_PUBLIC_SITE_OVERLAY_ENABLED` in `.github/workflows/deploy-production.yml` (build **and** deploy). `"true"` allows www to fetch `/api/bff/site`. `"false"` restores baked www + booking Functions only. Do not set this in the Cloudflare dashboard. Off-ramps: [docs/PORTAL.md](docs/PORTAL.md).

### GitHub Actions secrets

| Secret | Used by |
|--------|---------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | Production Release (hCaptcha rollback) |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | Production Release |
| `RESEND_API_KEY` | Pages Production secret (patient thank-you); also Worker `wellness-needles-reminders` (day-before email) |
| `TURNSTILE_SECRET_KEY` | Pages Production secret (Turnstile siteverify) |
| `WEB3FORMS_ACCESS_KEY` | Pages Production secret (clinic send via Function) |
| `VERCEL_TOKEN` (+ related) | Staging |

### Booking email checklist

1. **Staging** Web3Forms form: hCaptcha **on**, Autoresponder **OFF**
2. **Production** Web3Forms form: Captcha **None** after Turnstile Function is live, Autoresponder **OFF**
3. Pages secrets: `TURNSTILE_SECRET_KEY`, `WEB3FORMS_ACCESS_KEY`, `RESEND_API_KEY`
4. Pages text variable: `BOOKING_CAPTCHA_PROVIDER=turnstile` (set to `hcaptcha` to roll back — [docs/CAPTCHA_ROLLBACK.md](docs/CAPTCHA_ROLLBACK.md))
5. Push `dev` for staging (checkbox); **Create Production Release** for production (Turnstile badge)

### Build locally

```bash
npm run build
```

Static files are written to `out/`.
