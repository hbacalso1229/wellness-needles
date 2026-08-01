'use client'

import { useState } from 'react'
import NextImage from 'next/image'
import { Heart, Award, Target, Clock, Shield } from 'lucide-react'
import { PulsingLeaf, FeatureCard, HeroSection, SectionHeading, SnapCarousel, snapSlideClassName } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

/** Known logo files only — avoid requesting missing .svg/.png (404 spam). */
const insurers = [
  {
    name: 'Aviva',
    slug: 'aviva',
    href: 'https://www.aviva.ie/',
    logo: '/insurance/aviva.svg',
  },
  {
    name: 'Laya Healthcare',
    slug: 'laya',
    href: 'https://www.layahealthcare.ie/',
    logo: '/insurance/laya.png',
  },
  {
    name: 'HSF Health Plan',
    slug: 'hsf',
    href: 'https://www.hsf.ie/',
    logo: '/insurance/hsf.png',
  },
  {
    name: 'Vhi',
    slug: 'vhi',
    href: 'https://www.vhi.ie/',
    logo: '/insurance/vhi.png',
  },
  // GloHealth brand retired; use Irish Life Health mark (successor)
  {
    name: 'GloHealth',
    slug: 'glohealth',
    href: 'https://www.irishlifehealth.ie/',
    logo: '/insurance/glohealth.svg',
  },
] as const

function InsurerLogo({
  name,
  logo,
}: {
  name: string
  logo: string | null
}) {
  const [failed, setFailed] = useState(false)

  if (!logo || failed) {
    return <span className="text-sm font-semibold leading-snug text-primary">{name}</span>
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- local brand assets; svg preferred when listed
    <img
      src={logo}
      alt=""
      className="max-h-12 w-auto max-w-[9rem] object-contain sm:max-h-14 sm:max-w-[10rem]"
      onError={() => setFailed(true)}
    />
  )
}

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 lg:gap-12 items-stretch mb-8 md:mb-12">
            {/* Your Practitioner tile */}
            <div className="bg-secondary/5 rounded-xl p-3.5 md:p-8 text-center shadow-md relative overflow-hidden border border-accent/20 card-emboss flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-gold/10 to-accent/10 rounded-full -translate-x-8 -translate-y-8"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full translate-x-12 translate-y-12"></div>

              <div className="relative z-10">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-4">
                  Your Practitioner
                </p>
                <div className="relative group mb-4 inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-accent/20 rounded-full blur-md"></div>
                  <div className="w-28 h-28 bg-accent rounded-full mx-auto overflow-hidden relative border-4 border-cream shadow-xl">
                    <NextImage
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

                <h3 className="font-serif text-lg md:text-xl font-semibold text-primary mb-1">
                  Arkinth Garcia
                </h3>
                <p className="text-secondary text-sm mb-2">Naturopath &amp; Acupuncturist</p>
                <p className="text-secondary text-sm">
                  Qualified from the College of Naturopathic Medicine, Dublin
                </p>
              </div>
            </div>

            {/* Mission / Vision / Values + image tile */}
            <div className="bg-cream rounded-lg p-3.5 md:p-8">
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-primary rounded-full p-2.5 md:p-3 shrink-0">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-primary">Our Mission</h3>
                    <p className="text-sm md:text-base text-secondary leading-snug">
                      To restore balance and promote healing through authentic traditional Chinese medicine
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-secondary rounded-full p-2.5 md:p-3 shrink-0">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-primary">Our Vision</h3>
                    <p className="text-sm md:text-base text-secondary leading-snug">
                      A community where holistic wellness is accessible to all who seek healing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-accent rounded-full p-2.5 md:p-3 shrink-0">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base md:text-lg text-primary">Our Values</h3>
                    <p className="text-sm md:text-base text-secondary leading-snug">
                      Authenticity, compassion, and dedication to the highest standards of care
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Arkinth Garcia — full width below tiles */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-4 md:mb-6">
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

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Why Choose Wellness Needles?"
            subtitle="Committed to providing the highest quality care with authentic traditional practices and personal experience"
          />

          <SnapCarousel
            slideCount={3}
            ariaLabel="Why choose us carousel"
            trackClassName="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8"
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

      {/* Insurance */}
      <section className="py-12 md:py-16 lg:py-20 bg-accent/10">
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

          <ul className="mt-6 md:mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-10 md:gap-x-12">
            {insurers.map((insurer) => (
              <li key={insurer.slug}>
                <a
                  href={insurer.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${insurer.name} website (opens in a new tab)`}
                  className="inline-flex items-center justify-center opacity-90 transition-opacity duration-200 motion-safe:hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-accent/10"
                >
                  <InsurerLogo name={insurer.name} logo={insurer.logo} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}
