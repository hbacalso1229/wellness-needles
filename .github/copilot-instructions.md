# Wellness Needles - AI Coding Instructions

**Visual system:** see [`BRANDING_AND_PATTERNS.md`](../BRANDING_AND_PATTERNS.md) for brand tokens, CTA hierarchy, card chrome, heroes, and mobile patterns.  
**Go-live:** see [`docs/GO_LIVE_ARCHITECTURE.md`](../docs/GO_LIVE_ARCHITECTURE.md).

## Project Overview

Static Next.js 15 site for an acupuncture / TCM practice (Celbridge & Carlow, Ireland). Tropical/jungle theme. Static export (`output: 'export'`). Clinic booking mail via Web3Forms; patient thank-you via Cloudflare Pages Function + Resend.

## Key Architecture Patterns

### Design System
- **Color Palette**: Custom CSS variables in `globals.css`
  - Primary green spectrum: `--primary-green` (#2d5016) to `--light-green` (#a7c957)
  - Accent: `--gold-accent` (#d4af37); background `--cream` (#faf9f7)
- **Typography**: Inter (body) + Playfair Display (headings)
- **Gradients**: `jungle-gradient`, `sunset-gradient`, etc. in CSS + Tailwind

### Component Structure
- Fixed header (`pt-16` offset), persistent footer
- Nav: Home, About, Acupuncture, Chinese Medicine, Testimonials, Contact, Bookings, Book Now CTA
- Icons: Lucide React

### Booking (Phase 1)
- Defaults in `src/lib/contact-config.ts` (`bookingFormEnabled: true`; Calendly/Fresha off)
- Marketing `/admin` **removed** — change modes in `contact-config.ts`
- Clinic email: Web3Forms via `send-booking-email.ts` → `info@` (Autoresponder **OFF**)
- Patient thank-you: `send-patient-thank-you.ts` → `/api/booking-thank-you` (Resend From `info@`)
- Staging key: `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`; prod Release: `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY_PRODUCTION`
- Failure → `/bookings/unable-to-process/`; success → `/bookings/thank-you/`
- Production deploy: GitHub **Release published** → Cloudflare Pages only

## Development Conventions

### File Organization
```
src/app/           # App Router pages (no /admin)
src/components/    # Shared UI (Header, Footer, BookingForm, CalendlyEmbed, …)
src/features/      # Home sections + reusable UI primitives
src/hooks/         # e.g. useBookingFeatures
src/lib/           # contact-config, booking-features, send-booking-email, send-patient-thank-you
functions/api/     # Cloudflare Pages Functions (Resend)
public/            # Static assets (+ _redirects apex→www)
docs/              # Go-live architecture + release checklist
```

### Separation of Concerns
- App pages compose features/components; keep pages thin
- Contact/business defaults → `contact-config.ts`
- Booking flags → `booking-features.ts` (env Web3Forms key wins)

### Styling
- Tailwind + semantic classes (`.text-primary`, `.bg-accent`)
- Section padding `py-20`; containers `max-w-7xl mx-auto`
- Gentle transitions; decorative leaf animations where established

### Static Export
- `output: 'export'` in `next.config.ts`
- Images: `unoptimized: true`
- Build output: `/out`
- `NEXT_PUBLIC_*` env vars are baked at build time — redeploy after changes

## Content Patterns

- Practitioner: Arkinth Garcia (College of Naturopathic Medicine, Dublin)
- Dual clinics: Celbridge + Carlow; email `info@wellnessneedles.ie`
- Canonical site: `https://www.wellnessneedles.ie`
- Testimonials: verified Google reviews + consented before/after results

## Technical Requirements

```bash
npm run dev       # Development
npm run build     # Static export → /out
npm run lint      # ESLint
```

### Dependencies
- Next.js 15.5.x (App Router), React 19, TypeScript, Tailwind 3.4, Lucide React

### Key Files
- `src/app/globals.css` — theme
- `src/lib/contact-config.ts` — contact + default flags
- `src/lib/booking-features.ts` — flags + Web3Forms env
- `src/lib/send-patient-thank-you.ts` — client → Pages Function
- `functions/api/booking-thank-you.ts` — Resend HTML ≈ thank-you page
- `src/components/Header.tsx` — navigation
- `BOOKING_EMAIL_INTEGRATION.md` / `README.md` / `docs/GO_LIVE_ARCHITECTURE.md`

## Code Style Guidelines

- `'use client'` only when needed
- Functional components + TypeScript
- Mobile-first Tailwind breakpoints
- Prefer existing patterns over new abstractions
- Document setup in Markdown — no marketing `/admin`

## Common Tasks

### Env / deploy
1. Copy `.env.example` → `.env.local` for local Web3Forms key
2. Staging: push `dev` (Vercel) with `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
3. Production: publish a GitHub Release (Cloudflare Pages + prod secrets)

### Booking mode
1. Edit `contact-config.ts` features (legacy / Calendly / Fresha — one only)
2. Legacy email: env Web3Forms key; patient thank-you via Resend on Pages

### Adding pages
1. `src/app/[route]/page.tsx`
2. Reuse `features/ui` hero/CTA patterns
3. Add Header link if needed
