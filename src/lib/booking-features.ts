import { contactConfig } from '@/lib/contact-config'

export type BookingFeatureFlags = {
  calendlyEnabled: boolean
  bookingFormEnabled: boolean
  freshaEnabled: boolean
  /** Fallback Calendly URL (packages / unknown service). */
  calendlySchedulingUrl: string
  /** Initial Consultation event (1h 45m). */
  calendlyInitialUrl: string
  /** Follow-up event (1h 15m). */
  calendlyFollowUpUrl: string
  /** Fresha public booking page URL. */
  freshaBookingUrl: string
  /** Send legacy form submissions by email (Web3Forms). */
  bookingEmailEnabled: boolean
  /** Web3Forms access key from https://web3forms.com */
  bookingEmailAccessKey: string
  /** Inbox that should receive booking requests */
  bookingEmailTo: string
}

export const BOOKING_FEATURES_STORAGE_KEY = 'wellness-needles-booking-features'
export const BOOKING_FEATURES_EVENT = 'wellness-needles-booking-features-changed'

/**
 * Prefer this for shared deploys (`dev` Preview + `main` Production).
 * Local: `.env.local`. Host: set for both Preview and Production, then redeploy.
 */
export function getEnvWeb3FormsAccessKey(): string {
  if (typeof process === 'undefined') return ''
  return process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim() || ''
}

export function getDefaultBookingFeatures(): BookingFeatureFlags {
  const envAccessKey = getEnvWeb3FormsAccessKey()

  return {
    calendlyEnabled: contactConfig.features.calendlyEnabled,
    bookingFormEnabled: contactConfig.features.bookingFormEnabled,
    freshaEnabled: contactConfig.features.freshaEnabled,
    calendlySchedulingUrl: contactConfig.calendly.schedulingUrl,
    calendlyInitialUrl: contactConfig.calendly.initialConsultationUrl,
    calendlyFollowUpUrl: contactConfig.calendly.followUpUrl,
    freshaBookingUrl: contactConfig.fresha.bookingUrl,
    // Shared deploys: env key alone is enough — email is on by default for all visitors.
    bookingEmailEnabled: Boolean(envAccessKey),
    bookingEmailAccessKey: envAccessKey,
    bookingEmailTo: contactConfig.email.address,
  }
}

export function isValidCalendlySchedulingUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.hostname === 'calendly.com' &&
      parsed.pathname.split('/').filter(Boolean).length >= 2
    )
  } catch {
    return false
  }
}

export function isValidFreshaBookingUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim())
    const host = parsed.hostname.toLowerCase()
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      (host === 'fresha.com' || host.endsWith('.fresha.com')) &&
      !host.includes('YOUR-BUSINESS'.toLowerCase()) &&
      !parsed.pathname.includes('YOUR-BUSINESS')
    )
  } catch {
    return false
  }
}

export function isValidEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function readCalendlyUrl(value: unknown, fallback: string): string {
  if (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    isValidCalendlySchedulingUrl(value)
  ) {
    return value.trim()
  }
  return fallback
}

function readFreshaUrl(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    const trimmed = value.trim()
    // Allow saving the placeholder until Admin replaces it; validation gates CTAs.
    return trimmed
  }
  return fallback
}

/**
 * Pick the Calendly event URL for the selected service so Initial/Follow-up
 * block the correct calendar duration (105 vs 75 minutes).
 */
export function resolveCalendlyUrlForService(
  features: Pick<
    BookingFeatureFlags,
    'calendlySchedulingUrl' | 'calendlyInitialUrl' | 'calendlyFollowUpUrl'
  >,
  serviceId?: string
): string {
  if (!serviceId) return features.calendlySchedulingUrl
  if (serviceId.includes('initial')) return features.calendlyInitialUrl
  if (serviceId.includes('follow') || serviceId.includes('package')) {
    return features.calendlyFollowUpUrl
  }
  return features.calendlySchedulingUrl
}

/** Book Now CTA target: Fresha when enabled + valid URL, otherwise /bookings. */
export function getBookingCtaHref(features: BookingFeatureFlags): string {
  if (features.freshaEnabled && isValidFreshaBookingUrl(features.freshaBookingUrl)) {
    return features.freshaBookingUrl.trim()
  }
  return '/bookings'
}

export function isExternalBookingHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

export function readBookingFeatures(): BookingFeatureFlags {
  const defaults = getDefaultBookingFeatures()
  if (typeof window === 'undefined') return defaults

  try {
    const raw = window.localStorage.getItem(BOOKING_FEATURES_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<BookingFeatureFlags>
    const fallbackUrl = readCalendlyUrl(
      parsed.calendlySchedulingUrl,
      defaults.calendlySchedulingUrl
    )
    // Migrate older Admin saves that only had one URL.
    const initialUrl = readCalendlyUrl(
      parsed.calendlyInitialUrl,
      fallbackUrl === defaults.calendlySchedulingUrl
        ? defaults.calendlyInitialUrl
        : fallbackUrl
    )
    const followUpUrl = readCalendlyUrl(
      parsed.calendlyFollowUpUrl,
      fallbackUrl === defaults.calendlySchedulingUrl
        ? defaults.calendlyFollowUpUrl
        : fallbackUrl
    )
    const freshaBookingUrl = readFreshaUrl(
      parsed.freshaBookingUrl,
      defaults.freshaBookingUrl
    )
    const parsedKey =
      typeof parsed.bookingEmailAccessKey === 'string'
        ? parsed.bookingEmailAccessKey.trim()
        : ''
    // Shared deploys: env key always wins when set. Otherwise use Admin/localStorage.
    const accessKey = getEnvWeb3FormsAccessKey() || parsedKey || defaults.bookingEmailAccessKey
    const emailTo =
      typeof parsed.bookingEmailTo === 'string' &&
      isValidEmailAddress(parsed.bookingEmailTo)
        ? parsed.bookingEmailTo.trim()
        : defaults.bookingEmailTo

    // Shared deploys: env key means email is always on for every visitor.
    // Without env, use Admin/localStorage (default false).
    const bookingEmailEnabled = getEnvWeb3FormsAccessKey()
      ? true
      : typeof parsed.bookingEmailEnabled === 'boolean'
        ? parsed.bookingEmailEnabled
        : defaults.bookingEmailEnabled

    // Mutual exclusivity: prefer Fresha > legacy form > Calendly when multiple were stored.
    const freshaEnabled = Boolean(parsed.freshaEnabled)
    let bookingFormEnabled = Boolean(parsed.bookingFormEnabled)
    let calendlyEnabled = Boolean(parsed.calendlyEnabled)
    if (freshaEnabled) {
      bookingFormEnabled = false
      calendlyEnabled = false
    } else if (bookingFormEnabled) {
      calendlyEnabled = false
    }

    return {
      calendlyEnabled,
      bookingFormEnabled,
      freshaEnabled,
      calendlySchedulingUrl: fallbackUrl,
      calendlyInitialUrl: initialUrl,
      calendlyFollowUpUrl: followUpUrl,
      freshaBookingUrl,
      bookingEmailEnabled,
      bookingEmailAccessKey: accessKey,
      bookingEmailTo: emailTo,
    }
  } catch {
    return defaults
  }
}

export function writeBookingFeatures(features: BookingFeatureFlags): void {
  if (typeof window === 'undefined') return
  // Never persist the env access key into localStorage (shared-deploy source of truth is env).
  const toStore: BookingFeatureFlags = {
    ...features,
    bookingEmailAccessKey: getEnvWeb3FormsAccessKey()
      ? ''
      : features.bookingEmailAccessKey,
  }
  window.localStorage.setItem(BOOKING_FEATURES_STORAGE_KEY, JSON.stringify(toStore))
  window.dispatchEvent(
    new CustomEvent(BOOKING_FEATURES_EVENT, { detail: features })
  )
}

export function isBookingEmailConfigured(features: BookingFeatureFlags): boolean {
  return (
    features.bookingEmailEnabled &&
    features.bookingEmailAccessKey.trim().length > 0 &&
    isValidEmailAddress(features.bookingEmailTo)
  )
}

export function isFreshaBookingConfigured(features: BookingFeatureFlags): boolean {
  return features.freshaEnabled && isValidFreshaBookingUrl(features.freshaBookingUrl)
}
