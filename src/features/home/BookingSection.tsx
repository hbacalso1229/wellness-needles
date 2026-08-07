'use client'

import { BookingCtaButton } from '@/components/BookingCtaButton'
import { primaryGoldCtaClassName } from '../ui/CTAButton'

/** Destination booking CTA — full-width on mobile; header Book stays hug-label via shared class alone. */
const bookingDestinationCtaClassName = `${primaryGoldCtaClassName} !mx-auto !w-full !px-6 !py-3.5 sm:!w-auto md:!px-8 md:!py-4 focus-visible:ring-offset-[var(--primary,#1B3B2B)]`

export function BookingSection() {
  return (
    <section
      className="bg-white pb-12 pt-5 md:pb-14 md:pt-6 lg:pb-16"
      aria-labelledby="booking-heading"
    >
      <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center rounded-2xl bg-jungle-gradient px-6 py-8 text-center text-cream shadow-[0_14px_40px_rgba(45,80,22,0.22)] sm:w-fit sm:px-10 sm:py-9">
          <h2
            id="booking-heading"
            className="mb-2 font-serif text-2xl font-bold text-cream sm:text-3xl md:mb-3 md:text-4xl"
          >
            Ready when you are
          </h2>
          <p className="mb-5 text-base leading-relaxed text-cream/75 md:mb-6">
            Take a quiet next step. Book a session and begin restoring balance at a pace that
            feels right for you.
          </p>
          <div className="flex w-full justify-center">
            <BookingCtaButton
              variant="gold"
              size="large"
              showArrow
              className={bookingDestinationCtaClassName}
            >
              Book your session
            </BookingCtaButton>
          </div>
        </div>
      </div>
    </section>
  )
}
