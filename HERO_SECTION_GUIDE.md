# Reusable Hero Section Component

> **Historical / reference guide.** For current site architecture and booking/deploy setup, see [README.md](README.md) and [WORKFLOW.md](WORKFLOW.md).

## Overview

The `ReusableHeroSection` component provides a consistent, flexible hero section that can be used across all pages while maintaining design consistency and allowing for customization.


## Location

`src/features/ui/HeroSection.tsx`

## Import

```tsx
import { ReusableHeroSection } from '../../features'
```

## Basic Usage

```tsx
<ReusableHeroSection
  title="Your Page Title"
  subtitle="A compelling subtitle"
  description="Optional longer description text"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | Required | Main heading text |
| `subtitle` | `string` | Optional | Subtitle/description text |
| `description` | `string` | Optional | Longer description text |
| `backgroundImage` | `string` | Optional | Background image source path |
| `backgroundClass` | `string` | `'bg-jungle-gradient'` | Background color/gradient class |
| `textColor` | `string` | `'text-cream'` | Text color class |
| `logo` | `object` | Optional | Logo configuration object |
| `ctaButtons` | `array` | `[]` | Array of CTA button configurations |
| `showFloatingLeaves` | `boolean` | `true` | Whether to show floating leaf decorations |
| `heightClass` | `string` | `'min-h-screen'` | Height class for the section |
| `alignment` | `'left' \| 'center' \| 'right'` | `'center'` | Content alignment |
| `children` | `ReactNode` | Optional | Custom content to render |

### Logo Object

```tsx
logo: {
  src: string        // Image source path
  alt: string        // Alt text
  showGlow?: boolean // Whether to show glow effect
}
```

### CTA Button Object

```tsx
ctaButtons: [{
  text: string                           // Button text
  href: string                          // Link destination
  variant?: 'primary' | 'secondary' | 'gold' // Button style
  showArrow?: boolean                   // Whether to show arrow
}]
```

## Examples

### 1. Simple Text Hero (About Page Style)

```tsx
<ReusableHeroSection
  title="About Wellness Needles"
  subtitle="Dedicated to bringing you the finest in traditional Chinese medicine"
  description="Our practice combines ancient healing wisdom with modern understanding."
  backgroundClass="bg-accent/10"
  textColor="text-primary"
  heightClass="py-20"
  showFloatingLeaves={false}
/>
```

### 2. Hero with Background Image (Acupuncture Page Style)

```tsx
<ReusableHeroSection
  title="Why Choose Acupuncture?"
  subtitle="Discover the science and ancient wisdom behind this powerful healing modality"
  description="Acupuncture has been used for over 3,000 years to treat a wide range of conditions."
  backgroundImage="/accupuncture_cupping_therapy.jpeg"
  backgroundClass="bg-secondary"
  textColor="text-cream"
  heightClass="py-20"
/>
```

### 3. Hero with Logo and CTAs (Home Page Style)

```tsx
<ReusableHeroSection
  title="Wellness Needles"
  subtitle="Experience authentic acupuncture and naturopathic medicine"
  description="Specializing in pain management, mental health, digestive issues, and holistic wellness."
  backgroundClass="bg-jungle-gradient"
  textColor="text-cream"
  heightClass="min-h-screen"
  logo={{
    src: "/logo_wellness.jpeg",
    alt: "Wellness Needles Logo",
    showGlow: true
  }}
  ctaButtons={[
    {
      text: "Book Your Session",
      href: "/bookings",
      variant: "primary"
    },
    {
      text: "Learn More",
      href: "/about",
      variant: "secondary",
      showArrow: false
    }
  ]}
  showFloatingLeaves={true}
/>
```

### 4. Hero with Custom Background and CTAs (Contact Page Style)

```tsx
<ReusableHeroSection
  title="Contact Us"
  subtitle="We're here to answer your questions and help you start your wellness journey"
  description="Reach out to us for appointments, questions about our treatments, or to learn more."
  backgroundImage="/clinic_decor.jpeg"
  backgroundClass="bg-gold"
  textColor="text-primary"
  heightClass="py-20"
/>
```

## Color Options

### Background Classes
- `bg-jungle-gradient` - Green gradient (default)
- `bg-primary` - Dark forest green
- `bg-secondary` - Medium forest green
- `bg-accent` - Sage green
- `bg-gold` - Golden accent
- `bg-cream` - Warm cream
- `bg-accent/10` - Light sage green tint

### Text Color Classes
- `text-cream` - Warm cream (default for dark backgrounds)
- `text-primary` - Dark forest green (for light backgrounds)
- `text-secondary` - Medium forest green
- `text-accent` - Sage green

## Responsive Behavior

The component is fully responsive and includes:
- Mobile-first design approach
- Responsive typography scaling
- Adaptive spacing and layout
- Touch-friendly CTA buttons
- Optimized image loading

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Alt text for images
- Keyboard navigation support
- Screen reader compatibility

## Performance

- Optimized Next.js Image component
- Lazy loading for background images
- Minimal re-renders
- Efficient CSS classes

## Migration from Old Hero Sections

To migrate existing pages:

1. Import the `ReusableHeroSection` component
2. Replace existing hero `<section>` with `<ReusableHeroSection>`
3. Map existing content to component props
4. Remove old hero section markup
5. Test responsive behavior and styling

## Design Consistency

The component ensures:
- Consistent typography hierarchy
- Unified spacing and margins
- Standardized color usage
- Cohesive animation patterns
- Uniform responsive breakpoints
