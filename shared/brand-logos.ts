export const ORIGINAL_WORDMARK = '/logo_wellness_transparent.png'
export const ORIGINAL_ICON = '/logo_wellness_icon.png'
export const NEW_WORDMARK = '/logo_wellness_new.png'
export const NEW_ICON = '/logo_wellness_new_icon.png'

export type BrandLogos = {
  wordmark: string
  icon: string
  email: string
}

export function newClinicLogoActive(
  overlayEnabled: boolean,
  newClinicLogoEnabled: boolean
): boolean {
  return overlayEnabled && newClinicLogoEnabled
}

export function brandLogos(newLogoEnabled: boolean): BrandLogos {
  if (newLogoEnabled) {
    return {
      wordmark: NEW_WORDMARK,
      icon: NEW_ICON,
      email: NEW_ICON,
    }
  }
  return {
    wordmark: ORIGINAL_WORDMARK,
    icon: ORIGINAL_ICON,
    email: ORIGINAL_WORDMARK,
  }
}
