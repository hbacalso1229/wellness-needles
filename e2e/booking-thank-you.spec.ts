import { test, expect } from './fixtures'
import { fillBookingRequestForm } from './booking-helpers'

/**
 * Requires `npm run build:e2e` so submit skips hCaptcha / live email
 * and redirects to the thank-you page.
 */
test.describe('booking thank-you', () => {
  test('completes booking request and shows thank-you confirmation', async ({
    page,
  }) => {
    await fillBookingRequestForm(page)

    await page.getByRole('button', { name: 'Request appointment' }).click()

    await expect(page).toHaveURL(/\/bookings\/thank-you\/?$/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /Thank you, E2E/i })).toBeVisible()
    await expect(page.getByText(/Your booking confirmation/i)).toBeVisible()
    await expect(page.getByText(/Initial Consultation/i).first()).toBeVisible()

    // Full-screen result: site chrome gone; in-page brand remains
    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.getByRole('contentinfo')).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: /Wellness Needles/i }).first()
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: /Need help/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Call Now/i })).toBeVisible()

    await page.getByRole('link', { name: /Back to bookings|Close and return to booking/i }).click()
    await expect(page).toHaveURL(/\/bookings\/?$/)
  })
})
