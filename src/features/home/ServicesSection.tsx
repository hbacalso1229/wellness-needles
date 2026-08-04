'use client'

import Link from 'next/link'
import { Leaf, Flame, CircleDot, Hand, ArrowRight } from 'lucide-react'
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

        <p className="mt-8 flex justify-center md:mt-12">
          <Link
            href="/chinese-medicine/"
            className="inline-flex w-full max-w-sm min-h-11 items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:border-primary/50 hover:bg-accent/10 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-h-0 sm:py-2.5"
          >
            Explore Chinese medicine
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </p>
      </div>
    </section>
  )
}
