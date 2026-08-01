# Wellness Needles — Branding & UI Patterns

**Status:** Current source of truth for visual / UX decisions.  
**Code sources:** `src/app/globals.css`, `tailwind.config.js`, `src/features/ui/*`.

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
| `secondary` | `#4a7c2a` | Body supporting text, secondary greens |
| `accent` | `#7fb069` | Soft borders (`border-accent/15`), accents |
| `light-green` | `#a7c957` | Highlights (sparingly) |
| `cream` | `#f9f7f4` | Page / section backgrounds |
| `gold` | `#d4af37` | Primary conversion buttons, section gold rule |
| `text-dark` | `#2c3e50` | Body foreground |
| `text-light` | `#7f8c8d` | Muted meta |
| `blue-*` | logo blues | Minor accents only (not page themes) |

**Rules**

- Default page surface: `bg-cream`.
- Quiet panel chrome: `border border-accent/15` (not thick `border-2` + colored shadows).
- Gold = **conversion** (Book Appointment), not every decorative underline on cards.
- Prefer border intensify + lift on hover over `shadow-primary/*` / `shadow-gold/*` washes.

**Gradients:** `jungle-gradient`, `sunset-gradient`, `ocean-accent`, `harmony-gradient` (Tailwind + CSS). Use for large washes / hero fallbacks — not for every card.

---

## 3. Typography

| Role | Font | Tailwind |
|------|------|----------|
| Body / UI | Inter | `font-sans` (default on `body`) |
| Brand / headings | Playfair Display | `font-serif` |

**Section titles** — use `SectionHeading`:

- Serif H2 (`text-primary`)
- Gold rule — Lucide `Leaf` — gold rule (horizontal flourish)
- Subtitle in `text-secondary`
- Override with `titleClassName` / `subtitleClassName` when a page needs denser mobile type

**Hero H1** (inner `HeroSection`): `font-serif` with responsive scale up to `xl:text-7xl`.

---

## 4. Component patterns

Shared primitives live in `src/features/ui/` (exported from `src/features/index.ts`).

### Heroes (`HeroSection`)

- Full-bleed photo + readability overlay (`from-primary/65 via-primary/45 to-secondary/35` default).
- Image: `fill` + **`object-cover`** (never stretch). Optional `object-position` via `backgroundImageClassName`.
- **Asset rule:** short banners need **landscape** photos (e.g. `/hero_wellness_acupuncture.jpeg`, `/treatment_in_progress_2.jpeg`). Square/portrait crops look smeared in thin heroes.
- Inner pages: `hideOnMobile` default **true** → hero hidden below `xl` (1280px). Home hero is separate (`features/home/HeroSection.tsx`) and always visible.
- Optional `heightClass` (e.g. `min-h-[13rem] xl:min-h-[15rem]`) for a slightly deeper crop — don’t change global `.page-hero` for one page.

### CTAs (`CTAButton` / `BookingCtaButton`)

| Role | Style | Examples |
|------|--------|----------|
| **Primary** | Gold filled (`variant="gold"`) | Book an appointment |
| **Secondary** | Outline (`variant="outline"`) | Share your story, email |

- Always `rounded-full`.
- Hierarchy: **Book above / before Share** — never the reverse.
- Compact mobile (sidebars / bands): `!px-4 !py-2 !text-xs … md:!py-2.5 md:!text-sm`, prefer `!shadow-none`, light `hover:-translate-y-0.5` / `active:scale-[0.97]`.
- Base `CTAButton` still applies `shadow-md`; strip locally with `!shadow-none` when matching polished sidebars.

### Cards — two systems

1. **Embossed cream** — `bg-cream/80` + `.card-emboss` (FeatureCard, some condition tiles). Soft hover lift + light shadow on md+. On **cream** sections, FeatureCards go flat on mobile (`elevated` omitted). On **tinted** sections (e.g. `bg-accent/10`), pass `elevated` so the cream panel + shadow stay on mobile.
2. **Flat white** — `bg-white rounded-xl border border-accent/15 shadow-none` (TestimonialCard, bookings panels, contact FAQs). Hover: border + translate, not green glow.

### Before / After (`BeforeAfterSlider`)

- Separate `beforeSrc` / `afterSrc` (not multi-photo scrapbook as the only proof).
- Drag slider + visible Before/After labels; keyboard range input.
- Frame: `border-accent/15`, cream fill; optional `beforeRotate` / `afterRotate` to level tilted phone photos; `imageFit="contain"` for tall collages.
- Prefer one strong case over stacking noisy collages.

### Carousels (`SnapCarousel`)

- Mobile: horizontal snap + dots.
- `md+`: CSS grid; dots typically hidden.
- Slide shell: `snapSlideClassName`.

### Sticky sidebars

Bookings pattern:

- Grid from `md`: main + `minmax(14rem,16rem)` aside.
- Aside: `md:sticky md:top-24`, `rounded-xl border border-accent/15 bg-accent/10`.
- Mobile: stack below main; constrain width (`max-w-xs`) so CTAs aren’t edge-to-edge giants.

---

## 5. Motion

**Do**

- Hover lift: `-translate-y-0.5` or `-translate-y-1`
- Press: `scale-[0.97]`
- Gate with `motion-safe:`
- 2–3 intentional motions per visually led surface

**Don’t**

- Multi-layer glow / emboss as default decoration
- Colored box-shadow hover as the main affordance (`shadow-gold/40`, thick `shadow-primary/20`)
- Motion that fights layout (jumping cards on select)

---

## 6. Page behavior snapshots (final state)

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
- [ ] Primary action is **Book** (gold); secondary is outline; order is Book → secondary
- [ ] No new thick green/gold drop shadows; prefer `border-accent/15` + light lift
- [ ] Hero/banner photos are landscape (or explicitly positioned); no smeared square/portrait in thin banners
- [ ] Mobile: compact padding/type for CTAs; sidebars stack sensibly; page heroes stay hidden below xl unless intentional
- [ ] Testimonials / proof: unique names; structured Before/After over DIY collage chrome
- [ ] Motion uses `motion-safe:` and stays subtle

---

## Quick file map

| Concern | Location |
|---------|----------|
| Tokens / emboss / page-hero | `src/app/globals.css` |
| Tailwind colors / fonts | `tailwind.config.js` |
| UI primitives | `src/features/ui/` |
| Header Book CTA | `src/components/Header.tsx` |
| Contact / booking config | `src/lib/contact-config.ts` |
