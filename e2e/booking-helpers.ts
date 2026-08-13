import type { Page } from '@playwright/test'
import { expect } from './fixtures'

/** Walk the legacy stepper to the details step and fill required fields. */
export async function fillBookingRequestForm(page: Page) {
  await page.goto('/bookings/')

  await expect(
    page.getByRole('heading', { name: /Request an appointment/i })
  ).toBeVisible()

  await expect(page.getByRole('heading', { name: /^Location$/i })).toBeVisible({
    timeout: 10_000,
  })
  await expect(page.getByRole('radio', { name: /Celbridge/i })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: /^Service$/i })).toBeVisible({
    timeout: 10_000,
  })
  await expect(page.getByRole('radio', { name: /Initial Consultation/i })).toBeChecked()
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: /Date & Time/i })).toBeVisible({
    timeout: 10_000,
  })
  await page.getByRole('button', { name: 'Continue' }).click()

  await expect(page.getByRole('heading', { name: /Your details/i })).toBeVisible({
    timeout: 10_000,
  })
  const fullName = page.locator('#fullName')
  if (await fullName.isVisible()) {
    await fullName.fill('E2E Tester')
  } else {
    await page.getByLabel(/First Name/i).fill('E2E')
    await page.getByLabel(/Last Name/i).fill('Tester')
  }
  await page.getByLabel(/Email Address/i).fill('e2e.tester@example.com')
  await page.getByLabel(/Phone Number/i).fill('860543085')

  await page.locator('#dateOfBirth').click()
  const dobDialog = page.getByRole('dialog', { name: /Choose date of birth/i })
  await expect(dobDialog).toBeVisible()

  await dobDialog.locator('button[aria-haspopup="listbox"]').nth(1).click()
  await dobDialog.getByRole('option', { name: '1990' }).click()

  await dobDialog
    .getByRole('button', {
      name: /15 January 1990|15 February 1990|15 March 1990|15 April 1990|15 May 1990|15 June 1990|15 July 1990|15 August 1990|15 September 1990|15 October 1990|15 November 1990|15 December 1990/i,
    })
    .click()
}
