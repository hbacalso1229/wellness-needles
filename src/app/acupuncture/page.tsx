'use client'

import {
  Brain,
  BrainCircuit,
  Shield,
  Check,
  Flower2,
  Leaf,
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  HeartHandshake,
  ArrowRight,
  Activity,
  Venus,
  Apple,
  Wind,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  HeroSection,
  SectionHeading,
  glassGreenBandClassName,
} from '../../features'
import { BookingSection } from '../../features/home/BookingSection'

const howItWorksPerspectives: {
  badge: string
  title: string
  lead: string
  takeaways: { label: string; detail: string }[]
  icon: LucideIcon
}[] = [
  {
    badge: 'Traditional',
    title: 'Traditional Chinese Medicine Perspective',
    lead:
      'Acupuncture regulates the flow of Qi (pronounced "chee") — the vital energy that moves through meridians in the body.',
    takeaways: [
      { label: 'Qi flow', detail: 'energy moves through meridians' },
      { label: 'Blockage', detail: 'causes pain or illness when Qi stalls' },
      { label: 'Acupuncture', detail: 'restores balance with fine needles' },
    ],
    icon: Leaf,
  },
  {
    badge: 'Scientific',
    title: 'Modern Scientific Understanding',
    lead:
      'Research shows acupuncture stimulates the nervous system, releasing endorphins and affecting neurotransmitter levels.',
    takeaways: [
      { label: 'Nervous system', detail: 'needles stimulate sensory pathways' },
      { label: 'Endorphins', detail: 'natural pain relief and calm' },
      { label: 'Evidence', detail: 'MRI changes and WHO recognition' },
    ],
    icon: BrainCircuit,
  },
]

const authorityBadges = ['WHO', 'Meta-analyses', 'NIH'] as const

const evidencePoints: {
  title: string
  description: string
  icon: LucideIcon
  iconTone: string
  iconBg: string
}[] = [
  {
    title: '43+ conditions',
    description: 'WHO recognizes acupuncture for treating 43+ conditions',
    icon: BadgeCheck,
    iconTone: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    title: 'Chronic pain',
    description: 'Meta-analyses show significant benefits for chronic pain',
    icon: BookOpen,
    iconTone: 'text-[#3D6B4F]',
    iconBg: 'bg-[#3D6B4F]/10',
  },
  {
    title: 'Low risk',
    description: 'Low risk of adverse effects; no drug interactions',
    icon: Shield,
    iconTone: 'text-accent',
    iconBg: 'bg-accent/15',
  },
  {
    title: 'Compatible',
    description: 'Safe alongside conventional medical treatments',
    icon: HeartHandshake,
    iconTone: 'text-[#5A8F6A]',
    iconBg: 'bg-[#5A8F6A]/12',
  },
]

const CONDITION_PREVIEW = 3

const heroBenefits = [
  'Relieves chronic pain naturally',
  'Reduces stress and anxiety',
  'Improves sleep quality',
  'Supports hormonal balance',
] as const

type ConditionAccent = {
  icon: string
  iconBg: string
  border: string
  hoverBorder: string
  bar: string
  surface: string
  more: string
}

const conditions: {
  title: string
  blurb: string
  items: string[]
  icon: LucideIcon
  accent: ConditionAccent
}[] = [
  {
    title: 'Pain Management',
    blurb: 'Relieve chronic discomfort and restore mobility',
    icon: Activity,
    accent: {
      icon: 'text-[#8B5E4B]',
      iconBg: 'bg-[#8B5E4B]/10',
      border: 'border-[#D4B8A8]/55',
      hoverBorder: 'hover:border-[#C4A090]/80',
      bar: 'bg-[#A67C68]/45',
      surface: 'bg-gradient-to-br from-[#FBF7F4] via-white to-[#F5EDE8]/70',
      more: 'text-[#8B5E4B]',
    },
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
    blurb: 'Support emotional balance and better sleep',
    icon: Brain,
    accent: {
      icon: 'text-[#6F697A]',
      iconBg: 'bg-[#6F697A]/10',
      border: 'border-[#C9C4CF]/55',
      hoverBorder: 'hover:border-[#B8B2BF]/80',
      bar: 'bg-[#8A8494]/40',
      surface: 'bg-gradient-to-br from-[#F7F6F8] via-white to-[#EEEBF1]/70',
      more: 'text-[#6F697A]',
    },
    items: ['Anxiety and stress', 'Depression', 'Insomnia', 'PTSD', 'Addiction recovery'],
  },
  {
    title: "Women's Health",
    blurb: 'Nurture hormonal balance through every stage',
    icon: Venus,
    accent: {
      icon: 'text-[#9A6B78]',
      iconBg: 'bg-[#9A6B78]/10',
      border: 'border-[#D4B8C0]/55',
      hoverBorder: 'hover:border-[#C4A8B2]/80',
      bar: 'bg-[#B88996]/40',
      surface: 'bg-gradient-to-br from-[#F9F5F6] via-white to-[#F2E9EC]/70',
      more: 'text-[#9A6B78]',
    },
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
    blurb: 'Ease gut discomfort and support digestion',
    icon: Apple,
    accent: {
      icon: 'text-[#8F7A55]',
      iconBg: 'bg-[#8F7A55]/10',
      border: 'border-[#D4C6A8]/55',
      hoverBorder: 'hover:border-[#C4B698]/80',
      bar: 'bg-[#A8906E]/45',
      surface: 'bg-gradient-to-br from-[#F9F6F0] via-white to-[#F3EEE4]/70',
      more: 'text-[#8F7A55]',
    },
    items: ['IBS', 'Acid reflux', 'Bloating', 'Constipation', 'Nausea'],
  },
  {
    title: 'Respiratory',
    blurb: 'Breathe easier and calm irritated airways',
    icon: Wind,
    accent: {
      icon: 'text-[#4F7A72]',
      iconBg: 'bg-[#4F7A72]/10',
      border: 'border-[#A8C9C2]/50',
      hoverBorder: 'hover:border-[#92B8B0]/75',
      bar: 'bg-[#5F8A82]/40',
      surface: 'bg-gradient-to-br from-[#F3F8F6] via-white to-[#E8F2EF]/70',
      more: 'text-[#4F7A72]',
    },
    items: ['Asthma', 'Allergies', 'Sinusitis', 'Chronic cough', 'Bronchitis'],
  },
  {
    title: 'General Wellness',
    blurb: 'Build resilience and lasting vitality',
    icon: Flower2,
    accent: {
      icon: 'text-primary',
      iconBg: 'bg-accent/12',
      border: 'border-accent/20',
      hoverBorder: 'hover:border-primary/30',
      bar: 'bg-accent/50',
      surface: 'bg-gradient-to-br from-[#F1F8F4] via-white to-[#E8F3EC]/70',
      more: 'text-primary',
    },
    items: [
      'Immune support',
      'Energy enhancement',
      'Anti-aging',
      'Weight management',
      'Preventive care',
    ],
  },
]

function ConditionCard({
  title,
  blurb,
  items,
  icon: Icon,
  accent,
}: (typeof conditions)[number]) {
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = Math.max(0, items.length - CONDITION_PREVIEW)
  // Mobile: chevron shows all items. md+: preview-3 until "+N more".
  const visibleItems = expanded ? items : items.slice(0, CONDITION_PREVIEW)

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 shadow-[0_3px_16px_rgba(27,59,43,0.04)] transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${accent.surface} ${accent.border} ${accent.hoverBorder} hover:shadow-[0_10px_28px_rgba(27,59,43,0.08)] motion-safe:md:hover:-translate-y-1.5 md:p-6`}
    >
      <div className={`absolute inset-x-0 top-0 h-px ${accent.bar}`} aria-hidden />

      <button
        type="button"
        className="flex w-full items-start gap-3 text-left md:pointer-events-none md:block"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${accent.iconBg} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-105`}
        >
          <Icon className={`h-5 w-5 ${accent.icon}`} strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1 md:mt-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold leading-snug text-[var(--text-dark)] md:text-xl">
              {title}
            </h3>
            <ChevronDown
              className={`mt-1 h-4 w-4 shrink-0 text-[var(--text-dark)]/40 transition-transform duration-300 md:hidden ${
                expanded ? 'rotate-180' : ''
              }`}
              aria-hidden
            />
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-dark)]/65 md:text-base">
            {blurb}
          </p>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out md:grid-rows-[1fr] ${
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr] md:grid-rows-[1fr]'
        }`}
      >
        <div className="overflow-hidden">
          <ul className="mt-4 space-y-1.5 text-base leading-relaxed text-[var(--text-dark)]/70">
            {visibleItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent.icon}`} strokeWidth={2.5} aria-hidden />
                <span className="min-w-0">{item}</span>
              </li>
            ))}
          </ul>

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className={`mt-3 hidden items-center gap-1 text-sm font-semibold underline-offset-4 transition-colors hover:underline md:inline-flex ${accent.more}`}
            >
              {expanded ? 'Show less' : `+${hiddenCount} more`}
              <ArrowRight
                className={`h-3.5 w-3.5 transition-transform duration-300 ${
                  expanded ? 'rotate-90' : ''
                }`}
                aria-hidden
              />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function HowItWorksColumn({
  badge,
  title,
  lead,
  takeaways,
  icon: Icon,
  index,
}: (typeof howItWorksPerspectives)[number] & { index: number }) {
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduceMotion) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.28 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className={`group rounded-2xl border border-transparent px-4 py-5 transition-[transform,box-shadow,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:md:hover:-translate-y-1.5 motion-safe:md:hover:border-accent/15 motion-safe:md:hover:bg-[#F7FAF8]/80 motion-safe:md:hover:shadow-[0_12px_28px_rgba(27,59,43,0.08)] sm:px-5 md:px-7 md:py-6 ${
        index === 0 ? 'lg:pr-10' : 'lg:pl-10'
      }`}
    >
      <div className="mb-3.5 flex flex-wrap items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/12 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-105">
          <Icon className="h-6 w-6 text-accent" strokeWidth={1.6} aria-hidden />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
          {badge}
        </span>
      </div>

      <h3 className="mb-2.5 max-w-sm text-lg font-semibold leading-snug text-[var(--text-dark)] md:text-xl">
        {title}
      </h3>
      <p className="mb-5 max-w-md text-base font-[450] leading-[1.7] text-[#2C3E35]">{lead}</p>

      <ul className="max-w-md space-y-3 text-left text-base leading-[1.65] text-[var(--text-dark)]/70">
        {takeaways.map(({ label, detail }, i) => (
          <li
            key={label}
            className={`flex items-start gap-2.5 transition-[opacity,transform] duration-500 ease-out motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
              visible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-2 opacity-0'
            }`}
            style={{ transitionDelay: visible ? `${120 + i * 90}ms` : '0ms' }}
          >
            <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent/60" aria-hidden />
            <span className="min-w-0">
              <span className="font-semibold text-[var(--text-dark)]">{label}</span>
              <span className="text-[var(--text-dark)]/50"> — </span>
              {detail}
            </span>
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Acupuncture() {
  return (
    <div className="min-h-screen">
      <HeroSection
        title="Relieve pain. Restore balance."
        subtitle="Gentle care for pain, stress, sleep, and balance — rooted in tradition, supported by modern practice."
        backgroundImage="/acupuncture_facial_treatment.jpeg"
        backgroundImageClassName="object-cover object-[55%_52%]"
        backgroundOverlayClassName="bg-gradient-to-b from-black/60 via-primary/40 to-black/60"
        backgroundClass="bg-secondary"
        textColor="text-cream"
        showFloatingLeaves={true}
      >
        <ul className="mx-auto mt-2 flex max-w-xl list-none flex-col gap-2.5 text-left text-base sm:mt-3 sm:gap-3 sm:text-lg">
          {heroBenefits.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5">
              <Check
                className="mt-0.5 h-5 w-5 shrink-0 text-gold"
                aria-hidden
                strokeWidth={2.5}
              />
              <span className="leading-snug text-cream/95">{benefit}</span>
            </li>
          ))}
        </ul>
      </HeroSection>

      {/* Mobile page intro — hero is xl-only; header Book is the fold CTA */}
      <section className="bg-white px-4 pb-8 pt-5 sm:px-6 sm:pb-10 sm:pt-6 xl:hidden">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-3xl font-bold leading-tight text-[var(--text-dark)] sm:text-4xl">
            Relieve pain. Restore balance.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--text-dark)]/70 sm:mt-4 sm:text-lg">
            Gentle care for pain, stress, sleep, and balance — rooted in tradition, supported by
            modern practice.
          </p>
          <ul className="mx-auto mt-5 flex max-w-sm list-none flex-col gap-2.5 text-left text-base sm:mt-6">
            {heroBenefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden
                  strokeWidth={2.5}
                />
                <span className="leading-snug text-[var(--text-dark)]/85">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How It Works — editorial 2-col */}
      <section className="bg-white pb-5 pt-6 sm:pb-8 sm:pt-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="How Acupuncture Restores Balance"
            subtitle="Acupuncture works by stimulating specific points on the body to restore the natural flow of energy and promote healing"
          />
          <p className="mx-auto mb-8 hidden max-w-xl text-center text-base font-[450] leading-[1.7] text-[#2C3E35] sm:block md:mb-10">
            Whether you&apos;re seeking pain relief or overall wellness, acupuncture offers a natural
            path to balance.
          </p>

          <div className="relative grid grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-2 lg:gap-0">
            {/* Intentional vertical divider — soft gold fade */}
            <div
              className="pointer-events-none absolute inset-y-3 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-gold/55 to-transparent lg:block"
              aria-hidden
            />

            {howItWorksPerspectives.map((perspective, index) => (
              <HowItWorksColumn
                key={perspective.title}
                {...perspective}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Conditions — interactive category cards */}
      <section id="conditions-we-treat" className="scroll-mt-24 bg-white py-5 sm:py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Conditions We Treat"
            subtitle="Personalised care for the conditions that matter most to you"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {conditions.map((condition) => (
              <ConditionCard key={condition.title} {...condition} />
            ))}
          </div>

        </div>
      </section>

      <BookingSection
        title="Not sure where to start?"
        description="Let the practitioner support you on your journey to better health and balance."
        ctaLabel="Book your first session"
      />

      {/* Scientific Evidence — open proof on glass */}
      <section className={`${glassGreenBandClassName} py-5 sm:py-8 md:py-10 lg:py-12`}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Evidence You Can Trust"
            titleClassName="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
            className="mb-3 text-center md:mb-4"
          />

          <div className="space-y-2 text-left text-base leading-relaxed text-[var(--text-dark)]/70 md:space-y-3 md:text-center">
            <p>Modern research validates what traditional practitioners have known for millennia</p>
            <p className="hidden sm:block">
              Acupuncture is supported by thousands of published studies, recognized by the WHO for
              dozens of conditions, and backed by NIH guidance for pain care — with a strong safety
              profile when delivered by trained practitioners.
            </p>
          </div>

          <p
            className="mt-4 text-center text-sm font-medium tracking-wide text-primary md:mt-5"
            aria-label="Evidence sources"
          >
            {authorityBadges.map((label, index) => (
              <span key={label}>
                {index > 0 ? (
                  <span className="mx-2 text-[var(--text-dark)]/30" aria-hidden>
                    ·
                  </span>
                ) : null}
                {label}
              </span>
            ))}
          </p>

          {/* Mobile: flat list */}
          <ul className="mt-5 space-y-3 sm:hidden">
            {evidencePoints.map(({ title, description, icon: Icon, iconTone, iconBg }) => (
              <li key={title} className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${iconTone}`} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold leading-snug text-[var(--text-dark)]">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-dark)]/70">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* sm+: card grid */}
          <div className="mt-6 hidden grid-cols-1 gap-3 sm:mt-8 sm:grid sm:grid-cols-2 md:grid-cols-4 md:gap-3 lg:gap-4">
            {evidencePoints.map(({ title, description, icon: Icon, iconTone, iconBg }) => (
              <article
                key={title}
                className="group flex items-start gap-3 rounded-xl border border-accent/15 bg-white p-4 shadow-[0_4px_14px_rgba(27,59,43,0.05)] transition-[transform,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/35 hover:shadow-[0_16px_36px_rgba(27,59,43,0.14)] motion-safe:md:hover:-translate-y-1 md:flex-col md:gap-3 md:p-4 lg:p-5"
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg} transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:group-hover:scale-105`}
                >
                  <Icon className={`h-5 w-5 ${iconTone}`} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-1 text-base font-semibold leading-snug text-[var(--text-dark)] md:text-lg">
                    {title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[var(--text-dark)]/70 md:text-base">
                    {description}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-primary md:mt-8">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden />
            Evidence-based. Safe. Gentle.
          </p>
        </div>
      </section>
    </div>
  )
}
