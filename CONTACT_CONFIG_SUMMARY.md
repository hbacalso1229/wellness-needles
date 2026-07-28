# Centralized Contact Configuration

## Overview

Centralized location for contact details, business information, Calendly defaults, and feature flags — referenced throughout the app for consistency.

Runtime booking overrides (Calendly ↔ legacy form, Scheduling URL, email recipient) live in browser localStorage via `/admin` and `src/lib/booking-features.ts`. Shared-deploy Web3Forms key: `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` (see [README](README.md#production-deployment)).

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

- **Calendly**:
  - `calendly.schedulingUrl`: `https://calendly.com/hbacalso1229/scheduled-booking`
  - Overridable on `/admin` when Calendly mode is on

- **Feature flags** (defaults; booking pair overridable on `/admin`):

| Flag | Default | Effect |
|------|---------|--------|
| `contactFormEnabled` | `false` | Contact form hidden |
| `liveChatEnabled` | `false` | Chat not rendered |
| `mapIntegrationEnabled` | `true` | Dual Google Maps on Contact |
| `treatmentPackagesEnabled` | `false` | 5/10 session packages hidden |
| `calendlyEnabled` | `true` | Calendly embed on `/bookings` |
| `bookingFormEnabled` | `false` | Legacy stepper (mutually exclusive with Calendly in Admin) |

### 2. Booking features (`src/lib/booking-features.ts`)

- Reads/writes `wellness-needles-booking-features` in localStorage
- Defaults from `contactConfig` + `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`
- Env access key always wins; when set, booking email is forced on

### 3. Reusable components

| Component | Role |
|-----------|------|
| `ContactInfo.tsx` | Variants: default, compact, inline |
| `LocationMap.tsx` | Iframe map + optional directions link |
| `BusinessHours.tsx` | Variants: default, compact, card |

### 4. Consumers

- Footer, Contact page, Bookings page, Admin (defaults), Header (nav only)
- Contact “Find Us” renders both maps when `mapIntegrationEnabled` is true

## Usage

```typescript
import { contactConfig } from '@/lib/contact-config'

contactConfig.phone.displayText
contactConfig.email.address
contactConfig.calendly.schedulingUrl
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
