'use client'

import Link from 'next/link'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

type BookingLinkProps = {
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

/** Link that opens Fresha when Admin Fresha mode is on; otherwise /bookings. */
export function BookingLink({ className, children, onClick }: BookingLinkProps) {
  const { href, isExternal } = useBookingCtaHref()

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  )
}
