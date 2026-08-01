'use client'

import { useState } from 'react'
import { Leaf, Heart, Brain, Target, Zap, Circle, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { FeatureCard, HeroSection, SectionHeading } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

const diagnosisCardClass =
  'group w-full bg-white rounded-xl p-3.5 md:p-6 border border-accent/15 transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

const diagnosisMethods = [
  {
    title: 'Pulse Diagnosis',
    body: 'Practitioners feel the pulse at multiple positions to assess the quality, strength, and rhythm, revealing information about organ function and energy flow.',
  },
  {
    title: 'Tongue Examination',
    body: 'The color, coating, texture, and shape of the tongue provide insights into internal organ systems and overall constitutional health.',
  },
  {
    title: 'Observation',
    body: 'Visual assessment of complexion, eyes, body build, movement, and overall vitality to understand constitutional strengths and imbalances.',
  },
  {
    title: 'Questioning & Listening',
    body: 'Detailed inquiry about symptoms, lifestyle, emotions, and listening to voice quality and breathing patterns to complete the diagnostic picture.',
  },
] as const

const principleIconClass = 'rounded-full p-2 flex-shrink-0'

export default function ChineseMedicine() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()
  const [openDiagnosisIndexes, setOpenDiagnosisIndexes] = useState<Set<number>>(
    () => new Set()
  )

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Traditional Chinese Medicine"
        subtitle="Ancient wisdom meets modern wellness in our holistic approach to health"
        description="Discover the profound principles that have guided healing for over 3,000 years, offering a complete system of medicine that treats the whole person."
        backgroundImage="/hero_wellness_acupuncture.jpeg"
        backgroundClass="bg-secondary"
        textColor="text-cream"
        showFloatingLeaves={true}
        ctaWrapperClassName="xl:hidden"
        ctaButtons={[
          {
            text: 'Begin your healing journey',
            href: bookHref,
            variant: 'gold',
            external: isExternal,
            target,
            rel,
          },
        ]}
      />

      {/* Philosophy Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Philosophy of TCM"
            subtitle="Traditional Chinese Medicine is based on the understanding that health comes from balance and harmony within the body and with nature"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 lg:gap-16 items-start">
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                Core Principles
              </h3>
              <div className="mb-6 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`bg-primary ${principleIconClass}`}>
                    <Circle className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Qi (Life Energy)</h4>
                    <p className="text-secondary">
                      The fundamental life force that flows through all living things.
                      Health depends on the smooth and balanced flow of Qi throughout the body.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`bg-secondary ${principleIconClass}`}>
                    <Target className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Yin and Yang</h4>
                    <p className="text-secondary">
                      Complementary forces that must be in balance for optimal health.
                      Disease occurs when these forces become imbalanced.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`bg-accent ${principleIconClass}`}>
                    <Leaf className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Five Elements</h4>
                    <p className="text-secondary">
                      Wood, Fire, Earth, Metal, and Water represent different organ systems
                      and their interconnected relationships in the body.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className={`bg-light-green ${principleIconClass}`}>
                    <Zap className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Meridian System</h4>
                    <p className="text-secondary">
                      Energy pathways that connect different parts of the body,
                      allowing Qi to flow and nourish organs and tissues.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                Holistic Approach
              </h3>
              <div className="mb-6 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-4 text-secondary">
                <p>
                  Unlike Western medicine which often focuses on treating symptoms,
                  Traditional Chinese Medicine views the body as an interconnected whole,
                  seeking to identify and address the root causes of illness.
                </p>
                <p>
                  TCM practitioners consider not just physical symptoms, but also
                  emotional, mental, and spiritual aspects of health, recognizing
                  that true healing requires balance in all areas of life.
                </p>
                <p>
                  This comprehensive approach often leads to lasting healing rather
                  than temporary relief, as it works to restore the body&apos;s natural
                  ability to heal and maintain health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="TCM Treatment Methods"
            subtitle="We offer a comprehensive range of traditional Chinese medicine therapies"
          />

          <div className="grid grid-cols-2 gap-2.5 md:gap-8">
            <FeatureCard
              flippable
              icon={Zap}
              title="Acupuncture"
              description="Fine needles inserted at specific points to regulate Qi flow and promote healing throughout the body."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
            <FeatureCard
              flippable
              icon={Heart}
              title="Cupping Therapy"
              description="Gentle suction therapy that improves circulation, reduces inflammation, and releases muscle tension."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
            <FeatureCard
              flippable
              icon={Brain}
              title="Moxibustion"
              description="Therapeutic heat therapy using mugwort herb to warm acupuncture points and strengthen Yang energy."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
            <FeatureCard
              flippable
              icon={Circle}
              title="Gua Sha"
              description="Gentle scraping technique that promotes circulation, reduces inflammation, and supports detoxification."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Diagnosis Methods */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="TCM Diagnostic Methods"
            subtitle="Traditional Chinese Medicine uses unique diagnostic techniques to understand your health"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 md:items-stretch gap-2.5 md:gap-8">
            {diagnosisMethods.map((method, index) => {
              const isOpen = openDiagnosisIndexes.has(index)
              return (
                <button
                  key={method.title}
                  type="button"
                  className={`${diagnosisCardClass} md:h-full`}
                  aria-expanded={isOpen}
                  aria-controls={`diagnosis-body-${index}`}
                  id={`diagnosis-title-${index}`}
                  onClick={() =>
                    setOpenDiagnosisIndexes((prev) => {
                      const next = new Set(prev)
                      if (next.has(index)) next.delete(index)
                      else next.add(index)
                      return next
                    })
                  }
                >
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="font-semibold text-base md:text-lg text-primary mb-1 md:mb-2 leading-snug">
                        {method.title}
                      </h3>
                      <div className="h-0.5 w-8 md:w-10 rounded-full bg-gold" aria-hidden="true" />
                    </div>
                    <ChevronRight
                      className={`diagnosis-accordion-chevron h-4 w-4 md:h-5 md:w-5 shrink-0 text-secondary/50 ${
                        isOpen ? 'rotate-90 text-primary' : ''
                      }`}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <div
                    id={`diagnosis-body-${index}`}
                    role="region"
                    aria-labelledby={`diagnosis-title-${index}`}
                    className={`diagnosis-accordion-panel grid ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pt-2 md:pt-3 text-left text-sm md:text-base text-secondary leading-snug diagnosis-accordion-body ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {method.body}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Integration with Modern Medicine */}
      <section className="py-12 md:py-16 lg:py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Integrative Approach"
            subtitle="Combining the best of traditional wisdom with modern medical understanding"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8 lg:gap-16 items-start">
            <div>
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                Complementary Care
              </h3>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-4 text-secondary">
                <p>
                  Traditional Chinese Medicine works beautifully alongside conventional
                  medical treatments, often enhancing their effectiveness while reducing
                  side effects and supporting overall well-being.
                </p>
                <p>
                  I collaborate with your healthcare team to ensure coordinated care
                  that addresses all aspects of your health journey, from acute conditions
                  to long-term wellness maintenance.
                </p>
                <p>
                  Many patients find that TCM helps them achieve better results from
                  conventional treatments while providing additional tools for managing
                  stress, pain, and other health challenges.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3.5 md:p-8 border border-accent/15 transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25">
              <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                Evidence-Based Practice
              </h3>
              <div className="mb-3 md:mb-4 h-0.5 w-8 md:w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-3 md:space-y-4 text-sm md:text-base text-secondary leading-snug">
                <p>
                  While respecting traditional knowledge, we stay current with modern
                  research on TCM practices, ensuring our treatments meet both traditional
                  standards and contemporary safety protocols.
                </p>
                <p>
                  We use sterile, single-use needles, maintain the highest hygiene standards,
                  and continuously update our knowledge through ongoing education and
                  professional development.
                </p>
                <div className="pt-4">
                  <Link
                    href="/about"
                    className="text-accent hover:text-primary font-medium inline-flex items-center"
                  >
                    Meet our practitioner <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
