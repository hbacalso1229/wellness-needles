'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Calendar, MapPin, Clock } from 'lucide-react'
import { CTAButton } from '@/features'
import {
  clearBookingThankYouSummary,
  readBookingThankYouSummary,
  type BookingThankYouSummary,
} from '@/lib/booking-thank-you'

function formatDisplayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BookingThankYouPage() {
  const [summary, setSummary] = useState<BookingThankYouSummary | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = readBookingThankYouSummary()
    setSummary(stored)
    clearBookingThankYouSummary()
    setReady(true)
  }, [])

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-cream">
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 md:mb-6 md:h-16 md:w-16">
            <CheckCircle2 className="h-7 w-7 text-primary md:h-8 md:w-8" aria-hidden />
          </div>

          <h1 className="font-serif text-2xl font-bold leading-snug text-primary md:text-3xl">
            {ready && summary
              ? `Thank you, ${summary.firstName}`
              : 'Request received'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dark)]/65 md:mt-4 md:text-base">
            Your appointment request has been submitted. We&apos;ll contact you within
            24 hours to confirm — your preferred time is not locked until then.
          </p>

          {ready && summary ? (
            <div className="mt-8 rounded-xl border border-accent/15 bg-white p-5 text-left md:mt-10 md:p-6">
              <h2 className="mb-3 text-sm font-semibold text-primary md:mb-4 md:text-base">
                Request summary
              </h2>
              <ul className="space-y-3 text-sm text-[var(--text-dark)]/80 md:text-base">
                {summary.serviceLabel ? (
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                      aria-hidden
                    />
                    <span>
                      <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-dark)]/50">
                        Service
                      </span>
                      {summary.serviceLabel}
                    </span>
                  </li>
                ) : null}
                <li className="flex items-start gap-2.5">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                    aria-hidden
                  />
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-dark)]/50">
                      Visit type
                    </span>
                    {summary.serviceType}
                    {summary.locationLabel ? (
                      <span className="mt-0.5 block text-[var(--text-dark)]/70">
                        {summary.locationLabel}
                      </span>
                    ) : null}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Calendar
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                    aria-hidden
                  />
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-dark)]/50">
                      Preferred date
                    </span>
                    {formatDisplayDate(summary.date)}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary/70"
                    aria-hidden
                  />
                  <span>
                    <span className="block text-xs font-medium uppercase tracking-wide text-[var(--text-dark)]/50">
                      Preferred time
                    </span>
                    {summary.time}
                  </span>
                </li>
              </ul>
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:mx-auto sm:mt-10 sm:max-w-sm sm:gap-3.5">
            <CTAButton
              href="/"
              variant="gold"
              size="large"
              showArrow={false}
              className="w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-5 !py-3 !text-sm !font-bold shadow-md shadow-primary/25 transition-[transform,box-shadow,filter] duration-200 ease-out md:!py-3.5 md:!text-base motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
            >
              Back to home
            </CTAButton>
            {ready && !summary ? (
              <CTAButton
                href="/bookings/"
                variant="outline"
                size="medium"
                showArrow={false}
                className="w-full !rounded-full !border-primary/35 !px-4 !py-2.5 !text-xs !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 md:!py-3 md:!text-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
              >
                Book an appointment
              </CTAButton>
            ) : (
              <CTAButton
                href="/contact/"
                variant="outline"
                size="medium"
                showArrow={false}
                className="w-full !rounded-full !border-primary/35 !px-4 !py-2.5 !text-xs !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 md:!py-3 md:!text-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
              >
                Contact us
              </CTAButton>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
