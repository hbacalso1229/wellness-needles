'use client'

import type { ReactNode } from 'react'
import { Calendar } from 'lucide-react'
import { BookingCtaButton } from '@/components/BookingCtaButton'

/** Destination booking CTA — full-width on mobile; header Book stays hug-label via shared class alone. */
const bookingDestinationCtaClassName =
  '!mx-auto !w-full sm:!w-auto !px-6 !py-3.5 md:!px-8 md:!py-4 focus-visible:ring-offset-[var(--primary,#1B3B2B)]'

type BookingSectionProps = {
  eyebrow?: string
  title?: string
  description?: string
  ctaLabel?: string
  children?: ReactNode
  /** Optional left/side content (e.g. a testimonial) — stacks on mobile, single row from md up */
  leading?: ReactNode
}

export function BookingSection({
  eyebrow,
  title = 'Ready when you are',
  description = 'Take a quiet next step. Book a session and begin restoring balance at a pace that feels right for you.',
  ctaLabel = 'Book your session',
  children,
  leading,
}: BookingSectionProps) {
  const panel = (
    <div
      className={`flex h-full w-full flex-col items-center justify-center rounded-2xl bg-jungle-gradient px-6 py-8 text-center text-cream shadow-[0_6px_18px_rgba(45,80,22,0.16)] md:shadow-[0_14px_40px_rgba(45,80,22,0.22)] sm:px-10 sm:py-9 ${
        leading ? 'max-w-none' : 'mx-auto max-w-lg sm:w-fit'
      }`}
    >
      {eyebrow ? (
        <p className="mb-2 text-base font-[450] leading-relaxed text-cream/90 sm:mb-3">{eyebrow}</p>
      ) : null}
      <h2
        id="booking-heading"
        className={`font-serif text-2xl font-bold text-cream sm:text-3xl md:text-4xl ${
          description ? 'mb-2 md:mb-3' : 'mb-5 md:mb-6'
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p className="mb-5 text-base leading-relaxed text-cream/90 md:mb-6">{description}</p>
      ) : null}
      <div className="flex w-full justify-center">
        <BookingCtaButton variant="gold" size="large" className={bookingDestinationCtaClassName}>
          <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          {ctaLabel}
        </BookingCtaButton>
      </div>
      {children}
    </div>
  )

  return (
    <section
      className="bg-white pb-12 pt-5 md:pb-14 md:pt-6 lg:pb-16"
      aria-labelledby="booking-heading"
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${
          leading
            ? 'grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 md:gap-6 lg:gap-8'
            : 'flex justify-center'
        }`}
      >
        {leading ? <div className="min-w-0 h-full">{leading}</div> : null}
        {panel}
      </div>
    </section>
  )
}
