export const BOOKING_THANK_YOU_STORAGE_KEY = 'bookingThankYou'

export type BookingThankYouSummary = {
  firstName: string
  serviceLabel?: string
  locationLabel?: string
  date: string
  time: string
  serviceType: string
}

export function saveBookingThankYouSummary(summary: BookingThankYouSummary): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BOOKING_THANK_YOU_STORAGE_KEY, JSON.stringify(summary))
  } catch {
    // Ignore quota / private-mode failures; thank-you page has a generic fallback.
  }
}

export function readBookingThankYouSummary(): BookingThankYouSummary | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(BOOKING_THANK_YOU_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BookingThankYouSummary>
    if (typeof parsed.firstName !== 'string' || !parsed.firstName.trim()) return null
    if (typeof parsed.date !== 'string' || typeof parsed.time !== 'string') return null
    if (typeof parsed.serviceType !== 'string') return null
    return {
      firstName: parsed.firstName.trim(),
      serviceLabel:
        typeof parsed.serviceLabel === 'string' ? parsed.serviceLabel : undefined,
      locationLabel:
        typeof parsed.locationLabel === 'string' ? parsed.locationLabel : undefined,
      date: parsed.date,
      time: parsed.time,
      serviceType: parsed.serviceType,
    }
  } catch {
    return null
  }
}

export function clearBookingThankYouSummary(): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(BOOKING_THANK_YOU_STORAGE_KEY)
  } catch {
    // no-op
  }
}
