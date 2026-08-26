export const ORIGINAL_WORDMARK = '/logo_wellness_transparent.png'
export const ORIGINAL_ICON = '/logo_wellness_icon.png'
export const CHATGPT_WORDMARK = '/logo_wellness_chatgpt.png'
export const CHATGPT_ICON = '/logo_wellness_chatgpt_icon.png'

export type BrandLogos = {
  wordmark: string
  icon: string
  email: string
}

export function chatgptLogoActive(
  overlayEnabled: boolean,
  chatgptLogoEnabled: boolean
): boolean {
  return overlayEnabled && chatgptLogoEnabled
}

export function brandLogos(chatgptEnabled: boolean): BrandLogos {
  if (chatgptEnabled) {
    return {
      wordmark: CHATGPT_WORDMARK,
      icon: CHATGPT_ICON,
      email: CHATGPT_ICON,
    }
  }
  return {
    wordmark: ORIGINAL_WORDMARK,
    icon: ORIGINAL_ICON,
    email: ORIGINAL_WORDMARK,
  }
}
