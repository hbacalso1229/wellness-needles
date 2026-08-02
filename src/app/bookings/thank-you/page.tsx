'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  HeartHandshake,
  Phone,
  Sparkles,
} from 'lucide-react'
import { CTAButton } from '@/features'
import { contactConfig } from '@/lib/contact-config'
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

function SummaryRow({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Calendar
  label: string
  value: string
  detail?: string
}) {
  return (
    <li className="flex items-start gap-3 rounded-lg bg-cream/70 px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-white sm:h-9 sm:w-9">
        <Icon className="h-4 w-4 text-primary sm:h-[1.125rem] sm:w-[1.125rem]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-[var(--text-dark)]/50 sm:text-xs">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-[var(--text-dark)] sm:text-base">
          {value}
        </span>
        {detail ? (
          <span className="mt-0.5 block break-words text-xs leading-snug text-[var(--text-dark)]/65 sm:text-sm">
            {detail}
          </span>
        ) : null}
      </div>
    </li>
  )
}

const goldCtaClass =
  'w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-5 !py-3.5 !text-sm !font-bold shadow-md shadow-primary/25 transition-[transform,box-shadow,filter] duration-200 ease-out sm:!py-3.5 sm:!text-base motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'

const outlineCtaClass =
  'w-full !rounded-full !border-primary/35 !px-4 !py-3 !text-sm !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 sm:!py-3 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]'

export default function BookingThankYouPage() {
  const [summary, setSummary] = useState<BookingThankYouSummary | null>(null)
  const [ready, setReady] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // Always land at the top so the thank-you composition is on-screen
    // (mobile/tablet often restore scroll from the long booking form).
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0

    setSummary(readBookingThankYouSummary())
    setReady(true)

    window.requestAnimationFrame(() => {
      window.scrollTo(0, 0)
      headingRef.current?.focus({ preventScroll: true })
    })
  }, [])

  const handleLeave = () => {
    clearBookingThankYouSummary()
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] bg-cream">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      <section className="relative px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12 md:pb-20 md:pt-16 lg:pb-24 lg:pt-20">
        <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/15 shadow-sm sm:mb-5 sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem]">
              <CheckCircle2
                className="h-7 w-7 text-primary sm:h-8 sm:w-8 md:h-9 md:w-9"
                aria-hidden
              />
            </div>

            <p className="mb-2 inline-flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary/80 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
              Request received
            </p>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.65rem] font-bold leading-snug text-primary outline-none sm:text-3xl md:text-4xl"
            >
              {ready && summary ? `Thank you, ${summary.firstName}` : 'Thank you'}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--text-dark)]/70 sm:mt-4 sm:text-base md:text-lg md:leading-relaxed">
              {ready && summary
                ? 'We appreciate you trusting Wellness Needles with your care. Your appointment request is with us — we look forward to supporting you.'
                : 'We appreciate you reaching out. If you just submitted a request, we have it and will be in touch soon.'}
            </p>
          </div>

          {ready && summary ? (
            <div className="mt-6 rounded-2xl border border-accent/15 bg-white p-4 shadow-sm shadow-primary/5 sm:mt-8 sm:p-5 md:mt-10 md:p-6">
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <HeartHandshake
                  className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5"
                  aria-hidden
                />
                <h2 className="text-sm font-semibold text-primary sm:text-base">
                  Your booking confirmation
                </h2>
              </div>

              <ul className="space-y-2 sm:space-y-2.5">
                {summary.serviceLabel ? (
                  <SummaryRow
                    icon={CheckCircle2}
                    label="Service"
                    value={summary.serviceLabel}
                  />
                ) : null}
                <SummaryRow
                  icon={MapPin}
                  label="Visit type"
                  value={summary.serviceType}
                  detail={summary.locationLabel}
                />
                <SummaryRow
                  icon={Calendar}
                  label="Preferred date"
                  value={formatDisplayDate(summary.date)}
                />
                <SummaryRow
                  icon={Clock}
                  label="Preferred time"
                  value={summary.time}
                />
              </ul>

              <div className="mt-4 space-y-2 border-t border-accent/15 pt-3 text-center sm:mt-5 sm:pt-4">
                {summary.email ? (
                  <p className="break-words text-xs leading-relaxed text-[var(--text-dark)]/70 sm:text-sm">
                    A confirmation email is on its way to{' '}
                    <span className="font-medium text-[var(--text-dark)]/85">
                      {summary.email}
                    </span>
                    .
                  </p>
                ) : null}
                <p className="text-xs leading-relaxed text-[var(--text-dark)]/60 sm:text-sm">
                  We&apos;ll contact you within 24 hours to confirm. Your preferred time is
                  not locked until then.
                </p>
              </div>
            </div>
          ) : ready ? (
            <div className="mt-6 rounded-2xl border border-accent/15 bg-white p-5 text-center shadow-sm shadow-primary/5 sm:mt-8 sm:p-6">
              <p className="text-sm leading-relaxed text-[var(--text-dark)]/70 sm:text-base">
                No booking details were found for this visit. You can request an appointment
                anytime — it only takes a minute.
              </p>
            </div>
          ) : (
            <div
              className="mt-6 h-48 animate-pulse rounded-2xl bg-accent/10 sm:mt-8 sm:h-56"
              aria-hidden
            />
          )}

          <div className="mt-6 flex flex-col gap-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:mx-auto sm:mt-8 sm:max-w-sm sm:gap-3 md:mt-10">
            <div onClick={handleLeave}>
              <CTAButton
                href="/"
                variant="gold"
                size="large"
                showArrow={false}
                className={goldCtaClass}
              >
                Back to home
              </CTAButton>
            </div>

            {ready && !summary ? (
              <div onClick={handleLeave}>
                <CTAButton
                  href="/bookings/"
                  variant="outline"
                  size="medium"
                  showArrow={false}
                  className={outlineCtaClass}
                >
                  Book an appointment
                </CTAButton>
              </div>
            ) : (
              <>
                <div onClick={handleLeave}>
                  <CTAButton
                    href="/contact/"
                    variant="outline"
                    size="medium"
                    showArrow={false}
                    className={outlineCtaClass}
                  >
                    Contact us
                  </CTAButton>
                </div>
                <a
                  href={contactConfig.phone.href}
                  className="inline-flex min-h-11 items-center justify-center gap-2 py-2 text-sm font-medium text-primary/75 transition-colors hover:text-primary sm:text-base"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  Call {contactConfig.phone.displayText}
                </a>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
