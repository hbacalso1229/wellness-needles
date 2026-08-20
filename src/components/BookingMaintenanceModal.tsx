'use client'

import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { BookingResultHelpCard } from '@/components/BookingResultHelpCard'

export function BookingMaintenanceModal({ open }: { open: boolean }) {
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (typeof document === 'undefined' || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[300] isolate grid place-items-center overflow-y-auto bg-black/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative z-10 w-full max-w-sm rounded-xl border border-accent/20 bg-white px-4 py-5 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
      >
        <h2
          id={titleId}
          className="font-serif text-xl font-bold leading-snug text-[var(--text-dark)] sm:text-2xl"
        >
          Online Appointment Requests Unavailable
        </h2>
        <p
          id={descId}
          className="mt-3 text-sm leading-relaxed text-[var(--text-dark)]/70 sm:text-base"
        >
          We’re unable to accept online appointment requests right now. Please call or
          email us, and we’ll be happy to help you book. We apologise for the
          inconvenience.
        </p>
        <BookingResultHelpCard className="!mt-0 max-w-none" />
      </div>
    </div>,
    document.body
  )
}
