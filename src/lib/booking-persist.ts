import { SITE_DEFAULTS, type SiteSnapshot } from '../../shared/site-snapshot'

export async function persistBookingRequest(payload: {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType?: string
  locationLabel?: string
  serviceLabel?: string
  date?: string
  time?: string
  smsOptIn?: boolean
}): Promise<void> {
  if (process.env.NEXT_PUBLIC_E2E === 'true') return
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/bff/booking-persist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      keepalive: true,
      body: JSON.stringify(payload),
    })
  } catch (error) {
    console.error('[booking persist]', error)
  }
}

export function publicSiteOrDefaults(site: SiteSnapshot | null): SiteSnapshot {
  return site || SITE_DEFAULTS
}
