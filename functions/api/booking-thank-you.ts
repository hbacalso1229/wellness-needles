/**
 * Cloudflare Pages Function — patient thank-you email via Resend.
 * Secret: RESEND_API_KEY (Pages project env / `wrangler pages secret put`).
 * From: info@wellnessneedles.ie (domain verified in Resend).
 */

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
}

const FROM = 'Wellness Needles <info@wellnessneedles.ie>'
const SITE = 'https://www.wellnessneedles.ie'
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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function row(label: string, value: string, detail?: string): string {
  const detailHtml = detail
    ? `<div style="margin-top:4px;font-size:13px;color:#1B3B2B;opacity:0.65;">${escapeHtml(detail)}</div>`
    : ''
  return `
    <tr>
      <td style="padding:10px 14px;border:1px solid rgba(127,176,105,0.25);border-radius:12px;background:#ffffff;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:#1B3B2B;opacity:0.5;font-weight:600;">${escapeHtml(label)}</div>
        <div style="margin-top:4px;font-size:15px;font-weight:600;color:#1B3B2B;line-height:1.35;">${escapeHtml(value)}</div>
        ${detailHtml}
      </td>
    </tr>
    <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>`
}

function buildHtml(body: Required<Pick<ThankYouBody, 'firstName' | 'email' | 'date' | 'time' | 'serviceType'>> & ThankYouBody): string {
  const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ')
  const logoUrl = `${SITE}/logo_wellness_transparent.png`
  const rows = [
    row('Name', fullName),
    body.serviceLabel ? row('Service', body.serviceLabel) : '',
    row('Visit type', body.serviceType, body.locationLabel),
    row('Preferred date', formatDisplayDate(body.date)),
    row('Preferred time', body.time),
    body.message ? row('Message', body.message) : '',
  ].join('')

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Georgia,'Times New Roman',serif;color:#1B3B2B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" style="max-width:480px;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <img src="${logoUrl}" alt="Wellness Needles" width="160" style="display:block;max-width:160px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-size:28px;line-height:1.25;color:#1B3B2B;">Thank you, ${escapeHtml(body.firstName)}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1B3B2B;opacity:0.7;">
              Request received — we will confirm by email or phone.
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1B3B2B;opacity:0.75;">
              We appreciate you trusting <strong style="color:#1B3B2B;">Wellness Needles</strong> with your care.
              Your appointment request is with us — we look forward to supporting you.
            </td>
          </tr>
          <tr>
            <td style="padding:18px;border:1px solid rgba(127,176,105,0.3);border-radius:16px;background:rgba(127,176,105,0.08);">
              <div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#2F6B4F;margin-bottom:12px;">
                Your booking confirmation
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-family:Arial,Helvetica,sans-serif;">
                ${rows}
              </table>
              <div style="border-top:1px solid rgba(127,176,105,0.25);margin-top:8px;padding-top:14px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#1B3B2B;opacity:0.7;">
                A confirmation email is on its way to <strong style="opacity:1;color:#1B3B2B;">${escapeHtml(body.email)}</strong>.
                <br />We'll contact you within 24 hours to confirm. Your preferred time is not locked until then.
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;">
              <table role="presentation" width="100%" style="border:1px solid rgba(127,176,105,0.25);border-radius:12px;background:rgba(127,176,105,0.1);font-family:Arial,Helvetica,sans-serif;">
                <tr>
                  <td style="padding:18px;text-align:center;">
                    <div style="font-size:17px;font-weight:700;color:#1B3B2B;margin-bottom:6px;">Need help?</div>
                    <div style="font-size:14px;line-height:1.45;color:#1B3B2B;opacity:0.7;margin-bottom:14px;">
                      Questions about your request? Call or email and we can help.
                    </div>
                    <a href="${PHONE_HREF}" style="display:inline-block;background:#C9A227;color:#1B3B2B;text-decoration:none;font-weight:700;padding:10px 18px;border-radius:999px;margin-bottom:6px;">Call Now</a>
                    <div style="font-size:14px;color:#1B3B2B;opacity:0.7;margin-bottom:12px;">${PHONE_DISPLAY}</div>
                    <a href="${EMAIL_HREF}" style="display:inline-block;border:1px solid rgba(27,59,43,0.25);color:#1B3B2B;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:999px;background:#ffffff;">Send a message</a>
                    <div style="font-size:14px;color:#1B3B2B;opacity:0.7;margin-top:8px;">We reply within 24 hours</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top:22px;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#1B3B2B;opacity:0.5;">
              <a href="${SITE}/" style="color:#2F6B4F;text-decoration:none;">www.wellnessneedles.ie</a>
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
  })

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: 'We received your appointment request — Wellness Needles',
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
