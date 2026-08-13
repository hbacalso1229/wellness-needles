# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## Features

- Modern tropical/jungle design system (CSS variables + Tailwind)
- Fully responsive layout (mobile hamburger nav through desktop)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Bookings via **legacy stepper form** by default (`contact-config.ts`); Calendly / Fresha URLs configurable in code
- Clinic booking emails via **Web3Forms** (`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` on staging; production secret on Release)
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
- **Go-live architecture**: [docs/GO_LIVE_ARCHITECTURE.md](docs/GO_LIVE_ARCHITECTURE.md)

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For legacy booking emails locally, add your Web3Forms key to `.env.local` and restart the dev server. See [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md).

## End-to-end tests (Playwright)

E2E runs against the static export (`out/`). Use the E2E build so booking submit skips hCaptcha / live email and can reach the thank-you page (and the forced-fail path to unable-to-process).

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
    ├── booking-features.ts
    ├── send-booking-email.ts      # Web3Forms → clinic
    └── send-patient-thank-you.ts  # → Pages Function → Resend
functions/api/booking-thank-you.ts # Cloudflare Pages Function
docs/GO_LIVE_ARCHITECTURE.md
```

## Customization

- Colors: `src/app/globals.css`
- Clinic details / booking defaults: `src/lib/contact-config.ts`
- Images: `public/`

## Production deployment

| Event | Effect |
|-------|--------|
| Push `dev` | Staging → Vercel |
| Merge `main` | CI only — no live deploy |
| **Publish GitHub Release** | Production → Cloudflare Pages (`www.wellnessneedles.ie`) |

Architecture: [docs/GO_LIVE_ARCHITECTURE.md](docs/GO_LIVE_ARCHITECTURE.md).

**Live booking rule:** enable only one of Fresha / Calendly / legacy form in `contact-config.ts`.

### GitHub Actions secrets

| Secret | Used by |
|--------|---------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Staging |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION` | Production Release |
| `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` | Production Release |
| `RESEND_API_KEY` | Production (synced to Pages) |
| `VERCEL_TOKEN` (+ related) | Staging |

### Booking email checklist

1. Web3Forms key for `info@` — hCaptcha on, Autoresponder **OFF**
2. Set secrets above; push `dev` for staging; **Release** for production
3. Test booking → Zoho clinic mail + Resend patient thank-you (on Pages)

Details: [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md).

### Build locally

```bash
npm run build
```

Static files are written to `out/`.
