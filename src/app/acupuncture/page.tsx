'use client'

import {
  Brain,
  Heart,
  Zap,
  Shield,
  Target,
  Activity,
  Check,
  Wind,
  Apple,
  Flower2,
  ShieldCheck,
  Venus,
  type LucideIcon,
} from 'lucide-react'
import { FeatureCard, HeroSection, SectionHeading, SnapCarousel, snapSlideClassName } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

const conditionCardClass =
  `group ${snapSlideClassName} bg-white rounded-xl p-5 md:p-6 border border-accent/15 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25 hover:shadow-[0_14px_32px_rgba(45,80,22,0.18),0_4px_12px_rgba(45,80,22,0.1)]`

const conditions: {
  title: string
  icon: LucideIcon
  items: string[]
}[] = [
  {
    title: 'Pain Management',
    icon: Activity,
    items: [
      'Chronic back pain',
      'Neck and shoulder pain',
      'Arthritis',
      'Migraines and headaches',
      'Fibromyalgia',
    ],
  },
  {
    title: 'Mental Health',
    icon: Brain,
    items: ['Anxiety and stress', 'Depression', 'Insomnia', 'PTSD', 'Addiction recovery'],
  },
  {
    title: "Women's Health",
    icon: Venus,
    items: [
      'Fertility support',
      'Menstrual irregularities',
      'Menopause symptoms',
      'Pregnancy support',
      'PCOS',
    ],
  },
  {
    title: 'Digestive Issues',
    icon: Apple,
    items: ['IBS', 'Acid reflux', 'Bloating', 'Constipation', 'Nausea'],
  },
  {
    title: 'Respiratory',
    icon: Wind,
    items: ['Asthma', 'Allergies', 'Sinusitis', 'Chronic cough', 'Bronchitis'],
  },
  {
    title: 'General Wellness',
    icon: Flower2,
    items: [
      'Immune support',
      'Energy enhancement',
      'Anti-aging',
      'Weight management',
      'Preventive care',
    ],
  },
]

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
        showFloatingLeaves={true}
        ctaWrapperClassName="xl:hidden"
        ctaButtons={[
          {
            text: 'Schedule your treatment',
            href: bookHref,
            variant: 'gold',
            external: isExternal,
            target,
            rel,
          },
        ]}
      />

      {/* How It Works Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How Acupuncture Works"
            subtitle="Acupuncture works by stimulating specific points on the body to restore the natural flow of energy and promote healing"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                Traditional Chinese Medicine Perspective
              </h3>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
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
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                Modern Scientific Understanding
              </h3>
              <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
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
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Benefits of Acupuncture"
            subtitle="Experience comprehensive healing with proven benefits for mind and body"
          />

          <div className="grid grid-cols-2 gap-4 md:gap-8 lg:grid-cols-3">
            <FeatureCard
              flippable
              icon={Zap}
              title="Pain Relief"
              description="Effective treatment for chronic pain, arthritis, back pain, headaches, and muscular tension without side effects."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />

            <FeatureCard
              flippable
              icon={Brain}
              title="Stress Reduction"
              description="Promotes deep relaxation, reduces anxiety, and helps manage stress by balancing the nervous system naturally."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />

            <FeatureCard
              flippable
              icon={Activity}
              title="Improved Sleep"
              description="Regulates sleep patterns and helps with insomnia by addressing underlying imbalances that affect rest."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />

            <FeatureCard
              flippable
              icon={Shield}
              title="Immune Support"
              description="Strengthens the immune system and increases resistance to illness by optimizing the body's natural defenses."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />

            <FeatureCard
              flippable
              icon={Heart}
              title="Digestive Health"
              description="Improves digestion, reduces bloating, and helps with various gastrointestinal conditions through targeted treatment."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />

            <FeatureCard
              flippable
              icon={Target}
              title="Hormonal Balance"
              description="Helps regulate hormones naturally, supporting fertility, menstrual health, and overall endocrine system function."
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Conditions Treated */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Conditions We Treat"
            subtitle="Acupuncture can effectively address a wide range of health conditions"
          />

          <SnapCarousel
            slideCount={conditions.length}
            ariaLabel="Conditions carousel"
            trackClassName="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8"
          >
            {conditions.map(({ title, icon: Icon, items }) => (
              <div key={title} className={conditionCardClass}>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-accent/35 bg-cream transition-colors duration-300 group-hover:border-primary/40 group-hover:bg-accent/10">
                  <Icon className="h-5 w-5 text-primary transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-primary mb-2">{title}</h3>
                <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                <ul className="space-y-2 text-secondary md:space-y-2.5">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20">
                        <Check className="h-3 w-3 text-accent" strokeWidth={2.5} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </SnapCarousel>
        </div>
      </section>

      {/* Research Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-secondary/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeading
            title="Scientific Evidence"
            subtitle="Modern research validates what traditional practitioners have known for millennia"
          />

          <p className="text-secondary leading-relaxed mb-6">
            Acupuncture is supported by thousands of published studies, recognized by the WHO for
            dozens of conditions, and backed by NIH guidance for pain care — with a strong safety
            profile when delivered by trained practitioners.
          </p>
          <ul className="mx-auto max-w-xl space-y-3 text-left text-secondary">
            {[
              'WHO recognizes acupuncture for treating 43+ conditions',
              'Meta-analyses show significant benefits for chronic pain',
              'Low risk of adverse effects; no drug interactions',
              'Safe alongside conventional medical treatments',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-cream" strokeWidth={2.5} />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 inline-flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            Evidence-based. Safe. Gentle.
          </p>
        </div>
      </section>
    </div>
  )
}
