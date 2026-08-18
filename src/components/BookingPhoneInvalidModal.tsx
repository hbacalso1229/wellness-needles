'use client'

import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Info, Mail, Phone, Smartphone, X } from 'lucide-react'
import { CTAButton } from '@/features'
import { usePublicContact } from '@/lib/site-overlay'

/** Same box for all three actions — Need help? inner width (max-w-xs minus card padding). */
const modalActionWidthClass = 'w-[18rem] max-w-full mx-auto'

const modalActionClass =
  `box-border flex h-11 ${modalActionWidthClass} items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 text-sm font-semibold`

const modalCtaSizeClass =
  '!box-border !flex !h-11 !min-h-11 !w-full !items-center !justify-center !gap-1.5 !whitespace-nowrap !rounded-full !px-5 !py-0 !text-sm !font-semibold'

const emailCtaClass = `${modalCtaSizeClass} bg-white/80 !shadow-none`

type BookingPhoneInvalidModalProps = {
  open: boolean
  onClose: () => void
  onTryAnother: () => void
  /** Number the visitor typed, already formatted for display (e.g. +353 21 427 1234). */
  enteredNumber?: string
}

export function BookingPhoneInvalidModal({
  open,
  onClose,
  onTryAnother,
  enteredNumber,
}: BookingPhoneInvalidModalProps) {
  const { phoneHref, phoneText, emailHref } = usePublicContact()
  const titleId = useId()
  const descId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus({ preventScroll: true })

    const countrySelect = document.getElementById('phone-country')
    if (countrySelect instanceof HTMLElement) {
      countrySelect.blur()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (typeof document === 'undefined' || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[300] isolate grid place-items-center overflow-y-auto bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm overflow-y-auto rounded-xl border border-accent/20 bg-white px-4 pb-5 pt-4 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary [@media(hover:hover)]:hover:bg-accent/15 [@media(hover:hover)]:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent/15">
          <Info className="h-6 w-6 text-primary" aria-hidden strokeWidth={1.75} />
        </span>

        <h3
          id={titleId}
          className="mb-2 px-8 font-serif text-xl font-bold leading-snug text-[var(--text-dark)]"
        >
          This number isn&apos;t supported
        </h3>
        {enteredNumber ? (
          <p className="mb-3 font-semibold tabular-nums text-[var(--text-dark)]">
            {enteredNumber}
          </p>
        ) : null}
        <div
          id={descId}
          className="space-y-2 text-base leading-relaxed text-[var(--text-dark)]/70"
        >
          <p>Online appointment requests currently accept Irish mobile numbers only.</p>
          <p>
            For example:{' '}
            <span className="font-semibold text-[var(--text-dark)]">86 054 3085</span>
            . Landlines and other number formats aren&apos;t supported for online
            requests.
          </p>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onTryAnother}
          className={`mt-4 ${modalActionClass} bg-primary text-cream shadow-md transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [@media(hover:hover)]:hover:bg-secondary`}
        >
          <Smartphone className="h-4 w-4 shrink-0" aria-hidden />
          Try another number
        </button>

        <p className="mt-5 text-sm font-semibold text-[var(--text-dark)]">
          Prefer to request an appointment directly?
        </p>
        <p className="mt-0.5 text-sm text-[var(--text-dark)]/55">
          Call or email us during business hours.
        </p>

        <div className="mt-3 flex w-full flex-col gap-2.5">
          <div className={modalActionWidthClass}>
            <CTAButton
              href={phoneHref}
              variant="gold"
              size="medium"
              showArrow={false}
              fullWidth
              className={modalCtaSizeClass}
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden />
              Call us
            </CTAButton>
            <p className="mt-1.5 text-center text-base font-bold text-[var(--text-dark)]">
              {phoneText}
            </p>
          </div>

          <div className={`flex items-center gap-2.5 ${modalActionWidthClass}`} aria-hidden="true">
            <div className="h-px flex-1 bg-accent/25" />
            <span className="text-[10px] font-medium uppercase tracking-wide text-secondary">
              Or
            </span>
            <div className="h-px flex-1 bg-accent/25" />
          </div>

          <div className={modalActionWidthClass}>
            <CTAButton
              href={emailHref}
              variant="outline"
              size="medium"
              showArrow={false}
              fullWidth
              className={emailCtaClass}
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden />
              Send a message
            </CTAButton>
            <p className="mt-1.5 text-center text-base text-[var(--text-dark)]/70">
              We reply within 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
