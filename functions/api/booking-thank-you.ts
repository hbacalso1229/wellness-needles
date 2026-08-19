/**
 * Cloudflare Pages Function — patient thank-you email via Resend.
 * Secret: RESEND_API_KEY (Pages project env / `wrangler pages secret put`).
 * From: info@wellnessneedles.ie (domain verified in Resend).
 */

import {
  BAKED_LOCATIONS,
  HEADING,
  PRIMARY,
  ROW_BORDER,
  SANS,
  SECONDARY,
  SERIF,
  SITE,
  TEXT,
  TEXT_LABEL,
  TEXT_MUTED,
  asLocationRow,
  brandedLink,
  escapeHtml,
  fullWidthPill,
  iconImg,
  leafDivider,
  mapsHref,
  orDivider,
  row,
  visitTypeDisplay,
  type KnownLocation,
} from '../_lib/email-brand'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type ThankYouBody = {
  firstName?: string
  lastName?: string
  email?: string
  serviceLabel?: string
  locationLabel?: string
  date?: string
  time?: string
  serviceType?: string
  message?: string
}

type Env = {
  RESEND_API_KEY: string
  DB?: {
    prepare: (query: string) => {
      first: <T>() => Promise<T | null>
    }
  }
  SITE_CACHE?: {
    get: (key: string, type: 'text') => Promise<string | null>
  }
}

const FROM = 'Wellness Needles <info@wellnessneedles.ie>'
const PHONE_DISPLAY = '+353 86 054 3085'
const PHONE_HREF = 'tel:+353860543085'
const EMAIL_HREF =
  'mailto:info@wellnessneedles.ie?subject=Appointment%20enquiry'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function formatDisplayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/** Keep in sync with src/lib/person-name.ts */
function collapseRepeatedFullName(value: string): string {
  let current = collapseSpaces(value)
  for (let i = 0; i < 3; i += 1) {
    const parts = current.split(' ').filter(Boolean)
    if (parts.length < 4 || parts.length % 2 !== 0) break
    const mid = parts.length / 2
    const left = parts.slice(0, mid).join(' ')
    const right = parts.slice(mid).join(' ')
    if (left.toLowerCase() !== right.toLowerCase()) break
    current = left
  }
  return current
}

function joinPersonName(firstName: string, lastName: string): string {
  const first = collapseRepeatedFullName(firstName)
  const last = collapseRepeatedFullName(lastName)
  if (!first) return last
  if (!last) return first
  const firstLower = first.toLowerCase()
  const lastLower = last.toLowerCase()
  if (firstLower === lastLower) return first
  if (firstLower.endsWith(` ${lastLower}`)) return first
  if (lastLower.startsWith(`${firstLower} `)) return last
  return collapseRepeatedFullName(`${first} ${last}`)
}

async function publishedLocations(env: Env): Promise<KnownLocation[]> {
  try {
    const fromKv = await env.SITE_CACHE?.get('public:site:v1', 'text')
    let raw = fromKv || ''
    if (!raw && env.DB) {
      const row = await env.DB.prepare(
        'SELECT published_json FROM site_settings WHERE id = 1'
      ).first<{ published_json: string }>()
      raw = row?.published_json || ''
    }
    if (!raw) return BAKED_LOCATIONS
    const parsed = JSON.parse(raw) as { locations?: unknown }
    const extra = Array.isArray(parsed.locations)
      ? parsed.locations.map(asLocationRow).filter((item): item is KnownLocation => Boolean(item))
      : []
    return extra.length ? extra : BAKED_LOCATIONS
  } catch {
    return BAKED_LOCATIONS
  }
}

function buildHtml(
  body: Required<Pick<ThankYouBody, 'firstName' | 'email' | 'date' | 'time' | 'serviceType'>> &
    ThankYouBody,
  known: KnownLocation[] = BAKED_LOCATIONS
): string {
  const fullName = joinPersonName(body.firstName, body.lastName || '')
  const logoUrl = `${SITE}/logo_wellness_transparent.png`
  const visit = visitTypeDisplay(body.serviceType, body.locationLabel, known)
  const rows = [
    row('user', 'Name', fullName),
    body.serviceLabel ? row('check', 'Service', body.serviceLabel) : '',
    row(
      'map-pin',
      'Visit type',
      visit.value,
      visit.address
        ? {
            text: visit.address,
            href: mapsHref(body.locationLabel || visit.address),
          }
        : undefined
    ),
    row('calendar', 'Preferred date', formatDisplayDate(body.date)),
    row('clock', 'Preferred time', body.time),
    body.message ? row('message', 'Message', body.message) : '',
  ].join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="format-detection" content="telephone=no,address=no,email=no" />
  <meta name="x-apple-data-detectors" content="false" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${SANS};color:${TEXT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:448px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="${SITE}/" style="text-decoration:none;">
                <img src="${logoUrl}" alt="Wellness Needles" width="56" height="56" style="display:block;width:56px;height:56px;border:0;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-family:${SERIF};font-size:24px;line-height:1.25;font-weight:700;color:${TEXT};text-align:center;">Thank you, ${escapeHtml(body.firstName)}!</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:10px;font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT_MUTED};">
              Your appointment request has been received.
              <br />We'll confirm by email or phone within 24 hours.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              ${leafDivider()}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;font-family:${SANS};font-size:16px;line-height:1.55;color:${TEXT_MUTED};">
              Thank you for choosing <strong style="color:${PRIMARY};">Wellness Needles</strong>.
              We'll be in touch soon to confirm your appointment.
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px 16px;border:1px solid #b7d0a8;border-radius:12px;background:#f4f8f2;box-shadow:0 8px 24px rgba(27,59,43,0.10);">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td valign="top" style="padding-right:8px;padding-top:2px;">${iconImg('heart-handshake', 20)}</td>
                  <td valign="top">
                    <div style="font-family:${SANS};font-size:16px;font-weight:600;color:${TEXT};line-height:1.3;">Your appointment request</div>
                    <div style="font-family:${SANS};font-size:13px;line-height:1.35;color:${TEXT_MUTED};margin-top:2px;">Your request details</div>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${rows}
              </table>
              <div style="border-top:1px solid ${ROW_BORDER};margin-top:4px;padding-top:12px;text-align:center;font-family:${SANS};font-size:14px;line-height:1.5;font-weight:700;color:${TEXT};">
                We'll contact you within 24 hours to confirm your appointment.
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;max-width:320px;border:1px solid ${ROW_BORDER};border-radius:12px;background:#eef5ea;">
                <tr>
                  <td style="padding:16px;text-align:left;">
                    <div style="font-family:${SANS};font-size:18px;font-weight:700;line-height:1.3;color:${HEADING};margin-bottom:4px;">Need help?</div>
                    <div style="font-family:${SANS};font-size:16px;line-height:1.55;color:${TEXT_MUTED};margin-bottom:16px;">
                      Have questions about your request? We're happy to help.
                    </div>
                    ${fullWidthPill(PHONE_HREF, 'Call us', 'gold', 'phone')}
                    <div style="font-family:${SANS};font-size:16px;line-height:1.5;font-weight:600;color:${TEXT};margin:6px 0 0;text-align:center;">${brandedLink(PHONE_HREF, PHONE_DISPLAY, TEXT, 'font-weight:600;')}</div>
                    ${orDivider()}
                    ${fullWidthPill(EMAIL_HREF, 'Send a message', 'outline', 'mail')}
                    <div style="font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT_MUTED};margin-top:6px;text-align:center;">We reply within 24 hours</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:22px;font-family:${SANS};font-size:12px;line-height:1.5;color:${TEXT_LABEL};">
              <a href="${SITE}/" style="color:${SECONDARY};text-decoration:none;">wellnessneedles.ie</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const apiKey = context.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return jsonResponse(503, { ok: false, error: 'RESEND_API_KEY not configured' })
  }

  let body: ThankYouBody
  try {
    body = (await context.request.json()) as ThankYouBody
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON body' })
  }

  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const date = typeof body.date === 'string' ? body.date.trim() : ''
  const time = typeof body.time === 'string' ? body.time.trim() : ''
  const serviceType = typeof body.serviceType === 'string' ? body.serviceType.trim() : ''

  if (!firstName || !email || !isValidEmail(email) || !date || !time || !serviceType) {
    return jsonResponse(400, { ok: false, error: 'Missing required booking fields' })
  }

  const known = await publishedLocations(context.env)
  const html = buildHtml({
    firstName,
    lastName: typeof body.lastName === 'string' ? body.lastName.trim() : undefined,
    email,
    serviceLabel:
      typeof body.serviceLabel === 'string' ? body.serviceLabel.trim() : undefined,
    locationLabel:
      typeof body.locationLabel === 'string' ? body.locationLabel.trim() : undefined,
    date,
    time,
    serviceType,
    message: typeof body.message === 'string' ? body.message.trim() : undefined,
  }, known)

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: 'Appointment request received — Wellness Needles',
      html,
    }),
  })

  if (!resendResponse.ok) {
    const detail = await resendResponse.text()
    console.error('[booking-thank-you] Resend error', resendResponse.status, detail)
    return jsonResponse(502, { ok: false, error: 'Resend rejected the email' })
  }

  return jsonResponse(200, { ok: true })
}
