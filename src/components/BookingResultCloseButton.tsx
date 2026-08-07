'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

const closeClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[var(--text-dark)]/25 bg-white text-[var(--text-dark)] shadow-sm transition-[transform,color,background-color,border-color] duration-200 hover:border-[var(--text-dark)]/45 hover:bg-white hover:text-[var(--text-dark)] motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-dark)]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

/** Quiet circular dismiss — fixed top-right; returns to the booking form page. */
export function BookingResultCloseButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <div
      className={
        className ??
        'fixed right-3 top-[calc(3.5rem+0.5rem)] z-40 sm:right-4 sm:top-[calc(3.5rem+0.75rem)]'
      }
    >
      <Link
        href="/bookings/"
        onClick={onClick}
        className={closeClassName}
        aria-label="Close and return to booking"
      >
        <X className="size-5 shrink-0" strokeWidth={2.25} aria-hidden />
      </Link>
    </div>
  )
}
