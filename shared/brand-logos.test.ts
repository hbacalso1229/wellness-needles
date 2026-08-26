import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CHATGPT_ICON,
  CHATGPT_WORDMARK,
  ORIGINAL_ICON,
  ORIGINAL_WORDMARK,
  brandLogos,
  chatgptLogoActive,
} from './brand-logos'
import { parseSiteSnapshot, SITE_DEFAULTS } from './site-snapshot'

describe('brandLogos', () => {
  it('returns original wordmark, icon, and email mark when off', () => {
    const logos = brandLogos(false)
    assert.equal(logos.wordmark, ORIGINAL_WORDMARK)
    assert.equal(logos.icon, ORIGINAL_ICON)
    assert.equal(logos.email, ORIGINAL_WORDMARK)
  })

  it('returns ChatGPT wordmark and icon when on', () => {
    const logos = brandLogos(true)
    assert.equal(logos.wordmark, CHATGPT_WORDMARK)
    assert.equal(logos.icon, CHATGPT_ICON)
    assert.equal(logos.email, CHATGPT_ICON)
  })
})

describe('chatgptLogoActive', () => {
  it('requires overlay and the feature flag', () => {
    assert.equal(chatgptLogoActive(false, false), false)
    assert.equal(chatgptLogoActive(false, true), false)
    assert.equal(chatgptLogoActive(true, false), false)
    assert.equal(chatgptLogoActive(true, true), true)
  })
})

describe('parseSiteSnapshot chatgptLogoEnabled', () => {
  it('defaults to false when the published snapshot omits the field', () => {
    const { chatgptLogoEnabled: _omitted, ...features } = SITE_DEFAULTS.features
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      features,
    })
    assert.ok(parsed)
    assert.equal(parsed.features.chatgptLogoEnabled, false)
  })
})
