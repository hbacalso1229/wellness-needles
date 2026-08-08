'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  HeartHandshake,
} from 'lucide-react'
import { SectionHeading, glassGreenPanelClassName } from '@/features'
import { BookingResultBrand } from '@/components/BookingResultBrand'
import { BookingResultNav } from '@/components/BookingResultCloseButton'
import { BookingResultHelpCard } from '@/components/BookingResultHelpCard'
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
    <li className="flex items-start gap-3 rounded-xl border border-accent/15 bg-white px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 sm:h-9 sm:w-9">
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

export default function BookingThankYouPage() {
  const [summary, setSummary] = useState<BookingThankYouSummary | null>(null)
  const [ready, setReady] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
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

  const handleClose = () => {
    clearBookingThankYouSummary()
  }

  const title =
    ready && summary ? `Thank you, ${summary.firstName}` : 'Thank you'

  const subtitle =
    ready && summary ? (
      <>
        We appreciate you trusting{' '}
        <span className="font-bold text-primary">Wellness Needles</span> with your
        care. Your appointment request is with us — we look forward to supporting
        you.
      </>
    ) : (
      'We appreciate you reaching out. If you just submitted a request, we have it and will be in touch soon.'
    )

  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      <section className="relative flex flex-1 flex-col overflow-y-auto px-4 py-3 sm:px-6 sm:py-4 md:py-5 lg:px-8 lg:py-8">
        <div className="mx-auto my-auto w-full max-w-md pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-12 sm:max-w-lg md:max-w-xl md:pt-14">
          <BookingResultNav onNavigate={handleClose} />

          <BookingResultBrand />

          <SectionHeading
            titleAs="h1"
            titleRef={headingRef}
            titleTabIndex={-1}
            title={title}
            credit="Request received — we will confirm by email or phone."
            subtitle={subtitle}
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
            creditClassName="mb-2 text-base text-[var(--text-dark)]/70 md:mb-3"
            subtitleClassName="text-base sm:text-lg text-[var(--text-dark)]/70 max-w-xl mx-auto leading-relaxed"
            className="text-center mb-4 sm:mb-5 lg:mb-6"
          />

          {ready && summary ? (
            <div className={`${glassGreenPanelClassName} p-3.5 sm:p-6`}>
              <div className="mb-3 flex items-center gap-2 sm:mb-4">
                <HeartHandshake className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <h2 className="text-base font-semibold text-primary sm:text-lg">
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

              <div className="mt-4 space-y-1.5 border-t border-accent/20 pt-3 text-center sm:mt-5 sm:pt-4">
                {summary.email ? (
                  <p className="break-words text-sm leading-relaxed text-[var(--text-dark)]/70">
                    A confirmation email is on its way to{' '}
                    <span className="font-bold text-[var(--text-dark)]">
                      {summary.email}
                    </span>
                    .
                  </p>
                ) : null}
                <p className="text-sm leading-relaxed text-[var(--text-dark)]/60">
                  We&apos;ll contact you within 24 hours to confirm. Your preferred time
                  is not locked until then.
                </p>
              </div>
            </div>
          ) : ready ? (
            <div className={`${glassGreenPanelClassName} p-4 text-center sm:p-6`}>
              <p className="text-base leading-relaxed text-[var(--text-dark)]/70">
                No booking details were found for this visit. You can request an
                appointment anytime — it only takes a minute.
              </p>
            </div>
          ) : (
            <div
              className={`${glassGreenPanelClassName} h-40 animate-pulse sm:h-44`}
              aria-hidden
            />
          )}

          {ready ? (
            <BookingResultHelpCard intro="Questions about your request? Call or email and we can help." />
          ) : null}
        </div>
      </section>
    </div>
  )
}
