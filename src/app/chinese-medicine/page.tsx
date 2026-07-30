'use client'

import { Leaf, Heart, Brain, Target, Zap, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { FeatureCard, HeroSection, SectionHeading } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

const diagnosisCardClass =
  'group snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-white rounded-xl p-6 border border-accent/15 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25 hover:shadow-[0_14px_32px_rgba(45,80,22,0.18),0_4px_12px_rgba(45,80,22,0.1)]'

const principleIconClass =
  'rounded-full p-2 flex-shrink-0 shadow-[0_8px_20px_rgba(74,124,42,0.28),0_2px_8px_rgba(45,80,22,0.14)]'

export default function ChineseMedicine() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Traditional Chinese Medicine"
        subtitle="Ancient wisdom meets modern wellness in our holistic approach to health"
        description="Discover the profound principles that have guided healing for over 3,000 years, offering a complete system of medicine that treats the whole person."
        backgroundImage="/needles_candles_flowers_decor.jpeg"
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
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="The Philosophy of TCM"
            subtitle="Traditional Chinese Medicine is based on the understanding that health comes from balance and harmony within the body and with nature"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                Core Principles
              </h3>
              <div className="mb-6 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-6">
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
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
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
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="TCM Treatment Methods"
            subtitle="We offer a comprehensive range of traditional Chinese medicine therapies"
          />

          {/* Mobile: horizontal scroll carousel | md+: compact 2x2 */}
          <div className="mx-auto max-w-2xl flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-auto md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-4">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                flippable
                compact
                icon={Zap}
                title="Acupuncture"
                description="Fine needles inserted at specific points to regulate Qi flow and promote healing throughout the body."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                flippable
                compact
                icon={Heart}
                title="Cupping Therapy"
                description="Gentle suction therapy that improves circulation, reduces inflammation, and releases muscle tension."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                flippable
                compact
                icon={Brain}
                title="Moxibustion"
                description="Therapeutic heat therapy using mugwort herb to warm acupuncture points and strengthen Yang energy."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                flippable
                compact
                icon={Circle}
                title="Gua Sha"
                description="Gentle scraping technique that promotes circulation, reduces inflammation, and supports detoxification."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>
          </div>

          {/* Swipe hint — mobile only */}
          <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" aria-hidden="true">
            <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
            <svg className="w-3.5 h-3.5 text-secondary/50" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* Diagnosis Methods */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="TCM Diagnostic Methods"
            subtitle="Traditional Chinese Medicine uses unique diagnostic techniques to understand your health"
          />

          {/* Mobile: horizontal scroll carousel | md: 2-col */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-8">
            <div className={diagnosisCardClass}>
              <h3 className="font-semibold text-lg text-primary mb-2">Pulse Diagnosis</h3>
              <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-secondary">
                Practitioners feel the pulse at multiple positions to assess the quality,
                strength, and rhythm, revealing information about organ function and energy flow.
              </p>
            </div>

            <div className={diagnosisCardClass}>
              <h3 className="font-semibold text-lg text-primary mb-2">Tongue Examination</h3>
              <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-secondary">
                The color, coating, texture, and shape of the tongue provide insights
                into internal organ systems and overall constitutional health.
              </p>
            </div>

            <div className={diagnosisCardClass}>
              <h3 className="font-semibold text-lg text-primary mb-2">Observation</h3>
              <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-secondary">
                Visual assessment of complexion, eyes, body build, movement, and overall
                vitality to understand constitutional strengths and imbalances.
              </p>
            </div>

            <div className={diagnosisCardClass}>
              <h3 className="font-semibold text-lg text-primary mb-2">Questioning & Listening</h3>
              <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-secondary">
                Detailed inquiry about symptoms, lifestyle, emotions, and listening to
                voice quality and breathing patterns to complete the diagnostic picture.
              </p>
            </div>
          </div>

          {/* Swipe hint — mobile only */}
          <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" aria-hidden="true">
            <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
            <svg className="w-3.5 h-3.5 text-secondary/50" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* Integration with Modern Medicine */}
      <section className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Integrative Approach"
            subtitle="Combining the best of traditional wisdom with modern medical understanding"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
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

            <div className="bg-white rounded-xl p-8 border border-accent/15 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25 hover:shadow-[0_14px_32px_rgba(45,80,22,0.18),0_4px_12px_rgba(45,80,22,0.1)]">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                Evidence-Based Practice
              </h3>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <div className="space-y-4 text-secondary">
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
