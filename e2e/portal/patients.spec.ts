import { test, expect } from './fixtures'

test.describe('portal patients', () => {
  test('Patients tab lists charts and opens intake', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Patients' }).click()
    await expect(page.getByText(/Staff-only charts/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create chart' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Aoife Murphy/ })).toBeVisible()
    await expect(page.getByText('Unsigned consent')).toBeVisible()
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    await expect(page.getByRole('heading', { name: 'Aoife Murphy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Intake', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Visits', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Files', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Consent', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Book follow-up' }).first()).toBeVisible()
    await expect(page.getByLabel('Chief complaint(s)')).toHaveValue('Low back pain')
    await page.getByRole('button', { name: /Tongue, diagnosis and first treatment/ }).click()
    await expect(page.getByLabel('Treatment plan')).toBeVisible()
    await page.getByRole('button', { name: /Advice sheet/ }).click()
    await expect(
      page.getByLabel('Additional herbal remedies / supplements (e.g. herbal teas)')
    ).toBeVisible()
    await expect(page.getByLabel('Nutritional advice')).toBeVisible()
  })

  test('Visits tab shows the follow-up form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Patients' }).click()
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    await page.getByRole('button', { name: 'Visits', exact: true }).click()
    await expect(page.getByLabel('Review of complaints')).toBeVisible()
    await expect(page.getByLabel('Additional / naturopathic advice')).toBeVisible()
    await expect(page.getByText('Date of birth')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Book follow-up' }).first()).toBeVisible()
  })

  test('Book follow-up prefills Follow-up Sessions', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Patients' }).click()
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    await page.getByRole('button', { name: 'Book follow-up' }).first().click()
    await expect(page.getByText(/Service is Follow-up Sessions/)).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirm follow-up' })).toBeVisible()
  })

  test('Files tab is on the chart', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Patients' }).click()
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    await page.getByRole('button', { name: 'Files', exact: true }).click()
    await expect(page.getByText(/PDF, JPEG, PNG/)).toBeVisible()
    await expect(page.getByRole('radio', { name: 'Initial' })).toBeChecked()
    await expect(page.getByRole('radio', { name: 'Follow-up' })).toBeVisible()
  })

  test('appointment card can open the linked chart', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    await expect(page.getByRole('button', { name: 'Open chart' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add visit note' })).toBeVisible()
    await page.getByRole('button', { name: 'Open chart' }).click()
    await expect(page.getByRole('heading', { name: 'Aoife Murphy' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Intake', exact: true })).toBeVisible()
  })
})
