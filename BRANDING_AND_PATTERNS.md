# Wellness Needles — Branding & UI Patterns

**Status:** Current source of truth for visual / UX decisions.  
**Code sources:** `src/app/globals.css`, `tailwind.config.js`, `src/features/ui/*`, `src/components/Header.tsx`.

Older notes (`HERO_SECTION_GUIDE.md`, `HERO_REFACTORING_COMPLETE.md`, `COMPONENT_REFACTORING_SUMMARY.md`) are **historical** — prefer this file when they conflict.

---

## 1. Brand identity

| | |
|---|---|
| **Product** | Wellness Needles — acupuncture / TCM (Celbridge & Carlow, Ireland) |
| **Tone** | Calm, clinical-credible wellness. Structured proof over DIY collage. |
| **Logo** | `/logo_wellness.jpeg` — circular crop in header/footer |
| **Avoid** | Purple/indigo AI defaults; heavy glow; thick green/gold box-shadows as decoration; tilted scrapbook collages as primary proof; Share CTAs competing with Book |

---

## 2. Color system

Tailwind keys map to CSS variables in `:root` (`globals.css`).

| Token | Hex | Typical use |
|-------|-----|-------------|
| `primary` | `#2d5016` | Headings, primary text CTAs, icons |
| `secondary` | `#4a7c2a` | Brand mid-green for fills / `hover:bg-secondary` (not body copy) |
| `accent` | `#7fb069` | Soft borders (`border-accent/15`), accents |
| `light-green` | `#a7c957` | Highlights (sparingly) |
| `cream` | `#f9f7f4` | Page / section backgrounds |
| `gold` | `#d4af37` | Primary conversion buttons, section flourish rules |
| `text-dark` | `#2c3e50` | Body copy, form values, calendar day numbers |
| `text-light` | `#7f8c8d` | Muted meta |
| `blue-*` | logo blues | Minor accents only (not page themes) |

**Supporting / body text:** `text-secondary` resolves to **`text-dark`** (`#2c3e50`) via the `.text-secondary` override in `globals.css`. Keep the Tailwind `secondary` color green for backgrounds and button hover — do not recolor that token for body copy.

**Rules**

- Default page surface: `bg-cream`.
- Quiet panel chrome: `border border-accent/15` (not thick `border-2` + colored shadows).
- Gold = **conversion** (Book Appointment) and **section flourish rules**, not every card title underline.
- Prefer border intensify + lift on hover over `shadow-primary/*` / `shadow-gold/*` washes.
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

- Full-bleed photo + readability overlay (`from-primary/65 via-primary/45 to-secondary/35` default).
- Image: `fill` + **`object-cover`** (never stretch). Optional `object-position` via `backgroundImageClassName`.
- **Asset rule:** short banners need **landscape** photos (e.g. `/hero_wellness_acupuncture.jpeg`, `/treatment_in_progress_2.jpeg`). Square/portrait crops look smeared in thin heroes.
- Inner pages: `hideOnMobile` default **true** → hero hidden below `xl` (1280px). Home hero is separate (`features/home/HeroSection.tsx`) and always visible.
- Optional `heightClass` (e.g. `min-h-[13rem] xl:min-h-[15rem]`) for a slightly deeper crop — don’t change global `.page-hero` for one page.

### CTAs (`CTAButton` / `BookingCtaButton` / Header)

| Role | Style | Examples |
|------|--------|----------|
| **Primary** | Gold filled (`variant="gold"`) | Book an appointment, header Book |
| **Secondary** | Outline (`variant="outline"`) | Share your story, email |

- Always `rounded-full`.
- Hierarchy: **Book above / before Share** — never the reverse.
- Compact mobile (sidebars / bands): `!px-4 !py-2 !text-xs … md:!py-2.5 md:!text-sm`, prefer `!shadow-none`, light `hover:-translate-y-0.5` / `active:scale-[0.97]`.
- Base `CTAButton` still applies `shadow-md`; strip locally with `!shadow-none` when matching polished sidebars.
- Header mobile Book uses larger type than sidebar compact CTAs (see Typography).

### Cards — two systems

1. **Embossed cream** — `bg-cream/80` + `.card-emboss` (FeatureCard, some condition tiles). Soft hover lift + light shadow on `md+`.
   - **Cream sections** (`bg-cream`): FeatureCards are **flat on mobile** — `bg-transparent shadow-none`, panel returns from `md` (`elevated` omitted). Example: home “Why acupuncture works”.
   - **Tinted sections** (`bg-accent/10`, etc.): pass **`elevated`** so cream panel + `shadow-sm` stay on mobile. Example: home “How we can help”.
2. **Flat white** — `bg-white rounded-xl border border-accent/15 shadow-none` (TestimonialCard, bookings panels, diagnosis/FAQ accordions). Hover: border + translate, not green glow.

### Accordions (diagnosis / FAQ)

- Collapsed: `ChevronDown` facing **down**.
- Expanded: `rotate-180` so chevron faces **up**.
- Shared motion classes: `.diagnosis-accordion-chevron`, `.diagnosis-accordion-panel`, `.diagnosis-accordion-body` in `globals.css`.
- Used on Chinese medicine diagnosis cards and Contact FAQs.

### Before / After (`BeforeAfterSlider`)

- Separate `beforeSrc` / `afterSrc` (not multi-photo scrapbook as the only proof).
- Drag slider + visible Before/After labels; keyboard range input.
- Frame: `border-accent/15`, cream fill; optional `beforeRotate` / `afterRotate` to level tilted phone photos; `imageFit="contain"` for tall collages.
- Prefer one strong case over stacking noisy collages.
- Assets live under `public/results/` (e.g. alopecia before/after).

### Carousels (`SnapCarousel`)

- Mobile: horizontal snap + dots.
- `md+`: CSS grid; dots typically hidden.
- Slide shell: `snapSlideClassName`.

### Sticky sidebars

Bookings pattern:

- Grid from `md`: main + `minmax(14rem,16rem)` aside.
- Aside: `md:sticky md:top-24`, `rounded-xl border border-accent/15 bg-accent/10`.
- Mobile: stack below main; constrain width (`max-w-xs`) so CTAs aren’t edge-to-edge giants.

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
- Cards use the same `booking-select-card` pattern as location/service selection.
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

- Hover lift: `-translate-y-0.5` or `-translate-y-1`
- Press: `scale-[0.97]`
- Accordion chevron rotate with `.diagnosis-accordion-chevron`
- Gate with `motion-safe:`
- 2–3 intentional motions per visually led surface

**Don’t**

- Multi-layer glow / emboss as default decoration
- Colored box-shadow hover as the main affordance (`shadow-gold/40`, thick `shadow-primary/20`)
- Motion that fights layout (jumping cards on select)

---

## 6. Page behavior snapshots (final state)

### Home

- Benefits (“Why acupuncture works”) on `bg-cream` → FeatureCards flat on mobile.
- Services (“How we can help”) on `bg-accent/10` → FeatureCards `elevated`.
- Booking band: gold rule — leaf — gold rule above CTA.

### Testimonials (`src/app/testimonials/page.tsx`)

1. Hero (landscape bg; book CTA in hero on xl-hidden wrapper as configured)
2. **Real Patient Results** — trust row (licensed + consent) → Before/After slider(s)
3. **What patients say** — unique patient names only (no duplicate names); compact cards + Read more modal
4. CTA band: **Book** (gold) then **Share** (outline)
5. No “Video coming soon” placeholders

### Bookings

- Form column + sticky call/email aside from `md`
- Gold Call primary → Or → outline email secondary
- Compact mobile button sizing
- Details step: name, email, phone, **required DOB** only — no Health Information block
- Date/Time: custom `BookingDatePicker` + Morning / Afternoon / Evening range cards; Saturdays disabled; past ranges disabled for today
- Step CTA: **Continue** → final **Request appointment**

### Chinese medicine

- Treatment Methods: compact centered 2×2 grid (`max-w-3xl`, tight `md`/`lg` gaps)
- Diagnostic Methods: accordion cards; chevron down → up when open

### Inner heroes (acupuncture, testimonials, etc.)

- Landscape assets + `object-cover`
- Hidden below `xl` unless `hideOnMobile={false}`

---

## 7. Layout / structure conventions

- Fixed header → content offset `pt-16`
- Footer: cream-on-primary; no decorative leaf scatter
- Icons: Lucide React
- Static export (`output: 'export'`) — no server API routes for UI work
- Features UI in `src/features/`; app chrome in `src/components/`

---

## 8. Before you ship UI — checklist

- [ ] Colors use brand tokens (`primary` / `secondary` / `accent` / `cream` / `gold`) — not one-off purple/cream AI themes
- [ ] Headings use `font-serif` where brand-facing; body stays Inter
- [ ] Section flourish is **gold — leaf — gold** (not leaf stacked only above one rule)
- [ ] Primary action is **Book** (gold); secondary is outline; order is Book → secondary
- [ ] Header Book stays readable on mobile/tablet (`text-sm`+)
- [ ] No new thick green/gold drop shadows; prefer `border-accent/15` + light lift
- [ ] FeatureCards: flat on cream mobile; `elevated` on tinted section backgrounds
- [ ] Accordions: chevron down closed, up open
- [ ] Small card grids on wide pages use `max-w-*` + modest gaps (not huge empty gutters)
- [ ] Hero/banner photos are landscape (or explicitly positioned); no smeared square/portrait in thin banners
- [ ] Mobile: compact padding/type for sidebar CTAs; sidebars stack sensibly; page heroes stay hidden below xl unless intentional
- [ ] Testimonials / proof: unique names; structured Before/After over DIY collage chrome
- [ ] Booking details: DOB required; no Health Information fields reintroduced without product sign-off
- [ ] Booking dates use `BookingDatePicker` (not native date); Saturdays closed for preferred date; DOB blocks future dates
- [ ] Calendar: green selected circle + white text; circular sage hover; month/year popovers; no N/A labels
- [ ] Contact values / hours use `text-dark`; hours Sunday–Friday 9–8, Saturday closed
- [ ] Booking Date/Time: Morning / Afternoon / Evening range cards; past ranges disabled for today; step CTA **Continue**
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
| Booking form | `src/components/BookingForm.tsx` |
| Date picker (preferred + DOB) | `src/features/ui/BookingDatePicker.tsx` |
| Time range cards | `src/features/ui/TimeRangeCards.tsx` |
| Booking email payload | `src/lib/send-booking-email.ts` |
| Contact / booking config (hours, inbox) | `src/lib/contact-config.ts` |
| Result photos | `public/results/` |
