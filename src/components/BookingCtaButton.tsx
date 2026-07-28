'use client'

import { CTAButton } from '@/features/ui/CTAButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

type BookingCtaButtonProps = Omit<
  React.ComponentProps<typeof CTAButton>,
  'href' | 'external' | 'target' | 'rel'
>

/** CTA that opens Fresha when Admin Fresha mode is on; otherwise /bookings. */
export function BookingCtaButton({ children, ...props }: BookingCtaButtonProps) {
  const { href, isExternal, target, rel } = useBookingCtaHref()
  return (
    <CTAButton href={href} external={isExternal} target={target} rel={rel} {...props}>
      {children}
    </CTAButton>
  )
}
