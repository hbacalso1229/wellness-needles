import { test, expect } from './fixtures'

/**
 * Requires a static build WITHOUT NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
 * so submit skips hCaptcha and redirects to the thank-you page.
 */
test.describe('booking thank-you', () => {
  test('completes booking request and shows thank-you confirmation', async ({
    page,
  }) => {
    await page.goto('/bookings/')

    await expect(
      page.getByRole('heading', { name: /Request an appointment/i })
    ).toBeVisible()

    // Step 1 — Service (Initial Consultation is selected by default)
    await expect(page.getByRole('radio', { name: /Initial Consultation/i })).toBeChecked()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 2 — Location
    await expect(page.getByRole('heading', { name: /^Location$/i })).toBeVisible({
      timeout: 10_000,
    })
    await expect(page.getByRole('radio', { name: /Celbridge/i })).toBeChecked()
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 3 — Date & time (preferred date/time are pre-filled with open defaults)
    await expect(page.getByRole('heading', { name: /Date & Time/i })).toBeVisible({
      timeout: 10_000,
    })
    await page.getByRole('button', { name: 'Continue' }).click()

    // Step 4 — Details
    await expect(page.getByRole('heading', { name: /Your details/i })).toBeVisible({
      timeout: 10_000,
    })
    await page.getByLabel(/First Name/i).fill('E2E')
    await page.getByLabel(/Last Name/i).fill('Tester')
    await page.getByLabel(/Email Address/i).fill('e2e.tester@example.com')
    await page.getByLabel(/Phone Number/i).fill('0860543085')

    // Date of birth via custom picker
    await page.locator('#dateOfBirth').click()
    const dobDialog = page.getByRole('dialog', { name: /Choose date of birth/i })
    await expect(dobDialog).toBeVisible()

    // Open year list and choose 1990
    await dobDialog.locator('button[aria-haspopup="listbox"]').nth(1).click()
    await dobDialog.getByRole('option', { name: '1990' }).click()

    await dobDialog
      .getByRole('button', { name: /15 January 1990|15 February 1990|15 March 1990|15 April 1990|15 May 1990|15 June 1990|15 July 1990|15 August 1990|15 September 1990|15 October 1990|15 November 1990|15 December 1990/i })
      .click()

    await page.getByRole('button', { name: 'Request appointment' }).click()

    await expect(page).toHaveURL(/\/bookings\/thank-you\/?$/, { timeout: 15_000 })
    await expect(page.getByRole('heading', { name: /Thank you, E2E/i })).toBeVisible()
    await expect(page.getByText(/Your booking confirmation/i)).toBeVisible()
    await expect(page.getByText(/Initial Consultation/i).first()).toBeVisible()
  })
})
