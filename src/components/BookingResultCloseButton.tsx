'use client'

import Link from 'next/link'
import { ChevronLeft, X } from 'lucide-react'

const closeButtonClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--text-dark)]/25 bg-white text-[var(--text-dark)] shadow-sm transition-[transform,color,background-color,border-color] duration-200 hover:border-[var(--text-dark)]/45 hover:bg-white hover:text-[var(--text-dark)] motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-dark)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

const backLinkClassName =
  'inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-dark)]/70 no-underline transition-colors hover:text-[var(--text-dark)] hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-dark)]/30 focus-visible:ring-offset-2'

/** Fixed top-right X — mobile only (all result pages). */
export const bookingResultCloseFixedClassName =
  'fixed right-3 top-[calc(3.5rem+0.5rem)] z-40 sm:right-4 sm:top-[calc(3.5rem+0.75rem)] md:hidden'

/** In-flow back link — tablet + desktop (all result pages). */
export const bookingResultBackLinkClassName = `mb-4 hidden md:inline-flex ${backLinkClassName}`

/** Quiet circular dismiss — fixed top-right; returns to the booking form page. */
export function BookingResultCloseButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <div className={className ?? bookingResultCloseFixedClassName}>
      <Link
        href="/bookings/"
        onClick={onClick}
        className={closeButtonClassName}
        aria-label="Close and return to booking"
      >
        <X className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  )
}

/** Shared result-page nav: X on mobile, Back to bookings on tablet+. */
export function BookingResultNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <BookingResultCloseButton onClick={onNavigate} />
      <Link
        href="/bookings/"
        onClick={onNavigate}
        className={bookingResultBackLinkClassName}
      >
        <ChevronLeft className="h-4 w-4 shrink-0" strokeWidth={2.25} aria-hidden />
        Back to bookings
      </Link>
    </>
  )
}
