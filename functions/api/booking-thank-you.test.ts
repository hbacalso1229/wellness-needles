import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SITE_DEFAULTS } from '../../shared/site-snapshot'
import { contactFromPublishedJson } from './booking-thank-you'

describe('contactFromPublishedJson', () => {
  it('reads phone from a full published snapshot', () => {
    const contact = contactFromPublishedJson({
      ...SITE_DEFAULTS,
      phone: {
        ...SITE_DEFAULTS.phone,
        displayText: '+44 7700 900123',
        href: 'tel:+447700900123',
        countryId: 'GB',
      },
    })
    assert.equal(contact.phoneDisplay, '+44 7700 900123')
    assert.equal(contact.phoneHref, 'tel:+447700900123')
    assert.ok(contact.locations.length > 0)
    assert.equal(contact.newClinicLogoEnabled, false)
  })

  it('enables new clinic email logo only when overlay and the flag are both on', () => {
    const on = contactFromPublishedJson({
      ...SITE_DEFAULTS,
      websiteOverlayEnabled: true,
      features: { ...SITE_DEFAULTS.features, newClinicLogoEnabled: true },
    })
    assert.equal(on.newClinicLogoEnabled, true)

    const overlayOff = contactFromPublishedJson({
      ...SITE_DEFAULTS,
      websiteOverlayEnabled: false,
      features: { ...SITE_DEFAULTS.features, newClinicLogoEnabled: true },
    })
    assert.equal(overlayOff.newClinicLogoEnabled, false)
  })

  it('still reads phone when the snapshot fails full parse', () => {
    const contact = contactFromPublishedJson({
      phone: {
        displayText: '+44 7700 900123',
        href: 'tel:+447700900123',
      },
      locations: [
        {
          label: 'Celbridge',
          street: '56 The Orchard',
          city: 'Celbridge',
          county: 'Co.Kildare',
          postcode: 'W23 K603',
        },
      ],
    })
    assert.equal(contact.phoneDisplay, '+44 7700 900123')
    assert.equal(contact.phoneHref, 'tel:+447700900123')
    assert.equal(contact.locations[0]?.label, 'Celbridge')
  })
})
