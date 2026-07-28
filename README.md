# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## Features

- Modern tropical/jungle design system (CSS variables + Tailwind)
- Fully responsive layout (mobile hamburger nav through desktop)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Bookings via **Calendly embed** (default) or **legacy stepper form** (Admin toggle)
- Legacy form emails via **Web3Forms** (`NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` on shared deploys)
- Feature flags in `contact-config.ts`, overridable on `/admin` (browser localStorage)
- SEO-ready meta tags and semantic HTML

## Design theme

| Token | Role | Hex |
|-------|------|-----|
| Primary green | Deep forest | `#2d5016` |
| Secondary green | Medium forest | `#4a7c2a` |
| Accent green | Sage | `#7fb069` |
| Light green | Bamboo | `#a7c957` |
| Cream | Background | `#f9f7f4` |
| Gold | CTA accent | `#d4af37` |
| Earth brown | Supporting | `#8b4513` |

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Home — hero, features, quick links, CTA |
| `/about` | Practice story, Arkinth Garcia, mission/values |
| `/acupuncture` | How acupuncture works, benefits, conditions |
| `/chinese-medicine` | TCM philosophy and methods |
| `/testimonials` | Illustrative stories + before/after imagery |
| `/blog` | Article listing only (no detail routes yet) |
| `/contact` | Dual locations, maps, FAQ (contact form gated) |
| `/bookings` | Pricing + Calendly **or** legacy stepper (Admin) |
| `/admin` | Booking feature toggles, Calendly URL, email settings |

## Technology stack

- **Framework**: Next.js 15.5.22 (App Router, static export)
- **UI**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Fonts**: Inter & Playfair Display
- **Hosting**: Vercel — Preview from `dev`, Production from `main`

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For legacy booking emails locally, add your Web3Forms key to `.env.local` and restart the dev server. See [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md).

## Project structure

```
src/
├── app/                      # App Router pages (+ /admin)
│   ├── about/
│   ├── acupuncture/
│   ├── admin/                # Feature toggles (no auth)
│   ├── blog/                 # Listing only
│   ├── bookings/
│   ├── chinese-medicine/
│   ├── contact/
│   ├── testimonials/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/               # Shared UI
│   ├── Header.tsx            # Nav includes Admin + Book Now
│   ├── Footer.tsx
│   ├── BookingForm.tsx       # Legacy stepper
│   ├── BookingStepper.tsx
│   ├── CalendlyEmbed.tsx
│   ├── ContactInfo.tsx
│   ├── BusinessHours.tsx
│   ├── LocationMap.tsx
│   ├── Toast.tsx
│   └── LoadingComponent.tsx
├── features/                 # Home sections + reusable UI
│   ├── home/
│   └── ui/
├── hooks/
│   └── useBookingFeatures.ts
└── lib/
    ├── contact-config.ts     # Contact details + default feature flags
    ├── booking-features.ts   # Admin flags + Web3Forms env key
    ├── send-booking-email.ts # Web3Forms POST
    └── loading-utils.ts
```

## Customization

### Colors

Update CSS custom properties in `src/app/globals.css`.

### Content & contact

- Clinic details, hours, and default booking flags: `src/lib/contact-config.ts`
- Runtime booking mode / Calendly URL / email recipient: `/admin` (per browser)

### Images

Replace placeholders under `public/` with practice photos and headshots.

## Production deployment

Static export (`output: 'export'`). Typical flow: push `dev` for Preview / staging, merge to `main` for Production.

### Calendly setup checklist

Use when **Calendly booking embed** is enabled on `/admin`. Create **two** event types so the calendar blocks the correct length after a booking:

| Service | Event duration (blocks availability) | Start-time increments | Default Share URL slug |
|---------|--------------------------------------|------------------------|-------------------------|
| Initial Consultation | **1 hour 45 minutes** (105 min) | **15 minutes** | `/initial-consultation` |
| Follow-up | **1 hour 15 minutes** (75 min) | **15 minutes** | `/follow-up` |

1. Create both event types in Calendly → Event types → New Event Type (One-on-One).
2. Set duration and start-time increments as in the table above (slug is case-sensitive).
3. Calendar connected (Google/Outlook) with weekly availability set.
4. Location set to **Ask invitee** so clinic selection appears on the meeting.
5. Keep at least one invitee question (default “Please share anything…” works) for visit type / service / add-ons.
6. Paste each Share link into `/admin` → **Initial Consultation URL** and **Follow-up URL**.

Defaults live in `src/lib/contact-config.ts` (`calendly.initialConsultationUrl`, `calendly.followUpUrl`). The bookings page picks the URL from the selected service so the right duration is blocked. Packages use the Follow-up event URL.

### Vercel environment variables

Set in **Vercel → Project → Settings → Environment Variables** (not GitHub Secrets, unless a GitHub Action builds the site):

| Variable | Environments | Purpose |
|----------|--------------|---------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | **Production** (`main`) and **Preview** (`dev`) | Web3Forms key for legacy booking-form emails |

Redeploy Preview and Production after adding or changing the variable — `NEXT_PUBLIC_*` is baked into the client at build time.

Local: copy [`.env.example`](.env.example) → `.env.local`, set the same variable, restart `npm run dev`.

When this env var is set: email is always on for that build, the Admin access-key field is hidden, and the email toggle is locked. Calendly does **not** use Web3Forms.

### Booking email checklist

1. Create an access key at [web3forms.com](https://web3forms.com) for the clinic inbox (e.g. `info@wellnessneedles.ie`).
2. Set `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in Vercel for Preview + Production.
3. Redeploy both environments.
4. On `/admin`, enable **Legacy stepper form** when you want form submissions.
5. Submit a test booking on `/bookings` and confirm the email arrives.

Full details: [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md). Architecture: [WORKFLOW.md](WORKFLOW.md). Contact config: [CONTACT_CONFIG_SUMMARY.md](CONTACT_CONFIG_SUMMARY.md).

### Build locally

```bash
npm run build
```

Static files are written to `out/`.
