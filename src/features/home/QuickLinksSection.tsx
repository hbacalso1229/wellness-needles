'use client'

import { Leaf, Heart, Users, Calendar } from 'lucide-react'
import { ServiceCard } from '../ui/ServiceCard'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export function QuickLinksSection() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <section className="relative py-20 bg-cream">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 lg:mb-14">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-3">
            Explore the Clinic
          </h2>
          <div className="flex flex-col items-center gap-1.5 mb-4" aria-hidden="true">
            <Leaf className="w-4 h-4 text-primary" strokeWidth={1.75} />
            <div className="h-0.5 w-14 rounded-full bg-gold" />
          </div>
          <p className="text-lg text-secondary">
            Find treatments, stories, and booking in one place.
          </p>
        </div>

        {/* Mobile: snap row of all cards | Desktop: 4-col grid */}
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-4 lg:gap-6 lg:items-stretch lg:py-3">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:contents lg:overflow-visible lg:pb-0">
            <div className="snap-start shrink-0 w-[72vw] sm:w-[48vw] lg:w-auto lg:min-w-0 py-1">
              <ServiceCard
                compact
                href="/acupuncture"
                icon={Leaf}
                title="Why Acupuncture"
                description="Learn about the benefits and science behind acupuncture."
                className="h-full"
              />
            </div>

            <div className="snap-start shrink-0 w-[72vw] sm:w-[48vw] lg:w-auto lg:min-w-0 py-1">
              <ServiceCard
                compact
                href="/chinese-medicine"
                icon={Heart}
                title="Chinese Medicine"
                description="Explore traditional Chinese medicine principles."
                className="h-full"
              />
            </div>

            <div className="snap-start shrink-0 w-[72vw] sm:w-[48vw] lg:w-auto lg:min-w-0 py-1">
              <ServiceCard
                compact
                href="/testimonials"
                icon={Users}
                title="Testimonials"
                description="Read success stories from our patients."
                className="h-full"
              />
            </div>

            <div
              id="explore-book-cta"
              data-hide-sticky-book
              className="snap-start shrink-0 w-[72vw] sm:w-[48vw] lg:w-auto lg:min-w-0 py-1"
            >
              <ServiceCard
                compact
                href={bookHref}
                external={isExternal}
                target={target}
                rel={rel}
                icon={Calendar}
                title="Book your session"
                description="Pick a time that works for you."
                variant="primary"
                className="h-full"
              />
            </div>
          </div>

          {/* Mobile swipe hint */}
          <div className="flex items-center justify-center gap-1.5 lg:hidden" aria-hidden="true">
            <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
            <svg className="w-3.5 h-3.5 text-secondary/50" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
