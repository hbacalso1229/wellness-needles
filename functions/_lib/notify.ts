import type { PagesEnv } from './http'
import type { SiteSnapshot } from '../../shared/site-snapshot'

const FROM = 'Wellness Needles <info@wellnessneedles.ie>'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function sendResend(
  apiKey: string | undefined,
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<boolean> {
  if (!apiKey) return false
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: [to], subject, html, text }),
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

export type BookingMessageKind = 'confirm' | 'combined' | 'reminder' | 'cancel-pending' | 'cancel-confirmed'

export async function sendPatientBookingMessage(options: {
  env: PagesEnv
  kind: BookingMessageKind
  toEmail: string
  toPhone: string
  smsOptIn: boolean
  whenLabel: string
  locationLabel: string
  site: SiteSnapshot
}): Promise<{ email: boolean; sms: boolean }> {
  const clinic = options.site.clinicName
  const when = options.whenLabel
  const loc = options.locationLabel || 'the clinic'
  const phone = options.site.phone.displayText

  let subject = `${clinic} booking`
  let text = ''
  if (options.kind === 'confirm') {
    subject = `${clinic} — appointment confirmed`
    text = `Your appointment is confirmed for ${when} at ${loc}. See you then. Call ${phone} if you need us.`
  } else if (options.kind === 'combined') {
    subject = `${clinic} — confirmed, see you then`
    text = `Your appointment is confirmed — see you ${when} at ${loc}. Call ${phone} if you need us.`
  } else if (options.kind === 'reminder') {
    subject = `${clinic} — reminder for tomorrow`
    text = `Reminder: your appointment is ${when} at ${loc}. See you then.`
  } else if (options.kind === 'cancel-pending') {
    subject = `${clinic} — we could not confirm this request`
    text = `We could not confirm this appointment request${when ? ` (${when})` : ''}. Please call ${phone} or email ${options.site.email.address} to rebook.`
  } else {
    subject = `${clinic} — appointment cancelled`
    text = `Your appointment on ${when} at ${loc} has been cancelled. Call ${phone} to rebook.`
  }

  const html = `<p>${escapeHtml(text)}</p>`
  const emailOk = await sendResend(
    options.env.RESEND_API_KEY,
    options.toEmail,
    subject,
    html,
    text
  )
  let smsOk = false
  if (options.smsOptIn) {
    smsOk = await sendTwilio(options.env, options.toPhone, text.slice(0, 160))
  }
  return { email: emailOk, sms: smsOk }
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
