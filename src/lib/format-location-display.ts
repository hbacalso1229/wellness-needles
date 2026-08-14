import { contactConfig } from '@/lib/contact-config'

function displayCounty(county: string): string {
  return county.replace(/^Co\.(?=\S)/, 'Co. ')
}

export type FormattedLocation = {
  town: string
  address: string
}

/** Town + street block for thank-you / email. */
export function parseLocationDisplay(
  locationLabel: string
): FormattedLocation | null {
  const trimmed = locationLabel.trim()
  if (!trimmed) return null

  const loc = contactConfig.address.locations.find(
    (item) =>
      trimmed === item.label ||
      trimmed.startsWith(`${item.label} —`) ||
      trimmed === item.full
  )
  if (loc) {
    return {
      town: loc.label,
      address: [
        loc.formatted.street,
        `${loc.formatted.city}, ${displayCounty(loc.formatted.county)}`,
        loc.formatted.postcode,
      ].join('\n'),
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
  locationLabel?: string
): { value: string; address?: string } {
  const parsed = locationLabel ? parseLocationDisplay(locationLabel) : null
  if (!parsed) return { value: serviceType }
  if (parsed.town) {
    return { value: `${serviceType} — ${parsed.town}`, address: parsed.address }
  }
  return { value: serviceType, address: parsed.address }
}
