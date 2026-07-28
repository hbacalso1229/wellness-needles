# Centralized Contact Configuration

## Overview
Centralized location for all contact details and business information, referenced throughout the application for consistency and easy updates.

## Files

### 1. Contact Configuration (`src/lib/contact-config.ts`)
**Central source of truth for all contact information:**

- **Locations** (two clinics):
  1. 56 The Orchard Oldtown Mill, Celbridge, Co.Kildare W23 K603
  2. 16 Kennedy St, Graigue, Carlow, R93 H2X8
  - Each location includes `formatted` lines, `mapQuery`, and `directionsUrl`
  - Shared MapPin icon from Lucide React

- **Phone**: 0860543085
  - Formats: raw number, formatted display, international display
  - Clickable `tel:` link

- **Email**: info@wellnessneedles.ie
  - Clickable `mailto:` link

- **Business Hours**:
  - Monday-Friday: 9:00 AM - 7:00 PM
  - Saturday: 10:00 AM - 4:00 PM
  - Sunday: Closed
  - Emergency appointments note

- **Feature flags**:
  - `contactFormEnabled: false`
  - `liveChatEnabled: false`
  - `mapIntegrationEnabled: true` (Google Maps embeds on Contact)
  - `treatmentPackagesEnabled: false` (5/10 session packages hidden until enabled)

### 2. Reusable Components

#### ContactInfo (`src/components/ContactInfo.tsx`)
Variants: default, compact, inline. Address entries link to Google Maps directions.

#### LocationMap (`src/components/LocationMap.tsx`)
Iframe map embed + optional “Get directions” link per location.

#### BusinessHours (`src/components/BusinessHours.tsx`)
Variants: default, compact, card.

### 3. Consumers

- Footer, Contact page, Bookings page, ContactInfo, BusinessHours
- Contact “Find Us” section renders both maps when `mapIntegrationEnabled` is true

## Usage

```typescript
import { contactConfig } from '../lib/contact-config'

{contactConfig.phone.displayText}
{contactConfig.email.address}
{contactConfig.address.locations.map((location) => location.full)}
```

```typescript
import ContactInfo from '../components/ContactInfo'
import LocationMap from '../components/LocationMap'

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
