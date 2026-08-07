# Wellness Needles — Branding & UI Patterns

**Status:** Final source of truth for visual / UX decisions.  
**Code sources:** `src/app/globals.css`, `tailwind.config.js`, `src/features/ui/*`, `src/components/Header.tsx`, `src/components/Footer.tsx`.

Older notes (`HERO_SECTION_GUIDE.md`, `HERO_REFACTORING_COMPLETE.md`, `COMPONENT_REFACTORING_SUMMARY.md`) are **historical** — prefer this file when they conflict.

---

## 1. Brand identity

| | |
|---|---|
| **Product** | Wellness Needles — acupuncture / TCM (Celbridge & Carlow, Ireland) |
| **Tone** | Calm, clinical-credible wellness. Structured proof over DIY collage. |
| **Logo** | `/logo_wellness.jpeg` — circular crop in header/footer |
| **Avoid** | Purple/indigo AI defaults; heavy glow as decoration; tilted scrapbook collages as primary proof; Share / Call competing equally with Book |

---

## 2. Color system

Tailwind keys map to CSS variables in `:root` (`globals.css`).

| Token | Hex | Typical use |
|-------|-----|-------------|
| `primary` | `#2d5016` | Headings, icons, selected calendar chrome, form/stepper fills |
| `secondary` | `#4a7c2a` | Brand mid-green for fills / `hover:bg-secondary` (not body copy) |
| `accent` | `#7fb069` | Soft borders (`border-accent/15`), pale chips/notes (`bg-accent/10`), glass fill base |
| `light-green` | `#a7c957` | Highlights (sparingly) |
| `cream` | `#ffffff` | Light text on dark (`text-cream`); token still used for borders/rings — page surfaces use `bg-white` |
| `gold` | `#d4af37` | Conversion CTAs, section flourish rules, trust star accents |
| `text-dark` | `#2a2a28` | Body copy, form values, calendar day numbers (warm ink charcoal) |
| `text-light` | `#7f8c8d` | Muted meta |
| `blue-*` | logo blues | Minor accents only (not page themes) |

**Gold CTA gradient stops** (polished Book pills via `primaryGoldCtaClassName`): `#e8c84a` → `#d4af37` → `#c49a2a`; hover `#f0d45c` → `#e0c040` → `#d4af37`.

**Supporting / body text:** `text-secondary` resolves to **`text-dark`** (`#2a2a28`) via the `.text-secondary` override in `globals.css`. Keep the Tailwind `secondary` color green for backgrounds and button hover — do not recolor that token for body copy.

**Rules**

- Default page surface + mid-page content sections: **`bg-white`** (do not use warm off-white / paper cream for section fills).
- Soft tinted bands (closing / proof / map / insurance info): shared glass green — **`glassGreenBandClassName`** (`border-y border-white/50` + `bg-accent/5` + light blur). Panels/asides: **`glassGreenPanelClassName`**. Pale chips and info notes stay **`bg-accent/10`**. Examples: Scientific Evidence, Integrative Approach, Insurance, Find Us, What patients say, testimonials CTA band, bookings form / sticky help.
- Fixed header (all devices): clear glass — `bg-white/40` + `backdrop-blur-[2px]` (+ `supports-[backdrop-filter]:bg-white/30`), `border-white/40`. Brand `font-bold text-primary`; nav links `font-semibold` (active `font-bold`) with dark ink → primary on hover/active. Prefer clear over heavy frost (`/92` + `backdrop-blur-md`).
- Quiet panel chrome: `border border-accent/15` (not thick decorative green/gold washes on cards).
- **Gold = marketing conversion** (Book Appointment, Call Now in booking help sidebar).
- **Green primary = in-flow actions** (Continue, Request appointment, Send Message) — not the main marketing Book CTA.
- Supporting paragraphs use `text-secondary` (`text-dark`); **section H2s** stay `text-primary` (forest green).
- **In-content titles** (FeatureCard titles, condition/treatment cards, column headings, Mission/Vision/Values, practitioner name, FAQ/accordion titles, blog card titles): use `text-[var(--text-dark)]` (`#2a2a28`) — not green. Reserve forest green for section H2s, icons, links, and selected chrome.
- `cream` token remains for **`text-cream` / borders / rings** on dark surfaces — not for page fills or warm cream nav glass.

**Gradients:** `jungle-gradient`, `sunset-gradient`, `ocean-accent`, `harmony-gradient` (Tailwind + CSS). Use for large washes / hero fallbacks — not for every card.

---

## 3. Typography

| Role | Font | Tailwind |
|------|------|----------|
| Body / UI | Inter | `font-sans` (default on `body`) |
| Brand / headings | Playfair Display | `font-serif` |

### Responsive type scale (marketing)

| Role | Mobile | Tablet (`md`) | Desktop (`lg`+) | Color |
|------|--------|---------------|-----------------|-------|
| **Section H2** | `text-2xl` | `text-3xl` → `md:text-4xl` | Home only: `lg:text-5xl` | `text-primary` |
| **Section subtitle** | `text-base` | `sm:text-lg` → `md:text-xl` | same | `text-dark/70` |
| **Card / column title** | `text-lg` | `md:text-xl` | same | `text-dark` |
| **Accordion / FAQ title** | `text-base` | `md:text-lg` | same | `text-dark` |
| **Body / supporting** | `text-base` + `leading-relaxed` | same | same | `text-dark/70` |
| **Learn more / outline pills / primary CTA labels** | `text-sm` min | `text-sm` | same | `text-primary` / dark |
| **Eyebrow / micro labels** | `text-xs` uppercase | same | same | `text-dark/45` |

**Readability floor:** primary readable copy (body, quotes, role lines, blurbs, FAQ answers, review text) ≥ **`text-base` (16px)** on **all marketing pages** (home, about, acupuncture, Chinese medicine, testimonials, contact, blog, bookings thank-you / help blurbs). Reserve `text-sm` for Learn more, credential pills, form labels, nav Book, and similar chrome. True micro-labels (eyebrows, OR, Before/After chips, copyright) may stay `text-xs`. Dense admin/form UI may still use `text-sm` where appropriate.

**Section titles** — use `SectionHeading` (defaults match the table). Home Benefits/Services/Practitioner may pass `lg:text-5xl` on the H2 only.

**Hero H1** (inner `HeroSection`): `font-serif` with responsive scale up to `xl:text-7xl`.

**Header Book (mobile / tablet):** `text-sm` with comfortable padding (`px-3 sm:px-3.5 py-1.5`) — never below `text-sm` on real devices. Desktop nav Book stays `text-sm`.

---

## 4. Component patterns

Shared primitives live in `src/features/ui/` (exported from `src/features/index.ts`).

### Heroes (`HeroSection`)

**Home** (`features/home/HeroSection.tsx`)

- Full-bleed photo + L→R dark green wash + light top/bottom fade (stronger than inner heroes for copy readability).
- Brand-forward copy; primary CTA **Book your appointment** (gold).
- Trust line: gold stars + **“Rated 5★ by clients”**.
- Tablet+: one-screen lock via `.page-hero[data-home-hero]` (`calc(100dvh - 3.5rem)`).
- Always visible (not gated behind `xl`).

**Inner pages** (`features/ui/HeroSection.tsx`)

- Full-bleed photo + readability overlay (`from-primary/65 via-primary/45 to-secondary/35` default).
- Image: `fill` + **`object-cover`** (never stretch). Optional `object-position` via `backgroundImageClassName`.
- **Asset rule:** short banners need **landscape** photos. Square/portrait crops look smeared in thin heroes.
- `hideOnMobile` default **true** → hero hidden below `xl` (1280px).
- Optional `heightClass` for a slightly deeper crop — don’t change global `.page-hero` for one page.

### CTAs (`CTAButton` / `BookingCtaButton` / Header)

| Role | Style | Examples |
|------|--------|----------|
| **Conversion (gold)** | `variant="gold"` + `primaryGoldCtaClassName` for polished Book pills | Header **Book Appointment**; home booking band **Book your session**; testimonials mid **Book your appointment** / bottom **Start your journey**; contact sidebar Book |
| **In-flow (green)** | `bg-primary` / `hover:bg-secondary` | Booking **Continue** / **Request appointment**; contact **Send Message** |
| **Secondary (outline / text)** | `variant="outline"` or muted text link | **Send a message**, **Share your story**, **View more results** |

- Always `rounded-full` for marketing CTAs.
- Hierarchy: **Book (gold) above / before Share or email** — never the reverse.
- **Label-fit width:** polished conversion pills use `primaryGoldCtaClassName` (`w-auto`) — hug the label. Do **not** stretch to `w-full max-w-md`. Consistency comes from shared padding, type, fill, and shadow — not equal forced widths.
- Shared polish: `primaryGoldCtaClassName` in `src/features/ui/CTAButton.tsx` (exported from `src/features/index.ts`) — bold type, calendar optional, stronger gold shadow, hover lift + press. Use on home `BookingSection` and testimonials primary Books; wrap with `inline-flex justify-center` (not a full-width max-width parent).
- Default `CTAButton` large padding still applies when the shared class is omitted; prefer the shared class for marketing Book pills so size/weight match across pages.
- Muted secondary: lower opacity text/outline so it never competes with gold (e.g. testimonials Share).
- Compact mobile (sidebars): tighter padding/type; stack under main content on small screens.
- Header Book stays gold and readable on mobile/tablet.

### Cards — two systems

1. **Embossed white** — `bg-white/80` + `.card-emboss` (FeatureCard, some condition tiles). Soft hover lift + light shadow on `md+`.
   - **Titles:** `font-serif text-lg md:text-xl font-semibold text-[var(--text-dark)]` — one size for static + flippable FeatureCards site-wide (home Benefits/Services, About, acupuncture, Chinese medicine). Not green.
   - **White sections** (`bg-white`): FeatureCards are **flat on mobile** — `bg-transparent shadow-none`, panel returns from `md` (`elevated` omitted). Soft icon discs via `softIcon` without elevating the panel. Example: home “Why acupuncture works”. No card/icon/CTA hover motion below `md`.
   - **Tinted / glass sections** (`glassGreenBandClassName`, sticky glass panels): pass **`elevated`** so white panel + `shadow-sm` stay on mobile. Example: soft info bands and sticky book/help asides.
2. **Flat white** — `bg-white rounded-xl border border-accent/15 shadow-none` (TestimonialCard, bookings panels, diagnosis/FAQ accordions). Hover: border + translate, not green glow.

### Booking selection cards

Service / location / time range cards (`ServiceSelectionCards`, `ClinicLocationCards`, `TimeRangeCards`):

- **Selected:** thicker primary border + `bg-accent/20` + filled check badge.
- **Unselected:** `border-2 border-accent/15 bg-white`; hover lift only when not selected.
- **No “Most popular”** (or similar) badges — keep choice chrome clean.
- Motion scoped so selection does not jump layout (`.booking-select-card`).

### Accordions (diagnosis / FAQ)

- Collapsed: `ChevronDown` facing **down**.
- Expanded: `rotate-180` so chevron faces **up**.
- Shared motion classes: `.diagnosis-accordion-chevron`, `.diagnosis-accordion-panel`, `.diagnosis-accordion-body` in `globals.css`.
- Used on Chinese medicine diagnosis cards and Contact FAQs.

### Before / After (`BeforeAfterSlider`)

- Separate `beforeSrc` / `afterSrc` (not multi-photo scrapbook as the only proof).
- **Primary green = handle only** (~44–48px): ← → chevrons; rest cursor `ew-resize`; hover/focus/card-hover `scale-[1.08]` + `shadow-lg` + `ring-primary/25`. No bottom range — keyboard on the focusable track.
- One-shot load preview (~8–10% slide) when motion is allowed; cancelled on first user interaction.
- Before/After: mid-ground pills (`bg-black/40`, `backdrop-blur-[4px]`).
- Media frame: shared `aspect-[4/3]` + inset ring + light top wash so photo/collage/lab UI feel unified.
- Caption stack (Option A): **Condition** (serif dark) → **Result** (bold dark) → **Supporting** (muted, varied per case).
- Case framing: neutral white panel (`border-black/5`, `p-6`, `0 6px 20px` elevation); hover lift ~4px + deeper shadow; `group/card` brightens handle/divider.
- Testimonials Real Patient Results: muted trust row with `•`; mobile `SnapCarousel`; `lg:grid-cols-3`; footer-style disclaimer under the grid.
- Optional `beforeRotate` / `afterRotate`; `imageFit="contain"` for lab reports and collages.
- Assets under `public/results/` (eczema, sperm concentration, hair loss / alopecia).

### Carousels (`SnapCarousel`)

- Mobile: horizontal snap + dots.
- `md+`: CSS grid; dots typically hidden.
- Slide shell: `snapSlideClassName`.

### Sticky sidebars (Contact + Bookings)

Shared pattern from **`md` (768px)** — not `xl`:

- Grid: main + `minmax(14rem,16rem)` aside (`lg` can widen aside slightly).
- Aside: `md:sticky md:top-24` + **`glassGreenPanelClassName`** (same glass surface as the bookings form).
- Mobile: stack below main; constrain width (`max-w-xs`) so CTAs aren’t edge-to-edge giants.

| Page | Sidebar job |
|------|-------------|
| Bookings | Need help? → gold **Call Now** → Or → outline **Send a message** |
| Contact | Ready to book… → gold **Book your appointment** (+ short trust line) |

`xl` (1280) is for desktop nav (vs hamburger) and inner-page hero visibility — **not** for showing the sticky book/help column.

### Header / nav (`src/components/Header.tsx`)

- Fixed top bar (mobile / tablet / desktop): height **`h-14` (3.5rem)**; clear glass `bg-white/40 backdrop-blur-[2px] supports-[backdrop-filter]:bg-white/30` + `border-b border-white/40` + `shadow-sm` (same on all breakpoints).
- Brand: circular logo + Playfair **Wellness Needles** — `font-bold text-primary`, responsive type `text-base` → `sm:text-lg` → `xl:text-xl`. On mobile the brand row is `flex-1 min-w-0` + truncate so **Book + hamburger stay `shrink-0` and visible**.
- Desktop / mobile links: base `font-semibold`; inactive `text-dark/80` → hover/active `text-primary`; active also `font-bold` + gold underline (desktop) or gold left border (mobile drawer).
- **Book Appointment** gold pill (calendar icon) — always visible on mobile/tablet; desktop at end of nav.
- Mobile drawer panel: `bg-white/50 backdrop-blur-[2px]` (match clear glass chrome).
- Main content offset: **`pt-14`** (match header height).

### Footer (`src/components/Footer.tsx`)

- Surface: `bg-primary` + cream text.
- **Section titles** (Quick Links, Contact Info, Follow us): `font-bold` + full `text-cream`.
- **Body / links / social:** `text-cream/65` → hover `text-cream` (clearer scan hierarchy).
- Copyright row: quieter (`text-cream/60`).
- No decorative leaf scatter.

### Booking form (`src/components/BookingForm.tsx`)

**Steps:** Service → Location → Date & Time → Your details.

**Step nav:** primary button label is **Continue** (not Next). Final step: **Request appointment**.

**Your details (confirmed personal fields only):**

| Field | Required |
|-------|----------|
| First name, last name | Yes |
| Email, phone (Irish formats) | Yes |
| Date of birth | **Yes** |

- **Do not** collect Health Information on the form (no chief complaint, prior acupuncture, medications, or allergies). Clinic can gather that in person / follow-up.
- Booking email (`src/lib/send-booking-email.ts`) mirrors the same fields — appointment + personal only; DOB is included as required.

**Date & Time layout:**

- Preferred Date full-width, then Preferred Time Range below.
- Three range cards (Morning / Afternoon / Evening) in `grid-cols-1 sm:grid-cols-3`.
- Cards use the same selection pattern as location/service.
- Soft-disable a range when the selected date is today and that window has already ended.
- Email payload sends a human-readable label (e.g. `Morning (9:00 AM – 12:00 PM)`).

### Date picker (`BookingDatePicker` in `src/features/ui/BookingDatePicker.tsx`)

Shared custom calendar for **Preferred Date** and **Date of birth** — do not use native `type="date"` for these fields.

| | Preferred date | Date of birth |
|---|---|---|
| Saturdays | Disabled (clinic closed) | Selectable |
| Range | `min` = first open day; years through **current year + 1** | `min` ≈ 1920; `max` = today |
| Default open | First bookable day | Current month/year (`initialView="max"`) |

**Chrome (match brand green, not purple):**

- Header: uppercase **month** toggle (dark text) + **year** toggle (`text-primary`) with chevrons; prev/next on the right
- Custom month/year popovers anchored under each toggle (not native `<select>`)
- Out-of-range months: disabled + muted — **no “N/A” / “Future” labels** in the list
- Day grid: adjacent-month days faded; in-month days `text-dark`
- **Selected:** solid `bg-primary` circle + **white** number
- **Hover:** `rounded-full` + soft `bg-accent/40` (circle, same shape as selected)
- Footers: “Closed Saturdays · Sunday–Friday” / “Future dates are not available”

### Contact hours & detail values

Source: `src/lib/contact-config.ts` (`businessInfo.hours` / `hoursDisplay`).

- **Sunday–Friday:** 9:00 AM – 8:00 PM  
- **Saturday:** Closed  

Contact detail values (phone, email, Celbridge / Carlow, hour strings): **`text-dark`**, not primary green. Section titles stay `text-primary`.

### Compact card grids (tablet / desktop)

When a small set of cards sits in a wide `max-w-7xl` container, **don’t** stretch them with large gaps. Constrain the grid (e.g. `max-w-3xl mx-auto`) and use modest gaps (`md:gap-4 lg:gap-5`). Example: Chinese medicine “TCM Treatment Methods” 2×2 FeatureCards.

---

## 5. Motion

**Do**

- Hover lift: `-translate-y-0.5` or `-translate-y-1` on interactive cards / conversion CTAs
- Press: `scale-[0.97]` on primary actions
- Accordion chevron rotate with `.diagnosis-accordion-chevron`
- Gate with `motion-safe:`
- 2–3 intentional motions per visually led surface

**Don’t**

- Multi-layer glow / emboss as default card decoration
- Green/gold shadow washes on every white panel (reserve stronger gold shadow for conversion Book / Call pills)
- Motion that fights layout (jumping cards on select)

---

## 6. Page behavior snapshots (final state)

### Home

- Hero: full-bleed, readable overlay, gold Book, trust “Rated 5★ by clients”.
- Benefits / Services / Practitioner share the same section rhythm (heading → content → `mt-8`/`md:mt-10` green CTA via `sectionGreenCtaClassName`, full-width flex centered). Natural heights — no forced equal-height stretch.
- Benefits (“Why acupuncture works”) on `bg-white` → FeatureCards flat on mobile (no `elevated`, no hover/animation below `md`); `softIcon` badges (white circle + muted `text-accent` outline icon); Card 2 title **Mind & nervous system**; **Learn more about acupuncture**.
- Services (“How we can help”) on **`glassGreenBandClassName`** → interactive elevated FeatureCards (same white-circle / accent outline icons, **Learn more →**, hover lift on `md+` only); grid matches Benefits (`sm:2` / `xl:4`); Acupuncture → `/acupuncture/`; Cupping / Moxibustion / Gua Sha → CM treatment anchors; **Explore Chinese medicine**.
- Practitioner (“Care you can trust”): compact horizontal card (smaller photo, condensed bio, credential pills, philosophy callout); name `text-dark`; solid green **Read Arkinth’s full story** with the same CTA spacing as Benefits/Services.
- About: practitioner name, Mission/Vision/Values titles, and **About Arkinth Garcia** use `text-dark`.
- Acupuncture / Chinese medicine: column headings and condition/treatment card titles use `text-dark`; mid sections `bg-white`; closing soft bands **Scientific Evidence** / **Integrative Approach** use **`glassGreenBandClassName`**.
- Booking selection cards: titles and prices use `text-dark`; selected chrome (border/check/icon disc) stays primary green.
- Booking band (“Ready when you are”): continuous `bg-white` canvas with compact floating `bg-jungle-gradient` card (`w-fit` / `max-w-md`); cream serif H2; muted cream subtext; gold **Book your session** via `primaryGoldCtaClassName` (no leaf flourish).

### Testimonials (`src/app/testimonials/page.tsx`)

1. Hero (landscape bg; book CTA in hero on xl-hidden wrapper as configured)
2. **Real results from real patients** (`bg-white`) — trust row → hybrid proof (Before/After + clinical metric card; `SnapCarousel`) → mid CTA **Book your appointment** (`primaryGoldCtaClassName`) → **View more results** → `#patient-stories`
3. **What patients say** (`glassGreenBandClassName`) — rating summary; review carousel (~3.5 cards on lg)
4. CTA band (`glassGreenFillClassName` + bottom border): **Ready to experience results like these?** → gold **Start your journey** (same `primaryGoldCtaClassName`, label-fit) → text **Share your story** → **Trusted by 200+ patients**
5. No “Video coming soon” placeholders

### Bookings

- Form column + sticky call/email aside from `md`
- Gold **Call Now** → Or → outline email secondary
- Details step: name, email, phone, **required DOB** only — no Health Information block
- Date/Time: custom `BookingDatePicker` + Morning / Afternoon / Evening range cards; Saturdays disabled; past ranges disabled for today
- Selection cards: strong selected state; no “Most popular” badge
- Step CTA: **Continue** → final **Request appointment**
- Post-submit: **thank-you** page on success; **unable-to-process** apologetic page (call / email + close back to bookings) on send failure — never a red technical error toast; no “Back to home” CTA

### Contact

- Hours + detail cards + sticky book aside from `md` (same grid pattern as bookings)
- Book sidebar: conversion headline + gold Book + short confirmation trust line
- Contact values / hours in `text-dark`
- Get in touch / FAQ on `bg-white`; **Find Us** map band on **`glassGreenBandClassName`**

### About

- Our Story / Why Choose on `bg-white`
- **Insurance** closing band on **`glassGreenBandClassName`** (same soft tint as Scientific Evidence / Integrative Approach)

### Chinese medicine

- Treatment Methods: compact centered 2×2 grid (`max-w-2xl`, tight gaps); card wrappers `id` anchors `#acupuncture` `#cupping` `#moxibustion` `#gua-sha` (`scroll-mt-24`) for home Learn more deep-links
- Diagnostic Methods: accordion cards; chevron down → up when open
- Mid sections `bg-white`; **Integrative Approach** on **`glassGreenBandClassName`**

### Inner heroes (acupuncture, testimonials, etc.)

- Landscape assets + `object-cover`
- Hidden below `xl` unless `hideOnMobile={false}`

---

## 7. Layout / structure conventions

- Fixed header (clear glass, `h-14`, all devices) → content offset `pt-14`
- Mid-page: `bg-white`; soft info/closing bands: **`glassGreenBandClassName`**; sticky asides / form shells: **`glassGreenPanelClassName`**; pale chips/notes: `bg-accent/10`; home booking close: white canvas + floating `bg-jungle-gradient` card
- Footer: cream-on-primary with bold titles / softer body (`cream/65`)
- Icons: Lucide React
- Static export (`output: 'export'`) — no server API routes for UI work
- Features UI in `src/features/`; app chrome in `src/components/`

---

## 8. Before you ship UI — checklist

- [ ] Page / mid-section fills use `bg-white`; soft tinted bands use **`glassGreenBandClassName`** (not warm cream nav fills or `bg-secondary/5` for those bands); chips/info notes may use `bg-accent/10`
- [ ] Header is clear glass on all devices (`bg-white/40` + light blur; drawer `bg-white/50`); brand `font-bold`; nav links `font-semibold` (active `font-bold`) — not heavy frost (`/92` + `backdrop-blur-md`)
- [ ] Colors use brand tokens (`primary` / `secondary` / `accent` / `cream` / `gold`) — not one-off purple/cream AI themes
- [ ] Headings use `font-serif` where brand-facing; body stays Inter
- [ ] Section flourish is **gold — leaf — gold** (not leaf stacked only above one rule)
- [ ] Marketing primary action is **Book** (gold, label-fit via `primaryGoldCtaClassName` / `w-auto` — no `w-full max-w-md`); in-flow form actions stay green; secondary is outline/text; order is Book → secondary
- [ ] Header Book stays gold and readable on mobile/tablet (`text-sm`+)
- [ ] Quiet card chrome: `border-accent/15` + light lift; reserve stronger gold shadows for conversion CTAs only
- [ ] FeatureCards: dark titles (`text-dark`); flat on white mobile; `elevated` on tinted section backgrounds
- [ ] Type scale: Section H2 `2xl→4xl` (home `lg:5xl` ok); subtitle `base→xl`; card/column titles `lg md:xl`; body `text-base` + `leading-relaxed`; Learn more / pills / Book labels may stay `text-sm`
- [ ] Readability floor: primary readable copy ≥ `text-base` (16px) sitewide on marketing pages (eyebrows/OR/chips may stay `text-xs`; form/admin chrome may stay `text-sm`)
- [ ] Booking selection cards: clear selected state; no “Most popular” badges
- [ ] Accordions: chevron down closed, up open
- [ ] Small card grids on wide pages use `max-w-*` + modest gaps (not huge empty gutters)
- [ ] Hero/banner photos are landscape (or explicitly positioned); no smeared square/portrait in thin banners
- [ ] Sticky book/help sidebars from **`md`** (contact + bookings); inner page heroes stay hidden below `xl` unless intentional
- [ ] Footer: bold cream titles; body/links at reduced opacity for scan hierarchy
- [ ] Testimonials / proof: unique names; structured Before/After over DIY collage chrome
- [ ] Testimonials CTA: mid **Book your appointment** + bottom **Start your journey** share `primaryGoldCtaClassName`; Share as text link; trust line under buttons
- [ ] Booking details: DOB required; no Health Information fields reintroduced without product sign-off
- [ ] Booking dates use `BookingDatePicker` (not native date); Saturdays closed for preferred date; DOB blocks future dates
- [ ] Calendar: green selected circle + white text; circular sage hover; month/year popovers; no N/A labels
- [ ] Contact values / hours use `text-dark`; hours Sunday–Friday 9–8, Saturday closed
- [ ] Booking Date/Time: Morning / Afternoon / Evening range cards; past ranges disabled for today; step CTA **Continue**
- [ ] Booking submit success → thank-you page; send/config failure → unable-to-process (apologetic call/email + close to bookings) — no technical error toast or Back to home
- [ ] Motion uses `motion-safe:` and stays subtle

---

## Quick file map

| Concern | Location |
|---------|----------|
| Tokens / emboss / page-hero / accordion motion | `src/app/globals.css` |
| Tailwind colors / fonts | `tailwind.config.js` |
| UI primitives | `src/features/ui/` |
| Section flourish | `src/features/ui/SectionHeading.tsx` |
| FeatureCard `elevated` | `src/features/ui/FeatureCard.tsx` |
| CTAButton / `primaryGoldCtaClassName` | `src/features/ui/CTAButton.tsx` |
| Header / nav (clear glass + Book, all devices) | `src/components/Header.tsx` |
| Home booking band CTA | `src/features/home/BookingSection.tsx` |
| Footer hierarchy | `src/components/Footer.tsx` |
| Home hero | `src/features/home/HeroSection.tsx` |
| Booking form | `src/components/BookingForm.tsx` |
| Date picker (preferred + DOB) | `src/features/ui/BookingDatePicker.tsx` |
| Time / service / location cards | `src/features/ui/TimeRangeCards.tsx`, `ServiceSelectionCards.tsx`, `ClinicLocationCards.tsx` |
| Booking email payload | `src/lib/send-booking-email.ts` |
| Contact / booking config (hours, inbox) | `src/lib/contact-config.ts` |
| Contact sticky book aside | `src/app/contact/page.tsx` |
| Bookings sticky help aside | `src/app/bookings/page.tsx` |
| Booking thank-you | `src/app/bookings/thank-you/page.tsx` |
| Booking unable-to-process | `src/app/bookings/unable-to-process/page.tsx` |
| Booking result close (circular X) | `src/components/BookingResultCloseButton.tsx` |
| Testimonials CTA band | `src/app/testimonials/page.tsx` |
| Result photos | `public/results/` |
