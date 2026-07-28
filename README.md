# Wellness Needles - Acupuncture & Traditional Chinese Medicine

A modern, professional website for an acupuncture and Traditional Chinese Medicine practice, featuring a calming jungle/tropical theme that reflects Southeast Asian origins.

## 🌿 Features

- **Modern Design**: Clean, professional layout with a tropical/jungle color palette
- **Responsive**: Fully responsive design that works on all devices
- **Navigation**: Easy-to-use navigation with all key sections
- **Professional Imagery**: Placeholders for high-quality photos and media
- **Contact Forms**: Interactive contact and booking forms
- **SEO Ready**: Proper meta tags and semantic HTML structure

## 🎨 Design Theme

The website uses a carefully crafted color palette inspired by tropical and jungle environments:

- **Primary Green**: Deep Forest Green (#2d5016)
- **Secondary Green**: Medium Forest Green (#4a7c2a)
- **Accent Green**: Sage Green (#7fb069)
- **Light Green**: Light Bamboo Green (#a7c957)
- **Warm Cream**: Background color (#f9f7f4)
- **Gold Accent**: Call-to-action color (#d4af37)
- **Earth Brown**: Supporting color (#8b4513)

## 📱 Pages

### 1. Landing Page (`/`)
- Hero section with compelling call-to-action
- Features highlighting the benefits of acupuncture
- Quick links to all services
- Professional and calming design

### 2. About (`/about`)
- Practice story and philosophy
- Team member profiles
- Mission, vision, and values
- Why choose this practice

### 3. Why Acupuncture (`/acupuncture`)
- Science behind acupuncture
- Benefits and conditions treated
- Traditional vs. modern perspectives
- Research validation

### 4. Testimonials (`/testimonials`)
- Illustrative healing journey examples (disclaimed)
- Before/after treatment imagery
- Video testimonials (placeholder)

### 5. Chinese Medicine (`/chinese-medicine`)
- TCM philosophy and principles
- Treatment methods offered
- Diagnostic approaches
- Integration with modern medicine

### 6. Blog (`/blog`)
- Wellness article listing and categories
- Detail articles not yet implemented
- Newsletter signup (UI only)

### 7. Contact (`/contact`)
- Dual clinic locations (Celbridge & Carlow) with Google Maps
- Contact details and hours
- FAQ section
- Contact form gated by feature flag

### 8. Bookings (`/bookings`)
- In-clinic and home-visit pricing
- Practitioner information
- Booking form gated by feature flag (call-to-book when off)

## 🛠 Technology Stack

- **Framework**: Next.js 15.5.22 with App Router (static export)
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **Fonts**: Inter & Playfair Display (Google Fonts)
- **Language**: TypeScript
- **Deployment**: GitHub Actions → Vercel (staging on `dev`, production on `main`)

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── about/
│   ├── acupuncture/
│   ├── blog/               # Listing only (no [id] routes yet)
│   ├── bookings/
│   ├── chinese-medicine/
│   ├── contact/            # Includes Google Maps Find Us
│   ├── testimonials/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/             # Shared UI chrome
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ContactInfo.tsx
│   ├── BusinessHours.tsx
│   ├── LocationMap.tsx
│   └── LoadingComponent.tsx
├── features/               # Domain UI (home + shared cards)
│   ├── home/
│   └── ui/
└── lib/
    └── contact-config.ts   # Contact details + feature flags
```

## 🎯 Key Features

### Professional Design
- Calming color scheme reflecting Southeast Asian heritage
- Clean typography with Inter and Playfair Display fonts
- Consistent spacing and layout principles
- Accessibility-focused design

### User Experience
- Intuitive navigation with mobile-friendly menu
- Progressive form design for bookings
- Clear call-to-action buttons throughout
- Smooth transitions and hover effects

### Content Strategy
- Educational content about acupuncture and TCM
- Patient-focused messaging
- Trust-building elements (testimonials, credentials)
- Clear service descriptions and pricing

### Technical Excellence
- Fast loading with Next.js optimization
- SEO-ready structure
- Mobile-first responsive design
- Modern development practices

## 📝 Customization

### Colors
Update the CSS custom properties in `globals.css` to change the color scheme:

```css
:root {
  --primary-green: #2d5016;
  --secondary-green: #4a7c2a;
  --accent-green: #7fb069;
  /* ... other colors */
}
```

### Content
- Update practitioner information in relevant pages
- Replace placeholder content with actual practice details
- Add real testimonials and success stories
- Include actual service prices and descriptions

### Images
- Replace icon placeholders with actual photos
- Add professional headshots of practitioners
- Include treatment room and facility photos
- Add relevant acupuncture and wellness imagery

## 🔧 Production Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

The application is ready for deployment to platforms like Vercel, Netlify, or any Node.js hosting service.

## 📞 Support

This website template provides a solid foundation for an acupuncture practice's online presence. The design emphasizes trust, professionalism, and the healing nature of traditional Chinese medicine while maintaining modern web standards and user experience best practices.
