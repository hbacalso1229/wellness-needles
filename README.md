# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## Features

- Modern tropical/jungle design system (CSS variables + Tailwind)
- Fully responsive layout (mobile hamburger nav through desktop)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Bookings via **Calendly embed** (default), **Fresha** (Admin toggle), or **legacy stepper form** (appointment *request* only — see [BOOKING_PROCESS.md](BOOKING_PROCESS.md))
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
| `/bookings` | Pricing + Calendly **or** legacy stepper (Admin) |
| `/bookings/thank-you` | Legacy form success — confirmation summary |
| `/bookings/unable-to-process` | Legacy form submit failure — apologetic call/email + close to bookings |
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

| Environment | Branch | Stable URL |
|-------------|--------|------------|
| Staging | `dev` | https://wellness-needles.vercel.app |
| Production | `main` | https://wellnessneedles.ie |

Staging aliases each preview deploy to `wellness-needles.vercel.app`. Production uses `vercel deploy --prod` for the `.ie` domains, then restores the staging hostname to the latest non-production deployment (because `--prod` reclaims `.vercel.app`).

**Live booking rule:** In production, enable **only one** scheduling product — **Fresha or Calendly** (never both). Admin toggles are mutually exclusive for that reason; running both would risk double-booking the same practitioner across Celbridge and Carlow.

### Fresha setup checklist

Use when **Fresha booking** is the chosen live booking UI on `/admin` (mutually exclusive with Calendly and the legacy form).

1. In Fresha, configure **both clinic locations** (Celbridge and Carlow) under **one staff member** so busy time is shared — a booking at one clinic blocks that slot for the other.
2. Copy your public Fresha booking link from Fresha (Link builder / Online Booking).
3. `/admin` → turn on **Fresha booking** → paste **Fresha booking URL** (Calendly and legacy form turn off automatically).
4. Save → confirm **Book Now** and `/bookings` (**Continue to Fresha**).

Default placeholder: `src/lib/contact-config.ts` → `fresha.bookingUrl` (replace or override in Admin). On phones with the Fresha app installed, the OS may open the app automatically via Universal/App Links; otherwise Fresha opens in the browser.

### Calendly setup checklist

Full real-world model + ops notes: [BOOKING_PROCESS.md](BOOKING_PROCESS.md).

Use when **Calendly booking embed** is the chosen live booking UI on `/admin` (mutually exclusive with Fresha and the legacy form). Create **two** event types so the calendar blocks the correct length after a booking:

| Service | Event duration (blocks availability) | Start-time increments | Default Share URL slug |
|---------|--------------------------------------|------------------------|-------------------------|
| Initial Consultation | **1 hour 15 minutes** (75 min) | **15 minutes** | `/initial-consultation` |
| Follow-up | **45 minutes** (45 min) | **15 minutes** | `/follow-up` |

1. Create both event types in Calendly → Event types → New Event Type (One-on-One) under **one** Calendly user (not one account per clinic).
2. Set duration and start-time increments as in the table above (slug is case-sensitive).
3. Connect **both** event types to the **same** Google/Outlook calendar with weekly availability set. Shared availability = one connected calendar; Celbridge vs Carlow is a **location tag only**, not a second schedule.
4. Location set to **Ask invitee** so clinic selection from the site appears on the meeting.
5. Keep at least one invitee question (default “Please share anything…” works) for visit type / service / add-ons.
6. Optional but recommended: add **buffers** before/after events (e.g. 30–60+ minutes) so travel between Celbridge and Carlow is not bookable back-to-back.
7. Do **not** create separate Celbridge vs Carlow calendars unless they sync to one busy calendar.
8. Paste each Share link into `/admin` → **Initial Consultation URL** and **Follow-up URL**.

Defaults live in `src/lib/contact-config.ts` (`calendly.initialConsultationUrl`, `calendly.followUpUrl`). The bookings page picks the URL from the selected service so the right duration is blocked. Packages use the Follow-up event URL.

### Web3Forms access key (shared deploys)

This repo deploys with **GitHub Actions → Vercel prebuilt**. Vercel UI “Redeploy” does **not** bake new env vars into those builds.

Set the key as a **GitHub Actions repository secret** (Settings → Secrets and variables → Actions):

| Secret | Used by | Purpose |
|--------|---------|---------|
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` | Deploy — Production & Deploy — Staging | Web3Forms key for legacy booking-form emails |

Then run **Deploy — Production** (or push/merge to `main` / `dev`). The workflows pass the secret into `vercel build` so it is baked into the static client.

Optional: you can also store the same variable in Vercel for local `vercel` CLI pulls; it is not required for CI prebuilt deploys.

Local: copy [`.env.example`](.env.example) → `.env.local`, set the same variable, restart `npm run dev`.

When this env var is set: email is always on for that build, the Admin access-key field is hidden, and the email toggle is locked. Calendly does **not** use Web3Forms.

### Booking email checklist

1. Create an access key at [web3forms.com](https://web3forms.com) for the clinic inbox (e.g. `info@wellnessneedles.ie`).
2. Set GitHub Actions secret `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` (see above).
3. Redeploy via **Deploy — Production** / **Deploy — Staging** (or merge to `main` / `dev`).
4. On staging `/admin`, enable **Legacy stepper form** when you want form submissions (Admin is off on production).
5. Submit a test booking on `/bookings` and confirm the email arrives.

Full details: [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md). Architecture: [WORKFLOW.md](WORKFLOW.md). Contact config: [CONTACT_CONFIG_SUMMARY.md](CONTACT_CONFIG_SUMMARY.md).

### Build locally

```bash
npm run build
```

Static files are written to `out/`.
