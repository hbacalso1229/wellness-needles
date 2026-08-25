import { test, expect, E2E_PENDING } from './fixtures'

test.describe('portal appointments', () => {
  test('loads inbox with add appointment and search', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Appointments' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Pending/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Confirmed/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Cancelled/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add appointment' })).toBeVisible()
    await expect(page.getByPlaceholder(/Search name, phone, email/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Aoife Murphy/ })).toBeVisible()
  })

  test('Add appointment opens the phone/walk-in form', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Add appointment' }).click()
    await expect(page.getByRole('heading', { name: 'Add appointment' })).toBeVisible()
    await expect(page.getByText(/Phone or walk-in/i)).toBeVisible()
  })

  test('pending card phone is a tel link and Confirm stays visible', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    const phone = page.getByRole('link', { name: E2E_PENDING.phone })
    await expect(phone).toBeVisible()
    await expect(phone).toHaveAttribute('href', 'tel:+353860543085')
    await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible()
  })
})

test.describe('portal appointments mobile toolbar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('pill and search sit above Pending Confirmed Cancelled', async ({ page }) => {
    await page.goto('/')
    const add = page.getByRole('button', { name: 'Add appointment' })
    const search = page.getByPlaceholder(/Search name, phone, email/)
    const pending = page.getByRole('button', { name: /Pending/ })
    await expect(add).toBeVisible()
    const addBox = await add.boundingBox()
    const searchBox = await search.boundingBox()
    const pendingBox = await pending.boundingBox()
    expect(addBox && searchBox && pendingBox).toBeTruthy()
    expect(Math.abs(addBox!.y - searchBox!.y)).toBeLessThan(12)
    expect(addBox!.y).toBeLessThan(pendingBox!.y)
  })
})
