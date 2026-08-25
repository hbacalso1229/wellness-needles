import { test as base, expect, type Page } from '@playwright/test'
import { SITE_DEFAULTS } from '../../shared/site-snapshot'

export const E2E_PENDING = {
  id: 'e2e-pending-1',
  firstName: 'Aoife',
  lastName: 'Murphy',
  email: 'aoife@example.com',
  phone: '+353 86 054 3085',
  serviceType: 'In Clinic',
  locationLabel: 'Celbridge — 56 The Orchard Oldtown Mill Celbridge, Co.Kildare W23 K603',
  serviceLabel: 'Initial Consultation & First Treatment',
  preferredDate: '2026-09-04',
  preferredTime: 'Morning (9:00 AM – 12:00 PM)',
  smsOptIn: 0,
  createdAt: '2026-08-24T10:00:00.000Z',
}

/** Intercept portal /api/admin so Appointments can render without Wrangler. */
export async function mockAdminApi(page: Page) {
  await page.route('**/api/admin/**', async (route) => {
    const request = route.request()
    if (request.method() !== 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      })
      return
    }
    const url = new URL(request.url())
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (path.endsWith('/api/admin/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ email: 'e2e@wellnessneedles.ie' }),
      })
      return
    }
    if (path.endsWith('/api/admin/site')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ draft: SITE_DEFAULTS, published: SITE_DEFAULTS }),
      })
      return
    }
    if (path.endsWith('/api/admin/bookings')) {
      const status = url.searchParams.get('status') || 'pending'
      const bookings = status === 'pending' ? [E2E_PENDING] : []
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ bookings }),
      })
      return
    }
    if (path.endsWith('/api/admin/reviews')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reviews: [] }),
      })
      return
    }
    if (path.endsWith('/api/admin/site-history')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ changes: [] }),
      })
      return
    }
    if (path.endsWith('/api/admin/places')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ suggestions: [] }),
      })
      return
    }

    await route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'not-mocked' }),
    })
  })
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await mockAdminApi(page)
    await use(page)
  },
})

export { expect }
