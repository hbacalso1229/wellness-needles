'use client'

import Link from 'next/link'
import { Leaf, Flame, CircleDot, Hand } from 'lucide-react'
import { FeatureCard } from '../ui/FeatureCard'
import { SectionHeading } from '../ui/SectionHeading'

const services = [
  {
    icon: Leaf,
    title: 'Acupuncture',
    description:
      'Fine needles at precise points to regulate Qi, ease discomfort, and restore flow throughout the body.',
  },
  {
    icon: CircleDot,
    title: 'Cupping therapy',
    description:
      'Gentle suction to improve circulation, release tight muscles, and reduce lingering inflammation.',
  },
  {
    icon: Flame,
    title: 'Moxibustion',
    description:
      'Warm mugwort therapy that comforts cold patterns and strengthens your body’s Yang energy.',
  },
  {
    icon: Hand,
    title: 'Gua Sha',
    description:
      'A soft scraping technique that encourages circulation, eases stagnation, and supports recovery.',
  },
] as const

export function ServicesSection() {
  return (
    <section className="py-12 md:py-16 lg:py-20 bg-accent/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How we can help"
          subtitle="Traditional Chinese medicine therapies chosen for your unique needs"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-6 max-w-4xl mx-auto">
          {services.map((service) => (
            <FeatureCard
              key={service.title}
              compact
              elevated
              icon={service.icon}
              title={service.title}
              description={service.description}
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
          ))}
        </div>

        <p className="mt-8 md:mt-10 text-center">
          <Link
            href="/chinese-medicine"
            className="text-primary font-medium underline underline-offset-4 decoration-gold/60 hover:decoration-gold transition-colors"
          >
            Explore Chinese medicine
          </Link>
        </p>
      </div>
    </section>
  )
}
