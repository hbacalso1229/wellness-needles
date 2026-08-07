import { test, expect } from './fixtures'

test.describe('smoke', () => {
  test('home loads with brand and book CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner').getByText('Wellness Needles')).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Book your appointment|Book Appointment/i }).first()
    ).toBeVisible()
  })

  test('contact page is reachable', async ({ page }) => {
    await page.goto('/contact/')
    await expect(
      page.getByRole('heading', { name: /Start Your Journey With Us/i })
    ).toBeVisible()
  })

  test('bookings page is reachable', async ({ page }) => {
    await page.goto('/bookings/')
    await expect(
      page.getByRole('heading', { name: /Request an appointment|Book Your Appointment/i }).first()
    ).toBeVisible()
  })

  test('unable-to-process page is reachable', async ({ page }) => {
    await page.goto('/bookings/unable-to-process/')
    await expect(
      page.getByRole('heading', { name: /unable to process your booking/i })
    ).toBeVisible()
  })
})
