'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

const closeClassName =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-accent/30 bg-white text-primary/75 shadow-none transition-[transform,color,background-color,border-color] duration-200 hover:border-primary/35 hover:bg-white hover:text-primary motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream'

/** Quiet circular dismiss — returns to the booking form page. */
export function BookingResultCloseButton({
  onClick,
}: {
  onClick?: () => void
}) {
  return (
    <div className="mb-4 flex justify-end sm:mb-5">
      <Link
        href="/bookings/"
        onClick={onClick}
        className={closeClassName}
        aria-label="Close and return to booking"
      >
        <X className="size-5 shrink-0" strokeWidth={2} aria-hidden />
      </Link>
    </div>
  )
}
