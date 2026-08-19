import type { PagesEnv } from './http'
import type { SiteSnapshot } from '../../shared/site-snapshot'
import {
  BAKED_LOCATIONS,
  asLocationRow,
  directionsHref,
  twoColPills,
  emailShell,
  escapeHtml,
  firstNameOnly,
  fullWidthPill,
  googleCalendarTemplateUrl,
  parseLocationDisplay,
  row,
  type KnownLocation,
} from './email-brand'

export { snapDateTimeLocalToQuarterHour } from '../../shared/quarter-hour'

const FROM = 'Wellness Needles <info@wellnessneedles.ie>'
const ORGANIZER_EMAIL = 'info@wellnessneedles.ie'

export type CalendarInvite = {
  method: 'REQUEST' | 'CANCEL'
  uid: string
  startsAtIso: string
  durationMinutes: number
  summary: string
  description: string
  location: string
  attendeeName: string
  attendeeEmail: string
  organizerName: string
  organizerEmail: string
}

export type ClinicCalendarCopy = {
  to: string
  subject: string
  html: string
  text: string
  ics: { method: 'REQUEST' | 'CANCEL'; body: string }
}

export type BookingMessageKind = 'confirm' | 'combined' | 'reminder' | 'cancel-pending' | 'cancel-confirmed'

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  for (const byte of bytes) bin += String.fromCharCode(byte)
  return btoa(bin)
}

async function sendResend(
  apiKey: string | undefined,
  to: string,
  subject: string,
  html: string,
  text: string,
  options?: { cc?: string; ics?: { method: 'REQUEST' | 'CANCEL'; body: string } }
): Promise<boolean> {
  if (!apiKey) return false
  const cc = options?.cc?.trim()
  const payload: Record<string, unknown> = {
    from: FROM,
    to: [to],
    subject,
    html,
    text,
  }
  if (cc && cc.toLowerCase() !== to.trim().toLowerCase()) {
    payload.cc = [cc]
  }
  if (options?.ics) {
    payload.attachments = [
      {
        filename: 'invite.ics',
        content: utf8ToBase64(options.ics.body),
        content_type: `text/calendar; charset=utf-8; method=${options.ics.method}`,
      },
    ]
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    return false
  }
}

async function sendTwilio(
  env: PagesEnv,
  to: string,
  body: string
): Promise<boolean> {
  const sid = env.TWILIO_ACCOUNT_SID?.trim()
  const token = env.TWILIO_AUTH_TOKEN?.trim()
  const from = env.TWILIO_FROM?.trim()
  if (!sid || !token || !from) return false
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: to, From: from, Body: body }),
      }
    )
    return res.ok
  } catch {
    return false
  }
}

export function formatDublin(isoUtc: string): string {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return isoUtc
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

export function formatDublinDate(isoUtc: string): string {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return isoUtc
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatDublinTime(isoUtc: string): string {
  const date = new Date(isoUtc)
  if (Number.isNaN(date.getTime())) return isoUtc
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function knownLocationsFromSite(site: SiteSnapshot): KnownLocation[] {
  const fromSite = (site.locations || [])
    .map((loc) => asLocationRow(loc))
    .filter((item): item is KnownLocation => Boolean(item))
  return fromSite.length ? fromSite : BAKED_LOCATIONS
}

export function appointmentCopy(options: {
  kind: BookingMessageKind
  firstName: string
  clinic: string
  dateLabel: string
  timeLabel: string
  locationText: string
  phone: string
}): { title: string; introHtml: string; introText: string; subject: string; sms: string } {
  const hello = options.firstName
    ? `Hi ${options.firstName}, we look forward to seeing you.`
    : 'We look forward to seeing you.'
  if (options.kind === 'confirm') {
    return {
      subject: `${options.clinic} — appointment confirmed`,
      title: 'Appointment confirmed',
      introHtml: escapeHtml(hello),
      introText: hello,
      sms: `Confirmed ${options.dateLabel} ${options.timeLabel} at ${options.locationText}. Call ${options.phone}`,
    }
  }
  if (options.kind === 'combined') {
    return {
      subject: 'Confirmed, see you then',
      title: 'See you then',
      introHtml: escapeHtml(hello),
      introText: hello,
      sms: `Confirmed — see you ${options.dateLabel} ${options.timeLabel} at ${options.locationText}. Call ${options.phone}`,
    }
  }
  return {
    subject: 'Reminder — your appointment is tomorrow',
    title: 'See you tomorrow',
    introHtml: escapeHtml(hello),
    introText: hello,
    sms: `Reminder ${options.dateLabel} ${options.timeLabel} at ${options.locationText}. See you then.`,
  }
}

function buildAppointmentEmail(options: {
  kind: 'confirm' | 'combined' | 'reminder'
  clinic: string
  firstName: string
  dateLabel: string
  timeLabel: string
  locationLabel: string
  site: SiteSnapshot
  startsAtIso?: string
  durationMinutes: number
}): { html: string; text: string; subject: string; sms: string } {
  const known = knownLocationsFromSite(options.site)
  const parsed = parseLocationDisplay(options.locationLabel, known)
  const town = parsed?.town || ''
  const address = parsed?.address || options.locationLabel || 'the clinic'
  const mapsQuery = parsed?.mapsQuery || address.replace(/\n/g, ' ')
  const mapsUrl = directionsHref(mapsQuery, parsed?.directionsUrl)
  const phoneHref = options.site.phone.href || `tel:${options.site.phone.displayText.replace(/\s/g, '')}`
  const phone = options.site.phone.displayText
  const copy = appointmentCopy({
    kind: options.kind,
    firstName: options.firstName,
    clinic: options.clinic,
    dateLabel: options.dateLabel,
    timeLabel: options.timeLabel,
    locationText: town || address.replace(/\n/g, ', '),
    phone,
  })
  const calendarUrl = options.startsAtIso
    ? googleCalendarTemplateUrl({
        title: `${options.clinic} appointment`,
        startsAtIso: options.startsAtIso,
        durationMinutes: options.durationMinutes,
        details: copy.introText,
        location: mapsQuery,
      })
    : null

  const rowsHtml = [
    row('calendar', 'Date', options.dateLabel),
    row('clock', 'Time', options.timeLabel),
    row('map-pin', 'Location', address),
  ].join('')

  const pair = calendarUrl
    ? twoColPills(
        { href: calendarUrl, label: 'Add to Calendar', variant: 'gold', icon: 'calendar' },
        { href: mapsUrl, label: 'Get Directions', variant: 'outline', icon: 'map-pin' }
      )
    : fullWidthPill(mapsUrl, 'Get Directions', 'outline', 'map-pin')
  const actionBlocks = [
    pair,
    `<div style="height:10px;font-size:0;line-height:0;">&nbsp;</div>`,
    fullWidthPill(phoneHref, 'Call Wellness Needles', 'outline', 'phone'),
  ].join('')

  const html = emailShell({
    title: copy.title,
    introHtml: copy.introHtml,
    rowsHtml,
    actionsHtml: `<div style="margin-top:8px;">${actionBlocks}</div>`,
    footerNote:
      options.kind === 'reminder' || !calendarUrl
        ? undefined
        : 'A calendar invite is also attached for Apple and Outlook.',
  })

  const textLines = [
    copy.title,
    '',
    copy.introText,
    '',
    `Date`,
    options.dateLabel,
    '',
    `Time`,
    options.timeLabel,
    '',
    `Location`,
    address,
    '',
    calendarUrl ? `Add to Calendar: ${calendarUrl}` : '',
    `Get Directions: ${mapsUrl}`,
    `Call Wellness Needles: ${phone}`,
  ].filter((line) => line !== undefined)

  return { html, text: textLines.join('\n'), subject: copy.subject, sms: copy.sms }
}

export type BookingNotifyResult = {
  email: boolean
  sms: boolean
  clinicCopy?: ClinicCalendarCopy
}

export async function sendClinicCalendarCopy(
  env: PagesEnv,
  copy: ClinicCalendarCopy
): Promise<boolean> {
  const withIcs = await sendResend(
    env.RESEND_API_KEY,
    copy.to,
    copy.subject,
    copy.html,
    copy.text,
    { ics: copy.ics }
  )
  if (withIcs) return true
  return sendResend(env.RESEND_API_KEY, copy.to, copy.subject, copy.html, copy.text)
}

/** After D1 is saved: waitUntil so clinic copy cannot block Confirm, or await if waitUntil is missing. */
export async function enqueueClinicCalendarCopy(
  waitUntil: ((promise: Promise<unknown>) => void) | undefined,
  env: PagesEnv,
  copy: ClinicCalendarCopy | undefined
): Promise<void> {
  if (!copy) return
  const task = sendClinicCalendarCopy(env, copy)
  if (typeof waitUntil === 'function') {
    waitUntil(task)
    return
  }
  await task
}

export async function sendPatientBookingMessage(options: {
  env: PagesEnv
  kind: BookingMessageKind
  toEmail: string
  toPhone: string
  smsOptIn: boolean
  whenLabel: string
  locationLabel: string
  site: SiteSnapshot
  bookingId?: string
  patientName?: string
  firstName?: string
  startsAtIso?: string
  durationMinutes?: number
}): Promise<BookingNotifyResult> {
  const clinic = options.site.clinicName
  const when = options.whenLabel
  const loc = options.locationLabel || 'the clinic'
  const phone = options.site.phone.displayText
  const clinicEmail = options.site.email.address.trim() || ORGANIZER_EMAIL
  const greetingName = firstNameOnly(options.firstName || options.patientName || '')
  const dateLabel = options.startsAtIso ? formatDublinDate(options.startsAtIso) : when
  const timeLabel = options.startsAtIso ? formatDublinTime(options.startsAtIso) : ''
  const durationMinutes = options.durationMinutes || 60
  const cardKind =
    options.kind === 'confirm' || options.kind === 'combined' || options.kind === 'reminder'
      ? options.kind
      : null

  let subject = `${clinic} booking`
  let text = ''
  let html = ''
  let smsBody = ''

  if (cardKind) {
    const card = buildAppointmentEmail({
      kind: cardKind,
      clinic,
      firstName: greetingName,
      dateLabel,
      timeLabel: timeLabel || when,
      locationLabel: loc,
      site: options.site,
      startsAtIso: options.startsAtIso,
      durationMinutes,
    })
    subject = card.subject
    text = card.text
    html = card.html
    smsBody = card.sms
  } else if (options.kind === 'cancel-pending') {
    subject = `${clinic} — we could not confirm this request`
    text = `We could not confirm this appointment request${when ? ` (${when})` : ''}. Please call ${phone} or email ${options.site.email.address} to rebook.`
    html = `<p>${escapeHtml(text)}</p>`
    smsBody = text
  } else {
    subject = `${clinic} — appointment cancelled`
    text = `Your appointment on ${when} at ${loc} has been cancelled. Call ${phone} to rebook.`
    html = `<p>${escapeHtml(text)}</p>`
    smsBody = text
  }

  const attachIcs =
    (options.kind === 'confirm' || options.kind === 'combined' || options.kind === 'cancel-confirmed') &&
    Boolean(options.bookingId && options.startsAtIso)
  const icsBody = attachIcs
    ? buildBookingIcs({
        method: options.kind === 'cancel-confirmed' ? 'CANCEL' : 'REQUEST',
        uid: options.bookingId || '',
        startsAtIso: options.startsAtIso || '',
        durationMinutes,
        summary: `${clinic} — ${options.patientName || 'appointment'}`,
        description: text,
        location: loc,
        attendeeName: options.patientName || options.toEmail,
        attendeeEmail: options.toEmail,
        organizerName: clinic,
        organizerEmail: clinicEmail,
      })
    : null
  const ics = icsBody
    ? {
        method: (options.kind === 'cancel-confirmed' ? 'CANCEL' : 'REQUEST') as 'REQUEST' | 'CANCEL',
        body: icsBody,
      }
    : undefined

  const sendWithOptionalIcs = async (
    to: string,
    mailSubject: string,
    mailHtml: string,
    mailText: string,
    cc?: string
  ): Promise<boolean> => {
    if (ics) {
      const withIcs = await sendResend(
        options.env.RESEND_API_KEY,
        to,
        mailSubject,
        mailHtml,
        mailText,
        { cc, ics }
      )
      if (withIcs) return true
    }
    return sendResend(options.env.RESEND_API_KEY, to, mailSubject, mailHtml, mailText, {
      cc: ics ? undefined : cc,
    })
  }

  const emailOk = await sendWithOptionalIcs(
    options.toEmail,
    subject,
    html,
    text,
    ics ? clinicEmail : undefined
  )

  const clinicCopy =
    emailOk &&
    ics &&
    clinicEmail.toLowerCase() !== options.toEmail.trim().toLowerCase()
      ? {
          to: clinicEmail,
          subject: `${clinic} — calendar: ${options.patientName || options.toEmail}`,
          html,
          text: `${text}\n\nPortal booking ${options.bookingId || ''}.`,
          ics,
        }
      : undefined

  let smsOk = false
  if (options.smsOptIn && options.site.features.smsEnabled) {
    smsOk = await sendTwilio(options.env, options.toPhone, smsBody.slice(0, 160))
  }
  return { email: emailOk, sms: smsOk, clinicCopy }
}

function dublinDateYmd(isoUtc: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Dublin',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(isoUtc))
  const pick = (type: string) => parts.find((p) => p.type === type)?.value || '00'
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

function shiftYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

/** 09:00 Europe/Dublin on the calendar day before the appointment. */
export function remindAtMorningBefore(startsAtIso: string): string {
  return dublinLocalToUtcIso(shiftYmd(dublinDateYmd(startsAtIso), -1), '09:00')
}

export function reminderWindowStarted(remindAtIso: string, nowMs = Date.now()): boolean {
  const at = new Date(remindAtIso).getTime()
  return Number.isFinite(at) && nowMs >= at
}

/** Interpret YYYY-MM-DD + HH:mm as Europe/Dublin, return UTC ISO. */
export function dublinLocalToUtcIso(dateStr: string, timeHm: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeHm.split(':').map(Number)
  const guess = Date.UTC(y, mo - 1, d, hh, mm)
  const asDublin = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Dublin',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(new Date(guess))
  const pick = (type: string) =>
    Number(asDublin.find((p) => p.type === type)?.value || '0')
  const shown = Date.UTC(
    pick('year'),
    pick('month') - 1,
    pick('day'),
    pick('hour'),
    pick('minute')
  )
  const offset = shown - guess
  return new Date(guess - offset).toISOString()
}

export function hoursUntil(isoUtc: string): number {
  return (new Date(isoUtc).getTime() - Date.now()) / 36e5
}

/** Initial 75, follow-up/package 45, otherwise 60. No schema change. */
export function bookingDurationMinutes(serviceLabel?: string | null): number {
  const label = (serviceLabel || '').toLowerCase()
  if (label.includes('initial')) return 75
  if (label.includes('follow') || label.includes('package')) return 45
  return 60
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function icsFold(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = [line.slice(0, 75)]
  let rest = line.slice(75)
  while (rest.length) {
    chunks.push(` ${rest.slice(0, 74)}`)
    rest = rest.slice(74)
  }
  return chunks.join('\r\n')
}

function toIcsUtc(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

export function icsUid(bookingId: string): string {
  return `${bookingId.replace(/[^A-Za-z0-9-]/g, '')}@wellnessneedles.ie`
}

export function buildBookingIcs(invite: CalendarInvite): string | null {
  const dtStart = toIcsUtc(invite.startsAtIso)
  if (!dtStart) return null
  const endMs = new Date(invite.startsAtIso).getTime() + invite.durationMinutes * 60_000
  const dtEnd = toIcsUtc(new Date(endMs).toISOString())
  const dtStamp = toIcsUtc(new Date().toISOString())
  const method = invite.method
  const status = method === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'
  const sequence = method === 'CANCEL' ? 1 : 0
  const organizer = invite.organizerEmail.trim() || ORGANIZER_EMAIL
  const attendee = invite.attendeeEmail.trim()
  if (!attendee) return null

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wellness Needles//Booking//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${icsUid(invite.uid)}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icsEscape(invite.summary)}`,
    `DESCRIPTION:${icsEscape(invite.description)}`,
    `LOCATION:${icsEscape(invite.location)}`,
    icsFold(
      `ORGANIZER;CN=${icsEscape(invite.organizerName)}:mailto:${organizer}`
    ),
    icsFold(
      `ATTENDEE;CN=${icsEscape(invite.attendeeName)};RSVP=TRUE;PARTSTAT=NEEDS-ACTION;ROLE=REQ-PARTICIPANT:mailto:${attendee}`
    ),
    icsFold(
      `ATTENDEE;CN=${icsEscape(invite.organizerName)};ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED:mailto:${organizer}`
    ),
    `STATUS:${status}`,
    `SEQUENCE:${sequence}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.join('\r\n')}\r\n`
}
