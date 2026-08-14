'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  HeartHandshake,
  MessageSquare,
  User,
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
import { joinPersonName } from '@/lib/person-name'
import { visitTypeDisplay } from '@/lib/format-location-display'

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
          <span className="mt-0.5 block whitespace-pre-line break-words text-xs leading-snug text-[var(--text-dark)]/65 sm:text-sm">
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
    ready && summary ? `Thank you, ${summary.firstName}!` : 'Thank you!'

  const visit = summary
    ? visitTypeDisplay(summary.serviceType, summary.locationLabel)
    : null

  const subtitle =
    ready && summary ? (
      <>
        Thank you for choosing{' '}
        <span className="font-bold text-primary">Wellness Needles</span>.
        We&apos;ll be in touch soon to confirm your appointment.
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
            credit={
              <>
                Your appointment request has been received.
                <br />
                We&apos;ll confirm by email or phone within 24 hours.
              </>
            }
            subtitle={subtitle}
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1B3B2B] mb-2 md:mb-3"
            creditClassName="mb-2 text-base text-[var(--text-dark)]/70 md:mb-3"
            subtitleClassName="text-base sm:text-lg text-[var(--text-dark)]/70 max-w-xl mx-auto leading-relaxed"
            className="text-center mb-4 sm:mb-5 lg:mb-6"
          />

          {ready && summary ? (
            <div className="rounded-xl border border-accent/40 bg-accent/[0.07] p-3.5 shadow-[0_8px_28px_rgba(27,59,43,0.10)] sm:p-6">
              <div className="mb-3 flex items-start gap-2 sm:mb-4">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-[var(--text-dark)]" aria-hidden />
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-dark)] sm:text-lg">
                    Your appointment request
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--text-dark)]/70">
                    Your request details
                  </p>
                </div>
              </div>

              <ul className="space-y-2 sm:space-y-2.5">
                <SummaryRow
                  icon={User}
                  label="Name"
                  value={joinPersonName(
                    summary.firstName,
                    summary.lastName || ''
                  )}
                />
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
                  value={visit?.value ?? summary.serviceType}
                  detail={visit?.address}
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
                {summary.message ? (
                  <SummaryRow
                    icon={MessageSquare}
                    label="Message"
                    value={summary.message}
                  />
                ) : null}
              </ul>

              <div className="mt-4 border-t border-accent/20 pt-3 text-center sm:mt-5 sm:pt-4">
                <p className="text-sm font-semibold leading-relaxed text-[var(--text-dark)]">
                  We&apos;ll contact you within 24 hours to confirm your appointment.
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
            <BookingResultHelpCard
              intro="Have questions about your request? We're happy to help."
              callLabel="Call us"
              className="max-w-xs"
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}
