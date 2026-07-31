'use client'

import Link from 'next/link'
import { Zap, Brain, Activity, Heart } from 'lucide-react'
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
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why acupuncture works"
          subtitle="Gentle needles, lasting change — supporting your body’s own capacity to heal"
          titleClassName="font-serif text-4xl md:text-5xl font-bold text-primary mb-3"
          className="text-center"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
          {benefits.map((benefit) => (
            <FeatureCard
              key={benefit.title}
              icon={benefit.icon}
              title={benefit.title}
              description={benefit.description}
              gradientFrom="from-primary/10"
              gradientTo="to-accent/10"
            />
          ))}
        </div>

        <p className="mt-10 text-center">
          <Link
            href="/acupuncture"
            className="text-primary font-medium underline underline-offset-4 decoration-gold/60 hover:decoration-gold transition-colors"
          >
            Learn more about acupuncture
          </Link>
        </p>
      </div>
    </section>
  )
}
