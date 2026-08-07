'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  HeartHandshake,
  Phone,
  Sparkles,
} from 'lucide-react'
import { contactConfig } from '@/lib/contact-config'
import { BookingResultCloseButton } from '@/components/BookingResultCloseButton'
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
    <li className="flex items-start gap-2.5 rounded-lg bg-white/70 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3.5">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-white sm:h-8 sm:w-8 lg:h-9 lg:w-9">
        <Icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4 lg:h-[1.125rem] lg:w-[1.125rem]" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--text-dark)]/50 sm:text-[11px] lg:text-xs">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-[var(--text-dark)] lg:text-base">
          {value}
        </span>
        {detail ? (
          <span className="mt-0.5 block break-words text-xs leading-snug text-[var(--text-dark)]/65 lg:text-sm">
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

  return (
    <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col bg-white lg:min-h-[calc(100dvh-3.5rem)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,_rgba(127,176,105,0.12)_0%,_transparent_70%)]"
        aria-hidden
      />

      {/* Compact on mobile/tablet so the full confirmation fits in one viewport */}
      <section className="relative flex flex-1 flex-col justify-center px-4 py-3 sm:px-6 sm:py-4 md:py-5 lg:justify-start lg:pb-24 lg:pt-16">
        <div className="mx-auto w-full max-w-md sm:max-w-lg md:max-w-xl">
          <BookingResultCloseButton onClick={handleClose} />

          <div className="mb-3 flex justify-center sm:mb-4 lg:mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 outline-none transition-opacity hover:opacity-90 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:gap-2.5"
            >
              <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-primary/15 sm:size-11 lg:size-12 lg:ring-[3px]">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  fill
                  sizes="(max-width: 639px) 40px, (max-width: 1023px) 44px, 48px"
                  className="object-cover object-center"
                  priority
                />
              </span>
              <span className="font-serif text-lg font-bold tracking-wide text-[var(--text-dark)] sm:text-xl lg:text-2xl">
                {contactConfig.businessInfo.name}
              </span>
            </Link>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full border border-accent/30 bg-accent/15 shadow-sm sm:mb-3 sm:h-12 sm:w-12 lg:mb-5 lg:h-16 lg:w-16">
              <CheckCircle2
                className="h-6 w-6 text-primary lg:h-8 lg:w-8"
                aria-hidden
              />
            </div>

            <p className="mb-1.5 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold sm:mb-2 sm:text-xs lg:text-sm">
              <Sparkles className="h-3.5 w-3.5 text-gold" aria-hidden />
              Request received
            </p>

            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-serif text-[1.45rem] font-bold leading-snug text-[var(--text-dark)] outline-none sm:text-2xl lg:text-4xl"
            >
              {ready && summary ? `Thank you, ${summary.firstName}` : 'Thank you'}
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-dark)]/70 sm:mt-2.5 sm:text-[0.9375rem] lg:mt-4 lg:text-lg lg:leading-relaxed">
              {ready && summary
                ? 'We appreciate you trusting Wellness Needles with your care. Your appointment request is with us — we look forward to supporting you.'
                : 'We appreciate you reaching out. If you just submitted a request, we have it and will be in touch soon.'}
            </p>
          </div>

          {ready && summary ? (
            <div className="mt-4 rounded-2xl border border-accent/15 bg-white p-3 shadow-sm shadow-primary/5 sm:mt-5 sm:p-4 lg:mt-10 lg:p-6">
              <div className="mb-2 flex items-center gap-2 sm:mb-3 lg:mb-4">
                <HeartHandshake
                  className="h-4 w-4 shrink-0 text-primary sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                  aria-hidden
                />
                <h2 className="text-sm font-semibold text-[var(--text-dark)] lg:text-base">
                  Your booking confirmation
                </h2>
              </div>

              <ul className="space-y-1.5 sm:space-y-2 lg:space-y-2.5">
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

              <div className="mt-3 space-y-1.5 border-t border-accent/15 pt-2.5 text-center sm:mt-3.5 sm:pt-3 lg:mt-5 lg:space-y-2 lg:pt-4">
                {summary.email ? (
                  <p className="break-words text-xs leading-relaxed text-[var(--text-dark)]/70 sm:text-[0.8125rem] lg:text-sm">
                    A confirmation email is on its way to{' '}
                    <span className="font-bold text-[var(--text-dark)]">
                      {summary.email}
                    </span>
                    .
                  </p>
                ) : null}
                <p className="text-xs leading-relaxed text-[var(--text-dark)]/60 sm:text-[0.8125rem] lg:text-sm">
                  We&apos;ll contact you within 24 hours to confirm. Your preferred time is
                  not locked until then.
                </p>
              </div>
            </div>
          ) : ready ? (
            <div className="mt-4 rounded-2xl border border-accent/15 bg-white p-4 text-center shadow-sm shadow-primary/5 sm:mt-5 sm:p-5 lg:mt-8 lg:p-6">
              <p className="text-sm leading-relaxed text-[var(--text-dark)]/70 lg:text-base">
                No booking details were found for this visit. You can request an appointment
                anytime — it only takes a minute.
              </p>
            </div>
          ) : (
            <div
              className="mt-4 h-40 animate-pulse rounded-2xl bg-accent/10 sm:mt-5 sm:h-44 lg:mt-8 lg:h-56"
              aria-hidden
            />
          )}

          {ready && summary ? (
            <p className="mt-3 pb-[max(0.25rem,env(safe-area-inset-bottom))] text-center sm:mt-4 lg:mt-8">
              <a
                href={contactConfig.phone.href}
                className="inline-flex min-h-10 items-center justify-center gap-2 py-1.5 text-sm font-bold text-[var(--text-dark)]/70 transition-colors hover:text-[var(--text-dark)] lg:min-h-11 lg:py-2 lg:text-base"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden />
                Call {contactConfig.phone.displayText}
              </a>
            </p>
          ) : null}
        </div>
      </section>
    </div>
  )
}
