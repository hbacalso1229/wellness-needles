import {
  HeroSection,
  FeaturesSection,
  QuickLinksSection,
  CTASection
} from '../features/home'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <QuickLinksSection />
      <CTASection />
    </div>
  )
}
