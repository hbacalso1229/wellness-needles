'use client'

import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getBookingCtaHref,
  isExternalBookingHref,
} from '@/lib/booking-features'

/** Book Now / booking CTA href that respects Fresha Admin toggle after hydrate. */
export function useBookingCtaHref() {
  const { features, hydrated } = useBookingFeatures()
  const href = hydrated ? getBookingCtaHref(features) : '/bookings'
  const isExternal = isExternalBookingHref(href)

  return {
    href,
    isExternal,
    hydrated,
    freshaEnabled: features.freshaEnabled,
  }
}
