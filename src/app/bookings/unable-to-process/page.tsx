'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, Mail, Phone } from 'lucide-react'
import { CTAButton } from '@/features'
import { BookingResultNav } from '@/components/BookingResultCloseButton'
import { contactConfig } from '@/lib/contact-config'

const outlineCtaClass =
  'w-full !rounded-full !border-primary/35 !px-4 !py-2.5 !text-sm !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:!scale-[0.97]'

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
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      <section className="relative flex flex-1 flex-col justify-center px-4 py-3 sm:px-6 sm:py-4 md:py-5 lg:justify-start lg:pb-24 lg:pt-16">
        <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
          <BookingResultNav />

          <div className="text-center">
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent/15 shadow-sm sm:mb-3 sm:h-12 sm:w-12 lg:mb-5 lg:h-16 lg:w-16">
              <AlertCircle className="h-6 w-6 text-primary lg:h-8 lg:w-8" aria-hidden />
            </div>

            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold sm:mb-2 sm:text-xs lg:text-sm">
              Booking request
            </p>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.45rem] font-bold leading-snug text-[var(--text-dark)] outline-none sm:text-2xl lg:text-4xl"
            >
              We&apos;re unable to process your booking
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-dark)]/70 sm:mt-2.5 sm:text-[0.9375rem] lg:mt-4 lg:text-lg lg:leading-relaxed">
              We&apos;re sorry for the inconvenience. Something went wrong while sending
              your appointment request. Please call or email us and we&apos;ll help you
              book a time.
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-accent/15 bg-white p-3 text-center shadow-sm shadow-primary/5 sm:mt-5 sm:p-4 lg:mt-10 lg:p-6">
            <p className="text-sm leading-relaxed text-[var(--text-dark)]/70 lg:text-base">
              Our team is happy to take your booking by phone or email during business
              hours.
            </p>
            <p className="mt-2 text-xs text-[var(--text-dark)]/55 sm:mt-3 sm:text-sm">
              Sunday–Friday · 9:00 AM – 8:00 PM · Saturday closed
            </p>
          </div>

          <div className="mx-auto mt-3 flex w-full max-w-sm flex-col items-stretch gap-2.5 pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:mt-4 sm:gap-3 lg:mt-8">
            <CTAButton
              href={contactConfig.phone.href}
              variant="gold"
              size="medium"
              showArrow={false}
              className="w-full"
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              Call {contactConfig.phone.displayText}
            </CTAButton>

            <CTAButton
              href={contactConfig.email.href}
              variant="outline"
              size="medium"
              showArrow={false}
              className={outlineCtaClass}
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              Email {contactConfig.email.address}
            </CTAButton>
          </div>
        </div>
      </section>
    </div>
  )
}
