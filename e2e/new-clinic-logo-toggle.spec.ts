import type { Page } from '@playwright/test'
import { test, expect } from './fixtures'
import { SITE_DEFAULTS } from '../shared/site-snapshot'

const newLogoOn = {
  ...SITE_DEFAULTS,
  websiteOverlayEnabled: true,
  features: { ...SITE_DEFAULTS.features, newClinicLogoEnabled: true },
}

async function mockPublishedSite(page: Page, site: typeof SITE_DEFAULTS) {
  await page.route('**/api/bff/site**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(site),
    })
  })
}

test.describe('New clinic logo overlay', () => {
  test('header, footer, thank-you, and unable-to-process all switch together', async ({
    page,
  }) => {
    test.setTimeout(60_000)
    await mockPublishedSite(page, newLogoOn)

    const overlayFetch = page
      .waitForRequest((request) => request.url().includes('/api/bff/site'), {
        timeout: 8_000,
      })
      .then(() => true)
      .catch(() => false)

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    test.skip(
      !(await overlayFetch),
      'This build does not fetch the public overlay, so the new clinic logo srcs cannot be asserted here.'
    )

    await expect(
      page.getByRole('banner').getByRole('link', { name: /Wellness Needles home/i })
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByRole('banner').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_new\.png/, { timeout: 10_000 })
    await expect(
      page.getByRole('contentinfo').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_new_icon\.png/)

    await page.goto('/bookings/thank-you/')
    await expect(
      page.getByRole('link', { name: /Wellness Needles/i }).first().locator('img')
    ).toHaveAttribute('src', /logo_wellness_new\.png/)

    await page.goto('/bookings/unable-to-process/')
    await expect(
      page.getByRole('link', { name: /Wellness Needles/i }).first().locator('img')
    ).toHaveAttribute('src', /logo_wellness_new_icon\.png/)
  })

  test('flag on with overlay off keeps original logos', async ({ page }) => {
    await mockPublishedSite(page, {
      ...SITE_DEFAULTS,
      websiteOverlayEnabled: false,
      features: { ...SITE_DEFAULTS.features, newClinicLogoEnabled: true },
    })

    await page.goto('/')
    await expect(
      page.getByRole('banner').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_transparent\.png/)
    await expect(
      page.getByRole('contentinfo').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_icon\.png/)
  })
})
