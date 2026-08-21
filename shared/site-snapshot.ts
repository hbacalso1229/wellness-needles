import { DEFAULT_REVIEWS, type DefaultReview } from './default-reviews'

export const WEEKDAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const

export type Weekday = (typeof WEEKDAYS)[number]

export type DayHours = {
  closed: boolean
  open: string
  close: string
}

export type WeekHours = Record<Weekday, DayHours>

export type SiteLocation = {
  id: string
  label: string
  full: string
  street: string
  city: string
  county: string
  postcode: string
  mapQuery: string
  directionsUrl: string
  enabled: boolean
}

export function composeLocation(
  loc: Pick<SiteLocation, 'id' | 'label' | 'street' | 'city' | 'county' | 'postcode'> & {
    enabled?: boolean
  }
): SiteLocation {
  const street = loc.street.trim()
  const city = loc.city.trim()
  const county = loc.county.trim()
  const postcode = loc.postcode.trim()
  const full = [street, city, county, postcode].filter(Boolean).join(' ')
  return {
    id: loc.id,
    label: loc.label.trim(),
    street,
    city,
    county,
    postcode,
    full,
    mapQuery: full,
    directionsUrl: full
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(full)}`
      : '',
    enabled: loc.enabled ?? true,
  }
}

export type SiteInsurer = {
  id: string
  name: string
  href: string
  logo: string
  enabled: boolean
  sortOrder: number
}

export type PriceList = {
  initial: string
  followUp: string
  package5: string
  package10: string
  cupping: string
  moxibustion: string
}

export type PriceItemKey = keyof PriceList

export type PriceListEnabled = Record<PriceItemKey, boolean>

export type PricingExtraKind = 'service' | 'package' | 'addon'

export type PricingExtra = {
  id: string
  kind: PricingExtraKind
  name: string
  price: string
  original: string
  description: string
  enabled: boolean
  durationMinutes: number
}

export function isBookableExtraKind(kind: PricingExtraKind): boolean {
  return kind === 'service' || kind === 'package'
}

export function defaultExtraDurationMinutes(kind: PricingExtraKind): number {
  if (kind === 'service') return 60
  if (kind === 'package') return 45
  return 0
}

export function durationPhrase(minutes: number): string {
  const n = Math.max(0, Math.round(Number(minutes) || 0))
  if (n < 60) return n === 1 ? '1 minute' : `${n} minutes`
  const hours = Math.floor(n / 60)
  const rest = n % 60
  const hourText = hours === 1 ? '1 hour' : `${hours} hours`
  if (rest === 0) return hourText
  const minText = rest === 1 ? '1 minute' : `${rest} minutes`
  return `${hourText} ${minText}`
}

export const PRICE_ITEM_KEYS: readonly PriceItemKey[] = [
  'initial',
  'followUp',
  'package5',
  'package10',
  'cupping',
  'moxibustion',
]

export const BOOKABLE_PRICE_KEYS = [
  'initial',
  'followUp',
  'package5',
  'package10',
] as const satisfies readonly PriceItemKey[]

export type BookablePriceKey = (typeof BOOKABLE_PRICE_KEYS)[number]

export function isBookablePriceKey(key: PriceItemKey): key is BookablePriceKey {
  return (BOOKABLE_PRICE_KEYS as readonly PriceItemKey[]).includes(key)
}

export function defaultPriceItemFlags(packagesEnabled: boolean): PriceListEnabled {
  return {
    initial: true,
    followUp: true,
    package5: packagesEnabled,
    package10: packagesEnabled,
    cupping: true,
    moxibustion: true,
  }
}

export function createPricingExtra(kind: PricingExtraKind): PricingExtra {
  return {
    id: `extra-${crypto.randomUUID()}`,
    kind,
    name: kind === 'service' ? 'New service' : kind === 'package' ? 'New package' : 'New add-on',
    price: '',
    original: '',
    description: '',
    enabled: true,
    durationMinutes: defaultExtraDurationMinutes(kind),
  }
}

export type UnifiedPricingExtra = {
  id: string
  kind: PricingExtraKind
  name: string
  description: string
  enabled: boolean
  durationMinutes: number
  inClinic: { price: string; original: string }
  homeVisit: { price: string; original: string }
}

function extraNameKey(name: string): string {
  return name.trim().toLowerCase()
}

export function mergePricingExtras(
  clinic: PricingExtra[],
  visit: PricingExtra[]
): UnifiedPricingExtra[] {
  const visitById = new Map(visit.map((row) => [row.id, row]))
  const visitByName = new Map(
    visit
      .filter((row) => extraNameKey(row.name))
      .map((row) => [extraNameKey(row.name), row])
  )
  const usedVisit = new Set<string>()
  const merged: UnifiedPricingExtra[] = []

  for (const clinicRow of clinic) {
    const visitRow =
      visitById.get(clinicRow.id) ||
      (extraNameKey(clinicRow.name) ? visitByName.get(extraNameKey(clinicRow.name)) : undefined)
    if (visitRow) usedVisit.add(visitRow.id)
    merged.push({
      id: clinicRow.id,
      kind: clinicRow.kind,
      name: clinicRow.name,
      description: clinicRow.description,
      enabled: clinicRow.enabled,
      durationMinutes: clinicRow.durationMinutes,
      inClinic: { price: clinicRow.price, original: clinicRow.original },
      homeVisit: {
        price: visitRow?.price ?? '',
        original: visitRow?.original ?? '',
      },
    })
  }

  for (const visitRow of visit) {
    if (usedVisit.has(visitRow.id)) continue
    merged.push({
      id: visitRow.id,
      kind: visitRow.kind,
      name: visitRow.name,
      description: visitRow.description,
      enabled: visitRow.enabled,
      durationMinutes: visitRow.durationMinutes,
      inClinic: { price: '', original: '' },
      homeVisit: { price: visitRow.price, original: visitRow.original },
    })
  }

  const rank = (kind: PricingExtraKind) =>
    kind === 'service' ? 0 : kind === 'package' ? 1 : 2
  return merged.sort((a, b) => rank(a.kind) - rank(b.kind))
}

function channelExtraFromUnified(
  row: UnifiedPricingExtra,
  channel: 'inClinic' | 'homeVisit'
): PricingExtra {
  const prices = row[channel]
  return {
    id: row.id,
    kind: row.kind,
    name: row.name,
    description: row.description,
    enabled: row.enabled,
    durationMinutes: row.durationMinutes,
    price: prices.price,
    original: prices.original,
  }
}

export function splitUnifiedPricingExtras(rows: UnifiedPricingExtra[]): {
  inClinicExtras: PricingExtra[]
  homeVisitExtras: PricingExtra[]
} {
  return {
    inClinicExtras: rows.map((row) => channelExtraFromUnified(row, 'inClinic')),
    homeVisitExtras: rows.map((row) => channelExtraFromUnified(row, 'homeVisit')),
  }
}

export function createUnifiedPricingExtra(kind: PricingExtraKind): UnifiedPricingExtra {
  const base = createPricingExtra(kind)
  return {
    id: base.id,
    kind: base.kind,
    name: base.name,
    description: base.description,
    enabled: base.enabled,
    durationMinutes: base.durationMinutes,
    inClinic: { price: '', original: '' },
    homeVisit: { price: '', original: '' },
  }
}

export function createSiteInsurer(sortOrder: number): SiteInsurer {
  return {
    id: `insurer-${crypto.randomUUID()}`,
    name: 'New insurer',
    href: '',
    logo: '',
    enabled: true,
    sortOrder,
  }
}

export type ServiceCopyKey = PriceItemKey

export type ServiceCopyItem = {
  name: string
  description: string
  duration: string
  durationMinutes: number
}

export type ServiceCopy = Record<ServiceCopyKey, ServiceCopyItem>

export const DEFAULT_SERVICE_COPY: ServiceCopy = {
  initial: {
    name: 'Initial Consultation & First Treatment',
    description:
      'Comprehensive health assessment with personalized treatment plan and first acupuncture session',
    duration: '1 hour 15 minutes',
    durationMinutes: 75,
  },
  followUp: {
    name: 'Follow-up Sessions',
    description: 'Tailored acupuncture treatment based on your progress and ongoing needs',
    duration: '45 minutes',
    durationMinutes: 45,
  },
  package5: {
    name: 'Treatment Package (5 sessions)',
    description: 'Save €30 with our 5-session package (Valid for 6 months – non-transferable)',
    duration: 'Multiple visits',
    durationMinutes: 45,
  },
  package10: {
    name: 'Treatment Package (10 sessions)',
    description: 'Save €80 with our 10-session package (Valid for 6 months – non-transferable)',
    duration: 'Multiple visits',
    durationMinutes: 45,
  },
  cupping: {
    name: 'Cupping Therapy',
    description: 'Therapeutic cupping treatment as an add-on to your acupuncture session',
    duration: '',
    durationMinutes: 0,
  },
  moxibustion: {
    name: 'Moxibustion',
    description:
      'Traditional warming therapy using dried mugwort to stimulate acupuncture points',
    duration: '',
    durationMinutes: 0,
  },
}

export type SiteSnapshot = {
  websiteOverlayEnabled: boolean
  clinicName: string
  tagline: string
  description: string
  phone: {
    number: string
    formatted: string
    displayText: string
    href: string
  }
  email: {
    address: string
    href: string
  }
  social: {
    facebookUrl: string
    instagramUrl: string
  }
  locations: SiteLocation[]
  hours: WeekHours
  hoursDisplay: string[]
  emergencyNote: string
  features: {
    contactFormEnabled: boolean
    liveChatEnabled: boolean
    mapIntegrationEnabled: boolean
    treatmentPackagesEnabled: boolean
    calendlyEnabled: boolean
    bookingFormEnabled: boolean
    freshaEnabled: boolean
    smsEnabled: boolean
    bookingMaintenanceEnabled: boolean
  }
  calendly: {
    schedulingUrl: string
    initialConsultationUrl: string
    followUpUrl: string
  }
  fresha: {
    bookingUrl: string
  }
  pricing: {
    inClinic: PriceList
    homeVisit: PriceList
    inClinicOriginal: PriceList
    homeVisitOriginal: PriceList
    inClinicEnabled: boolean
    homeVisitEnabled: boolean
    inClinicItems: PriceListEnabled
    homeVisitItems: PriceListEnabled
    inClinicExtras: PricingExtra[]
    homeVisitExtras: PricingExtra[]
    serviceCopy: ServiceCopy
  }
  insuranceParagraphs: [string, string, string]
  insurers: SiteInsurer[]
  reviews: DefaultReview[]
}

const celbridgeAddress =
  '56 The Orchard Oldtown Mill Celbridge Co.Kildare W23 K603'
const carlowAddress = '16 Kennedy St, Graigue, Carlow, R93 H2X8'

const openDay: DayHours = { closed: false, open: '09:00', close: '20:00' }

export const DEFAULT_HOURS: WeekHours = {
  sunday: { ...openDay },
  monday: { ...openDay },
  tuesday: { ...openDay },
  wednesday: { ...openDay },
  thursday: { ...openDay },
  friday: { ...openDay },
  saturday: { closed: true, open: '09:00', close: '20:00' },
}

export const SITE_DEFAULTS: SiteSnapshot = {
  websiteOverlayEnabled: false,
  clinicName: 'Wellness Needles',
  tagline:
    'Experience the ancient healing art of acupuncture with modern wellness practices.',
  description:
    'Our treatments combine traditional Chinese medicine with contemporary therapeutic approaches for holistic healing and well-being.',
  phone: {
    number: '0860543085',
    formatted: '086 054 3085',
    displayText: '+353 86 054 3085',
    href: 'tel:+353860543085',
  },
  email: {
    address: 'info@wellnessneedles.ie',
    href: 'mailto:info@wellnessneedles.ie?subject=Appointment%20enquiry',
  },
  social: {
    facebookUrl: 'https://www.facebook.com/WellnessNeedles',
    instagramUrl: 'https://www.instagram.com/wellnessneedles',
  },
  locations: [
    {
      id: 'celbridge',
      label: 'Celbridge',
      full: celbridgeAddress,
      street: '56 The Orchard Oldtown Mill',
      city: 'Celbridge',
      county: 'Co.Kildare',
      postcode: 'W23 K603',
      mapQuery: celbridgeAddress,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(celbridgeAddress)}`,
      enabled: true,
    },
    {
      id: 'carlow',
      label: 'Carlow',
      full: carlowAddress,
      street: '16 Kennedy St',
      city: 'Graigue',
      county: 'Carlow',
      postcode: 'R93 H2X8',
      mapQuery: carlowAddress,
      directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(carlowAddress)}`,
      enabled: true,
    },
  ],
  hours: DEFAULT_HOURS,
  hoursDisplay: ['Sunday - Friday: 9:00 AM – 8:00 PM', 'Saturday: Closed'],
  emergencyNote: 'Emergency appointments available by request',
  features: {
    contactFormEnabled: false,
    liveChatEnabled: false,
    mapIntegrationEnabled: true,
    treatmentPackagesEnabled: false,
    calendlyEnabled: false,
    bookingFormEnabled: true,
    freshaEnabled: false,
    smsEnabled: false,
    bookingMaintenanceEnabled: false,
  },
  calendly: {
    schedulingUrl: 'https://calendly.com/hbacalso1229/scheduled-booking',
    initialConsultationUrl:
      'https://calendly.com/hbacalso1229/initial-consultation',
    followUpUrl: 'https://calendly.com/hbacalso1229/follow-up',
  },
  fresha: {
    bookingUrl: 'https://www.fresha.com/a/YOUR-BUSINESS',
  },
  pricing: {
    inClinic: {
      initial: '€75',
      followUp: '€60',
      package5: '€270',
      package10: '€520',
      cupping: '€20',
      moxibustion: '€0',
    },
    homeVisit: {
      initial: '€120',
      followUp: '€90',
      package5: '€350',
      package10: '€690',
      cupping: '€25',
      moxibustion: '€0',
    },
    inClinicOriginal: {
      initial: '€150',
      followUp: '€120',
      package5: '€300',
      package10: '€600',
      cupping: '',
      moxibustion: '',
    },
    homeVisitOriginal: {
      initial: '€250',
      followUp: '€180',
      package5: '€375',
      package10: '€750',
      cupping: '',
      moxibustion: '',
    },
    inClinicEnabled: true,
    homeVisitEnabled: true,
    inClinicItems: defaultPriceItemFlags(false),
    homeVisitItems: defaultPriceItemFlags(false),
    inClinicExtras: [],
    homeVisitExtras: [],
    serviceCopy: DEFAULT_SERVICE_COPY,
  },
  insuranceParagraphs: [
    'We are a registered professional acupuncture clinic',
    'You may be able to claim acupuncture treatment through your health insurance, depending on your provider and level of cover.',
    'Please check with your insurer before your appointment. We will provide a receipt for your claim after treatment.',
  ],
  insurers: [
    {
      id: 'aviva',
      name: 'Aviva',
      href: 'https://www.aviva.ie/',
      logo: '/insurance/aviva.svg',
      enabled: true,
      sortOrder: 0,
    },
    {
      id: 'laya',
      name: 'Laya Healthcare',
      href: 'https://www.layahealthcare.ie/',
      logo: '/insurance/laya.png',
      enabled: true,
      sortOrder: 1,
    },
    {
      id: 'hsf',
      name: 'HSF Health Plan',
      href: 'https://www.hsf.ie/',
      logo: '/insurance/hsf.png',
      enabled: true,
      sortOrder: 2,
    },
    {
      id: 'vhi',
      name: 'Vhi',
      href: 'https://www.vhi.ie/',
      logo: '/insurance/vhi.png',
      enabled: true,
      sortOrder: 3,
    },
    {
      id: 'irish-life-health',
      name: 'Irish Life Health',
      href: 'https://www.irishlifehealth.ie/',
      logo: '/insurance/glohealth.svg',
      enabled: true,
      sortOrder: 4,
    },
  ],
  reviews: DEFAULT_REVIEWS,
}

/** Owner types an amount; published snapshot keeps a hardcoded euro prefix. */
export function priceDigits(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '')
  const dot = cleaned.indexOf('.')
  if (dot === -1) return cleaned
  const whole = cleaned.slice(0, dot).replace(/\./g, '')
  const fraction = cleaned
    .slice(dot + 1)
    .replace(/\./g, '')
    .slice(0, 2)
  return `${whole}.${fraction}`
}

export function euroPrice(value: string): string {
  const amount = priceDigits(value)
  if (!amount || amount === '.') return ''
  return `€${amount}`
}

function priceAmount(value: string): number | null {
  const amount = priceDigits(value)
  if (!amount || amount === '.') return null
  const n = Number(amount)
  return Number.isFinite(n) ? n : null
}

export function isFreePrice(value: string): boolean {
  if (/^\s*free\b/i.test(value)) return true
  return priceAmount(value) === 0
}

function asEuroOrFree(value: string): string {
  if (isFreePrice(value)) return '€0'
  return value
}

/** Strikethrough only when original and discounted are both set and differ. */
export function pricesDiffer(original: string, discounted: string): boolean {
  const orig = priceAmount(original)
  if (orig == null || orig <= 0) return false
  const disc = priceAmount(discounted)
  if (disc == null) return false
  return orig !== disc
}

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isHhmm(value: unknown): value is string {
  return typeof value === 'string' && HHMM.test(value)
}

export function parseWeekHours(value: unknown): WeekHours | null {
  if (!value || typeof value !== 'object') return null
  const hours = value as Record<string, unknown>
  const parsed = {} as WeekHours
  for (const day of WEEKDAYS) {
    const row = hours[day]
    if (!row || typeof row !== 'object') return null
    const rec = row as Record<string, unknown>
    if (typeof rec.closed !== 'boolean' || !isHhmm(rec.open) || !isHhmm(rec.close)) {
      return null
    }
    parsed[day] = {
      closed: rec.closed,
      open: rec.open,
      close: rec.close,
    }
  }
  if (WEEKDAYS.every((day) => parsed[day].closed)) return null
  return parsed
}

export function weekdayFromDateInput(dateStr: string): Weekday | null {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  const day = new Date(y, m - 1, d).getDay()
  return WEEKDAYS[day] ?? null
}

/** Overlay off / invalid hours: Saturday only. */
export function isClosedBookingDate(
  dateStr: string,
  hours?: WeekHours | null
): boolean {
  if (!dateStr) return false
  const weekday = weekdayFromDateInput(dateStr)
  if (!weekday) return false
  if (!hours) return weekday === 'saturday'
  return hours[weekday].closed
}

export function buildHoursDisplay(hours: WeekHours): string[] {
  const closedNames = WEEKDAYS.filter((day) => hours[day].closed).map(
    (day) => day.charAt(0).toUpperCase() + day.slice(1)
  )
  const openDays = WEEKDAYS.filter((day) => !hours[day].closed)
  const sample = openDays[0] ? hours[openDays[0]] : null
  const openLabel = sample
    ? formatHourLabel(sample.open) + ' – ' + formatHourLabel(sample.close)
    : ''
  const closedLine =
    closedNames.length > 0 ? `Closed ${closedNames.join(', ')}` : 'Open daily'
  const openLine =
    openDays.length > 0
      ? `${openDays.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join('–')} ${openLabel}`
      : ''
  return openLine ? [openLine, closedLine] : [closedLine]
}

export function formatHourLabel(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':')
  const h = Number(hStr)
  const m = Number(mStr)
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return m === 0 ? `${hour12}:00 ${suffix}` : `${hour12}:${mStr} ${suffix}`
}

export function calendarFooter(hours: WeekHours): string {
  const closed = WEEKDAYS.filter((d) => hours[d].closed)
  const open = WEEKDAYS.filter((d) => !hours[d].closed)
  const closedBit =
    closed.length === 1
      ? `Closed ${closed[0].charAt(0).toUpperCase() + closed[0].slice(1)}s`
      : closed.length
        ? `Closed ${closed.map((d) => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}`
        : 'Open daily'
  if (!open.length) return closedBit
  const sample = hours[open[0]]
  const openNames = open.map((d) => d.charAt(0).toUpperCase() + d.slice(1))
  return `${closedBit} · ${openNames[0]}–${openNames[openNames.length - 1]} ${formatHourLabel(sample.open)} – ${formatHourLabel(sample.close)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function parsePriceList(
  value: unknown,
  fallback: PriceList,
  allowEmpty: boolean
): PriceList {
  const rec = isRecord(value) ? value : {}
  const pick = (key: keyof PriceList) => {
    if (allowEmpty && typeof rec[key] === 'string') return rec[key].trim()
    return asString(rec[key], fallback[key])
  }
  return {
    initial: pick('initial'),
    followUp: pick('followUp'),
    package5: pick('package5'),
    package10: pick('package10'),
    cupping: pick('cupping'),
    moxibustion: asEuroOrFree(pick('moxibustion')),
  }
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function parsePriceItemFlags(value: unknown, packagesEnabled: boolean): PriceListEnabled {
  const fallback = defaultPriceItemFlags(packagesEnabled)
  const rec = isRecord(value) ? value : {}
  return {
    initial: asBool(rec.initial, fallback.initial),
    followUp: asBool(rec.followUp, fallback.followUp),
    package5: asBool(rec.package5, fallback.package5),
    package10: asBool(rec.package10, fallback.package10),
    cupping: asBool(rec.cupping, fallback.cupping),
    moxibustion: asBool(rec.moxibustion, fallback.moxibustion),
  }
}

function parsePricingExtra(value: unknown): PricingExtra | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) return null
  const kind: PricingExtraKind | null =
    value.kind === 'service' || value.kind === 'package' || value.kind === 'addon'
      ? value.kind
      : null
  if (!kind) return null
  const id = value.id.trim()
  const minutes =
    typeof value.durationMinutes === 'number' && Number.isFinite(value.durationMinutes)
      ? value.durationMinutes
      : defaultExtraDurationMinutes(kind)
  return {
    id: id.startsWith('extra-') ? id : `extra-${id}`,
    kind,
    name: typeof value.name === 'string' ? value.name.trim() : '',
    price: typeof value.price === 'string' ? value.price.trim() : '',
    original: typeof value.original === 'string' ? value.original.trim() : '',
    description: typeof value.description === 'string' ? value.description.trim() : '',
    enabled: asBool(value.enabled, true),
    durationMinutes: minutes,
  }
}

function parsePricingExtras(value: unknown): PricingExtra[] {
  if (!Array.isArray(value)) return []
  return value.map(parsePricingExtra).filter((row): row is PricingExtra => row !== null)
}

function parseServiceCopyItem(value: unknown, fallback: ServiceCopyItem): ServiceCopyItem {
  const rec = isRecord(value) ? value : {}
  const minutes =
    typeof rec.durationMinutes === 'number' && Number.isFinite(rec.durationMinutes)
      ? rec.durationMinutes
      : fallback.durationMinutes
  return {
    name: asString(rec.name, fallback.name),
    description: asString(rec.description, fallback.description),
    duration: typeof rec.duration === 'string' ? rec.duration.trim() : fallback.duration,
    durationMinutes: minutes,
  }
}

function parseServiceCopy(value: unknown): ServiceCopy {
  const rec = isRecord(value) ? value : {}
  return {
    initial: parseServiceCopyItem(rec.initial, DEFAULT_SERVICE_COPY.initial),
    followUp: parseServiceCopyItem(rec.followUp, DEFAULT_SERVICE_COPY.followUp),
    package5: parseServiceCopyItem(rec.package5, DEFAULT_SERVICE_COPY.package5),
    package10: parseServiceCopyItem(rec.package10, DEFAULT_SERVICE_COPY.package10),
    cupping: parseServiceCopyItem(rec.cupping, DEFAULT_SERVICE_COPY.cupping),
    moxibustion: parseServiceCopyItem(rec.moxibustion, DEFAULT_SERVICE_COPY.moxibustion),
  }
}

function parseLocation(value: unknown): SiteLocation | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') {
    return null
  }
  const composed = composeLocation({
    id: value.id,
    label: value.label,
    street: asString(value.street, ''),
    city: asString(value.city, ''),
    county: asString(value.county, ''),
    postcode: asString(value.postcode, ''),
    enabled: asBool(value.enabled, true),
  })
  const full = asString(value.full, composed.full)
  return {
    ...composed,
    full,
    mapQuery: asString(value.mapQuery, full),
    directionsUrl: asString(value.directionsUrl, composed.directionsUrl),
  }
}

export function parseSiteSnapshot(value: unknown): SiteSnapshot | null {
  if (!isRecord(value)) return null
  const hours = parseWeekHours(value.hours)
  if (!hours) return null
  if (!isRecord(value.phone) || !isRecord(value.email) || !isRecord(value.features)) {
    return null
  }
  if (!Array.isArray(value.locations) || value.locations.length < 1) return null
  const locations = value.locations
    .map(parseLocation)
    .filter((loc): loc is SiteLocation => loc !== null)
  if (locations.length < 1) return null
  if (!isRecord(value.pricing) || !isRecord(value.pricing.inClinic) || !isRecord(value.pricing.homeVisit)) {
    return null
  }
  const reviews = Array.isArray(value.reviews)
    ? value.reviews.filter(isReviewShape)
    : SITE_DEFAULTS.reviews
  const insurers = Array.isArray(value.insurers)
    ? value.insurers
        .map((row, index) => parseSiteInsurer(row, index))
        .filter((row): row is SiteInsurer => row !== null)
    : SITE_DEFAULTS.insurers

  const paragraphs = Array.isArray(value.insuranceParagraphs)
    ? value.insuranceParagraphs
    : SITE_DEFAULTS.insuranceParagraphs

  return {
    websiteOverlayEnabled: asBool(value.websiteOverlayEnabled, false),
    clinicName: asString(value.clinicName, SITE_DEFAULTS.clinicName),
    tagline: asString(value.tagline, SITE_DEFAULTS.tagline),
    description: asString(value.description, SITE_DEFAULTS.description),
    phone: {
      number: asString(value.phone.number, SITE_DEFAULTS.phone.number),
      formatted: asString(value.phone.formatted, SITE_DEFAULTS.phone.formatted),
      displayText: asString(value.phone.displayText, SITE_DEFAULTS.phone.displayText),
      href: asString(value.phone.href, SITE_DEFAULTS.phone.href),
    },
    email: {
      address: asString(value.email.address, SITE_DEFAULTS.email.address),
      href: asString(value.email.href, SITE_DEFAULTS.email.href),
    },
    social: {
      facebookUrl: asString(
        isRecord(value.social) ? value.social.facebookUrl : '',
        SITE_DEFAULTS.social.facebookUrl
      ),
      instagramUrl: asString(
        isRecord(value.social) ? value.social.instagramUrl : '',
        SITE_DEFAULTS.social.instagramUrl
      ),
    },
    locations,
    hours,
    hoursDisplay: buildHoursDisplay(hours),
    emergencyNote: asString(value.emergencyNote, SITE_DEFAULTS.emergencyNote),
    features: {
      contactFormEnabled: asBool(
        value.features.contactFormEnabled,
        SITE_DEFAULTS.features.contactFormEnabled
      ),
      liveChatEnabled: asBool(
        value.features.liveChatEnabled,
        SITE_DEFAULTS.features.liveChatEnabled
      ),
      mapIntegrationEnabled: asBool(
        value.features.mapIntegrationEnabled,
        SITE_DEFAULTS.features.mapIntegrationEnabled
      ),
      treatmentPackagesEnabled: asBool(
        value.features.treatmentPackagesEnabled,
        SITE_DEFAULTS.features.treatmentPackagesEnabled
      ),
      calendlyEnabled: asBool(
        value.features.calendlyEnabled,
        SITE_DEFAULTS.features.calendlyEnabled
      ),
      bookingFormEnabled: asBool(
        value.features.bookingFormEnabled,
        SITE_DEFAULTS.features.bookingFormEnabled
      ),
      freshaEnabled: asBool(
        value.features.freshaEnabled,
        SITE_DEFAULTS.features.freshaEnabled
      ),
      smsEnabled: asBool(value.features.smsEnabled, SITE_DEFAULTS.features.smsEnabled),
      bookingMaintenanceEnabled: asBool(
        value.features.bookingMaintenanceEnabled,
        SITE_DEFAULTS.features.bookingMaintenanceEnabled
      ),
    },
    calendly: {
      schedulingUrl: asString(
        isRecord(value.calendly) ? value.calendly.schedulingUrl : '',
        SITE_DEFAULTS.calendly.schedulingUrl
      ),
      initialConsultationUrl: asString(
        isRecord(value.calendly) ? value.calendly.initialConsultationUrl : '',
        SITE_DEFAULTS.calendly.initialConsultationUrl
      ),
      followUpUrl: asString(
        isRecord(value.calendly) ? value.calendly.followUpUrl : '',
        SITE_DEFAULTS.calendly.followUpUrl
      ),
    },
    fresha: {
      bookingUrl: asString(
        isRecord(value.fresha) ? value.fresha.bookingUrl : '',
        SITE_DEFAULTS.fresha.bookingUrl
      ),
    },
    pricing: {
      inClinic: parsePriceList(
        value.pricing.inClinic,
        SITE_DEFAULTS.pricing.inClinic,
        false
      ),
      homeVisit: parsePriceList(
        value.pricing.homeVisit,
        SITE_DEFAULTS.pricing.homeVisit,
        false
      ),
      inClinicOriginal: parsePriceList(
        value.pricing.inClinicOriginal,
        SITE_DEFAULTS.pricing.inClinicOriginal,
        true
      ),
      homeVisitOriginal: parsePriceList(
        value.pricing.homeVisitOriginal,
        SITE_DEFAULTS.pricing.homeVisitOriginal,
        true
      ),
      inClinicEnabled: asBool(value.pricing.inClinicEnabled, true),
      homeVisitEnabled: asBool(value.pricing.homeVisitEnabled, true),
      inClinicItems: parsePriceItemFlags(
        value.pricing.inClinicItems,
        asBool(
          value.features.treatmentPackagesEnabled,
          SITE_DEFAULTS.features.treatmentPackagesEnabled
        )
      ),
      homeVisitItems: parsePriceItemFlags(
        value.pricing.homeVisitItems,
        asBool(
          value.features.treatmentPackagesEnabled,
          SITE_DEFAULTS.features.treatmentPackagesEnabled
        )
      ),
      inClinicExtras: parsePricingExtras(value.pricing.inClinicExtras),
      homeVisitExtras: parsePricingExtras(value.pricing.homeVisitExtras),
      serviceCopy: parseServiceCopy(value.pricing.serviceCopy),
    },
    insuranceParagraphs: [
      asString(paragraphs[0], SITE_DEFAULTS.insuranceParagraphs[0]),
      asString(paragraphs[1], SITE_DEFAULTS.insuranceParagraphs[1]),
      asString(paragraphs[2], SITE_DEFAULTS.insuranceParagraphs[2]),
    ],
    insurers,
    reviews,
  }
}

function isReviewShape(value: unknown): value is DefaultReview {
  if (!isRecord(value)) return false
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.reviewedAt === 'string' &&
    typeof value.rating === 'number'
  )
}

function parseSiteInsurer(value: unknown, index: number): SiteInsurer | null {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id.trim()) return null
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  const sortOrder =
    typeof value.sortOrder === 'number' && Number.isFinite(value.sortOrder)
      ? value.sortOrder
      : index
  return {
    id: value.id.trim(),
    name,
    href: asString(value.href, ''),
    logo: asString(value.logo, ''),
    enabled: asBool(value.enabled, true),
    sortOrder,
  }
}

export function deepMergeSite(
  defaults: SiteSnapshot,
  incoming: SiteSnapshot
): SiteSnapshot {
  return {
    ...defaults,
    ...incoming,
    phone: { ...defaults.phone, ...incoming.phone },
    email: { ...defaults.email, ...incoming.email },
    social: { ...defaults.social, ...incoming.social },
    features: { ...defaults.features, ...incoming.features },
    calendly: { ...defaults.calendly, ...incoming.calendly },
    fresha: { ...defaults.fresha, ...incoming.fresha },
    pricing: {
      inClinic: { ...defaults.pricing.inClinic, ...incoming.pricing.inClinic },
      homeVisit: { ...defaults.pricing.homeVisit, ...incoming.pricing.homeVisit },
      inClinicOriginal: {
        ...defaults.pricing.inClinicOriginal,
        ...incoming.pricing.inClinicOriginal,
      },
      homeVisitOriginal: {
        ...defaults.pricing.homeVisitOriginal,
        ...incoming.pricing.homeVisitOriginal,
      },
      inClinicEnabled: incoming.pricing.inClinicEnabled,
      homeVisitEnabled: incoming.pricing.homeVisitEnabled,
      inClinicItems: { ...defaults.pricing.inClinicItems, ...incoming.pricing.inClinicItems },
      homeVisitItems: { ...defaults.pricing.homeVisitItems, ...incoming.pricing.homeVisitItems },
      inClinicExtras: incoming.pricing.inClinicExtras.length
        ? incoming.pricing.inClinicExtras
        : defaults.pricing.inClinicExtras,
      homeVisitExtras: incoming.pricing.homeVisitExtras.length
        ? incoming.pricing.homeVisitExtras
        : defaults.pricing.homeVisitExtras,
      serviceCopy: {
        ...defaults.pricing.serviceCopy,
        ...incoming.pricing.serviceCopy,
        initial: {
          ...defaults.pricing.serviceCopy.initial,
          ...incoming.pricing.serviceCopy?.initial,
        },
        followUp: {
          ...defaults.pricing.serviceCopy.followUp,
          ...incoming.pricing.serviceCopy?.followUp,
        },
        package5: {
          ...defaults.pricing.serviceCopy.package5,
          ...incoming.pricing.serviceCopy?.package5,
        },
        package10: {
          ...defaults.pricing.serviceCopy.package10,
          ...incoming.pricing.serviceCopy?.package10,
        },
        cupping: {
          ...defaults.pricing.serviceCopy.cupping,
          ...incoming.pricing.serviceCopy?.cupping,
        },
        moxibustion: {
          ...defaults.pricing.serviceCopy.moxibustion,
          ...incoming.pricing.serviceCopy?.moxibustion,
        },
      },
    },
    hours: incoming.hours,
    hoursDisplay: incoming.hoursDisplay.length
      ? incoming.hoursDisplay
      : buildHoursDisplay(incoming.hours),
    locations: incoming.locations.length ? incoming.locations : defaults.locations,
    insurers: incoming.insurers.length ? incoming.insurers : defaults.insurers,
    reviews: incoming.reviews.length ? incoming.reviews : defaults.reviews,
    insuranceParagraphs: incoming.insuranceParagraphs,
  }
}

export function overlayKillSwitchOff(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.env.NEXT_PUBLIC_SITE_OVERLAY_ENABLED === 'false'
  )
}

export const PUBLIC_CACHE_CONTROL =
  'public, max-age=0, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400'

export const SITE_CACHE_TAG = 'site-public'
export const KV_SITE_KEY = 'public:site:v1'
