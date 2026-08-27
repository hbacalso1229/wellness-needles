import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DEFAULT_TRAVEL_POLICY,
  SITE_DEFAULTS,
  formatEuroCopy,
  parseSiteSnapshot,
  publicTravelPolicy,
} from './site-snapshot'
import { diffSiteSnapshots, labelForFieldPath } from './site-diff'

describe('parseSiteSnapshot travelPolicy', () => {
  it('defaults omitted travelPolicy to 10 km / €0.50 / €15', () => {
    const { travelPolicy: _omitted, ...pricing } = SITE_DEFAULTS.pricing
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      pricing,
    })
    assert.ok(parsed)
    assert.deepEqual(parsed.pricing.travelPolicy, DEFAULT_TRAVEL_POLICY)
  })

  it('parses euroPrice strings the same way as other prices', () => {
    const parsed = parseSiteSnapshot({
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        travelPolicy: {
          includedKm: 12,
          perKm: '0.75',
          flatFee: '€20',
        },
      },
    })
    assert.ok(parsed)
    assert.equal(parsed.pricing.travelPolicy.includedKm, 12)
    assert.equal(parsed.pricing.travelPolicy.perKm, '€0.75')
    assert.equal(parsed.pricing.travelPolicy.flatFee, '€20')
  })
})

describe('publicTravelPolicy', () => {
  it('uses baked defaults when overlay is off even if the snapshot differs', () => {
    const site = {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        travelPolicy: { includedKm: 25, perKm: '€1.00', flatFee: '€40' },
      },
    }
    assert.deepEqual(publicTravelPolicy(false, site), DEFAULT_TRAVEL_POLICY)
    assert.deepEqual(publicTravelPolicy(true, site), site.pricing.travelPolicy)
  })
})

describe('formatEuroCopy', () => {
  it('keeps cents and drops trailing .00', () => {
    assert.equal(formatEuroCopy('€0.50'), '€0.50')
    assert.equal(formatEuroCopy('€15'), '€15')
    assert.equal(formatEuroCopy('€15.00'), '€15')
  })
})

describe('site-diff travelPolicy labels', () => {
  it('labels included km, per km, and flat fee', () => {
    assert.equal(labelForFieldPath('pricing.travelPolicy.includedKm'), 'Included travel distance')
    assert.equal(labelForFieldPath('pricing.travelPolicy.perKm'), 'Travel fee per km')
    assert.equal(labelForFieldPath('pricing.travelPolicy.flatFee'), 'Flat travel fee')

    const changes = diffSiteSnapshots(SITE_DEFAULTS, {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        travelPolicy: { includedKm: 15, perKm: '€0.50', flatFee: '€20' },
      },
    })
    const labels = changes.map((row) => row.fieldLabel)
    assert.ok(labels.includes('Included travel distance'))
    assert.ok(labels.includes('Flat travel fee'))
    assert.equal(labels.includes('Travel fee per km'), false)
  })
})
