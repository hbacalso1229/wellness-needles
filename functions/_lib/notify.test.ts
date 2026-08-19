import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  appointmentCopy,
  bookingDurationMinutes,
  buildBookingIcs,
  dublinLocalToUtcIso,
  icsUid,
  remindAtMorningBefore,
  reminderWindowStarted,
} from './notify'

describe('bookingDurationMinutes', () => {
  it('maps Initial to 75, follow-up/package to 45, else 60', () => {
    assert.equal(bookingDurationMinutes('Initial Consultation'), 75)
    assert.equal(bookingDurationMinutes('Follow-up'), 45)
    assert.equal(bookingDurationMinutes('Package of 5'), 45)
    assert.equal(bookingDurationMinutes('Acupuncture'), 60)
    assert.equal(bookingDurationMinutes(null), 60)
  })
})

describe('Dublin slot conversion', () => {
  it('treats winter local time as UTC', () => {
    assert.equal(dublinLocalToUtcIso('2026-01-14', '14:00'), '2026-01-14T14:00:00.000Z')
  })

  it('treats summer local time as IST (UTC+1)', () => {
    assert.equal(dublinLocalToUtcIso('2026-07-15', '14:00'), '2026-07-15T13:00:00.000Z')
  })

  it('sets remind_at to 09:00 Dublin the calendar day before', () => {
    const startsAt = dublinLocalToUtcIso('2026-08-19', '14:00')
    const remindAt = remindAtMorningBefore(startsAt)
    assert.equal(remindAt, dublinLocalToUtcIso('2026-08-18', '09:00'))
    assert.equal(reminderWindowStarted(remindAt, Date.parse('2026-08-18T08:00:00.000Z')), true)
    assert.equal(reminderWindowStarted(remindAt, Date.parse('2026-08-18T07:59:00.000Z')), false)
  })
})

describe('appointment copy', () => {
  const base = {
    firstName: 'Aoife',
    clinic: 'Wellness Needles',
    dateLabel: 'Wednesday 19 August 2026',
    timeLabel: '2:00 pm',
    locationText: 'Celbridge',
    phone: '01 234 5678',
  }

  it('uses distinct confirm subject and heading', () => {
    const copy = appointmentCopy({ ...base, kind: 'confirm' })
    assert.equal(copy.subject, 'Wellness Needles — appointment confirmed')
    assert.equal(copy.title, 'Appointment confirmed')
    assert.equal(copy.introText, 'Hi Aoife, we look forward to seeing you.')
  })

  it('uses last-minute combined wording', () => {
    const copy = appointmentCopy({ ...base, kind: 'combined' })
    assert.equal(copy.subject, 'Confirmed, see you then')
    assert.equal(copy.title, 'See you then')
  })

  it('does not repeat Reminder in the heading', () => {
    const copy = appointmentCopy({ ...base, kind: 'reminder' })
    assert.equal(copy.subject, 'Reminder — your appointment is tomorrow')
    assert.equal(copy.title, 'See you tomorrow')
    assert.notEqual(copy.title, copy.subject)
  })

  it('uses appointment updated copy for reschedule', () => {
    const copy = appointmentCopy({ ...base, kind: 'reschedule' })
    assert.equal(copy.subject, 'Wellness Needles — appointment updated')
    assert.equal(copy.title, 'Appointment updated')
    assert.equal(copy.introText, 'Hi Aoife, we look forward to seeing you.')
    assert.match(copy.sms, /^Updated /)
  })
})

describe('ICS', () => {
  const invite = {
    uid: 'booking-abc_123',
    startsAtIso: '2026-08-19T13:00:00.000Z',
    durationMinutes: 75,
    summary: 'Wellness Needles — Aoife Byrne',
    description: 'Confirmed slot',
    location: '56 The Orchard, Oldtown Mill',
    attendeeName: 'Aoife Byrne',
    attendeeEmail: 'aoife@example.com',
    organizerName: 'Wellness Needles',
    organizerEmail: 'info@wellnessneedles.ie',
  }

  it('keeps a stable UID across REQUEST and CANCEL', () => {
    const request = buildBookingIcs({ ...invite, method: 'REQUEST' })
    const cancel = buildBookingIcs({ ...invite, method: 'CANCEL' })
    assert.ok(request)
    assert.ok(cancel)
    const uid = `UID:${icsUid(invite.uid)}`
    assert.match(request, new RegExp(uid))
    assert.match(cancel, new RegExp(uid))
    assert.equal(icsUid(invite.uid), 'booking-abc123@wellnessneedles.ie')
    assert.match(request, /METHOD:REQUEST/)
    assert.match(cancel, /METHOD:CANCEL/)
    assert.match(request, /SEQUENCE:0/)
    assert.match(cancel, /SEQUENCE:1/)
    assert.match(request, /DTSTART:20260819T130000Z/)
    assert.match(request, /DTEND:20260819T141500Z/)
  })

  it('returns null without an attendee', () => {
    assert.equal(buildBookingIcs({ ...invite, method: 'REQUEST', attendeeEmail: '  ' }), null)
  })

  it('defaults REQUEST to SEQUENCE 0 and CANCEL to 1', () => {
    const request = buildBookingIcs({ ...invite, method: 'REQUEST' })
    const cancel = buildBookingIcs({ ...invite, method: 'CANCEL' })
    assert.match(request || '', /SEQUENCE:0/)
    assert.match(cancel || '', /SEQUENCE:1/)
  })

  it('bumps SEQUENCE on reschedule then cancel', () => {
    const first = buildBookingIcs({ ...invite, method: 'REQUEST', sequence: 0 })
    const updated = buildBookingIcs({ ...invite, method: 'REQUEST', sequence: 1 })
    const second = buildBookingIcs({ ...invite, method: 'REQUEST', sequence: 2 })
    const cancel = buildBookingIcs({ ...invite, method: 'CANCEL', sequence: 3 })
    assert.match(first || '', /SEQUENCE:0/)
    assert.match(updated || '', /SEQUENCE:1/)
    assert.match(second || '', /SEQUENCE:2/)
    assert.match(cancel || '', /SEQUENCE:3/)
    assert.match(updated || '', /UID:booking-abc123@wellnessneedles.ie/)
  })
})
