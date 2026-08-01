'use client'

import { BookingCtaButton } from '@/components/BookingCtaButton'
import { PulsingLeaf } from '../ui/PulsingLeaf'

export function BookingSection() {
  return (
    <section
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-jungle-gradient text-cream"
      aria-labelledby="booking-heading"
    >
      <div className="absolute top-12 left-8 opacity-30 hidden md:block" aria-hidden="true">
        <PulsingLeaf size="large" color="text-cream" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-30 hidden md:block" aria-hidden="true">
        <PulsingLeaf color="text-cream" animationDelay="1.2s" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          id="booking-heading"
          className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4"
        >
          Ready when you are
        </h2>
        <div className="flex flex-col items-center gap-1.5 mb-4 md:mb-5" aria-hidden="true">
          <PulsingLeaf size="small" color="text-gold/80" />
          <div className="h-0.5 w-14 rounded-full bg-gold" />
        </div>
        <p className="text-base md:text-lg text-cream/90 mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed">
          Take a quiet next step. Book a session and begin restoring balance at a pace that
          feels right for you.
        </p>
        <div className="inline-flex justify-center">
          <BookingCtaButton variant="gold" size="large" showArrow>
            Book your session
          </BookingCtaButton>
        </div>
      </div>
    </section>
  )
}
