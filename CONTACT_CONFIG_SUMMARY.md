# Centralized Contact Configuration

## Overview

Centralized location for contact details, business information, Calendly defaults, and feature flags — referenced throughout the app for consistency.

Runtime booking overrides previously lived on `/admin` (removed). Defaults and URLs now come from `contact-config.ts`. Captcha is env (`NEXT_PUBLIC_CAPTCHA_PROVIDER`), not contact-config. Shared-deploy staging Web3Forms key: `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` (see [README](README.md#production-deployment) and [docs/GO_LIVE_ARCHITECTURE.md](docs/GO_LIVE_ARCHITECTURE.md)).

## Files

### 1. Contact Configuration (`src/lib/contact-config.ts`)

**Central source of truth:**

- **Locations** (two clinics):
  1. 56 The Orchard Oldtown Mill, Celbridge, Co.Kildare W23 K603
  2. 16 Kennedy St, Graigue, Carlow, R93 H2X8
  - Each includes `formatted` lines, `mapQuery`, and `directionsUrl`

- **Phone**: 0860543085 / display `+353 86 054 3085` / `tel:+353860543085`

- **Email**: `info@wellnessneedles.ie`

- **Social**: Facebook → Wellness Needles page

- **Business hours**:
  - Monday–Friday: 9:00 AM – 7:00 PM
  - Saturday: 10:00 AM – 4:00 PM
  - Sunday: Closed
  - Emergency appointments note

- **Fresha**:
  - `fresha.bookingUrl` — public booking page (set in `contact-config.ts`)
  - `features.freshaEnabled` — default `false`; when on, Book Now opens Fresha

- **Calendly**:
  - `calendly.initialConsultationUrl` — Initial (1h 15m / 75 min, 15-min starts)
  - `calendly.followUpUrl` — Follow-up (45 min, 15-min starts)
  - `calendly.schedulingUrl` — fallback / packages default
  - `calendly.durations` — labels + minute constants

- **Feature flags** (defaults in `contact-config.ts`):

| Flag | Default | Effect |
|------|---------|--------|
| `contactFormEnabled` | `false` | Contact form hidden |
| `liveChatEnabled` | `false` | Chat not rendered |
| `mapIntegrationEnabled` | `true` | Dual Google Maps on Contact |
| `treatmentPackagesEnabled` | `false` | 5/10 session packages hidden |
| `calendlyEnabled` | `false` | Calendly embed on `/bookings` |
| `bookingFormEnabled` | `true` | Legacy stepper (Phase 1 default) |
| `freshaEnabled` | `false` | Fresha Book Now + bookings CTA |

Fresha, Calendly, and legacy form should stay mutually exclusive in config.
### 2. Booking features (`src/lib/booking-features.ts`)

- Defaults from `contactConfig` + `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
- Env access key always wins; when set, booking email is forced on
- Marketing `/admin` removed — modes follow `contact-config` defaults
- `resolveCalendlyUrlForService()` picks Initial vs Follow-up Calendly URL from the selected service id
- `getBookingCtaHref()` / Fresha flags for Book Now CTAs

### 3. Reusable components

| Component | Role |
|-----------|------|
| `ContactInfo.tsx` | Variants: default, compact, inline |
| `LocationMap.tsx` | Iframe map + optional directions link |
| `BusinessHours.tsx` | Variants: default, compact, card |

### 4. Consumers

- Footer, Contact page, Bookings page, Header (nav only)
- Contact “Find Us” renders both maps when `mapIntegrationEnabled` is true

## Usage

```typescript
import { contactConfig } from '@/lib/contact-config'

contactConfig.phone.displayText
contactConfig.email.address
contactConfig.calendly.initialConsultationUrl
contactConfig.calendly.followUpUrl
contactConfig.calendly.durations.initialLabel
contactConfig.address.locations.map((location) => location.full)
```

```typescript
import ContactInfo from '@/components/ContactInfo'
import LocationMap from '@/components/LocationMap'

<ContactInfo />
<LocationMap
  query={location.mapQuery}
  title={`Map of ${location.full}`}
  directionsUrl={location.directionsUrl}
/>
```

## Irish contact details

- Celbridge: 56 The Orchard Oldtown Mill, Celbridge, Co.Kildare W23 K603
- Carlow: 16 Kennedy St, Graigue, Carlow, R93 H2X8
- Phone: +353 86 054 3085
- Email: info@wellnessneedles.ie

## Related docs

- [README.md](README.md) — deployment, Calendly & Web3Forms checklists
- [BOOKING_EMAIL_INTEGRATION.md](BOOKING_EMAIL_INTEGRATION.md) — Web3Forms details
- [WORKFLOW.md](WORKFLOW.md) — architecture and booking flows
