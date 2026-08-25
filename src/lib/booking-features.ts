import { contactConfig } from '@/lib/contact-config'
import { isAdminUiEnabled } from '@/lib/admin-ui'
import { isValidEmailFormat } from '../../shared/email-check'
import type { SiteSnapshot } from '../../shared/site-snapshot'

export type BookingFeatureFlags = {
  calendlyEnabled: boolean
  bookingFormEnabled: boolean
  freshaEnabled: boolean
  /** Show 5/10 session treatment packages on the bookings page. */
  treatmentPackagesEnabled: boolean
  /** Fallback Calendly URL (packages / unknown service). */
  calendlySchedulingUrl: string
  /** Initial Consultation event (1h 15m). */
  calendlyInitialUrl: string
  /** Follow-up event (45m). */
  calendlyFollowUpUrl: string
  /** Fresha public booking page URL. */
  freshaBookingUrl: string
  /** Send legacy form submissions by email (Web3Forms). */
  bookingEmailEnabled: boolean
  /** Web3Forms access key from https://web3forms.com */
  bookingEmailAccessKey: string
  /** Inbox that should receive booking requests */
  bookingEmailTo: string
  /**
   * Country lock: hide the phone country picker.
   * Production also locks via hostname (www.wellnessneedles.ie) to the published
   * clinic country. E2E bakes this on via NEXT_PUBLIC_STRICT_IRISH_PHONE.
   * 08x mobile validation is separate — it runs whenever Ireland is selected.
   */
  strictIrishPhoneEnabled: boolean
}

export const BOOKING_FEATURES_STORAGE_KEY = 'wellness-needles-booking-features'
export const BOOKING_FEATURES_EVENT = 'wellness-needles-booking-features-changed'

/**
 * Prefer this for shared deploys (`dev` Preview + `main` Production).
 * Local: `.env.local`. Host: set for both Preview and Production, then redeploy.
 */
export function normalizeWeb3FormsAccessKey(value: string): string {
  return value.replace(/^\uFEFF/, '').trim()
}

export function isValidWeb3FormsAccessKey(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    normalizeWeb3FormsAccessKey(value)
  )
}

export function getEnvWeb3FormsAccessKey(): string {
  if (typeof process === 'undefined') return ''
  if (process.env.NEXT_PUBLIC_E2E === 'true') return ''
  return normalizeWeb3FormsAccessKey(
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || ''
  )
}

export type CaptchaProvider = 'hcaptcha' | 'turnstile'

/** Staging/local default is hCaptcha. Production Release sets `turnstile`. */
export function getCaptchaProvider(): CaptchaProvider {
  if (typeof process === 'undefined') return 'hcaptcha'
  if (process.env.NEXT_PUBLIC_E2E === 'true') return 'hcaptcha'
  const raw = (process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER || '').trim().toLowerCase()
  return raw === 'turnstile' ? 'turnstile' : 'hcaptcha'
}

export function getTurnstileSiteKey(): string {
  if (typeof process === 'undefined') return ''
  if (process.env.NEXT_PUBLIC_E2E === 'true') return ''
  return (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '').trim()
}

export function isTurnstileCaptchaEnabled(): boolean {
  return getCaptchaProvider() === 'turnstile' && Boolean(getTurnstileSiteKey())
}

/** Env override for the Ireland country lock. null = use contact-config default. */
export function getEnvStrictIrishPhone(): boolean | null {
  if (typeof process === 'undefined') return null
  const raw = (process.env.NEXT_PUBLIC_STRICT_IRISH_PHONE || '').trim().toLowerCase()
  if (raw === 'false' || raw === '0') return false
  if (raw === 'true' || raw === '1') return true
  return null
}

/**
 * Production-only runtime override from Pages `BOOKING_CAPTCHA_PROVIDER`.
 * Returns null when the Function is missing (staging) or the request fails —
 * caller keeps the build-time default.
 */
export async function fetchRuntimeCaptchaProvider(): Promise<CaptchaProvider | null> {
  if (typeof window === 'undefined') return null
  if (process.env.NEXT_PUBLIC_E2E === 'true') return null
  if (!getTurnstileSiteKey()) return null

  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 4000)
  try {
    const response = await fetch('/api/booking-captcha', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    })
    if (!response.ok) return null
    const data = (await response.json()) as { provider?: string }
    if (data.provider === 'hcaptcha') return 'hcaptcha'
    if (data.provider === 'turnstile') return 'turnstile'
    return null
  } catch {
    return null
  } finally {
    window.clearTimeout(timer)
  }
}

function pickWeb3FormsAccessKey(
  ...candidates: Array<string | undefined | null>
): string {
  for (const candidate of candidates) {
    if (!candidate) continue
    const normalized = normalizeWeb3FormsAccessKey(candidate)
    if (isValidWeb3FormsAccessKey(normalized)) return normalized
  }
  return ''
}

export { pickWeb3FormsAccessKey }

export function getDefaultBookingFeatures(): BookingFeatureFlags {
  const envAccessKey = getEnvWeb3FormsAccessKey()

  return {
    calendlyEnabled: contactConfig.features.calendlyEnabled,
    bookingFormEnabled: contactConfig.features.bookingFormEnabled,
    freshaEnabled: contactConfig.features.freshaEnabled,
    treatmentPackagesEnabled: contactConfig.features.treatmentPackagesEnabled,
    calendlySchedulingUrl: contactConfig.calendly.schedulingUrl,
    calendlyInitialUrl: contactConfig.calendly.initialConsultationUrl,
    calendlyFollowUpUrl: contactConfig.calendly.followUpUrl,
    freshaBookingUrl: contactConfig.fresha.bookingUrl,
    // Shared deploys: env key or Turnstile production (Function holds the access key).
    bookingEmailEnabled: Boolean(envAccessKey) || isTurnstileCaptchaEnabled(),
    bookingEmailAccessKey: envAccessKey,
    bookingEmailTo: contactConfig.email.address,
    strictIrishPhoneEnabled:
      getEnvStrictIrishPhone() ?? contactConfig.features.strictIrishPhoneEnabled,
  }
}

/**
 * Portal Settings booking mode when overlay is on. Email/captcha stay on the
 * baked env path. Overlay-off callers keep readBookingFeatures().
 */
export function bookingFeaturesFromOverlay(
  site: SiteSnapshot,
  base: BookingFeatureFlags
): BookingFeatureFlags {
  const freshaEnabled = Boolean(site.features.freshaEnabled)
  let bookingFormEnabled = Boolean(site.features.bookingFormEnabled)
  let calendlyEnabled = Boolean(site.features.calendlyEnabled)
  if (freshaEnabled) {
    bookingFormEnabled = false
    calendlyEnabled = false
  } else if (bookingFormEnabled) {
    calendlyEnabled = false
  }

  const calendlySchedulingUrl = isValidCalendlySchedulingUrl(site.calendly.schedulingUrl)
    ? site.calendly.schedulingUrl.trim()
    : base.calendlySchedulingUrl
  const calendlyInitialUrl = isValidCalendlySchedulingUrl(
    site.calendly.initialConsultationUrl
  )
    ? site.calendly.initialConsultationUrl.trim()
    : base.calendlyInitialUrl
  const calendlyFollowUpUrl = isValidCalendlySchedulingUrl(site.calendly.followUpUrl)
    ? site.calendly.followUpUrl.trim()
    : base.calendlyFollowUpUrl

  return {
    ...base,
    freshaEnabled,
    bookingFormEnabled,
    calendlyEnabled,
    treatmentPackagesEnabled: Boolean(site.features.treatmentPackagesEnabled),
    calendlySchedulingUrl,
    calendlyInitialUrl,
    calendlyFollowUpUrl,
    freshaBookingUrl: site.fresha.bookingUrl.trim() || base.freshaBookingUrl,
  }
}

export function resolvePublicBookingFeatures(
  overlayEnabled: boolean,
  site: SiteSnapshot
): BookingFeatureFlags {
  const base = readBookingFeatures()
  return overlayEnabled ? bookingFeaturesFromOverlay(site, base) : base
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
  return isValidEmailFormat(value)
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
 * block the correct calendar duration (75 vs 45 minutes).
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
  return '/bookings/'
}

export function isExternalBookingHref(href: string): boolean {
  return /^https?:\/\//i.test(href)
}

/**
 * Anchor attributes for Fresha https links.
 * Same-tab navigation lets the OS open the Fresha app via Universal/App Links
 * when installed; otherwise Fresha loads in the browser. Sites cannot detect
 * whether the app is installed.
 */
export function getFreshaOpenAttrs(): { target?: string; rel?: string } {
  return { target: '_self' }
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
        ? parsed.bookingEmailAccessKey
        : ''
    // Shared deploys: env key always wins when set. Otherwise use Admin/localStorage.
    // Ignore keys that are not valid Web3Forms UUIDs (common cause of submit errors).
    const accessKey = pickWeb3FormsAccessKey(
      getEnvWeb3FormsAccessKey(),
      parsedKey,
      defaults.bookingEmailAccessKey
    )
    const emailTo =
      typeof parsed.bookingEmailTo === 'string' &&
      isValidEmailAddress(parsed.bookingEmailTo)
        ? parsed.bookingEmailTo.trim()
        : defaults.bookingEmailTo

    // Shared deploys: env key means email is always on for every visitor.
    // Without env, use Admin/localStorage (default false).
    // E2E builds force email off so Playwright can reach thank-you without hCaptcha.
    const bookingEmailEnabled =
      process.env.NEXT_PUBLIC_E2E === 'true'
        ? false
        : getEnvWeb3FormsAccessKey() || isTurnstileCaptchaEnabled()
          ? true
          : typeof parsed.bookingEmailEnabled === 'boolean'
            ? parsed.bookingEmailEnabled
            : defaults.bookingEmailEnabled

    const accessKeyForClient =
      process.env.NEXT_PUBLIC_E2E === 'true' ? '' : accessKey

    // When Admin UI is on (dev), honor stored mode toggles with mutual exclusivity.
    // When Admin UI is off (main), force contact-config defaults (legacy form).
    let freshaEnabled: boolean
    let bookingFormEnabled: boolean
    let calendlyEnabled: boolean
    if (isAdminUiEnabled()) {
      freshaEnabled = Boolean(parsed.freshaEnabled)
      bookingFormEnabled = Boolean(parsed.bookingFormEnabled)
      calendlyEnabled = Boolean(parsed.calendlyEnabled)
      if (freshaEnabled) {
        bookingFormEnabled = false
        calendlyEnabled = false
      } else if (bookingFormEnabled) {
        calendlyEnabled = false
      }
    } else {
      freshaEnabled = defaults.freshaEnabled
      bookingFormEnabled = defaults.bookingFormEnabled
      calendlyEnabled = defaults.calendlyEnabled
    }

    const treatmentPackagesEnabled =
      typeof parsed.treatmentPackagesEnabled === 'boolean'
        ? parsed.treatmentPackagesEnabled
        : defaults.treatmentPackagesEnabled

    const envStrictIrishPhone = getEnvStrictIrishPhone()
    const strictIrishPhoneEnabled =
      envStrictIrishPhone !== null
        ? envStrictIrishPhone
        : isAdminUiEnabled() && typeof parsed.strictIrishPhoneEnabled === 'boolean'
          ? parsed.strictIrishPhoneEnabled
          : defaults.strictIrishPhoneEnabled

    return {
      calendlyEnabled,
      bookingFormEnabled,
      freshaEnabled,
      treatmentPackagesEnabled,
      calendlySchedulingUrl: fallbackUrl,
      calendlyInitialUrl: initialUrl,
      calendlyFollowUpUrl: followUpUrl,
      freshaBookingUrl,
      bookingEmailEnabled,
      bookingEmailAccessKey: accessKeyForClient,
      bookingEmailTo: emailTo,
      strictIrishPhoneEnabled,
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
  // Defer so listeners (e.g. Header) do not setState while the writer is still rendering.
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent(BOOKING_FEATURES_EVENT, { detail: features })
    )
  })
}

export function isBookingEmailConfigured(features: BookingFeatureFlags): boolean {
  if (!features.bookingEmailEnabled || !isValidEmailAddress(features.bookingEmailTo)) {
    return false
  }
  return isValidWeb3FormsAccessKey(features.bookingEmailAccessKey)
}

export function isFreshaBookingConfigured(features: BookingFeatureFlags): boolean {
  return features.freshaEnabled && isValidFreshaBookingUrl(features.freshaBookingUrl)
}
