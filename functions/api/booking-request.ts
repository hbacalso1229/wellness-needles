/**
 * Cloudflare Pages Function — verify Turnstile then send clinic booking mail via Web3Forms.
 * Secrets (Pages Production): TURNSTILE_SECRET_KEY, WEB3FORMS_ACCESS_KEY.
 * Patient thank-you stays on /api/booking-thank-you (Resend).
 */

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type BookingBody = {
  turnstileToken?: string
  serviceType?: string
  locationLabel?: string
  serviceLabel?: string
  addOnLabels?: string[]
  practitioner?: string
  date?: string
  time?: string
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  message?: string
}

type Env = {
  TURNSTILE_SECRET_KEY: string
  WEB3FORMS_ACCESS_KEY: string
}

type TurnstileVerifyJson = {
  success?: boolean
  hostname?: string
  'error-codes'?: string[]
}

const CLINIC_INBOX = 'info@wellnessneedles.ie'

function isAllowedTurnstileHostname(hostname: string): boolean {
  return (
    hostname === 'www.wellnessneedles.ie' ||
    hostname === 'wellnessneedles.ie' ||
    hostname === 'wellness-needles.pages.dev' ||
    hostname.endsWith('.wellness-needles.pages.dev')
  )
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function clinicRow(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 12px 8px 0;border-bottom:1px solid #e8e8e8;color:#6b6b6b;font-size:13px;line-height:1.4;vertical-align:top;width:42%;">${escapeHtml(label)}</td>
  <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;color:#222222;font-size:13px;line-height:1.4;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
</tr>`
}

function practitionerDisplayName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'arkinth-garcia') return 'Arkinth Garcia'
  return trimmed
}

function formatClinicDate(isoDate: string, withWeekday: boolean): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IE', withWeekday
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' })
}

function buildClinicAppointmentRequestHtml(fields: {
  name: string
  email: string
  phone: string
  visitType: string
  location: string
  service: string
  addOns: string
  preferredDate: string
  preferredTime: string
  practitioner: string
  dateOfBirth: string
  patientNote?: string
}): string {
  const rows = [
    clinicRow('Patient name', fields.name),
    clinicRow('Email', fields.email),
    clinicRow('Phone', fields.phone),
    clinicRow('Visit type', fields.visitType),
    clinicRow('Location', fields.location),
    clinicRow('Service', fields.service),
    clinicRow('Add-ons', fields.addOns),
    clinicRow('Preferred date', fields.preferredDate),
    clinicRow('Preferred time', fields.preferredTime),
    clinicRow('Practitioner', fields.practitioner),
    clinicRow('Date of birth', fields.dateOfBirth),
  ]
  const note = fields.patientNote?.trim()
  if (note) rows.push(clinicRow('Patient note', note))

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
${rows.join('\n')}
</table>`
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteip: string | null
): Promise<{ ok: true; hostname: string } | { ok: false }> {
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (remoteip) body.set('remoteip', remoteip)

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  )
  const data = (await response.json()) as TurnstileVerifyJson
  const hostname = asString(data.hostname)
  if (!data.success || !hostname || !isAllowedTurnstileHostname(hostname)) {
    console.error(
      '[booking-request] Turnstile siteverify failed',
      data['error-codes'] || [],
      hostname
    )
    return { ok: false }
  }
  return { ok: true, hostname }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const turnstileSecret = context.env.TURNSTILE_SECRET_KEY?.trim()
  const accessKey = context.env.WEB3FORMS_ACCESS_KEY?.trim()
  if (!turnstileSecret || !accessKey) {
    return jsonResponse(503, {
      ok: false,
      reason: 'not-configured',
      error: 'TURNSTILE_SECRET_KEY or WEB3FORMS_ACCESS_KEY not configured',
    })
  }

  let body: BookingBody
  try {
    body = (await context.request.json()) as BookingBody
  } catch {
    return jsonResponse(400, { ok: false, reason: 'request-failed', error: 'Invalid JSON body' })
  }

  const turnstileToken = asString(body.turnstileToken)
  const firstName = asString(body.firstName)
  const lastName = asString(body.lastName)
  const email = asString(body.email)
  const date = asString(body.date)
  const time = asString(body.time)
  const serviceType = asString(body.serviceType)
  const phone = asString(body.phone)
  const dateOfBirth = asString(body.dateOfBirth)

  if (!turnstileToken) {
    return jsonResponse(400, {
      ok: false,
      reason: 'captcha-required',
      error: 'Please complete the security check to send your request.',
    })
  }

  if (
    !firstName ||
    !email ||
    !isValidEmail(email) ||
    !date ||
    !time ||
    !serviceType ||
    !phone ||
    !dateOfBirth
  ) {
    return jsonResponse(400, {
      ok: false,
      reason: 'request-failed',
      error: 'Missing required booking fields',
    })
  }

  const remoteip = context.request.headers.get('CF-Connecting-IP')
  const verified = await verifyTurnstile(turnstileSecret, turnstileToken, remoteip)
  if (!verified.ok) {
    return jsonResponse(400, {
      ok: false,
      reason: 'captcha-required',
      error: 'Security check failed. Please try again.',
    })
  }

  const fullName = `${firstName} ${lastName}`.trim()
  const patientMessage = asString(body.message)
  const addOnLabels = Array.isArray(body.addOnLabels)
    ? body.addOnLabels.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
  const clinicMessage = buildClinicAppointmentRequestHtml({
    name: fullName,
    email,
    phone,
    visitType: serviceType,
    location: asString(body.locationLabel) || 'Not specified',
    service: asString(body.serviceLabel) || 'Not specified',
    addOns: addOnLabels.length ? addOnLabels.join(', ') : 'None',
    preferredDate: formatClinicDate(date, true),
    preferredTime: time,
    practitioner: practitionerDisplayName(asString(body.practitioner)),
    dateOfBirth: formatClinicDate(dateOfBirth, false),
    patientNote: patientMessage,
  })

  const web3Response = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject: `New appointment request — ${fullName}`,
      from_name: fullName,
      name: fullName,
      email,
      replyto: email,
      to: CLINIC_INBOX,
      message: clinicMessage,
    }),
  })

  const web3Data = (await web3Response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null
  if (!web3Response.ok || !web3Data?.success) {
    const rawMessage = web3Data?.message || 'Email service rejected the request.'
    console.error('[booking-request] Web3Forms error', web3Response.status, rawMessage)
    return jsonResponse(502, {
      ok: false,
      reason: 'request-failed',
      error: /access_key|form_id|uuid/i.test(rawMessage)
        ? 'Web3Forms rejected the access key.'
        : rawMessage,
    })
  }

  return jsonResponse(200, { ok: true })
}
