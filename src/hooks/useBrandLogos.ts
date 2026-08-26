'use client'

import { brandLogos, chatgptLogoActive } from '../../shared/brand-logos'
import { useSiteOverlay } from '@/lib/site-overlay'

export function useBrandLogos() {
  const { overlayEnabled, site } = useSiteOverlay()
  return brandLogos(
    chatgptLogoActive(overlayEnabled, site.features.chatgptLogoEnabled)
  )
}
