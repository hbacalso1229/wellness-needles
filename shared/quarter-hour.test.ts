import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { snapDateTimeLocalToQuarterHour, utcIsoToDublinDateTimeLocal, dublinTodayYmd, isDublinDateTimeLocalPast } from './quarter-hour'

describe('snapDateTimeLocalToQuarterHour', () => {
  it('keeps exact quarter hours', () => {
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:00'), '2026-08-19T14:00')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:15'), '2026-08-19T14:15')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:30'), '2026-08-19T14:30')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:45'), '2026-08-19T14:45')
  })

  it('rounds to the nearest 15 minutes', () => {
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:07'), '2026-08-19T14:00')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:08'), '2026-08-19T14:15')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:22'), '2026-08-19T14:15')
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:23'), '2026-08-19T14:30')
  })

  it('rolls 14:53 up to 15:00', () => {
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T14:53'), '2026-08-19T15:00')
  })

  it('rolls 23:53 up to midnight the next calendar day', () => {
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19T23:53'), '2026-08-20T00:00')
  })

  it('accepts a space separator from the API', () => {
    assert.equal(snapDateTimeLocalToQuarterHour('2026-08-19 14:07'), '2026-08-19T14:00')
  })
})

describe('utcIsoToDublinDateTimeLocal', () => {
  it('round-trips winter and summer Dublin slots', () => {
    assert.equal(utcIsoToDublinDateTimeLocal('2026-01-14T14:00:00.000Z'), '2026-01-14T14:00')
    assert.equal(utcIsoToDublinDateTimeLocal('2026-07-15T13:00:00.000Z'), '2026-07-15T14:00')
  })
})

describe('dublinTodayYmd and isDublinDateTimeLocalPast', () => {
  const noonUtc = new Date('2026-08-24T12:00:00.000Z')

  it('returns the Europe/Dublin calendar date', () => {
    assert.equal(dublinTodayYmd(noonUtc), '2026-08-24')
  })

  it('treats an earlier Dublin local start as past', () => {
    assert.equal(isDublinDateTimeLocalPast('2020-01-01T10:00', noonUtc), true)
    assert.equal(isDublinDateTimeLocalPast('2099-06-15T14:00', noonUtc), false)
  })
})
