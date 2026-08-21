import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { SITE_DEFAULTS, mergePricingExtras, splitUnifiedPricingExtras } from './site-snapshot'
import {
  isAllowedLocation,
  isAllowedService,
  isAllowedServiceType,
  publishedLocationOptions,
  publishedServiceLabels,
} from './booking-options'

describe('booking options', () => {
  it('keeps the current location even if later unpublished', () => {
    const site = {
      ...SITE_DEFAULTS,
      locations: SITE_DEFAULTS.locations.map((loc) =>
        loc.label === 'Carlow' ? { ...loc, enabled: false } : loc
      ),
    }
    const current = 'Carlow — 16 Kennedy St, Graigue, Carlow, R93 H2X8'
    assert.equal(isAllowedLocation(site, current, current), true)
    assert.ok(publishedLocationOptions(site, current).includes(current))
    assert.equal(isAllowedLocation(site, 'Nowhere'), false)
  })

  it('keeps the current service if the catalog later drops it', () => {
    const site = {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        inClinicItems: {
          ...SITE_DEFAULTS.pricing.inClinicItems,
          package10: false,
        },
      },
    }
    const current = 'Treatment Package (10 sessions)'
    assert.equal(isAllowedService(site, 'In Clinic', current, current), true)
    assert.ok(publishedServiceLabels(site, 'In Clinic', current).includes(current))
  })

  it('does not treat cupping as a bookable appointment service', () => {
    const labels = publishedServiceLabels(SITE_DEFAULTS, 'In Clinic')
    assert.equal(labels.some((item) => /cupping/i.test(item)), false)
  })

  it('does not treat moxibustion as a bookable appointment service', () => {
    const labels = publishedServiceLabels(SITE_DEFAULTS, 'In Clinic')
    assert.equal(labels.some((item) => /moxibustion/i.test(item)), false)
  })

  it('uses published serviceCopy names for reschedule', () => {
    const site = {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        serviceCopy: {
          ...SITE_DEFAULTS.pricing.serviceCopy,
          followUp: {
            ...SITE_DEFAULTS.pricing.serviceCopy.followUp,
            name: 'Return visit',
          },
        },
      },
    }
    assert.ok(publishedServiceLabels(site, 'In Clinic').includes('Return visit'))
  })

  it('accepts published In Clinic / Home Visit types', () => {
    assert.equal(isAllowedServiceType(SITE_DEFAULTS, 'In Clinic'), true)
    assert.equal(isAllowedServiceType(SITE_DEFAULTS, 'Home Visit'), true)
    assert.equal(isAllowedServiceType(SITE_DEFAULTS, 'Phone'), false)
    assert.equal(isAllowedServiceType(SITE_DEFAULTS, 'Phone', 'Phone'), true)
  })

  it('lists extra services and packages but not add-ons', () => {
    const site = {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        inClinicExtras: [
          {
            id: 'extra-svc',
            kind: 'service' as const,
            name: 'Fertility treatment',
            price: '€90',
            original: '',
            description: '',
            enabled: true,
            durationMinutes: 75,
          },
          {
            id: 'extra-pkg',
            kind: 'package' as const,
            name: 'Wellness bundle',
            price: '€200',
            original: '',
            description: '',
            enabled: true,
            durationMinutes: 45,
          },
          {
            id: 'extra-add',
            kind: 'addon' as const,
            name: 'Heat lamp',
            price: '€10',
            original: '',
            description: '',
            enabled: true,
            durationMinutes: 0,
          },
        ],
      },
    }
    const labels = publishedServiceLabels(site, 'In Clinic')
    assert.ok(labels.includes('Fertility treatment'))
    assert.ok(labels.includes('Wellness bundle'))
    assert.equal(labels.some((item) => /heat lamp/i.test(item)), false)
  })
})

describe('mergePricingExtras', () => {
  it('pairs clinic and home extras by id and writes both arrays', () => {
    const clinic = [
      {
        id: 'extra-1',
        kind: 'service' as const,
        name: 'Fertility treatment',
        price: '€90',
        original: '€120',
        description: 'One to one',
        enabled: true,
        durationMinutes: 75,
      },
    ]
    const visit = [
      {
        id: 'extra-1',
        kind: 'service' as const,
        name: 'Fertility treatment',
        price: '€140',
        original: '',
        description: 'One to one',
        enabled: true,
        durationMinutes: 75,
      },
    ]
    const merged = mergePricingExtras(clinic, visit)
    assert.equal(merged.length, 1)
    assert.equal(merged[0].inClinic.price, '€90')
    assert.equal(merged[0].homeVisit.price, '€140')
    const split = splitUnifiedPricingExtras(merged)
    assert.equal(split.inClinicExtras[0].id, 'extra-1')
    assert.equal(split.homeVisitExtras[0].id, 'extra-1')
    assert.equal(split.inClinicExtras[0].price, '€90')
    assert.equal(split.homeVisitExtras[0].price, '€140')
  })
})
