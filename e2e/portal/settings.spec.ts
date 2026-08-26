import { test, expect } from './fixtures'

test.describe('portal settings', () => {
  test('New clinic logo switch is present and off by default', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const toggle = page.getByRole('switch', { name: /New clinic logo/i })
    await expect(page.getByText('New clinic logo', { exact: true })).toBeVisible()
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
