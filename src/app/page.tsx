import { Star } from 'lucide-react'
import { ShareExperienceCta } from '@/components/ShareExperienceCta'
import {
  HeroSection,
  BenefitsSection,
  ServicesSection,
  PractitionerSection,
  BookingSection,
} from '../features/home'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <BenefitsSection />
      <ServicesSection />
      <PractitionerSection />
      <BookingSection
        title="Feel the Difference"
        description="Experience personalised care designed to restore balance, ease discomfort, and support your wellbeing."
        ctaLabel="Begin Your Care Journey"
      >
        <p className="mt-5 flex items-center justify-center gap-1.5 text-base text-cream/60 md:mt-6">
          <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-hidden />
          <span>Trusted by 200+ patients</span>
        </p>
        <ShareExperienceCta />
      </BookingSection>
    </div>
  )
}
