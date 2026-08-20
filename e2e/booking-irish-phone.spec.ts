import { test, expect } from './fixtures'
import { fillBookingRequestForm, openBookingDetailsStep } from './booking-helpers'

/**
 * Requires `npm run build:e2e` with NEXT_PUBLIC_STRICT_IRISH_PHONE=true
 * (country lock baked in scripts/build-e2e.mjs).
 */
test.describe('booking Irish mobile lock', () => {
  test('locks the country to Ireland and hides the country picker', async ({
    page,
  }) => {
    await openBookingDetailsStep(page)

    await expect(page.locator('#phone')).toBeVisible()
    await expect(page.getByText('+353').first()).toBeVisible()
    await expect(page.getByText(/Country locked to Ireland \(\+353\)/i)).toBeVisible()
    await expect(page.locator('#phone-country')).toHaveCount(0)
  })

  test('shows the unable-to-use-this-number modal for a landline setup', async ({
    page,
  }) => {
    await openBookingDetailsStep(page)

    const phone = page.locator('#phone')
    await phone.fill('214271234')
    await page.getByRole('button', { name: 'Request appointment' }).click()

    const dialog = page.getByRole('dialog', {
      name: /this number isn't supported/i,
    })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('+353 21 427 1234')).toBeVisible()
    await expect(
      dialog.getByText(/appointment requests currently accept Irish mobile numbers only/i)
    ).toBeVisible()
    await expect(dialog.getByRole('button', { name: /Try another number/i })).toBeVisible()
    await expect(dialog.getByRole('link', { name: /^Call us$/i })).toBeVisible()
    await expect(dialog.getByRole('link', { name: /Send a message/i })).toBeVisible()

    await dialog.getByRole('button', { name: /Try another number/i }).click()
    await expect(dialog).toHaveCount(0)
    await expect(phone).toBeFocused()
  })

  test('backdrop dismiss stays closed after focusing the phone field', async ({
    page,
  }) => {
    await openBookingDetailsStep(page)

    const phone = page.locator('#phone')
    await phone.fill('214271234')
    await page.getByRole('button', { name: 'Request appointment' }).click()

    const dialog = page.getByRole('dialog', {
      name: /this number isn't supported/i,
    })
    await expect(dialog).toBeVisible()

    await page.getByTestId('booking-phone-invalid-backdrop').click({
      position: { x: 8, y: 8 },
    })
    await expect(dialog).toHaveCount(0)

    await phone.focus()
    await phone.blur()
    await expect(dialog).toHaveCount(0)
  })

  test('accepts a valid Irish mobile and reaches thank-you', async ({ page }) => {
    await fillBookingRequestForm(page)

    await page.getByRole('button', { name: 'Request appointment' }).click()

    await expect(
      page.getByRole('dialog', { name: /this number isn't supported/i })
    ).toHaveCount(0)
    await expect(page).toHaveURL(/\/bookings\/thank-you\/?$/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /Thank you, E2E/i })).toBeVisible()
  })
})
