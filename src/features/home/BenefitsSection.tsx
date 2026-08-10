'use client'

import Link from 'next/link'
import { Zap, Brain, Activity, Heart, ArrowRight } from 'lucide-react'
import { FeatureCard } from '../ui/FeatureCard'
import { SectionHeading } from '../ui/SectionHeading'
import { sectionGreenCtaClassName } from '../ui/CTAButton'

const benefits = [
  {
    icon: Zap,
    title: 'Pain relief',
    description:
      'Ease chronic pain, tension, and headaches by treating the root imbalance — not only the symptom.',
  },
  {
    icon: Brain,
    title: 'Mind & nervous system',
    description:
      'Support deep relaxation and steadier moods as your nervous system finds its natural balance.',
  },
  {
    icon: Activity,
    title: 'Restorative sleep',
    description:
      'Encourage healthier sleep patterns so your body can recover and restore overnight.',
  },
  {
    icon: Heart,
    title: 'Whole-body vitality',
    description:
      'Nourish digestion, immunity, and hormonal balance so everyday energy feels more like your own.',
  },
] as const

export function BenefitsSection() {
  return (
    <section className="bg-white py-12 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why acupuncture works"
          subtitle="Gentle needles, lasting change — supporting your body’s own capacity to heal"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
          className="text-center mb-5 md:mb-6 lg:mb-8"
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-6 lg:gap-8 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              compact
              elevated
              softIcon
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              gradientFrom="from-primary/10"
              gradientTo="to-accent/10"
            />
          ))}
        </div>

        <div className="mt-8 flex w-full justify-center md:mt-10">
          <Link href="/acupuncture/" className={sectionGreenCtaClassName}>
            Learn more about acupuncture
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
