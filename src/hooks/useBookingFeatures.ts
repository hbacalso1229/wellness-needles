'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BOOKING_FEATURES_EVENT,
  BOOKING_FEATURES_STORAGE_KEY,
  getDefaultBookingFeatures,
  readBookingFeatures,
  writeBookingFeatures,
  type BookingFeatureFlags,
} from '@/lib/booking-features'

export function useBookingFeatures() {
  const [features, setFeaturesState] = useState<BookingFeatureFlags>(getDefaultBookingFeatures)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setFeaturesState(readBookingFeatures())
    setHydrated(true)

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<BookingFeatureFlags>).detail
      if (detail) setFeaturesState(detail)
      else setFeaturesState(readBookingFeatures())
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === BOOKING_FEATURES_STORAGE_KEY) {
        setFeaturesState(readBookingFeatures())
      }
    }

    window.addEventListener(BOOKING_FEATURES_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(BOOKING_FEATURES_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const setFeatures = useCallback((next: BookingFeatureFlags) => {
    writeBookingFeatures(next)
    setFeaturesState(next)
  }, [])

  const patchFeatures = useCallback(
    (patch: Partial<BookingFeatureFlags>) => {
      setFeatures({ ...features, ...patch })
    },
    [features, setFeatures]
  )

  const setCalendlyEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({
        calendlyEnabled: enabled,
        bookingFormEnabled: enabled ? false : features.bookingFormEnabled,
      })
    },
    [features.bookingFormEnabled, patchFeatures]
  )

  const setBookingFormEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({
        bookingFormEnabled: enabled,
        calendlyEnabled: enabled ? false : features.calendlyEnabled,
      })
    },
    [features.calendlyEnabled, patchFeatures]
  )

  const setCalendlySchedulingUrl = useCallback(
    (url: string) => {
      patchFeatures({ calendlySchedulingUrl: url.trim() })
    },
    [patchFeatures]
  )

  const setBookingEmailEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({ bookingEmailEnabled: enabled })
    },
    [patchFeatures]
  )

  const setBookingEmailAccessKey = useCallback(
    (accessKey: string) => {
      patchFeatures({ bookingEmailAccessKey: accessKey.trim() })
    },
    [patchFeatures]
  )

  const setBookingEmailTo = useCallback(
    (email: string) => {
      patchFeatures({ bookingEmailTo: email.trim() })
    },
    [patchFeatures]
  )

  const resetToDefaults = useCallback(() => {
    setFeatures(getDefaultBookingFeatures())
  }, [setFeatures])

  return {
    features,
    hydrated,
    setFeatures,
    setCalendlyEnabled,
    setBookingFormEnabled,
    setCalendlySchedulingUrl,
    setBookingEmailEnabled,
    setBookingEmailAccessKey,
    setBookingEmailTo,
    resetToDefaults,
  }
}
