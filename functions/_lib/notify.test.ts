import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NEW_ICON, ORIGINAL_WORDMARK } from '../../shared/brand-logos'
import { SITE_DEFAULTS } from '../../shared/site-snapshot'
import { SITE } from './email-brand'
import {
  appointmentCopy,
  bookingDurationMinutes,
  buildAppointmentEmail,
  buildBookingIcs,
  dublinLocalToUtcIso,
  formatDublinSmsDate,
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

  it('uses published durationMinutes when the service name matches', () => {
    const site = {
      ...SITE_DEFAULTS,
      pricing: {
        ...SITE_DEFAULTS.pricing,
        serviceCopy: {
          ...SITE_DEFAULTS.pricing.serviceCopy,
          followUp: {
            ...SITE_DEFAULTS.pricing.serviceCopy.followUp,
            name: 'Return visit',
            durationMinutes: 50,
          },
        },
      },
    }
    assert.equal(bookingDurationMinutes('Return visit', site), 50)
    assert.equal(bookingDurationMinutes('Follow-up', site), 45)
  })

  it('uses extra durationMinutes when the service name matches', () => {
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
            durationMinutes: 90,
          },
        ],
      },
    }
    assert.equal(bookingDurationMinutes('Fertility treatment', site), 90)
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
    smsDateLabel: 'Wednesday 19 August',
    timeLabel: '2:00 pm',
    locationText: 'Celbridge',
    phone: '01 234 5678',
  }
  const smsWhen = 'Wednesday 19 August at 2:00 pm in Celbridge'

  it('uses distinct confirm subject and heading', () => {
    const copy = appointmentCopy({ ...base, kind: 'confirm' })
    assert.equal(copy.subject, 'Wellness Needles — appointment confirmed')
    assert.equal(copy.status, 'Appointment confirmed')
    assert.equal(copy.title, 'See you soon, Aoife!')
    assert.equal(copy.introText, 'Hi Aoife, we look forward to seeing you.')
    assert.equal(copy.sms, `Confirmed: ${smsWhen}. Call 01 234 5678`)
  })

  it('uses last-minute combined wording', () => {
    const copy = appointmentCopy({ ...base, kind: 'combined' })
    assert.equal(copy.subject, 'Confirmed, see you then')
    assert.equal(copy.status, 'Appointment confirmed')
    assert.equal(copy.title, 'See you soon, Aoife!')
    assert.equal(copy.sms, `Confirmed — see you ${smsWhen}. Call 01 234 5678`)
  })

  it('does not repeat Reminder in the heading', () => {
    const copy = appointmentCopy({ ...base, kind: 'reminder' })
    assert.equal(copy.subject, 'Reminder — your appointment is tomorrow')
    assert.equal(copy.status, 'Your appointment is tomorrow')
    assert.equal(copy.title, 'See you tomorrow, Aoife!')
    assert.notEqual(copy.title, copy.subject)
    assert.equal(
      copy.sms,
      `Just a reminder: your appointment is ${smsWhen}. See you then!`
    )
  })

  it('uses appointment updated copy for reschedule', () => {
    const copy = appointmentCopy({ ...base, kind: 'reschedule' })
    assert.equal(copy.subject, 'Wellness Needles — appointment updated')
    assert.equal(copy.status, 'Appointment updated')
    assert.equal(copy.title, 'See you soon, Aoife!')
    assert.equal(copy.introText, 'Hi Aoife, we look forward to seeing you.')
    assert.equal(copy.sms, `Updated: ${smsWhen}. Call 01 234 5678`)
  })
})

describe('formatDublinSmsDate', () => {
  it('omits the year', () => {
    assert.equal(formatDublinSmsDate('2026-08-20T08:00:00.000Z'), 'Thursday 20 August')
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

describe('buildAppointmentEmail logo', () => {
  const base = {
    kind: 'confirm' as const,
    clinic: 'Wellness Needles',
    firstName: 'Ada',
    dateLabel: 'Monday 1 September',
    timeLabel: '10:00',
    locationLabel: 'Celbridge',
    durationMinutes: 60,
  }

  it('uses the original wordmark when overlay or the flag is off', () => {
    const html = buildAppointmentEmail({ ...base, site: SITE_DEFAULTS }).html
    assert.match(html, new RegExp(`${SITE}${ORIGINAL_WORDMARK}`.replace(/\./g, '\\.')))
    assert.doesNotMatch(html, new RegExp(NEW_ICON.replace(/\./g, '\\.')))
  })

  it('uses the new clinic icon when overlay and the flag are both on', () => {
    const html = buildAppointmentEmail({
      ...base,
      site: {
        ...SITE_DEFAULTS,
        websiteOverlayEnabled: true,
        features: { ...SITE_DEFAULTS.features, newClinicLogoEnabled: true },
      },
    }).html
    assert.match(html, new RegExp(`${SITE}${NEW_ICON}`.replace(/\./g, '\\.')))
    assert.doesNotMatch(html, new RegExp(`${SITE}${ORIGINAL_WORDMARK}`.replace(/\./g, '\\.')))
  })
})
