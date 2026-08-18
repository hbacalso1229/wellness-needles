import { contactConfig } from '@/lib/contact-config'

function displayCounty(county: string): string {
  return county.replace(/^Co\.(?=\S)/, 'Co. ')
}

export type FormattedLocation = {
  town: string
  address: string
}

export type LocationLookup = {
  label: string
  full?: string
  street?: string
  city?: string
  county?: string
  postcode?: string
  formatted?: {
    street: string
    city: string
    county: string
    postcode: string
  }
}

function matchLocation(
  trimmed: string,
  loc: LocationLookup
): boolean {
  return (
    trimmed === loc.label ||
    trimmed.startsWith(`${loc.label} —`) ||
    Boolean(loc.full && trimmed === loc.full)
  )
}

function locationAddress(loc: LocationLookup): string {
  const street = loc.formatted?.street || loc.street || ''
  const city = loc.formatted?.city || loc.city || ''
  const county = loc.formatted?.county || loc.county || ''
  const postcode = loc.formatted?.postcode || loc.postcode || ''
  return [street, `${city}, ${displayCounty(county)}`.replace(/^, /, ''), postcode]
    .filter(Boolean)
    .join('\n')
}

/** Town + street block for thank-you / email. */
export function parseLocationDisplay(
  locationLabel: string,
  extra: readonly LocationLookup[] = []
): FormattedLocation | null {
  const trimmed = locationLabel.trim()
  if (!trimmed) return null

  const loc = [...extra, ...contactConfig.address.locations].find((item) =>
    matchLocation(trimmed, item)
  )
  if (loc) {
    return {
      town: loc.label,
      address: locationAddress(loc),
    }
  }

  const dash = trimmed.indexOf(' — ')
  if (dash !== -1) {
    return {
      town: trimmed.slice(0, dash),
      address: trimmed.slice(dash + 3),
    }
  }
  return { town: '', address: trimmed }
}

export function visitTypeDisplay(
  serviceType: string,
  locationLabel?: string,
  extra: readonly LocationLookup[] = []
): { value: string; address?: string } {
  const parsed = locationLabel ? parseLocationDisplay(locationLabel, extra) : null
  if (!parsed) return { value: serviceType }
  if (parsed.town) {
    return { value: `${serviceType} — ${parsed.town}`, address: parsed.address }
  }
  return { value: serviceType, address: parsed.address }
}
