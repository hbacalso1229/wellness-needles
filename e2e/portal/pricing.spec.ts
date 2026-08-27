import { SITE_DEFAULTS } from '../../shared/site-snapshot'
import { test, expect } from './fixtures'

test.describe('portal pricing unpublished bar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('draft bar stays below Add service pills', async ({ page }) => {
    await page.route('**/api/admin/site', async (route) => {
      if (route.request().method() !== 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ok: true }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          draft: { ...SITE_DEFAULTS, clinicName: 'Draft Clinic' },
          published: SITE_DEFAULTS,
        }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Pricing' }).click()

    await expect(page.getByText('Draft saved')).toBeVisible()
    await expect(page.getByText('Not live on the booking page yet.')).toBeVisible()
    await expect(page.getByText('Saved — not published')).toHaveCount(0)
    await expect(page.getByText(/Publish to update prices/)).toHaveCount(0)

    const addOn = page.getByRole('button', { name: 'Add add-on' })
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(addOn).toBeVisible()
    const addBox = await addOn.boundingBox()
    const barBox = await page.getByTestId('publish-bar').boundingBox()
    expect(addBox && barBox).toBeTruthy()
    expect(addBox!.y + addBox!.height).toBeLessThanOrEqual(barBox!.y + 2)
  })
})

test.describe('portal pricing travel fees', () => {
  test('Home visit travel fees uses km and CompactEuro fields', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Pricing' }).click()

    await expect(page.getByRole('heading', { name: 'Home visit travel fees' })).toBeVisible()
    await expect(page.getByText('Patients see this on the Home Visit booking step.')).toBeVisible()
    await expect(page.getByLabel('Included distance in km')).toHaveValue('10')
    await expect(page.getByLabel('Per km in euro')).toHaveValue('0.50')
    await expect(page.getByLabel('Flat travel fee in euro')).toHaveValue('15')
  })
})
