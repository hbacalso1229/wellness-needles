'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import { SectionHeading, glassGreenPanelClassName } from '@/features'
import { BookingResultBrand } from '@/components/BookingResultBrand'
import { BookingResultNav } from '@/components/BookingResultCloseButton'
import { BookingResultHelpCard } from '@/components/BookingResultHelpCard'

export default function BookingUnableToProcessPage() {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      headingRef.current?.focus({ preventScroll: true })
    })
  }, [])

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      <section className="relative flex flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 md:py-5 lg:px-8 lg:py-8">
        <div className="mx-auto my-auto w-full max-w-md pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-12 sm:max-w-lg md:max-w-xl md:pt-14">
          <BookingResultNav />

          <BookingResultBrand />

          <div className="mb-4 flex justify-center sm:mb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/15 shadow-sm sm:h-14 sm:w-14">
              <AlertCircle className="h-6 w-6 text-primary sm:h-7 sm:w-7" aria-hidden />
            </div>
          </div>

          <SectionHeading
            titleAs="h1"
            titleRef={headingRef}
            titleTabIndex={-1}
            title="We're unable to process your booking"
            credit="Booking request — please call or email so we can help."
            subtitle="We're sorry for the inconvenience. Something went wrong while sending your appointment request. Please call or email us and we'll help you book a time."
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
            creditClassName="mb-2 text-base text-[var(--text-dark)]/70 md:mb-3"
            subtitleClassName="text-base sm:text-lg text-[var(--text-dark)]/70 max-w-xl mx-auto leading-relaxed"
            className="text-center mb-4 sm:mb-5 lg:mb-6"
          />

          <div className={`${glassGreenPanelClassName} p-3.5 text-center sm:p-6`}>
            <p className="text-base leading-relaxed text-[var(--text-dark)]/70">
              Our team is happy to take your booking by phone or email during business
              hours.
            </p>
            <p className="mt-2 text-sm text-[var(--text-dark)]/55 sm:mt-3">
              Sunday–Friday · 9:00 AM – 8:00 PM · Saturday closed
            </p>
          </div>

          <BookingResultHelpCard intro="Prefer to call or email — we can help you book." />
        </div>
      </section>
    </div>
  )
}
