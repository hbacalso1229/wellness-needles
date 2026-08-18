'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  BOOKING_FEATURES_EVENT,
  BOOKING_FEATURES_STORAGE_KEY,
  getDefaultBookingFeatures,
  resolvePublicBookingFeatures,
  writeBookingFeatures,
  type BookingFeatureFlags,
} from '@/lib/booking-features'
import { useSiteOverlay } from '@/lib/site-overlay'

export function useBookingFeatures() {
  const { overlayEnabled, site } = useSiteOverlay()
  const [features, setFeaturesState] = useState<BookingFeatureFlags>(getDefaultBookingFeatures)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const read = () => resolvePublicBookingFeatures(overlayEnabled, site)
    setFeaturesState(read())
    setHydrated(true)

    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<BookingFeatureFlags>).detail
      if (overlayEnabled) setFeaturesState(read())
      else if (detail) setFeaturesState(detail)
      else setFeaturesState(read())
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === BOOKING_FEATURES_STORAGE_KEY) {
        setFeaturesState(read())
      }
    }

    window.addEventListener(BOOKING_FEATURES_EVENT, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(BOOKING_FEATURES_EVENT, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [overlayEnabled, site])

  const setFeatures = useCallback((next: BookingFeatureFlags) => {
    writeBookingFeatures(next)
    setFeaturesState(next)
  }, [])

  // Merge against the latest state so consecutive patches do not overwrite
  // each other via a stale closure. Persist outside the updater to avoid
  // sync CustomEvent → other components setState during render.
  const patchFeatures = useCallback((patch: Partial<BookingFeatureFlags>) => {
    setFeaturesState((current) => {
      const next = { ...current, ...patch }
      queueMicrotask(() => writeBookingFeatures(next))
      return next
    })
  }, [])

  const setFreshaEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({
        freshaEnabled: enabled,
        calendlyEnabled: enabled ? false : features.calendlyEnabled,
        bookingFormEnabled: enabled ? false : features.bookingFormEnabled,
      })
    },
    [features.calendlyEnabled, features.bookingFormEnabled, patchFeatures]
  )

  const setCalendlyEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({
        calendlyEnabled: enabled,
        bookingFormEnabled: enabled ? false : features.bookingFormEnabled,
        freshaEnabled: enabled ? false : features.freshaEnabled,
      })
    },
    [features.bookingFormEnabled, features.freshaEnabled, patchFeatures]
  )

  const setBookingFormEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({
        bookingFormEnabled: enabled,
        calendlyEnabled: enabled ? false : features.calendlyEnabled,
        freshaEnabled: enabled ? false : features.freshaEnabled,
      })
    },
    [features.calendlyEnabled, features.freshaEnabled, patchFeatures]
  )

  const setCalendlySchedulingUrl = useCallback(
    (url: string) => {
      patchFeatures({ calendlySchedulingUrl: url.trim() })
    },
    [patchFeatures]
  )

  const setCalendlyInitialUrl = useCallback(
    (url: string) => {
      patchFeatures({ calendlyInitialUrl: url.trim() })
    },
    [patchFeatures]
  )

  const setCalendlyFollowUpUrl = useCallback(
    (url: string) => {
      patchFeatures({ calendlyFollowUpUrl: url.trim() })
    },
    [patchFeatures]
  )

  const setFreshaBookingUrl = useCallback(
    (url: string) => {
      patchFeatures({ freshaBookingUrl: url.trim() })
    },
    [patchFeatures]
  )

  const setTreatmentPackagesEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({ treatmentPackagesEnabled: enabled })
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

  const setStrictIrishPhoneEnabled = useCallback(
    (enabled: boolean) => {
      patchFeatures({ strictIrishPhoneEnabled: enabled })
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
    setFreshaEnabled,
    setCalendlyEnabled,
    setBookingFormEnabled,
    setCalendlySchedulingUrl,
    setCalendlyInitialUrl,
    setCalendlyFollowUpUrl,
    setFreshaBookingUrl,
    setTreatmentPackagesEnabled,
    setBookingEmailEnabled,
    setBookingEmailAccessKey,
    setBookingEmailTo,
    setStrictIrishPhoneEnabled,
    resetToDefaults,
  }
}
