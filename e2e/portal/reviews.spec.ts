import { test, expect } from './fixtures'

const E2E_REVIEW = {
  id: 'e2e-review-1',
  status: 'approved',
  name: 'Luiza Barbi',
  body: 'Very professional and made me feel at ease.',
  condition: 'Pain relief',
  source: 'Verified Google review',
  rating: 5,
  reviewedAt: '2026-08-10',
  emphasis: 'made me feel at ease',
}

test.describe('portal reviews card actions', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('expanded card actions use cream pills', async ({ page }) => {
    await page.route('**/api/admin/reviews**', async (route) => {
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
        body: JSON.stringify({ reviews: [E2E_REVIEW] }),
      })
    })

    await page.goto('/')
    await page.getByRole('button', { name: 'Reviews' }).click()
    await page.getByRole('button', { name: /^Confirmed/ }).click()
    await page.getByRole('button', { name: /Luiza Barbi/ }).click()

    const suggest = page.getByRole('button', { name: 'Suggest from review' })
    const save = page.getByRole('button', { name: 'Save tag & highlight' })
    const unpublish = page.getByRole('button', { name: 'Unpublish' })
    const reject = page.getByRole('button', { name: 'Reject', exact: true })
    await expect(suggest).toBeVisible()
    await expect(save).toBeVisible()
    await expect(unpublish).toBeVisible()
    await expect(reject).toBeVisible()

    for (const button of [suggest, save, unpublish, reject]) {
      const box = await button.boundingBox()
      expect(box).toBeTruthy()
      expect(box!.height).toBeLessThan(36)
      await expect(button).toHaveCSS('background-color', 'rgb(244, 242, 236)')
    }
    await page.screenshot({ path: 'tmp-reviews-actions.png' })
  })
})
