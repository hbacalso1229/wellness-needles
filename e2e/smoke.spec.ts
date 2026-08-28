import { test, expect } from './fixtures'

const headerNav = [
  {
    name: 'Home',
    url: '/',
    heading: /Restore Balance/i,
  },
  {
    name: 'About',
    url: '/about/',
    heading: /Meet the care behind Wellness Needles|Meet Your Practitioner|Feel the Difference/i,
  },
  {
    name: 'Why Acupuncture',
    url: '/acupuncture/',
    heading: /Relieve [Pp]ain|How Acupuncture Works/i,
  },
  {
    name: 'Chinese Medicine',
    url: '/chinese-medicine/',
    heading: /Traditional Chinese Medicine|Healing Begins with Balance|Care Tailored to You/i,
  },
  {
    name: 'Testimonials',
    url: '/testimonials/',
    heading: /Real Results/i,
  },
  {
    name: 'Contact',
    url: '/contact/',
    heading: /Start Your Journey With Us|Contact Us/i,
  },
] as const

test.describe('smoke', () => {
  test('home loads with brand and book CTA', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('banner').getByRole('link', { name: /Wellness Needles home/i })
    ).toBeVisible()
    await expect(
      page.getByRole('banner').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_transparent\.png/)
    await expect(
      page.getByRole('contentinfo').locator('img').first()
    ).toHaveAttribute('src', /logo_wellness_icon\.png/)
    await expect(
      page.getByRole('link', { name: /Book your appointment|Book Appointment/i }).first()
    ).toBeVisible()
  })

  test('header nav links reach each page', async ({ page }) => {
    await page.goto('/')
    const header = page.getByRole('banner')

    for (const item of headerNav) {
      await header.getByRole('link', { name: item.name, exact: true }).click()
      await expect(page).toHaveURL(item.url)
      await expect(page.getByRole('heading', { name: item.heading }).first()).toBeVisible()
    }

    await header.getByRole('link', { name: /Book Appointment/i }).click()
    await expect(page).toHaveURL('/bookings/')
    await expect(
      page.getByRole('heading', { name: /Request an appointment|Book Your Appointment/i }).first()
    ).toBeVisible()
  })

  test('footer quick links reach each page', async ({ page }) => {
    const footerLinks = [
      { name: 'About Us', url: '/about/' },
      { name: 'Why Acupuncture', url: '/acupuncture/' },
      { name: 'Chinese Medicine', url: '/chinese-medicine/' },
      { name: 'Testimonials', url: '/testimonials/' },
    ] as const

    for (const item of footerLinks) {
      await page.goto('/')
      await page.getByRole('contentinfo').getByRole('link', { name: item.name, exact: true }).click()
      await expect(page).toHaveURL(item.url)
    }
  })

  test('contact page is reachable', async ({ page }) => {
    await page.goto('/contact/')
    await expect(
      page.getByRole('heading', { name: /Start Your Journey With Us/i })
    ).toBeVisible()
    await expect(page.getByText('Celbridge and Carlow')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'Visit Us in Person' })
    ).toBeVisible()
    await expect(
      page.getByText('Two convenient locations to support your care.')
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Celbridge' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Carlow' })).toBeVisible()
  })

  test('bookings page is reachable', async ({ page }) => {
    await page.goto('/bookings/')
    await expect(
      page.getByRole('heading', { name: /Request an appointment|Book Your Appointment/i }).first()
    ).toBeVisible()
  })

  test('unable-to-process page is reachable', async ({ page }) => {
    await page.goto('/bookings/unable-to-process/')
    await expect(
      page.getByRole('heading', { name: /unable to process your appointment request/i })
    ).toBeVisible()
  })

  test('thank-you page is reachable', async ({ page }) => {
    await page.goto('/bookings/thank-you/')
    await expect(page.getByRole('heading', { name: /Thank you/i })).toBeVisible()
  })

  test('chinese medicine section anchors exist', async ({ page }) => {
    for (const id of ['cupping', 'moxibustion', 'gua-sha'] as const) {
      await page.goto(`/chinese-medicine/#${id}`)
      await expect(page.locator(`#${id}`)).toBeVisible()
    }
  })
})
