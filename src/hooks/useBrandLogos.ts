'use client'

import { brandLogos, newClinicLogoActive } from '../../shared/brand-logos'
import { useSiteOverlay } from '@/lib/site-overlay'

export function useBrandLogos() {
  const { overlayEnabled, site } = useSiteOverlay()
  return brandLogos(
    newClinicLogoActive(overlayEnabled, site.features.newClinicLogoEnabled)
  )
}
