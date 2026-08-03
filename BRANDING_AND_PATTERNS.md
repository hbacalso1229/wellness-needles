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
| `accent` | `#7fb069` | Soft borders (`border-accent/15`), tinted panels (`bg-accent/10`) |
| `light-green` | `#a7c957` | Highlights (sparingly) |
| `cream` | `#f9f7f4` | Page / section backgrounds |
| `gold` | `#d4af37` | Conversion CTAs, section flourish rules, trust star accents |
| `text-dark` | `#2c3e50` | Body copy, form values, calendar day numbers |
| `text-light` | `#7f8c8d` | Muted meta |
| `blue-*` | logo blues | Minor accents only (not page themes) |

**Gold CTA gradient stops** (used on polished Book pills): `#e8c84a` → `gold`; hover `#f0d45c` → `#c9a52f`.

**Supporting / body text:** `text-secondary` resolves to **`text-dark`** (`#2c3e50`) via the `.text-secondary` override in `globals.css`. Keep the Tailwind `secondary` color green for backgrounds and button hover — do not recolor that token for body copy.

**Rules**

- Default page surface: `bg-cream`.
- Quiet panel chrome: `border border-accent/15` (not thick decorative green/gold washes on cards).
- **Gold = marketing conversion** (Book Appointment, Call Now in booking help sidebar).
- **Green primary = in-flow actions** (Continue, Request appointment, Send Message) — not the main marketing Book CTA.
- Supporting paragraphs use `text-secondary` (`text-dark`); headings stay `text-primary` (forest green).
- **Contact / booking values** (phone, email, clinic names, hours times, calendar numbers): use `text-[var(--text-dark)]` — not `text-primary`. Reserve forest green for headings, icons, and selected calendar chrome.

**Gradients:** `jungle-gradient`, `sunset-gradient`, `ocean-accent`, `harmony-gradient` (Tailwind + CSS). Use for large washes / hero fallbacks — not for every card.

---

## 3. Typography

| Role | Font | Tailwind |
|------|------|----------|
| Body / UI | Inter | `font-sans` (default on `body`) |
| Brand / headings | Playfair Display | `font-serif` |

**Section titles** — use `SectionHeading`:

- Serif H2 (`text-primary`)
- Flourish: **gold rule — Lucide `Leaf` — gold rule** (horizontal; also used on home booking CTA)
- Subtitle in `text-secondary`
- Override with `titleClassName` / `subtitleClassName` when a page needs denser mobile type

**Hero H1** (inner `HeroSection`): `font-serif` with responsive scale up to `xl:text-7xl`.

**Header Book (mobile / tablet):** `text-sm sm:text-base` with comfortable padding (`px-3.5 sm:px-4 py-2`) — keep readable on real devices. Desktop nav Book stays `text-sm`.

---

## 4. Component patterns

Shared primitives live in `src/features/ui/` (exported from `src/features/index.ts`).

### Heroes (`HeroSection`)

**Home** (`features/home/HeroSection.tsx`)

- Full-bleed photo + L→R dark green wash + light top/bottom fade (stronger than inner heroes for copy readability).
- Brand-forward copy; primary CTA **Book your appointment** (gold).
- Trust line: gold stars + **“Rated 5★ by clients”**.
- Tablet+: one-screen lock via `.page-hero[data-home-hero]` (`calc(100dvh - 4rem)`).
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
| **Conversion (gold)** | `variant="gold"` (+ optional gradient/shadow polish) | Header **Book Appointment**; home / contact / testimonials **Book your appointment**; bookings sidebar **Call Now** |
| **In-flow (green)** | `bg-primary` / `hover:bg-secondary` | Booking **Continue** / **Request appointment**; contact **Send Message** |
| **Secondary (outline)** | `variant="outline"` (can mute contrast) | **Send a message**, **Share your story** |

- Always `rounded-full` for marketing CTAs.
- Hierarchy: **Book (gold) above / before Share or email** — never the reverse.
- Conversion Book pills may use calendar icon, stronger shadow, and hover lift + press (`active:scale-[0.97]`).
- Muted secondary outline: lower border/text opacity so it never competes with gold (e.g. testimonials Share).
- Compact mobile (sidebars): tighter padding/type; stack under main content on small screens.
- Header Book stays gold and readable on mobile/tablet.

### Cards — two systems

1. **Embossed cream** — `bg-cream/80` + `.card-emboss` (FeatureCard, some condition tiles). Soft hover lift + light shadow on `md+`.
   - **Cream sections** (`bg-cream`): FeatureCards are **flat on mobile** — `bg-transparent shadow-none`, panel returns from `md` (`elevated` omitted). Example: home “Why acupuncture works”.
   - **Tinted sections** (`bg-accent/10`, etc.): pass **`elevated`** so cream panel + `shadow-sm` stay on mobile. Example: home “How we can help”.
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
- Aside: `md:sticky md:top-24`, `rounded-xl border border-accent/15 bg-accent/10`.
- Mobile: stack below main; constrain width (`max-w-xs`) so CTAs aren’t edge-to-edge giants.

| Page | Sidebar job |
|------|-------------|
| Bookings | Need help? → gold **Call Now** → Or → outline **Send a message** |
| Contact | Ready to book… → gold **Book your appointment** (+ short trust line) |

`xl` (1280) is for desktop nav (vs hamburger) and inner-page hero visibility — **not** for showing the sticky book/help column.

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
- Benefits (“Why acupuncture works”) on `bg-cream` → FeatureCards flat on mobile.
- Services (“How we can help”) on `bg-accent/10` → FeatureCards `elevated`.
- Booking band: gold rule — leaf — gold rule above CTA.

### Testimonials (`src/app/testimonials/page.tsx`)

1. Hero (landscape bg; book CTA in hero on xl-hidden wrapper as configured)
2. **Real Patient Results** — trust row → framed Before/After cases (Option A captions; `SnapCarousel` mobile; `lg:grid-cols-3`) → results disclaimer
3. **What patients say** — rating summary (honest average + count); unique names; initials avatars; condition chips; bold outcome preview (mid-quote lead-in when needed); **Verified Google review**; dates without “Recent”; **Read full story** modal
4. CTA band: **Ready to experience results like these?** → gold **Book your appointment** → subtle text **Share your story** → trust line
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

### Chinese medicine

- Treatment Methods: compact centered 2×2 grid (`max-w-3xl`, tight `md`/`lg` gaps)
- Diagnostic Methods: accordion cards; chevron down → up when open

### Inner heroes (acupuncture, testimonials, etc.)

- Landscape assets + `object-cover`
- Hidden below `xl` unless `hideOnMobile={false}`

---

## 7. Layout / structure conventions

- Fixed header → content offset `pt-16`
- Footer: cream-on-primary with bold titles / softer body (`cream/65`)
- Icons: Lucide React
- Static export (`output: 'export'`) — no server API routes for UI work
- Features UI in `src/features/`; app chrome in `src/components/`

---

## 8. Before you ship UI — checklist

- [ ] Colors use brand tokens (`primary` / `secondary` / `accent` / `cream` / `gold`) — not one-off purple/cream AI themes
- [ ] Headings use `font-serif` where brand-facing; body stays Inter
- [ ] Section flourish is **gold — leaf — gold** (not leaf stacked only above one rule)
- [ ] Marketing primary action is **Book** (gold); in-flow form actions stay green; secondary is outline; order is Book → secondary
- [ ] Header Book stays gold and readable on mobile/tablet (`text-sm`+)
- [ ] Quiet card chrome: `border-accent/15` + light lift; reserve stronger gold shadows for conversion CTAs only
- [ ] FeatureCards: flat on cream mobile; `elevated` on tinted section backgrounds
- [ ] Booking selection cards: clear selected state; no “Most popular” badges
- [ ] Accordions: chevron down closed, up open
- [ ] Small card grids on wide pages use `max-w-*` + modest gaps (not huge empty gutters)
- [ ] Hero/banner photos are landscape (or explicitly positioned); no smeared square/portrait in thin banners
- [ ] Sticky book/help sidebars from **`md`** (contact + bookings); inner page heroes stay hidden below `xl` unless intentional
- [ ] Footer: bold cream titles; body/links at reduced opacity for scan hierarchy
- [ ] Testimonials / proof: unique names; structured Before/After over DIY collage chrome
- [ ] Testimonials CTA: benefit headline, reassurance subtext, Book → Share, trust line under buttons
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
| Header Book CTA | `src/components/Header.tsx` |
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
