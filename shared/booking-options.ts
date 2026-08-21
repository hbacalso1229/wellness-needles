import {
  BOOKABLE_PRICE_KEYS,
  isBookableExtraKind,
  type BookablePriceKey,
  type SiteSnapshot,
} from './site-snapshot'

export const SERVICE_TYPE_IN_CLINIC = 'In Clinic'
export const SERVICE_TYPE_HOME_VISIT = 'Home Visit'

export const BOOKABLE_SERVICE_NAMES: Record<BookablePriceKey, string> = {
  initial: 'Initial Consultation & First Treatment',
  followUp: 'Follow-up Sessions',
  package5: 'Treatment Package (5 sessions)',
  package10: 'Treatment Package (10 sessions)',
}

function same(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase() && Boolean(a.trim())
}

function unique(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(value)
  }
  return out
}

export function visitKind(serviceType: string): 'inClinic' | 'homeVisit' {
  return /home/i.test(serviceType) ? 'homeVisit' : 'inClinic'
}

export function locationDisplay(loc: { label: string; full?: string }): string {
  return loc.full ? `${loc.label} — ${loc.full}` : loc.label
}

function locationMatches(loc: { label: string; full?: string }, candidate: string): boolean {
  const trimmed = candidate.trim()
  if (!trimmed) return false
  return (
    same(trimmed, loc.label) ||
    Boolean(loc.full && same(trimmed, loc.full)) ||
    trimmed.startsWith(`${loc.label} —`) ||
    Boolean(loc.full && same(trimmed, `${loc.label} — ${loc.full}`))
  )
}

export function publishedLocationOptions(
  site: SiteSnapshot,
  current?: string | null
): string[] {
  const labels = site.locations
    .filter((loc) => loc.enabled !== false)
    .map((loc) => locationDisplay(loc))
  const cur = (current || '').trim()
  if (cur) labels.unshift(cur)
  return unique(labels)
}

export function isAllowedLocation(
  site: SiteSnapshot,
  candidate: string,
  current?: string | null
): boolean {
  const trimmed = candidate.trim()
  if (!trimmed) return false
  if (current && same(trimmed, current)) return true
  return site.locations.some(
    (loc) => loc.enabled !== false && locationMatches(loc, trimmed)
  )
}

export function publishedServiceTypes(
  site: SiteSnapshot,
  current?: string | null
): string[] {
  const types: string[] = []
  if (site.pricing.inClinicEnabled) types.push(SERVICE_TYPE_IN_CLINIC)
  if (site.pricing.homeVisitEnabled) types.push(SERVICE_TYPE_HOME_VISIT)
  const cur = (current || '').trim()
  if (cur) types.unshift(cur)
  if (!types.length) types.push(SERVICE_TYPE_IN_CLINIC)
  return unique(types)
}

export function isAllowedServiceType(
  site: SiteSnapshot,
  candidate: string,
  current?: string | null
): boolean {
  const trimmed = candidate.trim()
  if (!trimmed) return false
  if (current && same(trimmed, current)) return true
  if (same(trimmed, SERVICE_TYPE_IN_CLINIC) && site.pricing.inClinicEnabled) return true
  if (same(trimmed, SERVICE_TYPE_HOME_VISIT) && site.pricing.homeVisitEnabled) return true
  return false
}

export function publishedServiceLabels(
  site: SiteSnapshot,
  serviceType: string,
  current?: string | null
): string[] {
  const kind = visitKind(serviceType)
  const categoryOn =
    kind === 'homeVisit' ? site.pricing.homeVisitEnabled : site.pricing.inClinicEnabled
  const items = kind === 'homeVisit' ? site.pricing.homeVisitItems : site.pricing.inClinicItems
  const extras = kind === 'homeVisit' ? site.pricing.homeVisitExtras : site.pricing.inClinicExtras
  const labels: string[] = []
  if (categoryOn) {
    for (const key of BOOKABLE_PRICE_KEYS) {
      if (site.pricing.removedItems?.includes(key)) continue
      if (items[key]) {
        const name = site.pricing.serviceCopy?.[key]?.name?.trim()
        labels.push(name || BOOKABLE_SERVICE_NAMES[key])
      }
    }
    for (const extra of extras) {
      if (extra.enabled && isBookableExtraKind(extra.kind) && extra.name.trim()) {
        labels.push(extra.name.trim())
      }
    }
  }
  const cur = (current || '').trim()
  if (cur) labels.unshift(cur)
  return unique(labels)
}

export function isAllowedService(
  site: SiteSnapshot,
  serviceType: string,
  candidate: string,
  current?: string | null
): boolean {
  const trimmed = candidate.trim()
  if (!trimmed) return false
  if (current && same(trimmed, current)) return true
  return publishedServiceLabels(site, serviceType, null).some((item) => same(item, trimmed))
}
