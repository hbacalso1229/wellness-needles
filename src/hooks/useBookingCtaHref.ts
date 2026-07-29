'use client'

import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getBookingCtaHref,
  getFreshaOpenAttrs,
  isExternalBookingHref,
} from '@/lib/booking-features'

/** Book Now / booking CTA href that respects Fresha Admin toggle after hydrate. */
export function useBookingCtaHref() {
  const { features, hydrated } = useBookingFeatures()
  const href = hydrated ? getBookingCtaHref(features) : '/bookings'
  const isExternal = isExternalBookingHref(href)
  const openAttrs =
    isExternal && hydrated
      ? getFreshaOpenAttrs()
      : { target: '_blank' as const, rel: 'noopener noreferrer' }

  return {
    href,
    isExternal,
    target: openAttrs.target,
    rel: openAttrs.rel,
    hydrated,
    freshaEnabled: features.freshaEnabled,
  }
}
