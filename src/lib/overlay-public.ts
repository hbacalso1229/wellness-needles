import {
  formatHourLabel,
  type PriceList,
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

const SERVICE_PRICE_KEY: Record<string, keyof PriceList> = {
  'initial-consultation': 'initial',
  'follow-up': 'followUp',
  'package-5': 'package5',
  'package-10': 'package10',
  'home-initial-consultation': 'initial',
  'home-follow-up': 'followUp',
  'home-package-5': 'package5',
  'home-package-10': 'package10',
}

const ADDON_PRICE_KEY: Record<string, keyof PriceList> = {
  cupping: 'cupping',
  'home-cupping': 'cupping',
}

function applyServicePrices(
  services: BookingCatalogService[],
  discounted: PriceList,
  original: PriceList
): BookingCatalogService[] {
  return services.map((service) => {
    const key = SERVICE_PRICE_KEY[service.id]
    if (!key) return service
    const price = discounted[key] || service.price
    const orig = original[key]
    return {
      ...service,
      price,
      originalPrice: orig && orig !== price ? orig : undefined,
    }
  })
}

function applyAddOnPrices(
  addOns: BookingCatalogAddOn[],
  discounted: PriceList,
  original: PriceList
): BookingCatalogAddOn[] {
  return addOns.map((addOn) => {
    const key = ADDON_PRICE_KEY[addOn.id]
    if (!key) return addOn
    const price = discounted[key] || addOn.price
    const orig = original[key]
    return {
      ...addOn,
      price,
      originalPrice: orig && orig !== price ? orig : undefined,
    }
  })
}

export function withOverlayCatalog(site: SiteSnapshot) {
  return {
    inClinicServices: applyServicePrices(
      inClinicServices,
      site.pricing.inClinic,
      site.pricing.inClinicOriginal
    ),
    homeVisitServices: applyServicePrices(
      homeVisitServices,
      site.pricing.homeVisit,
      site.pricing.homeVisitOriginal
    ),
    inClinicAddOns: applyAddOnPrices(
      inClinicAddOns,
      site.pricing.inClinic,
      site.pricing.inClinicOriginal
    ),
    homeVisitAddOns: applyAddOnPrices(
      homeVisitAddOns,
      site.pricing.homeVisit,
      site.pricing.homeVisitOriginal
    ),
  }
}

export function formatOverlayDayHours(
  hours: SiteSnapshot['hours'],
  day: Weekday
): string {
  const row = hours[day]
  if (row.closed) return 'Closed'
  return `${formatHourLabel(row.open)} – ${formatHourLabel(row.close)}`
}
