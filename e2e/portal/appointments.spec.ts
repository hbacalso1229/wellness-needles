import { test, expect, E2E_PENDING } from './fixtures'

test.describe('portal appointments', () => {
  test('loads inbox with add appointment and search', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: 'Appointments' })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Pending/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Confirmed/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /^Cancelled/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add appointment' })).toBeVisible()
    await expect(page.getByPlaceholder(/Search name, phone, email/)).toBeVisible()
    const card = page.getByRole('button', { name: /Aoife Murphy/ })
    await expect(card).toBeVisible()
    await expect(card.getByText('Pending', { exact: true })).toBeVisible()
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
    await expect(
      page.getByRole('button', { name: /Aoife Murphy/ }).getByText('Pending', { exact: true })
    ).toBeVisible()
    const phone = page.getByRole('link', { name: E2E_PENDING.phone })
    await expect(phone).toBeVisible()
    await expect(phone).toHaveAttribute('href', 'tel:+353860543085')
    await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toBeVisible()
  })

  test('cancelled card shows header status and no footer line', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /^Cancelled/ }).click()
    const card = page.getByRole('button', { name: /Niamh Byrne/ })
    await expect(card).toBeVisible()
    await expect(card.getByText('Cancelled', { exact: true })).toBeVisible()
    await card.click()
    await expect(page.getByText('Location', { exact: true })).toBeVisible()
    await expect(card.getByText('Cancelled', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirm', exact: true })).toHaveCount(0)
  })
})

test.describe('portal appointments mobile toolbar', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('pill and search sit above Pending Confirmed Cancelled', async ({ page }) => {
    await page.goto('/')
    const add = page.getByRole('button', { name: 'Add appointment' })
    const search = page.getByPlaceholder(/Search name, phone, email/)
    const pending = page.getByRole('button', { name: /^Pending/ })
    await expect(add).toBeVisible()
    const intro = page.getByText(/Website requests land in Pending/)
    const addBox = await add.boundingBox()
    const searchBox = await search.boundingBox()
    const pendingBox = await pending.boundingBox()
    const introBox = await intro.boundingBox()
    expect(addBox && searchBox && pendingBox && introBox).toBeTruthy()
    expect(addBox!.y - (introBox!.y + introBox!.height)).toBeGreaterThanOrEqual(24)
    expect(Math.abs(addBox!.y - searchBox!.y)).toBeLessThan(24)
    expect(addBox!.y).toBeLessThan(pendingBox!.y)
  })

  test('expanded card Email and Visit sit on the same row', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Aoife Murphy/ }).click()
    const email = page.getByText('Email', { exact: true })
    const visit = page.getByText('Visit', { exact: true })
    await expect(email).toBeVisible()
    await expect(visit).toBeVisible()
    const emailBox = await email.boundingBox()
    const visitBox = await visit.boundingBox()
    expect(emailBox && visitBox).toBeTruthy()
    expect(Math.abs(emailBox!.y - visitBox!.y)).toBeLessThan(4)
  })

  test('appointment time stays on one line', async ({ page }) => {
    await page.goto('/')
    const when = page.getByText(/Morning \(9:00 AM/)
    await expect(when).toBeVisible()
    const box = await when.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.height).toBeLessThan(22)
  })
})
