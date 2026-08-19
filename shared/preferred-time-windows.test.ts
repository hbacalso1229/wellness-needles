import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { DEFAULT_HOURS, type WeekHours } from './site-snapshot'
import {
  clipPreferredWindows,
  formatPreferredWindowLabel,
} from './preferred-time-windows'

const MONDAY = '2026-08-17'
const SATURDAY = '2026-08-22'

function hours(patch: Partial<WeekHours['monday']>): WeekHours {
  return {
    ...DEFAULT_HOURS,
    monday: { closed: false, open: '09:00', close: '20:00', ...patch },
  }
}

describe('clipPreferredWindows', () => {
  it('uses baked Evening 4–7 when overlay hours are off', () => {
    const ranges = clipPreferredWindows(MONDAY, null)
    assert.equal(ranges.length, 3)
    assert.equal(ranges[0].window, '9:00 AM – 12:00 PM')
    assert.equal(ranges[1].window, '12:00 PM – 4:00 PM')
    assert.equal(ranges[2].window, '4:00 PM – 7:00 PM')
    assert.equal(
      formatPreferredWindowLabel(ranges[2]),
      'Evening (4:00 PM – 7:00 PM)'
    )
  })

  it('clips evening to published close in 12-hour AM/PM', () => {
    const ranges = clipPreferredWindows(MONDAY, DEFAULT_HOURS)
    assert.equal(ranges.length, 3)
    assert.equal(ranges[0].window, '9:00 AM – 12:00 PM')
    assert.equal(ranges[1].window, '12:00 PM – 4:00 PM')
    assert.equal(ranges[2].window, '4:00 PM – 8:00 PM')
    assert.match(ranges[2].window, /AM|PM/)
    assert.equal(ranges[2].window.includes('20:00'), false)
    assert.equal(
      formatPreferredWindowLabel(ranges[2]),
      'Evening (4:00 PM – 8:00 PM)'
    )
  })

  it('hides evening when the clinic closes at 14:00 and clips afternoon', () => {
    const ranges = clipPreferredWindows(MONDAY, hours({ close: '14:00' }))
    assert.deepEqual(
      ranges.map((row) => row.id),
      ['morning', 'afternoon']
    )
    assert.equal(ranges[1].window, '12:00 PM – 2:00 PM')
  })

  it('hides morning when the clinic opens at 13:00', () => {
    const ranges = clipPreferredWindows(MONDAY, hours({ open: '13:00' }))
    assert.deepEqual(
      ranges.map((row) => row.id),
      ['afternoon', 'evening']
    )
    assert.equal(ranges[0].window, '1:00 PM – 4:00 PM')
  })

  it('does not add a card before 9:00 AM when opening earlier', () => {
    const ranges = clipPreferredWindows(MONDAY, hours({ open: '08:00' }))
    assert.equal(ranges[0].id, 'morning')
    assert.equal(ranges[0].window, '9:00 AM – 12:00 PM')
  })

  it('shows one open–close card when no bucket overlaps', () => {
    const ranges = clipPreferredWindows(
      MONDAY,
      hours({ open: '08:00', close: '08:30' })
    )
    assert.equal(ranges.length, 1)
    assert.equal(ranges[0].id, 'open')
    assert.equal(ranges[0].window, '8:00 AM – 8:30 AM')
  })

  it('returns no cards on a closed weekday', () => {
    assert.deepEqual(clipPreferredWindows(SATURDAY, DEFAULT_HOURS), [])
  })
})
