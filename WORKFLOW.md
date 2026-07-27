# Wellness Needles — App Workflow & Architecture

## Context

**Wellness Needles** is a Next.js 15 marketing/informational website for Arkinth Garcia's acupuncture and Traditional Chinese Medicine practice in Celbridge, Co. Kildare, Ireland. It is a fully static site (no backend) with a nature-themed design system. The workflow below covers site navigation, component architecture, data flow, and the user journey from discovery to booking.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.4.6 (App Router, static export) |
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
│  │  Testimonials | Contact | Bookings | [Book Now CTA]      │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  PAGE CONTENT (per route)                                │    │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐   │    │
│  │  │  /       │  │  /about  │  │  /acupuncture        │   │    │
│  │  │  /contact│  │  /book.. │  │  /chinese-medicine   │   │    │
│  │  │  /testim.│  │  /blog*  │  │  /test-loading       │   │    │
│  │  └──────────┘  └──────────┘  └─────────────────────┘   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  FOOTER (Footer.tsx) — Global                            │    │
│  │  Logo | Quick Links | Contact Info | Facebook | ©        │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
* blog route exists but is not implemented
```

---

## 3. Component Architecture

```
src/
├── app/                          ← Next.js App Router pages
│   ├── layout.tsx                ← Root layout (Header + Footer wrapper)
│   ├── globals.css               ← Tailwind + CSS variables (colors, gradients)
│   ├── page.tsx                  ← Home page
│   ├── about/page.tsx            ← About Arkinth Garcia
│   ├── acupuncture/page.tsx      ← Educational: how acupuncture works
│   ├── chinese-medicine/page.tsx ← TCM philosophy & methods
│   ├── contact/page.tsx          ← Contact info + FAQ (form disabled)
│   ├── bookings/page.tsx         ← Pricing display + booking form (disabled)
│   └── testimonials/page.tsx     ← Patient stories + before/after images
│
├── components/                   ← Global shared components
│   ├── Header.tsx                ← Nav bar + mobile hamburger menu
│   ├── Footer.tsx                ← Footer links + contact summary
│   ├── ContactInfo.tsx           ← Reusable contact block (3 variants)
│   └── LoadingComponent.tsx      ← Animated skeleton loader
│
├── features/                     ← Domain-specific feature components
│   ├── home/                     ← Sections exclusive to the home page
│   │   ├── HeroSection.tsx       ← Logo + headline + CTA buttons
│   │   ├── FeaturesSection.tsx   ← "Why Choose Us" 3-card grid + images
│   │   ├── QuickLinksSection.tsx ← 4 service navigation cards
│   │   └── CTASection.tsx        ← "Book Now" banner
│   └── ui/                       ← Generic reusable UI primitives
│       ├── HeroSection.tsx       ← Configurable hero (used on all inner pages)
│       ├── CTAButton.tsx         ← Link button (primary/secondary/gold)
│       ├── FeatureCard.tsx       ← Icon + title + description card
│       ├── ServiceCard.tsx       ← Service navigation card
│       ├── DecorativeImageCard.tsx ← Image + floating leaf decoration
│       └── PulsingLeaf.tsx       ← Animated leaf icon (decorative)
│
└── lib/                          ← Utilities & configuration
    ├── contact-config.ts         ← Single source of truth: address, phone,
    │                               email, hours, feature flags
    └── loading-utils.ts          ← simulateLoading(), withLoadingSimulation()
```

---

## 4. Data Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│                contact-config.ts                     │
│  address | phone | email | hours | feature flags     │
└────────────────────┬────────────────────────────────┘
                     │ imported by
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    Footer.tsx   Contact/     Bookings/
                 page.tsx     page.tsx

┌────────────────────────────────────────────────────┐
│          Static/Hardcoded Content                   │
│  Testimonials array | Services & Pricing arrays    │
│  Educational text  | About bio                     │
└──────────────────────┬─────────────────────────────┘
                       │ defined inside
           ┌───────────┼────────────┐
           ▼           ▼            ▼
     testimonials/  bookings/   acupuncture/
     page.tsx       page.tsx    page.tsx

┌────────────────────────────────────────────────────┐
│          Client-Side Form State (useState)          │
│  Booking form:  {name, email, service, date, ...}  │
│  Contact form:  {name, email, phone, subject, msg} │
└──────────────────────┬─────────────────────────────┘
                       │ on submit
                       ▼
              console.log() + alert()
              (no backend — forms disabled)

┌────────────────────────────────────────────────────┐
│          External Links (no JS fetch calls)         │
│  tel:+353860543085   → user's phone dialer          │
│  mailto:arkinth1@... → user's email client          │
│  https://facebook… → Facebook page (new tab)        │
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
| Booking form | `BOOKING_FORM_ENABLED` | `false` | Pricing shown; form button disabled |
| Live chat | `liveChatEnabled` | `false` | Button not rendered |
| Map integration | `mapIntegrationEnabled` | `false` | Map section hidden |
| Blog | route `/blog` | not implemented | Placeholder only |
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
4. 43 Conditions treated (6 categories: Musculoskeletal, Mental, Neurological, Digestive, Women's Health, General Wellness)
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
3. 6 Patient testimonials (name, treatment, duration, rating, quote)
4. Video testimonials placeholder (coming soon)
5. CTA to share your story

### `/contact`
1. Hero
2. Contact Info block (phone, email, address, hours)
3. FAQ (2 questions shown: how to prepare, how many sessions)
4. CTA buttons: Book Appointment + Send Message (if enabled)

### `/bookings`
1. Hero
2. Service tabs (In-Clinic | Home Visits) with full pricing list
3. Add-ons section (Cupping €20, Moxibustion free)
4. Travel policy for home visits
5. Practitioner card (Arkinth Garcia credentials)
6. Booking form (disabled — shows "Call to Book" instead)

---

## 8. Booking Form Flow (Ready to Activate)

When `BOOKING_FORM_ENABLED = true` in `/bookings/page.tsx`, the multi-step form activates:

```
Step 1: Service Type
  └── Tab: In-Clinic | Home Visit
      └── Radio select: Initial (€75/€90) | Follow-up (€60/€75)
                        5-session | 10-session package

Step 2: Add-ons (checkboxes)
  └── Cupping Therapy | Moxibustion

Step 3: Practitioner
  └── Arkinth Garcia (only option)

Step 4: Date & Time
  └── Date picker (min: today) + Time slot dropdown
      Morning: 9am–12pm | Afternoon: 12pm–4pm | Evening: 4pm–7pm

Step 5: Personal Info
  └── First name, Last name, Email, Phone, Date of Birth

Step 6: Health Info
  └── Chief complaint, Previous treatment (Y/N), Medications,
      Allergies, Emergency contact name + phone

Step 7: Submit → console.log() + alert()
  (backend integration point: connect to email/calendar API here)
```

---

## 9. Responsive Design Breakpoints

| Breakpoint | Layout |
|-----------|--------|
| Mobile (<768px) | Single column; hamburger menu; stacked sections |
| Tablet (≥768px `md:`) | 2-column grids; nav links partially visible |
| Desktop (≥1024px `lg:`) | 3-column grids; full nav; max-width 7xl container |

---

## 10. What's Missing / Extension Points

| Gap | To Implement |
|-----|-------------|
| Form backend | Connect booking/contact forms to email API (e.g., Resend, EmailJS, Formspree) |
| Calendar | Integrate Calendly or custom calendar for appointment slots |
| Payment | Add Stripe for package pre-payment |
| Blog | Build blog list + MDX blog post pages |
| Map | Embed Google Maps in contact page |
| Live chat | Enable live chat widget (e.g., Tawk.to) |
| Video testimonials | Upload/embed real patient videos |
| CMS | Connect to Sanity/Contentful for dynamic content editing |

---

## Verification

To view the app:
```bash
npm install
npm run dev
# Open http://localhost:3000
```

To build static export:
```bash
npm run build
# Output in /out directory
```

Test each route: `/`, `/about`, `/acupuncture`, `/chinese-medicine`, `/testimonials`, `/contact`, `/bookings`
