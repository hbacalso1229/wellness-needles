# Wellness Needles - AI Coding Instructions

## Project Overview
This is a static Next.js website for an acupuncture and traditional Chinese medicine practice. The site emphasizes a calming, professional atmosphere with a tropical/jungle theme inspired by Southeast Asian heritage.

## Key Architecture Patterns

### Design System
- **Color Palette**: Custom CSS variables in `globals.css` define the core theme
  - Primary green spectrum: `--primary-green` (#2d5016) to `--light-green` (#a7c957)
  - Accent colors: `--gold-accent` (#d4af37), blue accents from logo
  - Background: `--cream` (#f9f7f4) for warm, calming feel
- **Typography**: Inter (body) + Playfair Display (headings) via Google Fonts
- **Custom Gradients**: Predefined gradients (`jungle-gradient`, `sunset-gradient`, etc.) in both CSS variables and Tailwind config

### Component Structure
- **Layout**: Fixed header with transparent backdrop-blur, main content with `pt-16` offset, persistent footer
- **Navigation**: Mobile-first responsive with hamburger menu, consistent CTA button placement
- **Image Handling**: Next.js Image component with decorative overlays and hover effects
- **Icons**: Lucide React icons throughout (Leaf, Heart, Users, etc.)

## Development Conventions

### File Organization
```
src/app/           # Next.js App Router - routing infrastructure only
src/components/    # Reusable UI components (Header, Footer)
src/features/      # Business logic, domain-specific components, and feature implementations
public/           # Static assets (images, logos)
```

### Separation of Concerns
- **App Folder**: Contains only routing infrastructure (page.tsx files, layout.tsx, loading.tsx, error.tsx)
- **Features Folder**: Houses all business logic, feature-specific components, hooks, utilities, and domain logic
- **Components Folder**: Shared UI components that are agnostic to business logic (Header, Footer, common UI elements)

When adding new functionality:
1. Create feature modules in `src/features/[feature-name]/`
2. Keep app router pages minimal - they should import and compose from features
3. Move complex logic, data fetching, and domain-specific components to appropriate feature folders

### Styling Patterns
- **Tailwind + Custom CSS**: Extend Tailwind with custom color classes (`.text-primary`, `.bg-accent`)
- **Consistent Spacing**: Use `py-20` for section padding, `max-w-7xl mx-auto` for content containers
- **Hover Effects**: Gentle transitions with `transition-all duration-300`, scale transforms on images
- **Decorative Elements**: Floating leaf icons with staggered animations using `animationDelay`

### Image Implementation
- All images use Next.js `Image` component with `fill` prop and object-cover/contain
- Decorative frames with gradient backgrounds and border effects
- Hover scale effects: `group-hover:scale-105 transition-transform duration-500`
- Floating leaf decorations positioned absolutely with CSS transforms

### Static Export Configuration
- **Build**: Configured for static export (`output: 'export'` in `next.config.ts`)
- **Images**: `unoptimized: true` for static hosting compatibility
- **Deployment**: Generates `/out` directory with static files

## Content Patterns

### Page Structure
- Hero section with large logo, gradient background, dual CTAs
- Feature sections with 3-column grids and icon-based content
- Image galleries with decorative frames and hover effects
- CTA sections with background images and overlays

### Practitioner Focus
- Personal story of Arkinth Garcia (founder) integrated throughout
- Professional credentials from College of Naturopathic Medicine, Dublin
- Specializations: pain management, mental health, digestive issues, fertility

### Service Areas
Navigation covers: Home, About, Why Acupuncture, Testimonials, Chinese Medicine, Blog, Contact, Bookings

## Technical Requirements

### Development Commands
```bash
npm run dev --turbopack    # Development with Turbopack
npm run build             # Static export build
npm run start             # Production server
npm run lint              # ESLint checking
```

### Dependencies
- Next.js 15.4.6 with App Router
- React 19.1.0
- Tailwind CSS with typography plugin
- Lucide React for icons
- TypeScript with strict configuration

### Key Files to Understand
- `globals.css`: Complete color system and utility classes
- `layout.tsx`: App-wide layout with font loading and metadata
- `Header.tsx`: Complex responsive navigation with mobile menu
- `tailwind.config.js`: Extended color palette and gradient definitions

## Code Style Guidelines

### Component Patterns
- Use `'use client'` directive only when necessary (interactive components)
- Prefer functional components with TypeScript interfaces
- Implement responsive design mobile-first with Tailwind breakpoints
- Group related functionality in reusable components

### Styling Approach
- Leverage custom CSS variables for theme consistency
- Use Tailwind utilities with semantic custom classes
- Implement hover states and animations consistently
- Maintain visual hierarchy with font-serif for headings

### Image & Asset Guidelines
- Place all images in `/public` directory
- Use descriptive alt text related to acupuncture/wellness context
- Implement decorative overlays and frame effects for visual consistency
- Apply consistent hover animations across image galleries

## Common Tasks

### Adding New Pages
1. Create page.tsx in appropriate app directory
2. Follow established hero + content sections pattern
3. Include relevant medical/wellness imagery
4. Add navigation link to Header.tsx if needed

### Extending Color Palette
1. Add CSS variable to `:root` in globals.css
2. Create corresponding Tailwind utilities
3. Add to tailwind.config.js colors object
4. Use semantic naming (e.g., `healing-blue`, `wisdom-purple`)

### Content Updates
- Replace placeholder contact info in Footer.tsx
- Update practitioner details in about/page.tsx
- Maintain professional, wellness-focused tone throughout
