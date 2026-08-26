import { test, expect } from './fixtures'

test.describe('portal settings', () => {
  test('ChatGPT clinic logo switch is present and off by default', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Settings' }).click()

    const toggle = page.getByRole('switch', { name: /ChatGPT clinic logo/i })
    await expect(page.getByText('ChatGPT clinic logo', { exact: true })).toBeVisible()
    await expect(toggle).toBeVisible()
    await expect(toggle).toHaveAttribute('aria-checked', 'false')

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
  })
})
