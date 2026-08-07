'use client'

import { Leaf, Heart, Brain, Target, Zap, Circle, ArrowRight, Activity, Eye, MessageCircle, Scan, Calendar, type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { HeroSection, SectionHeading, glassGreenBandClassName } from '../../features'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { BookingCtaButton } from '@/components/BookingCtaButton'

const sectionTitleClassName =
  'font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] font-bold text-[var(--text-dark)] mb-2 md:mb-3'

const corePrinciples = [
  {
    title: 'Qi (Energy)',
    body: 'The life force that flows gently through your body',
    icon: Circle,
    iconWrap: 'bg-primary/75',
  },
  {
    title: 'Yin & Yang',
    body: 'Opposing forces working together to create balance',
    icon: Target,
    iconWrap: 'bg-secondary/75',
  },
  {
    title: 'Five Elements',
    body: 'Interconnected systems supporting your overall health',
    icon: Leaf,
    iconWrap: 'bg-accent/80',
  },
  {
    title: 'Meridians',
    body: 'Pathways that carry energy where your body needs it most',
    icon: Zap,
    iconWrap: 'bg-light-green/80',
  },
] as const

const treatmentMethods = [
  {
    id: 'acupuncture',
    icon: Zap,
    title: 'Acupuncture',
    description: 'Fine, gentle needles to support balance and ease discomfort',
    href: '/acupuncture/',
    ctaLabel: 'Learn more',
  },
  {
    id: 'cupping',
    icon: Heart,
    title: 'Cupping',
    description: 'Releases tension and improves circulation',
    href: '/bookings/',
    ctaLabel: 'Explore',
  },
  {
    id: 'moxibustion',
    icon: Brain,
    title: 'Moxibustion',
    description: 'Soothing warmth to relieve and restore',
    href: '/bookings/',
    ctaLabel: 'Discover',
  },
  {
    id: 'gua-sha',
    icon: Circle,
    title: 'Gua Sha',
    description: 'Encourages flow, reduces inflammation, and supports recovery',
    href: '/bookings/',
    ctaLabel: 'Explore',
  },
] as const

const diagnosisMethods: {
  title: string
  body: string
  icon: LucideIcon
}[] = [
  {
    title: 'Pulse Diagnosis',
    body: "Understanding how your body's systems are functioning",
    icon: Activity,
  },
  {
    title: 'Tongue Examination',
    body: 'Revealing internal balance and overall health',
    icon: Scan,
  },
  {
    title: 'Observation',
    body: 'Noticing subtle signs in your body and movement',
    icon: Eye,
  },
  {
    title: 'Listening & Conversation',
    body: 'Taking time to truly understand your experience',
    icon: MessageCircle,
  },
]

export default function ChineseMedicine() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Traditional Chinese Medicine"
        subtitle="Ancient wisdom meets modern wellness in our holistic approach to health"
        description="Discover the profound principles that have guided healing for over 3,000 years, offering a complete system of medicine that treats the whole person."
        backgroundImage="/chinese_medicine_herbs.jpeg"
        backgroundImageClassName="object-cover object-center"
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

      {/* Philosophy — editorial two-column, no cards */}
      <section className="bg-white py-10 md:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Healing Begins with Balance"
            subtitle="True wellbeing comes from harmony — within your body, your mind, and the world around you."
            titleClassName={sectionTitleClassName}
          />

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="mb-6 text-lg font-semibold tracking-tight text-[var(--text-dark)] md:text-xl">
                Core Principles
              </h3>
              <ul className="space-y-7 md:space-y-8">
                {corePrinciples.map(({ title, body, icon: Icon, iconWrap }) => (
                  <li key={title} className="flex items-start gap-3.5 md:gap-4">
                    <div
                      className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11 ${iconWrap}`}
                    >
                      <Icon
                        className="h-5 w-5 text-cream/90 md:h-6 md:w-6"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="mb-1.5 text-base font-semibold text-[var(--text-dark)] md:text-lg">
                        {title}
                      </h4>
                      <p className="text-base leading-[1.75] text-[var(--text-dark)]/70">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-6 text-lg font-semibold tracking-tight text-[var(--text-dark)] md:text-xl">
                Holistic Approach
              </h3>
              <div className="space-y-5 text-base leading-[1.8] text-[var(--text-dark)]/70 md:text-lg md:leading-[1.85]">
                <p>
                  We don&apos;t just treat symptoms — we listen, observe, and understand the whole you.
                </p>
                <blockquote className="border-l-[3px] border-gold pl-4 font-serif text-lg font-medium italic leading-relaxed text-[var(--text-dark)] md:pl-5 md:text-xl">
                  “Healing happens when the body, mind, and spirit are in balance.”
                </blockquote>
                <p>
                  This approach supports lasting wellbeing, helping your body restore itself naturally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Methods — minimalist divider rows */}
      <section className="bg-white py-10 md:py-14 lg:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Care Tailored to You"
            subtitle="Gentle, time-tested treatments designed to restore balance and support your natural healing"
            titleClassName={sectionTitleClassName}
          />

          <ul className="divide-y divide-accent/20 border-y border-accent/20">
            {treatmentMethods.map(({ id, icon: Icon, title, description, href, ctaLabel }) => (
              <li key={id} id={id} className="scroll-mt-24">
                <Link
                  href={href}
                  className="group flex flex-col gap-2 px-2 py-4 transition-colors duration-300 ease-out hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:flex-row md:items-center md:gap-6 md:px-3 md:py-5 lg:gap-8"
                >
                  <span className="flex min-w-0 items-center justify-between gap-3 md:w-48 md:shrink-0 md:justify-start lg:w-52">
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon
                        className="h-6 w-6 shrink-0 text-accent/65 transition-colors duration-300 ease-out group-hover:text-primary/80 md:h-7 md:w-7"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <span className="font-semibold text-[var(--text-dark)] transition-colors duration-300 ease-out group-hover:text-primary">
                        {title}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-primary transition-colors duration-300 ease-out group-hover:text-secondary md:hidden">
                      {ctaLabel}
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 text-base leading-relaxed text-[var(--text-dark)]/70">
                    {description}
                  </span>
                  <span className="hidden shrink-0 items-center gap-1 text-sm font-bold text-primary transition-colors duration-300 ease-out group-hover:text-secondary md:inline-flex">
                    {ctaLabel}
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                      aria-hidden
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Diagnostic Methods — 4 columns on white */}
      <section className="bg-white py-10 md:py-14 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Understanding You, Not Just Symptoms"
            subtitle="A thoughtful approach to uncovering the root cause of imbalance"
            titleClassName={sectionTitleClassName}
          />

          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-0">
            {diagnosisMethods.map(({ title, body, icon: Icon }, index) => (
              <div
                key={title}
                className={`border-b border-accent/15 pb-6 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0 lg:px-6 ${
                  index > 0 ? 'lg:border-l lg:border-accent/15' : ''
                } ${index === 0 ? 'lg:pl-0' : ''} ${
                  index === diagnosisMethods.length - 1 ? 'lg:pr-0' : ''
                }`}
              >
                <div className="mb-2 flex items-center gap-3 lg:mb-0 lg:block">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/[0.08] lg:mb-4">
                    <Icon className="h-5 w-5 text-accent/65" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-dark)] lg:mb-3 md:text-lg">
                    {title}
                  </h3>
                </div>
                <p className="text-base leading-[1.75] text-[var(--text-dark)]/70">{body}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-3xl px-2 text-center md:mt-16">
            <p className="mb-3 text-base font-[450] leading-relaxed text-[#2C3E35]/80 sm:mb-4">
              When you&apos;re ready, we&apos;re here to support you.
            </p>
            <h3 className="font-serif text-[clamp(1.15rem,4.2vw,2.25rem)] font-bold leading-snug text-[var(--text-dark)]">
              Begin Your Journey to Balance
            </h3>
            <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[var(--text-dark)]/70 sm:mt-3">
              A calm, personalised approach to restoring balance and supporting your wellbeing.
            </p>
            <div className="mt-5 flex justify-center sm:mt-6">
              <BookingCtaButton variant="gold" showArrow={false}>
                <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                Book a Consultation
              </BookingCtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Integrative Approach — glass green full section */}
      <section className={`${glassGreenBandClassName} py-8 md:py-10 lg:py-12`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="A More Complete Way to Heal"
            subtitle="Combining the best of traditional wisdom with modern medical understanding"
            titleClassName={sectionTitleClassName}
          />
          <p className="mx-auto mb-8 max-w-2xl text-center text-base font-[450] leading-[1.7] text-[#2C3E35] md:mb-10">
            Because true healing isn&apos;t just about symptoms — it&apos;s about how you feel, every
            day.
          </p>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-dark)] md:text-xl">
                Complementary Care
              </h3>
              <div className="space-y-4 text-base leading-[1.75] text-[var(--text-dark)]/70">
                <p>
                  Traditional Chinese Medicine works beautifully alongside conventional medical
                  treatments, often enhancing their effectiveness while reducing side effects and
                  supporting overall well-being.
                </p>
                <p>
                  We collaborate with your healthcare team to ensure coordinated care that addresses
                  all aspects of your health journey, from acute conditions to long-term wellness
                  maintenance.
                </p>
                <p>
                  Many patients find that TCM helps them achieve better results from conventional
                  treatments while providing additional tools for managing stress, pain, and other
                  health challenges.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-accent/15 bg-white p-4 shadow-sm transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/30 hover:shadow-[0_14px_32px_rgba(27,59,43,0.12)] motion-safe:md:hover:-translate-y-1.5 md:p-8">
              <h3 className="mb-3 text-lg font-semibold text-[var(--text-dark)] md:mb-4 md:text-xl">
                Evidence-Based Practice
              </h3>
              <div className="space-y-3 text-base leading-[1.75] text-[var(--text-dark)]/70 md:space-y-4">
                <p>
                  While respecting traditional knowledge, we stay current with modern research on TCM
                  practices, ensuring our treatments meet both traditional standards and contemporary
                  safety protocols.
                </p>
                <p>
                  We use sterile, single-use needles, maintain the highest hygiene standards, and
                  continuously update our knowledge through ongoing education and professional
                  development.
                </p>
                <div className="pt-4">
                  <Link
                    href="/about/"
                    className="group inline-flex items-center gap-1.5 font-medium text-accent transition-colors duration-300 ease-out hover:text-primary"
                  >
                    Learn Who Will Be Supporting You
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                      aria-hidden
                    />
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
