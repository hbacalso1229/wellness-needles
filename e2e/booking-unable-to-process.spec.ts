import { test, expect } from './fixtures'
import { fillBookingRequestForm } from './booking-helpers'

test.describe('booking unable-to-process', () => {
  test('apologetic page shows call, email, and try again', async ({ page }) => {
    await page.goto('/bookings/unable-to-process/')

    await expect(
      page.getByRole('heading', { name: /unable to process your appointment request/i })
    ).toBeVisible()
    await expect(page.getByText(/sorry for the inconvenience/i)).toBeVisible()

    await expect(page.getByRole('heading', { name: /Need help/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Call us/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Send a message/i })).toBeVisible()
    await expect(page.getByText(/\+?353|086/i).first()).toBeVisible()

    await expect(page.getByRole('banner')).toHaveCount(0)
    await expect(page.getByRole('contentinfo')).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: /Wellness Needles/i }).first().locator('img')
    ).toHaveAttribute('src', /logo_wellness_icon\.png/)

    const back = page.getByRole('link', {
      name: /Back to bookings|Close and return to booking/i,
    })
    await expect(back).toHaveAttribute('href', /\/bookings\/?/)
    await back.click()
    await expect(page).toHaveURL(/\/bookings\/?$/)
  })

  test('forced submit failure redirects to unable-to-process', async ({ page }) => {
    await fillBookingRequestForm(page)

    await page.evaluate(() => {
      sessionStorage.setItem('e2eForceBookingSubmitFail', '1')
    })

    await page.getByRole('button', { name: 'Request appointment' }).click()

    await expect(page).toHaveURL(/\/bookings\/unable-to-process\/?$/, {
      timeout: 15_000,
    })
    await expect(
      page.getByRole('heading', { name: /unable to process your appointment request/i })
    ).toBeVisible()
    await expect(page.getByText(/Web3Forms|UUID|access key/i)).toHaveCount(0)
  })

  test('unknown outcome tells the patient not to submit again', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('bookingSubmitOutcome', 'unknown')
    })
    await page.goto('/bookings/unable-to-process/')
    await expect(
      page.getByRole('heading', {
        name: /could not confirm your appointment request/i,
      })
    ).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(/may already have your request/i)).toBeVisible()
    await expect(page.getByText(/do not submit again/i)).toBeVisible()
  })
})
