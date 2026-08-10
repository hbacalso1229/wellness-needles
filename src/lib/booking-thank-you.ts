export const BOOKING_THANK_YOU_STORAGE_KEY = 'bookingThankYou'
/** Survives React Strict Mode remount after the live key is consumed. */
const BOOKING_THANK_YOU_DISPLAY_KEY = 'bookingThankYouDisplay'

export type BookingThankYouSummary = {
  firstName: string
  email?: string
  serviceLabel?: string
  locationLabel?: string
  date: string
  time: string
  serviceType: string
  /** Optional note from Personal Information. */
  message?: string
}

function parseSummary(raw: string | null): BookingThankYouSummary | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<BookingThankYouSummary>
    if (typeof parsed.firstName !== 'string' || !parsed.firstName.trim()) return null
    if (typeof parsed.date !== 'string' || typeof parsed.time !== 'string') return null
    if (typeof parsed.serviceType !== 'string') return null
    return {
      firstName: parsed.firstName.trim(),
      email: typeof parsed.email === 'string' ? parsed.email.trim() : undefined,
      serviceLabel:
        typeof parsed.serviceLabel === 'string' ? parsed.serviceLabel : undefined,
      locationLabel:
        typeof parsed.locationLabel === 'string' ? parsed.locationLabel : undefined,
      date: parsed.date,
      time: parsed.time,
      serviceType: parsed.serviceType,
      message:
        typeof parsed.message === 'string' && parsed.message.trim()
          ? parsed.message.trim()
          : undefined,
    }
  } catch {
    return null
  }
}

export function saveBookingThankYouSummary(summary: BookingThankYouSummary): void {
  if (typeof window === 'undefined') return
  try {
    const raw = JSON.stringify(summary)
    sessionStorage.setItem(BOOKING_THANK_YOU_STORAGE_KEY, raw)
    sessionStorage.removeItem(BOOKING_THANK_YOU_DISPLAY_KEY)
  } catch {
    // Ignore quota / private-mode failures; thank-you page has a generic fallback.
  }
}

/** Read confirmation details. Safe across Strict Mode remounts. */
export function readBookingThankYouSummary(): BookingThankYouSummary | null {
  if (typeof window === 'undefined') return null
  try {
    const live = sessionStorage.getItem(BOOKING_THANK_YOU_STORAGE_KEY)
    if (live) {
      sessionStorage.setItem(BOOKING_THANK_YOU_DISPLAY_KEY, live)
      sessionStorage.removeItem(BOOKING_THANK_YOU_STORAGE_KEY)
      return parseSummary(live)
    }
    return parseSummary(sessionStorage.getItem(BOOKING_THANK_YOU_DISPLAY_KEY))
  } catch {
    return null
  }
}

export function clearBookingThankYouSummary(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BOOKING_THANK_YOU_STORAGE_KEY)
    sessionStorage.removeItem(BOOKING_THANK_YOU_DISPLAY_KEY)
  } catch {
    // no-op
  }
}
