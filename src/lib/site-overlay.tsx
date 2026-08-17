'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  SITE_DEFAULTS,
  overlayKillSwitchOff,
  parseSiteSnapshot,
  type SiteSnapshot,
  type WeekHours,
} from '../../shared/site-snapshot'

type OverlayValue = {
  overlayEnabled: boolean
  site: SiteSnapshot
  hours: WeekHours | null
}

const OverlayContext = createContext<OverlayValue>({
  overlayEnabled: false,
  site: SITE_DEFAULTS,
  hours: null,
})

export function useSiteOverlay(): OverlayValue {
  return useContext(OverlayContext)
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
