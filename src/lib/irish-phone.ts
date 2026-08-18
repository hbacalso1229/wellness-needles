import {
  getPhoneCountry,
  type PhoneCountry,
} from './phone-countries'

/** ComReg 08x mobiles after dropping the trunk 0: 082, 083, 085, 086, 087, 089. */
const IRISH_MOBILE_SUBSCRIBER = /^(?:82|83|85|86|87|89)\d{7}$/

function dialDigits(country: PhoneCountry): string {
  return country.dial.replace(/\D/g, '')
}

/**
 * Strip to subscriber digits (no trunk 0 / country code).
 * Always strip country code when the value is international (`+…` / `00…`)
 * or a long pasted code — otherwise short stored values like `+353 86`
 * round-trip as `35386` and corrupt the local input on backspace.
 */
export function subscriberDigits(raw: string, country: PhoneCountry): string {
  const code = dialDigits(country)
  const hasPlus = raw.trimStart().startsWith('+')
  let digits = raw.replace(/\D/g, '')

  if (digits.startsWith(`00${code}`)) {
    digits = digits.slice(2 + code.length)
  } else if (digits.startsWith(code) && (hasPlus || digits.length > country.localDigits)) {
    digits = digits.slice(code.length)
  }

  if (country.stripLeadingZero && digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, country.localDigits)
}

export function formatLocalPhoneInput(raw: string, country: PhoneCountry): string {
  const local = subscriberDigits(raw, country)
  if (country.id === 'IE') {
    const groups = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(
      (g) => g.length > 0
    )
    return groups.join(' ')
  }
  return local.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

export function toE164(raw: string, country: PhoneCountry): string {
  const local = subscriberDigits(raw, country)
  if (!local) return ''
  return `${country.dial} ${formatLocalPhoneInput(local, country)}`
}

/** Length-only IE check: +353 / 00353 / 0 + any 9 subscriber digits. */
export function isValidIrishPhoneLenient(value: string): boolean {
  const ireland = getPhoneCountry('IE')
  return subscriberDigits(value, ireland).length === ireland.localDigits
}

/** Irish 08x mobile only (not landlines, 1800/0818, or random 9-digit setups). */
export function isValidIrishMobile(value: string): boolean {
  const ireland = getPhoneCountry('IE')
  return IRISH_MOBILE_SUBSCRIBER.test(subscriberDigits(value, ireland))
}

export function isValidBookingPhone(
  value: string,
  country: PhoneCountry,
  options?: { strictIrishMobile?: boolean }
): boolean {
  if (country.id === 'IE') {
    return options?.strictIrishMobile
      ? isValidIrishMobile(value)
      : isValidIrishPhoneLenient(value)
  }
  const local = subscriberDigits(value, country)
  return local.length >= 7 && local.length <= country.localDigits
}

/**
 * Show the “this number isn't supported” modal.
 * Incomplete numbers wait until submit has a full 9-digit Irish setup that is not an 08x mobile.
 */
export function shouldShowIrishMobileInvalidModal(
  value: string,
  country: PhoneCountry,
  options?: { strictIrishMobile?: boolean; requireComplete?: boolean }
): boolean {
  if (!options?.strictIrishMobile || country.id !== 'IE') return false
  if (!value.trim()) return false
  if (options.requireComplete) {
    const ireland = getPhoneCountry('IE')
    if (subscriberDigits(value, ireland).length < ireland.localDigits) return false
  }
  return !isValidIrishMobile(value)
}
