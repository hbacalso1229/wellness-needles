import { DEFAULT_PHONE_COUNTRY_ID, PHONE_COUNTRIES } from '../../shared/phone-countries'

const ALLOWED_COUNTRY_IDS = new Set(PHONE_COUNTRIES.map((country) => country.id))

/** Allowlisted ISO id → Nominatim countrycodes (lowercase). Unknown values fall back to Ireland. */
export function nominatimCountryCode(countryId?: string | null): string {
  const id = (countryId || '').trim().toUpperCase()
  if (id && ALLOWED_COUNTRY_IDS.has(id)) return id.toLowerCase()
  return DEFAULT_PHONE_COUNTRY_ID.toLowerCase()
}

export type PlaceSuggestion = {
  id: string
  label: string
  street: string
  city: string
  county: string
  postcode: string
}

export type PlaceAddress = {
  street: string
  city: string
  county: string
  postcode: string
}

const NOMINATIM = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'WellnessNeedlesPortal/1.0 (https://portal.wellnessneedles.ie)'

let lastNominatimAt = 0

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

async function nominatimGet(path: string): Promise<unknown> {
  const wait = 1100 - (Date.now() - lastNominatimAt)
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait))
  lastNominatimAt = Date.now()
  const response = await fetch(`${NOMINATIM}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  })
  const json: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new Error('places-failed')
  return json
}

function addressFromNominatim(
  address: Record<string, unknown> | null,
  displayName: string
): PlaceAddress {
  const number = asText(address?.house_number)
  const road = asText(address?.road) || asText(address?.residential) || asText(address?.pedestrian)
  const street = [number, road].filter(Boolean).join(' ')
  const city =
    asText(address?.town) ||
    asText(address?.city) ||
    asText(address?.village) ||
    asText(address?.suburb) ||
    asText(address?.hamlet)
  const county = asText(address?.county).replace(/^County\s+/i, '')
  const postcode = asText(address?.postcode)
  const fallbackStreet = displayName.split(',')[0]?.trim() || ''
  return {
    street: street || fallbackStreet,
    city,
    county,
    postcode,
  }
}

function osmLookupId(osmType: string, osmId: string): string {
  const prefix = osmType === 'node' ? 'N' : osmType === 'way' ? 'W' : osmType === 'relation' ? 'R' : ''
  return prefix && osmId ? `${prefix}${osmId}` : ''
}

function suggestionFromRow(row: unknown): PlaceSuggestion | null {
  if (!isRecord(row)) return null
  const osmType = asText(row.osm_type)
  const osmId = typeof row.osm_id === 'number' ? String(row.osm_id) : asText(row.osm_id)
  const id = osmLookupId(osmType, osmId)
  const label = asText(row.display_name)
  if (!id || !label) return null
  const parsed = addressFromNominatim(isRecord(row.address) ? row.address : null, label)
  return { id, label, ...parsed }
}

export async function autocompletePlaces(
  input: string,
  countryId?: string | null
): Promise<PlaceSuggestion[]> {
  const countrycodes = nominatimCountryCode(countryId)
  const json = await nominatimGet(
    `/search?format=jsonv2&addressdetails=1&countrycodes=${countrycodes}&limit=6&q=${encodeURIComponent(input)}`
  )
  const rows = Array.isArray(json) ? json : []
  const out: PlaceSuggestion[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    const suggestion = suggestionFromRow(row)
    if (!suggestion || seen.has(suggestion.id)) continue
    seen.add(suggestion.id)
    out.push(suggestion)
  }
  return out
}

export async function placeAddressDetails(placeId: string): Promise<PlaceAddress> {
  const id = placeId.trim().toUpperCase()
  if (!/^[NWR]\d+$/.test(id)) throw new Error('places-failed')
  const json = await nominatimGet(`/lookup?osm_ids=${encodeURIComponent(id)}&format=json&addressdetails=1`)
  const rows = Array.isArray(json) ? json : []
  const suggestion = suggestionFromRow(rows[0])
  if (!suggestion) throw new Error('places-failed')
  return {
    street: suggestion.street,
    city: suggestion.city,
    county: suggestion.county,
    postcode: suggestion.postcode,
  }
}
