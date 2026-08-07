import { test, expect } from './fixtures'
import { fillBookingRequestForm } from './booking-helpers'

test.describe('booking unable-to-process', () => {
  test('apologetic page shows call, email, and try again', async ({ page }) => {
    await page.goto('/bookings/unable-to-process/')

    await expect(
      page.getByRole('heading', { name: /unable to process your booking/i })
    ).toBeVisible()
    await expect(page.getByText(/sorry for the inconvenience/i)).toBeVisible()

    await expect(
      page.getByRole('link', { name: /Call \+?353|Call 0/i })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Email info@wellnessneedles\.ie/i })
    ).toBeVisible()

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
      page.getByRole('heading', { name: /unable to process your booking/i })
    ).toBeVisible()
    await expect(page.getByText(/Web3Forms|UUID|access key/i)).toHaveCount(0)
  })
})
