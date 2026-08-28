import {
  DEFAULT_SERVICE_COPY,
  defaultPriceItemFlags,
  durationPhrase,
  formatHourLabel,
  pricesDiffer,
  type PriceItemKey,
  type PriceList,
  type PriceListEnabled,
  type PricingExtra,
  type ServiceCopy,
  type SiteSnapshot,
  type Weekday,
} from '../../shared/site-snapshot'
import {
  homeVisitAddOns,
  homeVisitServices,
  inClinicAddOns,
  inClinicServices,
  type BookingCatalogAddOn,
  type BookingCatalogService,
} from '@/lib/booking-catalog'

const SERVICE_PRICE_KEY: Record<string, PriceItemKey> = {
  'initial-consultation': 'initial',
  'follow-up': 'followUp',
  'package-5': 'package5',
  'package-10': 'package10',
  'home-initial-consultation': 'initial',
  'home-follow-up': 'followUp',
  'home-package-5': 'package5',
  'home-package-10': 'package10',
}

const ADDON_PRICE_KEY: Record<string, PriceItemKey> = {
  cupping: 'cupping',
  'home-cupping': 'cupping',
  moxibustion: 'moxibustion',
}

function isFilledExtra(extra: PricingExtra): boolean {
  return extra.enabled && Boolean(extra.name.trim()) && Boolean(extra.price.trim())
}

function applyServicePrices(
  services: BookingCatalogService[],
  discounted: PriceList,
  original: PriceList,
  items: PriceListEnabled,
  copy: ServiceCopy
): BookingCatalogService[] {
  return services.flatMap((service) => {
    const key = SERVICE_PRICE_KEY[service.id]
    if (key && items[key] === false) return []
    if (!key) return [service]
    const price = discounted[key] || service.price
    const orig = original[key]
    const item = copy[key]
    return [
      {
        ...service,
        name: item.name.trim() || service.name,
        description: item.description.trim() || service.description,
        duration: item.duration.trim() || service.duration,
        price,
        originalPrice: pricesDiffer(orig ?? '', price) ? orig : undefined,
      },
    ]
  })
}

function applyAddOnPrices(
  addOns: BookingCatalogAddOn[],
  discounted: PriceList,
  original: PriceList,
  items: PriceListEnabled,
  copy: ServiceCopy
): BookingCatalogAddOn[] {
  return addOns.flatMap((addOn) => {
    const key = ADDON_PRICE_KEY[addOn.id]
    if (key && items[key] === false) return []
    if (!key) return [addOn]
    const price = discounted[key] || addOn.price
    const orig = original[key]
    const item = copy[key]
    return [
      {
        ...addOn,
        name: item.name.trim() || addOn.name,
        description: item.description.trim() || addOn.description,
        price,
        originalPrice: pricesDiffer(orig ?? '', price) ? orig : undefined,
      },
    ]
  })
}

function extraToService(extra: PricingExtra): BookingCatalogService | null {
  if ((extra.kind !== 'package' && extra.kind !== 'service') || !isFilledExtra(extra)) return null
  const price = extra.price.trim()
  const original = extra.original.trim()
  return {
    id: extra.id,
    name: extra.name.trim(),
    duration:
      extra.kind === 'package'
        ? 'Multiple visits'
        : durationPhrase(extra.durationMinutes || 60),
    price,
    originalPrice: pricesDiffer(original, price) ? original : undefined,
    description: extra.description.trim() || extra.name.trim(),
  }
}

function extraToAddOn(extra: PricingExtra): BookingCatalogAddOn | null {
  if (extra.kind !== 'addon' || !isFilledExtra(extra)) return null
  const price = extra.price.trim()
  const original = extra.original.trim()
  return {
    id: extra.id,
    name: extra.name.trim(),
    price,
    originalPrice: pricesDiffer(original, price) ? original : undefined,
    description: extra.description.trim() || extra.name.trim(),
  }
}

export function withOverlayCatalog(site: SiteSnapshot) {
  const clinicOn = site.pricing.inClinicEnabled !== false
  const visitOn = site.pricing.homeVisitEnabled !== false
  const clinicItems = site.pricing.inClinicItems ?? defaultPriceItemFlags(false)
  const visitItems = site.pricing.homeVisitItems ?? defaultPriceItemFlags(false)
  const clinicExtras = site.pricing.inClinicExtras ?? []
  const visitExtras = site.pricing.homeVisitExtras ?? []
  const copy = site.pricing.serviceCopy ?? DEFAULT_SERVICE_COPY
  const clinicServices = clinicOn
    ? [
        ...applyServicePrices(
          inClinicServices,
          site.pricing.inClinic,
          site.pricing.inClinicOriginal,
          clinicItems,
          copy
        ),
        ...clinicExtras.map(extraToService).filter((row): row is BookingCatalogService => row !== null),
      ]
    : []
  const visitServices = visitOn
    ? [
        ...applyServicePrices(
          homeVisitServices,
          site.pricing.homeVisit,
          site.pricing.homeVisitOriginal,
          visitItems,
          copy
        ),
        ...visitExtras.map(extraToService).filter((row): row is BookingCatalogService => row !== null),
      ]
    : []
  const clinicAddOns = clinicOn
    ? [
        ...applyAddOnPrices(
          inClinicAddOns,
          site.pricing.inClinic,
          site.pricing.inClinicOriginal,
          clinicItems,
          copy
        ),
        ...clinicExtras.map(extraToAddOn).filter((row): row is BookingCatalogAddOn => row !== null),
      ]
    : []
  const visitAddOns = visitOn
    ? [
        ...applyAddOnPrices(
          homeVisitAddOns,
          site.pricing.homeVisit,
          site.pricing.homeVisitOriginal,
          visitItems,
          copy
        ),
        ...visitExtras.map(extraToAddOn).filter((row): row is BookingCatalogAddOn => row !== null),
      ]
    : []
  return {
    inClinicServices: clinicServices,
    homeVisitServices: visitServices,
    inClinicAddOns: clinicAddOns,
    homeVisitAddOns: visitAddOns,
    inClinicEnabled: clinicOn && clinicServices.length > 0,
    homeVisitEnabled: visitOn && visitServices.length > 0,
  }
}

/** Overlay catalog, or null so callers keep baked lists when both categories are empty. */
export function overlayCatalogOrNull(site: SiteSnapshot) {
  const catalog = withOverlayCatalog(site)
  if (!catalog.inClinicEnabled && !catalog.homeVisitEnabled) return null
  return catalog
}

export function joinLocationLabels(labels: string[]): string {
  const names = labels.map((label) => label.trim()).filter(Boolean)
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

const LOCATION_COUNT_WORDS = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
] as const

/** Contact "Visit Us" subtitle from the enabled clinic count. */
export function visitLocationsSubtitle(count: number): string {
  if (count <= 0) return ''
  if (count === 1) return 'A convenient location to support your care.'
  const word = LOCATION_COUNT_WORDS[count]
  const n = word ?? String(count)
  return `${n} convenient locations to support your care.`
}

export function formatOverlayDayHours(
  hours: SiteSnapshot['hours'],
  day: Weekday
): string {
  const row = hours[day]
  if (row.closed) return 'Closed'
  return `${formatHourLabel(row.open)} – ${formatHourLabel(row.close)}`
}
