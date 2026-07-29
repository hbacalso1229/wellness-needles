import {
  HeroSection,
  FeaturesSection,
  QuickLinksSection,
} from '../features/home'

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <QuickLinksSection />
    </div>
  )
}
