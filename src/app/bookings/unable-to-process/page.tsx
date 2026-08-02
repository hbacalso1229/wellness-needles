'use client'

import { useEffect, useRef } from 'react'
import { AlertCircle, Mail, Phone } from 'lucide-react'
import { CTAButton } from '@/features'
import { BookingResultCloseButton } from '@/components/BookingResultCloseButton'
import { contactConfig } from '@/lib/contact-config'

const goldCtaClass =
  'w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-5 !py-3.5 !text-sm !font-bold shadow-md shadow-primary/25 transition-[transform,box-shadow,filter] duration-200 ease-out sm:!py-3.5 sm:!text-base motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'

const outlineCtaClass =
  'w-full !rounded-full !border-primary/35 !px-4 !py-3 !text-sm !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 sm:!py-3 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'

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
    <div className="relative min-h-[calc(100dvh-4rem)] bg-cream">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      <section className="relative px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20">
        <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
          <BookingResultCloseButton />

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/15 shadow-sm sm:mb-5 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]">
              <AlertCircle
                className="h-7 w-7 text-primary sm:h-8 sm:w-8 md:h-9 md:w-9"
                aria-hidden
              />
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 sm:text-sm">
              Booking request
            </p>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.65rem] font-bold leading-snug text-primary outline-none sm:text-3xl md:text-4xl"
            >
              We&apos;re unable to process your booking
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-dark)]/70 sm:mt-4 sm:text-base md:text-lg md:leading-relaxed">
              We&apos;re sorry for the inconvenience. Something went wrong while sending
              your appointment request. Please call or email us and we&apos;ll help you
              book a time.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-accent/15 bg-white p-4 text-center shadow-sm shadow-primary/5 sm:mt-8 sm:p-5 md:mt-10 md:p-6">
            <p className="text-sm leading-relaxed text-[var(--text-dark)]/70 sm:text-base">
              Our team is happy to take your booking by phone or email during business
              hours.
            </p>
            <p className="mt-3 text-xs text-[var(--text-dark)]/55 sm:text-sm">
              Sunday–Friday · 9:00 AM – 8:00 PM · Saturday closed
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:mt-8 sm:max-w-sm sm:gap-3 md:mt-10">
            <CTAButton
              href={contactConfig.phone.href}
              variant="gold"
              size="large"
              showArrow={false}
              className={goldCtaClass}
            >
              <Phone className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden />
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
