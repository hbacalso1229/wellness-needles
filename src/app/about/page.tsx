'use client'

import { Heart, Award, Target, Clock, Shield } from 'lucide-react'
import Image from 'next/image'
import { PulsingLeaf, FeatureCard, HeroSection, SectionHeading, SnapCarousel, snapSlideClassName } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

/** Drop official logos into /public/insurance/{slug}.svg (or .png) when available. */
const insurers = [
  { name: 'Aviva', slug: 'aviva' },
  { name: 'Laya Healthcare', slug: 'laya' },
  { name: 'HSF Health Plan', slug: 'hsf' },
  { name: 'Vhi', slug: 'vhi' },
  { name: 'GloHealth', slug: 'glohealth' },
] as const

export default function About() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="About Wellness Needles"
        subtitle="Dedicated to bringing you the finest in traditional Chinese medicine and acupuncture therapy"
        description="Our practice combines ancient healing wisdom with modern understanding to provide comprehensive wellness solutions tailored to your unique needs."
        backgroundImage="/hero_wellness_acupuncture.jpeg"
        showFloatingLeaves={true}
        ctaWrapperClassName="xl:hidden"
        ctaButtons={[
          {
            text: 'Schedule your consultation',
            href: bookHref,
            variant: 'gold',
            external: isExternal,
            target,
            rel,
          },
        ]}
      />

      {/* Our Story Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row: Practitioner (left) + Mission/Vision (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch mb-12">
            {/* Your Practitioner tile */}
            <div className="bg-secondary/5 rounded-xl p-6 sm:p-8 text-center shadow-md relative overflow-hidden border border-accent/20 card-emboss flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-gold/10 to-accent/10 rounded-full -translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full translate-x-12 translate-y-12"></div>

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
                  Your Practitioner
                </p>
                <div className="relative group mb-4 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-accent/20 rounded-full blur-md"></div>
                  <div className="w-28 h-28 bg-accent rounded-full mx-auto overflow-hidden relative border-4 border-cream shadow-xl">
                    <Image
                      src="/Arkinth_clinic_founder.jpeg"
                      alt="Arkinth Garcia - Naturopath & Acupuncturist"
                      width={112}
                      height={112}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse pointer-events-none"></div>
                  <div className="absolute -top-1 -right-1 z-20">
                    <PulsingLeaf size="small" color="text-gold/60" rotation={45} />
                  </div>
                  <div className="absolute -bottom-1 -left-1 z-20">
                    <PulsingLeaf
                      size="small"
                      color="text-accent/60"
                      rotation={-12}
                      animationDelay="1s"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-xl font-semibold text-primary mb-1">
                  Arkinth Garcia
                </h3>
                <p className="text-secondary text-sm mb-2">Naturopath &amp; Acupuncturist</p>
                <p className="text-secondary text-sm">
                  Qualified from the College of Naturopathic Medicine, Dublin
                </p>
              </div>
            </div>

            {/* Mission / Vision / Values + image tile */}
            <div className="bg-cream rounded-lg p-6 sm:p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary rounded-full p-3 shrink-0">
                    <Target className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Mission</h3>
                    <p className="text-secondary">
                      To restore balance and promote healing through authentic traditional Chinese medicine
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-secondary rounded-full p-3 shrink-0">
                    <Heart className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Vision</h3>
                    <p className="text-secondary">
                      A community where holistic wellness is accessible to all who seek healing
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-accent rounded-full p-3 shrink-0">
                    <Shield className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Values</h3>
                    <p className="text-secondary">
                      Authenticity, compassion, and dedication to the highest standards of care
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Arkinth Garcia — full width below tiles */}
          <div>
            <h2 className="font-serif text-4xl font-bold text-primary mb-6">
              About Arkinth Garcia
            </h2>
            <div className="space-y-4 text-secondary">
              <p>
                My name is Arkinth Garcia, and I am a qualified Naturopath and Acupuncturist.
                I completed my training at the College of Naturopathic Medicine in Dublin, where
                I first studied Biomedicine to gain a strong foundation in anatomy, physiology,
                and pathology before specializing in acupuncture and naturopathy.
              </p>
              <p>
                My journey into this field began with my own personal health challenge. I struggled
                with alopecia, and after trying many approaches without success, it was acupuncture
                that finally brought real healing and balance to my body. This powerful experience
                inspired me to dedicate my career to understanding how and why acupuncture works,
                and more importantly, how it can transform the lives of others.
              </p>
              <p>
                Today, I combine my knowledge of acupuncture and naturopathic medicine to help people
                restore balance, improve their wellbeing, and address the root causes of their health
                concerns. My approach is holistic, compassionate, and tailored to each person&apos;s unique
                needs—whether you are looking for relief from a specific condition, support for stress
                and fatigue, or guidance on lifestyle changes that promote long-term health.
              </p>
              <p>
                If you are ready to take the next step towards better health and balance, I would be
                honored to support you on your journey. I treat pain management, mental health conditions,
                digestive issues, fertility, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance */}
      <section className="py-20 bg-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Insurance"
            subtitle="We are a registered professional acupuncture clinic"
          />
          <div className="mx-auto max-w-3xl space-y-4 text-center text-secondary">
            <p>
              You may be able to claim acupuncture treatment through your health insurance,
              depending on your provider and level of cover.
            </p>
            <p>
              Please check with your insurer before your appointment. We will provide a receipt
              for your claim after treatment.
            </p>
          </div>

          <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {insurers.map((insurer) => (
              <li
                key={insurer.slug}
                className="flex min-h-[4.5rem] items-center justify-center rounded-xl border border-accent/20 bg-cream px-3 py-4 text-center shadow-sm shadow-primary/5 transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md motion-safe:hover:shadow-primary/10"
              >
                <span className="text-sm font-semibold leading-snug text-primary">
                  {insurer.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Choose Wellness Needles?"
            subtitle="Committed to providing the highest quality care with authentic traditional practices and personal experience"
          />

          <SnapCarousel
            slideCount={3}
            ariaLabel="Why choose us carousel"
            trackClassName="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8"
          >
            <div className={snapSlideClassName}>
              <FeatureCard
                flippable
                icon={Award}
                title="Certified Expert"
                description="Arkinth Garcia is licensed and certified in acupuncture and naturopathic medicine from Dublin's prestigious College of Naturopathic Medicine"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
              />
            </div>

            <div className={snapSlideClassName}>
              <FeatureCard
                flippable
                icon={Clock}
                title="Flexible Scheduling"
                description="We offer convenient appointment times to fit your busy lifestyle and schedule"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
              />
            </div>

            <div className={snapSlideClassName}>
              <FeatureCard
                flippable
                icon={Heart}
                title="Personal Experience"
                description="Having experienced the healing power of acupuncture firsthand, Arkinth brings both professional expertise and personal understanding to your care"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
              />
            </div>
          </SnapCarousel>
        </div>
      </section>
    </div>
  )
}
