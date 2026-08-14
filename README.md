# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## Features

- Modern tropical/jungle design system (CSS variables + Tailwind)
- Fully responsive layout (mobile hamburger nav through desktop)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Bookings via **legacy stepper form** by default (`contact-config.ts`); Calendly / Fresha URLs configurable in code
- Clinic booking emails via **Web3Forms** (staging: browser + hCaptcha; production: Turnstile verify then browser Web3Forms)
- Patient thank-you email via **Resend** (Cloudflare Pages Function `/api/booking-thank-you`, From `info@`)
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
| `/bookings` | Pricing + legacy stepper (default) or Calendly/Fresha via config |
| `/bookings/thank-you` | Legacy form success — confirmation summary |
| `/bookings/unable-to-process` | Legacy form submit failure — apologetic call/email + close to bookings |

## Technology stack

- **Framework**: Next.js 15.5.22 (App Router, static export)
- **UI**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Fonts**: Inter & Playfair Display
- **Staging**: Vercel Preview from `dev` → `https://wellness-needles.vercel.app`
- **Production**: Cloudflare Pages on **GitHub Release published** → `https://www.wellnessneedles.ie`

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

Optional UI mode: `npm run test:e2e:ui`.

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
functions/api/booking-thank-you.ts # Resend patient thank-you
```

## Customization

- Colors: `src/app/globals.css`
- Clinic details / booking defaults: `src/lib/contact-config.ts`
- Booking prices (in clinic vs home visit): `src/lib/booking-catalog.ts`
- Images: `public/`

## Booking prices

In-clinic and home visit **must stay on different prices**. Change them only in [`src/lib/booking-catalog.ts`](src/lib/booking-catalog.ts) — the stepper and the bookings page both read from there.

| Service | In clinic | Home visit |
|---------|-----------|------------|
| Initial Consultation & First Treatment | €90 | €120 |
| Follow-up Sessions | €75 | €90 |
| Treatment Package (5 sessions) | €270 | €350 |
| Treatment Package (10 sessions) | €520 | €690 |
| Cupping add-on | €20 | €25 |
| Moxibustion | Free (if required) | Free (if required) |

## Production deployment

| Event | Effect |
|-------|--------|
| Push `dev` | Staging → Vercel (`https://wellness-needles.vercel.app`) |
| Merge `main` | CI only — no live deploy |
| **Publish GitHub Release** | Production → Cloudflare Pages (`https://www.wellnessneedles.ie`) |

**Live booking rule:** enable only one of Fresha / Calendly / legacy form in `contact-config.ts`.

### GitHub Actions secrets

| Secret | Used by |
|--------|---------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | Production Release (hCaptcha rollback) |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | Production Release |
| `RESEND_API_KEY` | Pages Production secret (patient thank-you) |
| `TURNSTILE_SECRET_KEY` | Pages Production secret (Turnstile siteverify) |
| `WEB3FORMS_ACCESS_KEY` | Pages Production secret (clinic send via Function) |
| `VERCEL_TOKEN` (+ related) | Staging |

### Booking email checklist

1. **Staging** Web3Forms form: hCaptcha **on**, Autoresponder **OFF**
2. **Production** Web3Forms form: Captcha **None** after Turnstile Function is live, Autoresponder **OFF**
3. Pages secrets: `TURNSTILE_SECRET_KEY`, `WEB3FORMS_ACCESS_KEY`, `RESEND_API_KEY`
4. Pages text variable: `BOOKING_CAPTCHA_PROVIDER=turnstile` (set to `hcaptcha` to roll back — [docs/CAPTCHA_ROLLBACK.md](docs/CAPTCHA_ROLLBACK.md))
5. Push `dev` for staging (checkbox); **Release** for production (Turnstile badge)

### Build locally

```bash
npm run build
```

Static files are written to `out/`.
