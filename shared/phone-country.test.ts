import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { inferPhoneCountry } from './irish-phone'
import { parseSiteSnapshot, SITE_DEFAULTS } from './site-snapshot'

describe('inferPhoneCountry', () => {
  it('uses stored countryId when it is a known country', () => {
    assert.equal(
      inferPhoneCountry({
        countryId: 'GB',
        href: 'tel:+353860543085',
        displayText: '+353 86 054 3085',
      }).id,
      'GB'
    )
  })

  it('infers GB from href when countryId is missing', () => {
    assert.equal(
      inferPhoneCountry({
        href: 'tel:+447700900123',
        displayText: '+44 7700 900123',
        number: '7700900123',
      }).id,
      'GB'
    )
  })

  it('falls back to Ireland when digits are empty', () => {
    assert.equal(inferPhoneCountry({ href: '', displayText: '', number: '' }).id, 'IE')
  })
})

describe('parseSiteSnapshot phone.countryId', () => {
  it('defaults countryId to IE', () => {
    const parsed = parseSiteSnapshot(SITE_DEFAULTS)
    assert.equal(parsed?.phone.countryId, 'IE')
  })

  it('round-trips an explicit GB countryId', () => {
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      phone: {
        number: '7700900123',
        formatted: '7700 900123',
        displayText: '+44 7700 900123',
        href: 'tel:+447700900123',
        countryId: 'GB',
      },
    })
    assert.equal(parsed?.phone.countryId, 'GB')
    assert.equal(parsed?.phone.href, 'tel:+447700900123')
  })

  it('infers GB from href when countryId is omitted', () => {
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      phone: {
        number: '7700900123',
        formatted: '7700 900123',
        displayText: '+44 7700 900123',
        href: 'tel:+447700900123',
      },
    })
    assert.equal(parsed?.phone.countryId, 'GB')
  })

  it('infers Ireland from href when countryId is unknown', () => {
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      phone: {
        ...SITE_DEFAULTS.phone,
        countryId: 'XX',
      },
    })
    assert.equal(parsed?.phone.countryId, 'IE')
  })
})
