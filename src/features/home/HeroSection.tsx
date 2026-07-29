'use client'

import { HeroSection as ReusableHeroSection } from '../ui/HeroSection'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export function HeroSection() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <ReusableHeroSection
      title="Wellness Needles"
      subtitle="Experience authentic acupuncture and naturopathic medicine with Arkinth Garcia"
      description="Specializing in pain management, mental health, digestive issues, fertility support, and holistic wellness through traditional Chinese medicine"
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
          href: bookHref,
          variant: "gold",
          external: isExternal,
          target,
          rel,
        },
        {
          text: "Learn more",
          href: "/about",
          appearance: "link",
          showArrow: false
        }
      ]}
      showFloatingLeaves={true}
    />
  )
}
