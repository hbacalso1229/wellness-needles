'use client'

import Link from 'next/link'
import { Zap, Brain, Activity, Heart, ArrowRight } from 'lucide-react'
import { FeatureCard } from '../ui/FeatureCard'
import { SectionHeading } from '../ui/SectionHeading'

const benefits = [
  {
    icon: Zap,
    title: 'Pain relief',
    description:
      'Ease chronic pain, tension, and headaches by treating the root imbalance — not only the symptom.',
  },
  {
    icon: Brain,
    title: 'Calm for mind and nerves',
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
    <section className="py-12 md:py-16 lg:py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why acupuncture works"
          subtitle="Gentle needles, lasting change — supporting your body’s own capacity to heal"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 md:gap-6 lg:gap-8">
          {benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              compact
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              gradientFrom="from-primary/10"
              gradientTo="to-accent/10"
            />
          ))}
        </div>

        <p className="mt-8 flex justify-center md:mt-12">
          <Link
            href="/acupuncture/"
            className="inline-flex w-full max-w-sm min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:border-primary/50 hover:bg-accent/10 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-h-0 sm:py-2.5"
          >
            Learn more about acupuncture
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  )
}
