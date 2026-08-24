import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'
import { SITE_DEFAULTS } from '../../shared/site-snapshot'
import { publishedLocationOptions } from '../../shared/booking-options'
import {
  parseConfirmStartsAtLocal,
  validateCreateBookingInput,
} from './confirm-booking'

const validCreate = {
  firstName: 'Aoife',
  lastName: 'Murphy',
  email: 'aoife@example.com',
  phone: '0860543085',
  serviceType: 'In Clinic',
  locationLabel: publishedLocationOptions(SITE_DEFAULTS)[0] || '',
  serviceLabel: 'Initial Consultation & First Treatment',
  startsAtLocal: '2099-06-15T14:00',
  smsOptIn: false,
}

describe('parseConfirmStartsAtLocal', () => {
  it('accepts YYYY-MM-DDTHH:mm and snaps to 15 minutes', () => {
    const parsed = parseConfirmStartsAtLocal('2026-09-02T14:07')
    assert.deepEqual(parsed, {
      local: '2026-09-02T14:00',
      ymd: '2026-09-02',
      hm: '14:00',
    })
  })

  it('rejects a missing or junk start', () => {
    assert.equal(parseConfirmStartsAtLocal(''), null)
    assert.equal(parseConfirmStartsAtLocal('Tuesday afternoon'), null)
  })
})

describe('validateCreateBookingInput', () => {
  it('accepts a complete phone/walk-in payload against published lists', () => {
    assert.equal(validateCreateBookingInput(validCreate, SITE_DEFAULTS), null)
  })

  it('rejects a missing or invalid email', () => {
    assert.equal(
      validateCreateBookingInput({ ...validCreate, email: '' }, SITE_DEFAULTS),
      'email-required'
    )
    assert.equal(
      validateCreateBookingInput({ ...validCreate, email: 'not-an-email' }, SITE_DEFAULTS),
      'email-required'
    )
  })

  it('rejects a bad startsAtLocal without changing Confirm body rules', () => {
    assert.equal(
      validateCreateBookingInput({ ...validCreate, startsAtLocal: '' }, SITE_DEFAULTS),
      'startsAtLocal required (YYYY-MM-DDTHH:mm)'
    )
  })

  it('rejects an unpublished service type', () => {
    assert.equal(
      validateCreateBookingInput({ ...validCreate, serviceType: 'Phone' }, SITE_DEFAULTS),
      'invalid-service-type'
    )
  })

  it('rejects junk that is not a phone number', () => {
    assert.equal(
      validateCreateBookingInput(
        { ...validCreate, phone: 'dsfsertertertdfert' },
        SITE_DEFAULTS
      ),
      'invalid-phone'
    )
  })

  it('rejects a start that is already in the past', () => {
    assert.equal(
      validateCreateBookingInput(
        { ...validCreate, startsAtLocal: '2020-01-01T10:00' },
        SITE_DEFAULTS
      ),
      'starts-in-past'
    )
  })
})

describe('Confirm contract', () => {
  it('keeps website Confirm as action plus startsAtLocal on /:id', () => {
    const root = join(dirname(fileURLToPath(import.meta.url)), '..')
    const idSrc = readFileSync(join(root, 'api/admin/bookings/[id].ts'), 'utf8')
    const listSrc = readFileSync(join(root, 'api/admin/bookings.ts'), 'utf8')
    assert.match(idSrc, /action === 'confirm'/)
    assert.match(idSrc, /startsAtLocal: asString\(body\?\.startsAtLocal\)/)
    assert.equal(idSrc.includes("action === 'create'"), false)
    assert.match(idSrc, /confirmBookingRow\(/)
    assert.match(listSrc, /asString\(body\?\.action\) !== 'create'/)
    assert.match(listSrc, /confirmBookingRow\(/)
  })
})
