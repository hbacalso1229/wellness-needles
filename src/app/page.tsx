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
      <BookingSection />
    </div>
  )
}
