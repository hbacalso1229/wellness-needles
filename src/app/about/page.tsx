'use client'

import { useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import {
  Heart,
  Award,
  Target,
  Clock,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  BadgeCheck,
  GraduationCap,
  School,
  type LucideIcon,
} from 'lucide-react'
import {
  PulsingLeaf,
  FeatureCard,
  HeroSection,
  SectionHeading,
  SnapCarousel,
  snapSlidePeekClassName,
  snapTrackGridSmClassName,
  glassGreenBandClassName,
} from '../../features'
import { BookingSection } from '../../features/home/BookingSection'
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

const credentials: { label: string; icon: LucideIcon }[] = [
  { label: 'Registered Acupuncturist', icon: BadgeCheck },
  { label: 'Master’s in Acupuncture', icon: GraduationCap },
  { label: 'CNM Dublin Graduate', icon: School },
]

const carePillars: {
  title: string
  body: string
  icon: LucideIcon
  iconBg: string
}[] = [
  {
    title: 'Our Mission',
    body: 'To restore balance and promote healing through authentic traditional Chinese medicine',
    icon: Target,
    iconBg: 'bg-primary',
  },
  {
    title: 'Our Vision',
    body: 'A community where holistic wellness is accessible to all who seek healing',
    icon: Heart,
    iconBg: 'bg-secondary',
  },
  {
    title: 'Our Values',
    body: 'Authenticity, compassion, and dedication to the highest standards of care',
    icon: Shield,
    iconBg: 'bg-accent',
  },
]

const bioSections = [
  {
    heading: 'My Journey',
    body: 'My name is Arkinth Garcia, and I am a qualified Naturopath and Acupuncturist. I completed my training at the College of Naturopathic Medicine in Dublin, where I first studied Biomedicine to build a strong foundation in anatomy, physiology, and pathology before specialising in acupuncture and naturopathy. I later undertook advanced postgraduate training, achieving Master’s-level training in Acupuncture.',
  },
  {
    heading: 'Why I Practice Acupuncture',
    body: 'My journey into this field began with my own personal health challenge. I struggled with alopecia, and after trying many approaches without success, it was acupuncture that finally brought real healing and balance to my body. This powerful experience inspired me to dedicate my career to understanding how and why acupuncture works, and more importantly, how it can transform the lives of others.',
  },
  {
    heading: 'My Approach to Care',
    body: 'Today, I combine my knowledge of acupuncture and naturopathic medicine to help people restore balance, improve their wellbeing, and address the root causes of their health concerns. My approach is holistic, compassionate, and tailored to each person’s unique needs—whether you are looking for relief from a specific condition, support for stress and fatigue, or guidance on lifestyle changes that promote long-term health.',
  },
  {
    heading: 'How I Can Help',
    body: 'If you are ready to take the next step towards better health and balance, I would be honored to support you on your journey. I treat pain management, mental health conditions, digestive issues, fertility, and more.',
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
      className="max-h-10 w-auto max-w-[7.5rem] object-contain md:max-h-14 md:max-w-[10rem]"
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
        title="Meet the care behind Wellness Needles"
        subtitle="Personalised acupuncture & naturopathic care focused on root causes and lasting wellbeing."
        backgroundImage="/hero_wellness_acupuncture.jpeg"
        backgroundOverlayClassName="bg-gradient-to-b from-black/60 via-primary/40 to-black/60"
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

      {/* Mobile page intro — hero is xl-only; header Book is the fold CTA */}
      <section className="bg-white px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 xl:hidden">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-2xl font-bold leading-tight text-[var(--text-dark)] sm:text-4xl">
            Meet Your Practitioner
          </h1>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[var(--text-dark)]/70 sm:mt-2.5 sm:text-lg">
            Personalised acupuncture & naturopathic care focused on root causes and lasting
            wellbeing.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="bg-white pb-5 pt-3 sm:pb-8 sm:pt-4 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top row: Practitioner (left) + Mission/Vision (right) */}
          <div className="mb-8 grid grid-cols-1 items-stretch gap-4 md:mb-12 md:gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Your Practitioner tile — decorated card on all breakpoints */}
            <div className="card-emboss relative flex flex-col justify-center overflow-hidden rounded-xl border border-accent/20 bg-cream p-3.5 text-center shadow-md md:bg-secondary/5 md:p-8">
              <div className="absolute left-0 top-0 h-16 w-16 -translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-gold/10 to-accent/10" />
              <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-12 translate-y-12 rounded-full bg-gradient-to-br from-primary/5 to-secondary/5" />

              <div className="relative z-10">
                <p className="mb-3 hidden text-xs font-semibold uppercase tracking-wide text-secondary md:mb-4 md:block">
                  Your Practitioner
                </p>
                <div className="group relative mb-3 inline-block md:mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-accent/20 blur-md" />
                  <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-[#faf9f7] bg-accent shadow-xl md:h-40 md:w-40">
                    <NextImage
                      src="/Arkinth_clinic_founder.jpeg"
                      alt="Arkinth Garcia - Naturopath & Acupuncturist"
                      width={160}
                      height={160}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 animate-pulse rounded-full border-2 border-gold/30" />
                  <div className="absolute -right-1 -top-1 z-20">
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

                <h3 className="mb-1 font-serif text-lg font-semibold text-[var(--text-dark)] md:text-xl">
                  Arkinth Garcia
                </h3>
                <p className="mb-2 text-base text-secondary">Naturopath &amp; Acupuncturist</p>
                <p className="mb-3 text-base text-secondary">
                  Helping patients restore balance and feel better
                  <br />
                  every day.
                </p>

                <ul className="flex flex-wrap justify-center gap-1.5">
                  {credentials.map(({ label, icon: Icon }) => (
                    <li
                      key={label}
                      className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-white px-2.5 py-1 text-[11px] font-medium text-primary"
                    >
                      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
                      {label}
                    </li>
                  ))}
                </ul>

                {/* Mission / Vision / Values — inside card on mobile only */}
                <div className="mt-5 border-t border-dashed border-accent/35 pt-1 text-left md:hidden">
                  {carePillars.map(({ title, body, icon: Icon, iconBg }) => (
                    <div key={title} className="flex items-center gap-3 py-4">
                      <div className={`shrink-0 rounded-full p-2.5 ${iconBg}`}>
                        <Icon className="h-5 w-5 text-cream" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-[var(--text-dark)]">{title}</h3>
                        <p className="text-base leading-[1.7] text-[var(--text-dark)]/70">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mission / Vision / Values — side column from md up */}
            <div className="hidden rounded-lg bg-white p-3.5 md:block md:p-8">
              <div className="space-y-4 md:space-y-6">
                {carePillars.map(({ title, body, icon: Icon, iconBg }) => (
                  <div key={title} className="flex items-center gap-3 md:gap-4">
                    <div className={`shrink-0 rounded-full p-2.5 md:p-3 ${iconBg}`}>
                      <Icon className="h-5 w-5 text-cream md:h-6 md:w-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[var(--text-dark)] md:text-lg">
                        {title}
                      </h3>
                      <p className="text-base leading-[1.7] text-[var(--text-dark)]/70">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* About Arkinth Garcia — full width below tiles */}
          <div>
            <h2 className="mb-4 font-serif text-2xl font-bold text-[var(--text-dark)] sm:text-3xl md:mb-6 md:text-4xl">
              About Arkinth Garcia
            </h2>
            <div className="space-y-5 md:space-y-8">
              {bioSections.map((section) => (
                <div key={section.heading}>
                  <h3 className="mb-2 font-serif text-lg font-semibold text-[var(--text-dark)] md:text-xl">
                    {section.heading}
                  </h3>
                  <p className="text-base leading-[1.7] text-[var(--text-dark)]/70">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-5 sm:py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Feel the Difference in Your Care"
            subtitle="Thoughtful care, rooted in tradition and guided by experience"
          />

          <SnapCarousel
            slideCount={3}
            ariaLabel="Reasons patients feel cared for"
            trackClassName={snapTrackGridSmClassName}
            hideDotsFrom="sm"
          >
            <div className={`${snapSlidePeekClassName} h-full`}>
              <FeatureCard
                compact
                elevated
                softIcon
                icon={Award}
                title="You're in Safe Hands"
                description="Experienced, qualified care you can trust at every step"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
                className="!shadow-[0_3px_14px_rgba(27,59,43,0.04)]"
              />
            </div>

            <div className={`${snapSlidePeekClassName} h-full`}>
              <FeatureCard
                compact
                elevated
                softIcon
                icon={Clock}
                title="Care That Fits Your Life"
                description="Appointments designed to work gently around your routine"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
                className="!shadow-[0_3px_14px_rgba(27,59,43,0.04)]"
              />
            </div>

            <div className={`${snapSlidePeekClassName} h-full`}>
              <FeatureCard
                compact
                elevated
                softIcon
                icon={Heart}
                title="Truly Personal Treatment"
                description="Every session tailored to you, your body, and your journey"
                gradientFrom="from-accent/10"
                gradientTo="to-accent/10"
                className="!shadow-[0_3px_14px_rgba(27,59,43,0.04)]"
              />
            </div>
          </SnapCarousel>
        </div>
      </section>

      <BookingSection
        title="Care That Listens"
        description="Meet a practitioner who listens first, understands the whole person, and takes the time to find the right path forward with you."
        ctaLabel="Book a Consultation"
        leading={
          <blockquote
            aria-label="Patient review"
            className="flex h-full flex-col rounded-2xl border border-accent/20 bg-accent/10 px-5 py-5 text-left shadow-[0_3px_14px_rgba(27,59,43,0.05)] md:px-6 md:py-6"
          >
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <cite className="not-italic text-sm font-semibold text-[var(--text-dark)] md:text-base">
                  Pavlo Nikulin
                </cite>
                <span
                  className="inline-flex items-center gap-0.5 text-gold"
                  aria-label="5 out of 5 stars"
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                  ))}
                </span>
              </div>
              <span className="mt-2 inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-secondary">
                Lower back pain
              </span>
              <p className="mt-2 inline-flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-secondary md:text-xs">
                <time dateTime="2026-07-22">22 July 2026</time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 shrink-0 text-accent md:h-3.5 md:w-3.5" aria-hidden />
                  Verified Google review
                </span>
              </p>
            </div>

            <p className="font-serif text-base font-medium italic leading-relaxed text-[var(--text-dark)]">
              “I&apos;d been struggling with lower back pain for so long, and after just two sessions,
              I finally felt relief again.”
            </p>

            <p className="mt-auto pt-4">
              <Link
                href="/testimonials/"
                className="inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 transition-[gap,color] duration-300 ease-out hover:gap-1.5 hover:text-secondary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Read More Patient Stories
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </p>
          </blockquote>
        }
      />

      {/* Insurance */}
      <section className={`${glassGreenBandClassName} py-5 sm:py-8 md:py-10 lg:py-12`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Insurance"
            titleClassName="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
            className="mb-3 text-center md:mb-4"
          />
          <div className="mx-auto max-w-3xl space-y-2 text-center text-base leading-[1.7] text-[var(--text-dark)]/70 md:space-y-3">
            <p>We are a registered professional acupuncture clinic</p>
            <p>
              You may be able to claim acupuncture treatment through your health insurance,
              depending on your provider and level of cover.
            </p>
            <p>
              Please check with your insurer before your appointment. We will provide a receipt for
              your claim after treatment.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl border-t border-accent/20 pt-8 md:mt-10 md:pt-10">
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-8 sm:gap-y-5 md:gap-x-12 md:gap-y-6">
              {insurers.map((insurer) => (
                <li key={insurer.slug}>
                  <a
                    href={insurer.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${insurer.name} website (opens in a new tab)`}
                    className="inline-flex items-center justify-center opacity-90 transition-opacity duration-200 motion-safe:hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <InsurerLogo name={insurer.name} logo={insurer.logo} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
