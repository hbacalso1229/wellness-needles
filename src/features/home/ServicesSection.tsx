'use client'

import Link from 'next/link'
import { Leaf, Flame, CircleDot, Hand, ArrowRight } from 'lucide-react'
import { FeatureCard } from '../ui/FeatureCard'
import { SectionHeading } from '../ui/SectionHeading'
import { sectionGreenCtaClassName, glassGreenBandClassName } from '../ui/CTAButton'

const services = [
  {
    icon: Leaf,
    title: 'Acupuncture',
    description:
      'Fine needles at precise points to regulate Qi, ease discomfort, and restore flow throughout the body.',
    href: '/acupuncture/',
  },
  {
    icon: CircleDot,
    title: 'Cupping therapy',
    description:
      'Gentle suction to improve circulation, release tight muscles, and reduce lingering inflammation.',
    href: '/chinese-medicine/#cupping',
  },
  {
    icon: Flame,
    title: 'Moxibustion',
    description:
      'Warm mugwort therapy that comforts cold patterns and strengthens your body’s Yang energy.',
    href: '/chinese-medicine/#moxibustion',
  },
  {
    icon: Hand,
    title: 'Gua Sha',
    description:
      'Soft scraping that encourages circulation, eases stagnation, and supports recovery.',
    href: '/chinese-medicine/#gua-sha',
  },
] as const

export function ServicesSection() {
  return (
    <section className={`${glassGreenBandClassName} py-12 md:py-14`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="How we can help"
          subtitle="Traditional Chinese medicine therapies chosen for your unique needs"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
          className="text-center mb-5 md:mb-6 lg:mb-8"
        />

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:gap-6 lg:gap-8 xl:grid-cols-4">
          {services.map((service) => (
            <FeatureCard
              key={service.title}
              compact
              elevated
              href={service.href}
              icon={service.icon}
              title={service.title}
              description={service.description}
              gradientFrom="from-primary/10"
              gradientTo="to-primary/10"
            />
          ))}
        </div>

        <div className="mt-8 flex w-full justify-center md:mt-10">
          <Link href="/chinese-medicine/" className={sectionGreenCtaClassName}>
            Explore Chinese medicine
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
