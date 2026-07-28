# Wellness Needles — App Workflow & Architecture

## Context

**Wellness Needles** is a Next.js 15 marketing/informational website for Arkinth Garcia's acupuncture and Traditional Chinese Medicine practice in Celbridge and Carlow, Ireland. It is a fully static site (no backend) with a nature-themed design system. The workflow below covers site navigation, component architecture, data flow, and the user journey from discovery to booking.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5.22 (App Router, static export) |
| UI | React 19.1.0 + TypeScript 5 |
| Styling | Tailwind CSS 3.4 + Custom CSS variables |
| Icons | Lucide React 0.539 |
| Fonts | Playfair Display (serif) + Inter (sans-serif) |
| State | React `useState` (no external store) |
| Hosting | Static export (`output: 'export'` in next.config.ts) |

---

## 2. Site Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    ROOT LAYOUT (layout.tsx)                       │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  HEADER (Header.tsx) — Fixed, global                     │    │
│  │  Logo | Home | About | Acupuncture | Chinese Medicine    │    │
│  │  Testimonials | Contact | Bookings | Admin | [Book Now]  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  PAGE CONTENT (per route)                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │    │
│  │  │  /       │  │  /about  │  │  /acupuncture        │   │    │
│  │  │  /contact│  │  /book.. │  │  /chinese-medicine   │   │    │
│  │  │  /testim.│  │  /blog*  │  │  /admin              │   │    │
│  │  └──────────┘  └──────────┘  └─────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FOOTER (Footer.tsx) — Global                            │    │
│  │  Logo | Quick Links | Contact Info | Facebook | ©        │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
* blog listing page exists; article detail routes not implemented yet
```

---

## 3. Component Architecture

```
src/
├── app/                          ← Next.js App Router pages
│   ├── layout.tsx                ← Root layout (Header + Footer wrapper)
│   ├── globals.css               ← Tailwind + CSS variables (colors, gradients)
│   ├── page.tsx                  ← Home page
│   ├── about/page.tsx
│   ├── acupuncture/page.tsx
│   ├── chinese-medicine/page.tsx
│   ├── contact/page.tsx          ← Contact info + FAQ (form gated)
│   ├── bookings/page.tsx         ← Pricing + Calendly or legacy stepper
│   ├── admin/page.tsx            ← Feature toggles (no auth)
│   ├── blog/page.tsx             ← Listing only
│   └── testimonials/page.tsx
│
├── components/                   ← Global shared components
│   ├── Header.tsx                ← Nav (includes Admin) + mobile menu
│   ├── Footer.tsx
│   ├── BookingForm.tsx           ← Legacy stepper form
│   ├── BookingStepper.tsx
│   ├── CalendlyEmbed.tsx         ← Inline Calendly iframe + URL builder
│   ├── ContactInfo.tsx
│   ├── BusinessHours.tsx
│   ├── LocationMap.tsx
│   ├── Toast.tsx
│   └── LoadingComponent.tsx
│
├── features/                     ← Domain-specific feature components
│   ├── home/                     ← Home-only sections
│   └── ui/                       ← Reusable Hero, cards, CTA, etc.
│
├── hooks/
│   └── useBookingFeatures.ts     ← Admin / bookings feature flags
│
└── lib/
    ├── contact-config.ts         ← Address, phone, email, hours, default flags
    ├── booking-features.ts       ← localStorage flags + Web3Forms env key
    ├── send-booking-email.ts     ← Web3Forms submit helper
    └── loading-utils.ts
```

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                contact-config.ts                     │
│  address | phone | email | hours | calendly URL      │
│  default feature flags                               │
└────────────────────┬────────────────────────────────┘
                     │ imported by
         ┌───────────┼───────────────┐
         ▼           ▼               ▼
    Footer.tsx   Contact/      booking-features.ts
                 page.tsx      (defaults + env key)

┌────────────────────────────────────────────────────┐
│  booking-features.ts + useBookingFeatures            │
│  localStorage: wellness-needles-booking-features     │
│  NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY (preferred)        │
│  Admin (/admin) toggles Calendly ↔ legacy form       │
└──────────────────────┬─────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   Bookings page   CalendlyEmbed  BookingForm
   (mode switch)                  → send-booking-email.ts
                                  → api.web3forms.com

┌────────────────────────────────────────────────────┐
│          Static/Hardcoded Content                   │
│  Testimonials | Services & Pricing | Educational    │
└────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────┐
│          External Links                             │
│  tel:+353860543085   → phone dialer                 │
│  mailto:info@wellnessneedles.ie → email client      │
│  Calendly embed / Facebook                          │
└────────────────────────────────────────────────────┘
```

---

## 5. User Journey Workflow

```
                        DISCOVERY
                            │
                            ▼
                    ┌───────────────┐
                    │  Home Page /  │
                    │  Hero + CTA   │
                    └──────┬────────┘
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
   ┌────────────┐  ┌──────────────┐  ┌───────────────┐
   │  /about    │  │/acupuncture  │  │/chinese-      │
   │ Who is     │  │ How it works │  │medicine       │
   │ Arkinth?   │  │ Benefits     │  │ TCM Philosophy│
   │ Mission &  │  │ 43 conditions│  │ Methods       │
   │ Values     │  │ treated      │  │ Diagnosis     │
   └────────────┘  └──────────────┘  └───────────────┘
          │                │                 │
          └────────────────┼─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │ /testimonials   │
                  │ Before/After    │
                  │ Patient Stories │
                  │ 6 reviews       │
                  └────────┬────────┘
                           │
               ┌───────────┴────────────┐
               │                        │
               ▼                        ▼
      ┌────────────────┐     ┌─────────────────────┐
      │   /contact     │     │     /bookings        │
      │ Phone, Email   │     │ Pricing tabs:        │
      │ Address, Hours │     │  In-Clinic vs Home   │
      │ FAQ            │     │ Add-ons (Cupping,    │
      │                │     │  Moxibustion)        │
      └────────┬───────┘     │ Form (disabled) ─── ┤
               │             │  → Call/Email to     │
               │             │    book manually     │
               │             └──────────────────────┘
               │
               ▼
        ┌────────────┐
        │ tel: link  │  ← user calls Arkinth directly
        │ mailto:    │  ← user emails Arkinth directly
        └────────────┘

              CONVERSION (current)
       User calls or emails to book a session
```

---

## 6. Feature Flags & Current Status

| Feature | Config Key | Status | What Happens |
|---------|-----------|--------|--------------|
| Contact form | `contactFormEnabled` | `false` | Form hidden; user sees call/email CTA |
| Booking form | `bookingFormEnabled` | `false` (default; overridable in Admin) | Legacy stepper on `/bookings` |
| Calendly scheduling | `calendlyEnabled` | `true` (default; overridable in Admin) | Inline Calendly embed on `/bookings` |
| Live chat | `liveChatEnabled` | `false` | Button not rendered |
| Map integration | `mapIntegrationEnabled` | `true` | Dual Google Maps embeds on Contact |
| Treatment packages | `treatmentPackagesEnabled` | `false` | 5/10 session packages hidden |
| Blog | route `/blog` | listing only | Article list shown; no `/blog/[id]` routes |
| Video testimonials | hardcoded | not implemented | "Coming soon" placeholder |

---

## 7. Page-by-Page Breakdown

### `/` — Home
Sections (in order):
1. `HeroSection` — logo, headline, "Book Your Session" + "Learn More" CTAs
2. `FeaturesSection` — clinic images + 3 "Why Choose Us" cards
3. `QuickLinksSection` — 4 service navigation cards
4. `CTASection` — "Ready to Begin?" banner → /bookings

### `/about`
1. Hero (reusable `ui/HeroSection`)
2. Arkinth's personal story (alopecia → became practitioner)
3. Mission / Vision / Values
4. "Why Choose Wellness Needles?" feature cards

### `/acupuncture`
1. Hero
2. "How Acupuncture Works" (TCM + scientific view)
3. 6 Benefits cards (Pain, Stress, Sleep, Digestion, Fertility, Immunity)
4. Conditions treated (categories: Pain Management, Mental Health, Women's Health, Digestive Issues, Respiratory, General Wellness)
5. Scientific evidence section + CTA

### `/chinese-medicine`
1. Hero
2. TCM Philosophy (Qi, Yin/Yang, Five Elements, Meridians)
3. Treatment Methods (Acupuncture, Cupping, Moxibustion, Gua Sha)
4. Diagnostic Methods
5. Integrative Approach + CTA

### `/testimonials`
1. Hero
2. Before/After image cards (Alopecia, Skin conditions)
3. Illustrative example stories (disclaimed; not verified patient quotes)
4. Video testimonials placeholder (coming soon)
5. CTA to share your story

### `/contact`
1. Hero
2. Contact Info block (phone, email, dual addresses with directions links, hours)
3. Find Us — Google Maps embeds for Celbridge and Carlow
4. FAQ (2 questions shown: how to prepare, how many sessions)
5. CTA buttons: Book Appointment + Send Message (if enabled)

### `/bookings`
1. Hero
2. When **legacy stepper** is on (`bookingFormEnabled`): full `BookingForm` (Service → Location → Date & Time → Details). Pricing UI is replaced by the form path.
3. When **Calendly** is on (default): service tabs + pricing, add-ons, travel policy, practitioner card, then inline Calendly after location + service are selected.
4. When both off: call / contact CTA only.
5. Mode + Calendly URL + email settings: `/admin` (browser localStorage). Defaults from `contact-config.ts`.
6. Legacy form email: Web3Forms when email is configured — preferred via `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` on shared deploys. See `BOOKING_EMAIL_INTEGRATION.md` and README deployment section.

### `/admin`
1. Active mode banner (Calendly | Legacy form | both off)
2. Mutually exclusive toggles: Calendly embed ↔ Legacy stepper form
3. Calendly setup: Scheduling URL + Save / Open link (when Calendly on)
4. Booking email setup: recipient (+ access key only if env key unset); email toggle locked when env key is set
5. Reset to defaults / Open bookings
6. **No auth** — linked from Header. Setup checklists live in README (not in the UI).

**Calendly one-time setup:** see [README → Calendly setup checklist](README.md#calendly-setup-checklist). Default Share URL must match `contactConfig.calendly.schedulingUrl` (or the Admin override).

---

## 8. Booking Form Flow (Legacy Stepper)

When `bookingFormEnabled` is true (Admin toggle), the legacy form uses `BookingForm` + `BookingStepper`:

```
Progress: Service → Location → Date & Time → Your details
  (desktop: numbered steps; mobile: “Step X of 4” + dots + sticky Back/Next)

Step 1: Service
  └── Tab: In-Clinic | Home Visit
      └── Radio select: Initial | Follow-up (packages if enabled)
      └── Add-ons: Cupping | Moxibustion
      └── Practitioner card

Step 2: Location
  └── Celbridge | Carlow (required)

Step 3: Date & Time
  └── Preferred date + time slot (past times disabled for today)

Step 4: Your details
  └── Personal info + health info (Irish phone + email validation)

Submit → toast (+ console.log)
  └── If email configured → POST Web3Forms (send-booking-email.ts)
  └── Form resets after successful submit
```

Per-step validation blocks Next until required fields on that step are filled. All validation errors can surface as a toast list with red field highlights.

---

## 9. Responsive Design Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<768px) | Single column; hamburger menu; stacked sections |
| Tablet (≥768px `md:`) | 2-column grids; nav links partially visible |
| Desktop (≥1024px `lg:`) | 3-column grids; full nav; max-width 7xl container |

---

## 10. What's Missing / Extension Points

| Gap | Notes |
|-----|--------|
| Contact form backend | Still gated (`contactFormEnabled: false`); no email API for contact yet |
| Admin auth | `/admin` is public — add protection if exposing more than feature toggles |
| Payment | Stripe for package pre-payment (packages currently hidden) |
| Blog detail routes | Optional MDX `/blog/[slug]` when ready |
| Live chat | Flag exists; widget not wired |
| Video testimonials | “Coming soon” placeholder |
| CMS | Sanity/Contentful for dynamic content |

**Already in place:** Calendly embed, legacy stepper, Web3Forms booking email, dual Google Maps on Contact.

---

## Verification

```bash
npm install
cp .env.example .env.local   # optional Web3Forms key
npm run dev
# Open http://localhost:3000
```

```bash
npm run build
# Output in /out
```

Test routes: `/`, `/about`, `/acupuncture`, `/chinese-medicine`, `/testimonials`, `/contact`, `/bookings`, `/admin`, `/blog`.
