import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { nominatimCountryCode } from './places'

describe('nominatimCountryCode', () => {
  it('defaults to Ireland when country is missing', () => {
    assert.equal(nominatimCountryCode(), 'ie')
    assert.equal(nominatimCountryCode(null), 'ie')
    assert.equal(nominatimCountryCode(''), 'ie')
    assert.equal(nominatimCountryCode('   '), 'ie')
  })

  it('maps allowlisted phone country ids to lowercase ISO', () => {
    assert.equal(nominatimCountryCode('IE'), 'ie')
    assert.equal(nominatimCountryCode('GB'), 'gb')
    assert.equal(nominatimCountryCode('gb'), 'gb')
    assert.equal(nominatimCountryCode(' GB '), 'gb')
  })

  it('falls back to Ireland instead of forwarding unknown codes', () => {
    assert.equal(nominatimCountryCode('XX'), 'ie')
    assert.equal(nominatimCountryCode('us,ie'), 'ie')
    assert.equal(nominatimCountryCode('hack'), 'ie')
  })
})
