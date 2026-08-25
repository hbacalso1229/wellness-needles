import { test, expect } from './fixtures'

test.describe('portal business info', () => {
  test('Contact details sits above Locations and Find address follows phone country', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Business Info' }).click()

    const contact = page.getByRole('heading', { name: 'Contact details' })
    const locations = page.getByRole('heading', { name: 'Locations' })
    await expect(contact).toBeVisible()
    await expect(locations).toBeVisible()
    const contactBox = await contact.boundingBox()
    const locationsBox = await locations.boundingBox()
    expect(contactBox && locationsBox).toBeTruthy()
    expect(contactBox!.y).toBeLessThan(locationsBox!.y)

    await expect(page.getByPlaceholder('Search Ireland — pick a suggestion').first()).toBeVisible()

    await page.getByLabel('Postcode').first().fill('SW1A 1AA')
    await expect(page.getByText(/Check this looks like an Eircode/)).toBeVisible()

    await page.getByRole('button', { name: 'Country code' }).click()
    await page.getByRole('option', { name: /United Kingdom/ }).click()
    await expect(page.getByText(/Check this looks like an Eircode/)).toHaveCount(0)
    await expect(
      page.getByPlaceholder('Search United Kingdom — pick a suggestion').first()
    ).toBeVisible()

    const search = page.waitForRequest((request) => {
      const url = new URL(request.url())
      return (
        url.pathname.replace(/\/+$/, '').endsWith('/api/admin/places') &&
        Boolean(url.searchParams.get('q')) &&
        url.searchParams.get('country') === 'GB'
      )
    })
    await page.getByPlaceholder('Search United Kingdom — pick a suggestion').first().fill('london')
    await search
  })
})
