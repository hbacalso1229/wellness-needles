# Wellness Needles - AI Coding Instructions

**Visual system:** see [`BRANDING_AND_PATTERNS.md`](../BRANDING_AND_PATTERNS.md) for brand tokens, CTA hierarchy, card chrome, heroes, and mobile patterns.

## Project Overview

Static Next.js 15 site for an acupuncture / TCM practice (Celbridge & Carlow, Ireland). Tropical/jungle theme. Static export (`output: 'export'`) — no server API routes.

## Key Architecture Patterns

### Design System
- **Color Palette**: Custom CSS variables in `globals.css`
  - Primary green spectrum: `--primary-green` (#2d5016) to `--light-green` (#a7c957)
  - Accent: `--gold-accent` (#d4af37); background `--cream` (#f9f7f4)
- **Typography**: Inter (body) + Playfair Display (headings)
- **Gradients**: `jungle-gradient`, `sunset-gradient`, etc. in CSS + Tailwind

### Component Structure
- Fixed header (`pt-16` offset), persistent footer
- Nav: Home, About, Acupuncture, Chinese Medicine, Testimonials, Contact, Bookings, **Admin**, Book Now CTA
- Icons: Lucide React

### Booking / Admin
- Defaults in `src/lib/contact-config.ts` (`calendlyEnabled: true`, `bookingFormEnabled: false`)
- Runtime overrides: `/admin` → `booking-features.ts` / `useBookingFeatures` (localStorage)
- Calendly embed vs legacy stepper are mutually exclusive in Admin
- Legacy form email: Web3Forms via `send-booking-email.ts`
- Prefer `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` for shared deploys (Vercel Preview + Production) — not GitHub Secrets
- When env key is set: email forced on; Admin key field hidden; toggle locked
- Setup checklists live in README / BOOKING_EMAIL_INTEGRATION.md — keep Admin UI lean

## Development Conventions

### File Organization
```
src/app/           # App Router pages only (incl. /admin)
src/components/    # Shared UI (Header, Footer, BookingForm, CalendlyEmbed, …)
src/features/      # Home sections + reusable UI primitives
src/hooks/         # e.g. useBookingFeatures
src/lib/           # contact-config, booking-features, send-booking-email
public/            # Static assets
```

### Separation of Concerns
- App pages compose features/components; keep pages thin
- Contact/business defaults → `contact-config.ts`
- Booking runtime flags → `booking-features.ts` (not scattered localStorage)

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
- Testimonials: illustrative / disclaimed where noted

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
- `src/lib/contact-config.ts` — contact + default flags + Calendly URL
- `src/lib/booking-features.ts` — Admin flags + Web3Forms env
- `src/app/admin/page.tsx` — feature toggles (no auth)
- `src/components/Header.tsx` — navigation
- `BOOKING_EMAIL_INTEGRATION.md` / `README.md` — deploy & email setup

## Code Style Guidelines

- `'use client'` only when needed
- Functional components + TypeScript
- Mobile-first Tailwind breakpoints
- Prefer existing patterns over new abstractions
- Do not put long setup checklists back into Admin UI — document in Markdown

## Common Tasks

### Env / deploy
1. Copy `.env.example` → `.env.local` for local Web3Forms key
2. Set the same var in Vercel for Preview (`dev`) and Production (`main`)
3. Redeploy after env changes

### Booking mode
1. `/admin` — toggle Calendly vs legacy form
2. Calendly: paste Share URL; follow README Calendly checklist
3. Legacy email: prefer env key; Admin recipient override is per-browser

### Adding pages
1. `src/app/[route]/page.tsx`
2. Reuse `features/ui` hero/CTA patterns
3. Add Header link if needed
