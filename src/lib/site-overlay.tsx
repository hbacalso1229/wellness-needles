'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { contactConfig } from '@/lib/contact-config'
import {
  SITE_DEFAULTS,
  overlayKillSwitchOff,
  parseSiteSnapshot,
  type SiteLocation,
  type SiteSnapshot,
  type WeekHours,
} from '../../shared/site-snapshot'

type OverlayValue = {
  overlayEnabled: boolean
  site: SiteSnapshot
  hours: WeekHours | null
}

export type PublicClinicLocation = {
  id: string
  label: string
  full: string
  mapQuery: string
  directionsUrl: string
  formatted: {
    street: string
    city: string
    county: string
    postcode: string
  }
}

export function toPublicLocation(loc: SiteLocation): PublicClinicLocation {
  return {
    id: loc.id,
    label: loc.label,
    full: loc.full,
    mapQuery: loc.mapQuery,
    directionsUrl: loc.directionsUrl,
    formatted: {
      street: loc.street,
      city: loc.city,
      county: loc.county,
      postcode: loc.postcode,
    },
  }
}

export function toPublicLocations(locations: SiteLocation[]): PublicClinicLocation[] {
  return locations.filter((loc) => loc.enabled !== false).map(toPublicLocation)
}

export function publicLocationsOrBaked(locations: SiteLocation[]): PublicClinicLocation[] {
  const next = toPublicLocations(locations)
  return next.length > 0 ? next : [...contactConfig.address.locations]
}

const OverlayContext = createContext<OverlayValue>({
  overlayEnabled: false,
  site: SITE_DEFAULTS,
  hours: null,
})

export function useSiteOverlay(): OverlayValue {
  return useContext(OverlayContext)
}

export function usePublicContact() {
  const { overlayEnabled, site } = useSiteOverlay()
  return {
    overlayEnabled,
    site,
    phoneHref: overlayEnabled ? site.phone.href : contactConfig.phone.href,
    phoneText: overlayEnabled ? site.phone.displayText : contactConfig.phone.displayText,
    emailHref: overlayEnabled ? site.email.href : contactConfig.email.href,
    emailText: overlayEnabled ? site.email.address : contactConfig.email.address,
    hoursDisplay: overlayEnabled
      ? site.hoursDisplay
      : contactConfig.businessInfo.hoursDisplay,
    emergencyNote: contactConfig.businessInfo.emergencyNote,
    hours: overlayEnabled ? site.hours : null,
    locations: overlayEnabled
      ? publicLocationsOrBaked(site.locations)
      : contactConfig.address.locations,
  }
}

export function SiteOverlayProvider({ children }: { children: ReactNode }) {
  const [site, setSite] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [overlayEnabled, setOverlayEnabled] = useState(false)

  useEffect(() => {
    if (overlayKillSwitchOff()) return
    if (process.env.NEXT_PUBLIC_E2E === 'true') return
    let cancelled = false

    fetch('/api/bff/site', { headers: { Accept: 'application/json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error('overlay fetch failed')
        return res.json()
      })
      .then((json) => {
        const parsed = parseSiteSnapshot(json)
        if (!parsed || cancelled) return
        if (!parsed.websiteOverlayEnabled) {
          sessionStorage.removeItem('site-overlay-last-good')
          setOverlayEnabled(false)
          return
        }
        setSite(parsed)
        setOverlayEnabled(true)
      })
      .catch(() => {
        /* Keep baked marketing defaults (overlay off). Do not restore a cached ON snapshot. */
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<OverlayValue>(
    () => ({
      overlayEnabled,
      site,
      hours: overlayEnabled ? site.hours : null,
    }),
    [overlayEnabled, site]
  )

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  )
}
