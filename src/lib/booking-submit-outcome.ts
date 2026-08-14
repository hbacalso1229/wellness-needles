export const BOOKING_SUBMIT_OUTCOME_KEY = 'bookingSubmitOutcome'
const BOOKING_SUBMIT_OUTCOME_DISPLAY_KEY = 'bookingSubmitOutcomeDisplay'

export type BookingSubmitOutcome = 'failed' | 'unknown'

function parseOutcome(raw: string | null): BookingSubmitOutcome | null {
  if (raw === 'failed' || raw === 'unknown') return raw
  return null
}

export function saveBookingSubmitOutcome(outcome: BookingSubmitOutcome): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(BOOKING_SUBMIT_OUTCOME_KEY, outcome)
    sessionStorage.removeItem(BOOKING_SUBMIT_OUTCOME_DISPLAY_KEY)
  } catch {
    // ignore quota / private-mode failures
  }
}

/** Survives Strict Mode remount; live key is copied to a display key. */
export function readBookingSubmitOutcome(): BookingSubmitOutcome | null {
  if (typeof window === 'undefined') return null
  try {
    const live = sessionStorage.getItem(BOOKING_SUBMIT_OUTCOME_KEY)
    if (live) {
      sessionStorage.setItem(BOOKING_SUBMIT_OUTCOME_DISPLAY_KEY, live)
      sessionStorage.removeItem(BOOKING_SUBMIT_OUTCOME_KEY)
      return parseOutcome(live)
    }
    return parseOutcome(sessionStorage.getItem(BOOKING_SUBMIT_OUTCOME_DISPLAY_KEY))
  } catch {
    return null
  }
}
