import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  NEW_ICON,
  NEW_WORDMARK,
  ORIGINAL_ICON,
  ORIGINAL_WORDMARK,
  brandLogos,
  newClinicLogoActive,
} from './brand-logos'
import { parseSiteSnapshot, SITE_DEFAULTS } from './site-snapshot'

describe('brandLogos', () => {
  it('returns original wordmark, icon, and email mark when off', () => {
    const logos = brandLogos(false)
    assert.equal(logos.wordmark, ORIGINAL_WORDMARK)
    assert.equal(logos.icon, ORIGINAL_ICON)
    assert.equal(logos.email, ORIGINAL_WORDMARK)
  })

  it('returns new clinic wordmark and icon when on', () => {
    const logos = brandLogos(true)
    assert.equal(logos.wordmark, NEW_WORDMARK)
    assert.equal(logos.icon, NEW_ICON)
    assert.equal(logos.email, NEW_ICON)
  })
})

describe('newClinicLogoActive', () => {
  it('requires overlay and the feature flag', () => {
    assert.equal(newClinicLogoActive(false, false), false)
    assert.equal(newClinicLogoActive(false, true), false)
    assert.equal(newClinicLogoActive(true, false), false)
    assert.equal(newClinicLogoActive(true, true), true)
  })
})

describe('parseSiteSnapshot newClinicLogoEnabled', () => {
  it('defaults to false when the published snapshot omits the field', () => {
    const { newClinicLogoEnabled: _omitted, ...features } = SITE_DEFAULTS.features
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      features,
    })
    assert.ok(parsed)
    assert.equal(parsed.features.newClinicLogoEnabled, false)
  })
})
