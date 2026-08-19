import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  datetimeLocalFrom12,
  datetimeLocalTo12,
  hhmmTo12,
  hour12ToHhmm,
} from './twelve-hour'

describe('twelve-hour clock', () => {
  it('converts HH:mm to 12-hour AM/PM', () => {
    assert.deepEqual(hhmmTo12('09:00'), { hour: 9, minute: 0, ampm: 'AM' })
    assert.deepEqual(hhmmTo12('20:00'), { hour: 8, minute: 0, ampm: 'PM' })
    assert.deepEqual(hhmmTo12('00:00'), { hour: 12, minute: 0, ampm: 'AM' })
    assert.deepEqual(hhmmTo12('12:00'), { hour: 12, minute: 0, ampm: 'PM' })
  })

  it('writes 12-hour back to HH:mm', () => {
    assert.equal(hour12ToHhmm(9, 'AM'), '09:00')
    assert.equal(hour12ToHhmm(8, 'PM'), '20:00')
    assert.equal(hour12ToHhmm(12, 'AM'), '00:00')
    assert.equal(hour12ToHhmm(12, 'PM'), '12:00')
    assert.equal(hour12ToHhmm(2, 'PM', 15), '14:15')
  })

  it('round-trips datetime-local as 12-hour parts', () => {
    const parts = datetimeLocalTo12('2026-08-19T14:15')
    assert.deepEqual(parts, { date: '2026-08-19', hour: 2, minute: 15, ampm: 'PM' })
    assert.equal(datetimeLocalFrom12(parts), '2026-08-19T14:15')
  })
})
