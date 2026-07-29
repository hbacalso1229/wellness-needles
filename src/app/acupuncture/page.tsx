'use client'

import { Brain, Heart, Zap, Shield, Target, Activity, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { PulsingLeaf, FeatureCard, HeroSection } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export default function Acupuncture() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Why Choose Acupuncture?"
        subtitle="Discover the science and ancient wisdom behind this powerful healing modality"
        description="Acupuncture has been used for over 3,000 years to treat a wide range of conditions, and modern research continues to validate its effectiveness."
        backgroundImage="/accupuncture_cupping_therapy.jpeg"
        backgroundClass="bg-secondary"
        textColor="text-cream"
        heightClass="py-20"
        showFloatingLeaves={true}
        ctaWrapperClassName="xl:hidden"
        ctaButtons={[
          {
            text: 'Schedule Your Treatment',
            href: bookHref,
            variant: 'gold',
            external: isExternal,
            target,
            rel,
          },
        ]}
      />

      {/* How It Works Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              How Acupuncture Works
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Acupuncture works by stimulating specific points on the body to restore 
              the natural flow of energy and promote healing
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Traditional Chinese Medicine Perspective
              </h3>
              <div className="space-y-4 text-secondary">
                <p>
                  According to traditional Chinese medicine, acupuncture works by regulating 
                  the flow of Qi (pronounced &quot;chee&quot;) - the vital energy that flows through 
                  specific pathways called meridians in the body.
                </p>
                <p>
                  When Qi becomes blocked or imbalanced, illness and pain can result. 
                  Acupuncture helps restore this balance by stimulating specific points 
                  along the meridians with fine, sterile needles.
                </p>
                <p>
                  This ancient understanding has guided successful treatments for thousands 
                  of years and continues to provide a framework for holistic healing.
                </p>
              </div>
              {/* Treatment Image */}
              <div className="mt-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-2xl blur-md"></div>
                  <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                    <Image
                      src="/treatment_on_head.jpeg"
                      alt="Acupuncture treatment on head"
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 rounded-2xl border border-accent/30 group-hover:border-accent/50 transition-all duration-300 pointer-events-none"></div>
                  </div>
                  {/* Floating decorative elements */}
                  <div className="absolute -top-1 -right-1">
                    <PulsingLeaf 
                      size="small"
                      color="text-accent/70"
                      rotation={12}
                    />
                  </div>
                  <div className="absolute -bottom-1 -left-1">
                    <PulsingLeaf 
                      size="small"
                      color="text-secondary/70"
                      rotation={-45}
                      animationDelay="0.5s"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Modern Scientific Understanding
              </h3>
              <div className="space-y-4 text-secondary">
                <p>
                  Modern research shows that acupuncture stimulates the nervous system, 
                  releasing natural pain-relieving chemicals like endorphins and affecting 
                  neurotransmitter levels.
                </p>
                <p>
                  Studies using MRI and other imaging techniques show that acupuncture 
                  can influence brain activity, reduce inflammation, and improve blood 
                  circulation to treated areas.
                </p>
                <p>
                  The World Health Organization recognizes acupuncture as effective for 
                  treating numerous conditions, bridging ancient wisdom with modern medicine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Benefits of Acupuncture
            </h2>
            <p className="text-lg text-secondary">
              Experience comprehensive healing with proven benefits for mind and body
            </p>
          </div>
          
          {/* Mobile: horizontal scroll carousel | md: 2-col | lg: 3-col */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Zap}
                title="Pain Relief"
                description="Effective treatment for chronic pain, arthritis, back pain, headaches, and muscular tension without side effects."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Brain}
                title="Stress Reduction"
                description="Promotes deep relaxation, reduces anxiety, and helps manage stress by balancing the nervous system naturally."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Activity}
                title="Improved Sleep"
                description="Regulates sleep patterns and helps with insomnia by addressing underlying imbalances that affect rest."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Shield}
                title="Immune Support"
                description="Strengthens the immune system and increases resistance to illness by optimizing the body's natural defenses."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Heart}
                title="Digestive Health"
                description="Improves digestion, reduces bloating, and helps with various gastrointestinal conditions through targeted treatment."
                gradientFrom="from-primary/10"
                gradientTo="to-primary/10"
              />
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
              <FeatureCard
                icon={Target}
                title="Hormonal Balance"
                description="Helps regulate hormones naturally, supporting fertility, menstrual health, and overall endocrine system function."
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

      {/* Conditions Treated */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Conditions We Treat
            </h2>
            <p className="text-lg text-secondary">
              Acupuncture can effectively address a wide range of health conditions
            </p>
          </div>
          
          {/* Mobile: horizontal scroll carousel | md: 2-col | lg: 3-col */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">Pain Management</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Chronic back pain</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Neck and shoulder pain</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Arthritis</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Migraines and headaches</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Fibromyalgia</li>
              </ul>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">Mental Health</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Anxiety and stress</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Depression</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Insomnia</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> PTSD</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Addiction recovery</li>
              </ul>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">Women&apos;s Health</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Fertility support</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Menstrual irregularities</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Menopause symptoms</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Pregnancy support</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> PCOS</li>
              </ul>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">Digestive Issues</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> IBS</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Acid reflux</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Bloating</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Constipation</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Nausea</li>
              </ul>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">Respiratory</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Asthma</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Allergies</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Sinusitis</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Chronic cough</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Bronchitis</li>
              </ul>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-4">General Wellness</h3>
              <ul className="space-y-2 text-secondary">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Immune support</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Energy enhancement</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Anti-aging</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Weight management</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" /> Preventive care</li>
              </ul>
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

      {/* Research Section */}
      <section className="py-20 bg-light-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Scientific Evidence
            </h2>
            <p className="text-lg text-secondary">
              Modern research validates what traditional practitioners have known for millennia
            </p>
          </div>
          
          {/* Mobile: horizontal scroll carousel | md: 2-col */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-8">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-cream rounded-lg p-8 card-emboss">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
                Clinical Research
              </h3>
              <ul className="space-y-3 text-secondary">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>Over 3,000 published studies on acupuncture effectiveness</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>WHO recognizes acupuncture for treating 43+ conditions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>NIH supports acupuncture for pain management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>Meta-analyses show significant benefits for chronic pain</span>
                </li>
              </ul>
            </div>
            
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-cream rounded-lg p-8 card-emboss">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
                Safety Profile
              </h3>
              <ul className="space-y-3 text-secondary">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>Extremely low risk of adverse effects when performed by licensed practitioners</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>No drug interactions or side effects</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>Safe for all ages, including children and pregnant women</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-accent mr-3 mt-0.5 flex-shrink-0" />
                  <span>Can be used alongside conventional medical treatments</span>
                </li>
              </ul>
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
    </div>
  )
}
