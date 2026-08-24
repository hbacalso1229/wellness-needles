import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'
import { readPublishedSite } from '../../_lib/site'
import {
  confirmBookingRow,
  parseConfirmStartsAtLocal,
  validateCreateBookingInput,
  type BookingConfirmRow,
} from '../../_lib/confirm-booking'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  waitUntil?: (promise: Promise<unknown>) => void
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { bookings: [] })
  const url = new URL(context.request.url)
  const requested = url.searchParams.get('status') || 'pending'
  const status =
    requested === 'confirmed' || requested === 'cancelled' ? requested : 'pending'
  const orderSql = status === 'confirmed' ? 'starts_at IS NULL, starts_at DESC' : 'created_at DESC'
  const { results } = await context.env.DB.prepare(
    `SELECT id, status, first_name as firstName, last_name as lastName, email, phone,
            service_type as serviceType, location_label as locationLabel, service_label as serviceLabel,
            preferred_date as preferredDate, preferred_time as preferredTime, starts_at as startsAt,
            sms_opt_in as smsOptIn, created_at as createdAt
     FROM bookings
     WHERE status = ?
     ORDER BY ${orderSql}
     LIMIT 200`
  )
    .bind(status)
    .all()
  return jsonResponse(200, { bookings: results || [] })
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const body = (await readJsonBody(context.request)) as {
    action?: string
    startsAtLocal?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    serviceType?: string
    locationLabel?: string
    serviceLabel?: string
    smsOptIn?: boolean
  } | null
  if (asString(body?.action) !== 'create') {
    return jsonResponse(400, { ok: false, error: 'unknown-action' })
  }

  const input = {
    firstName: asString(body?.firstName),
    lastName: asString(body?.lastName),
    email: asString(body?.email),
    phone: asString(body?.phone),
    serviceType: asString(body?.serviceType),
    locationLabel: asString(body?.locationLabel),
    serviceLabel: asString(body?.serviceLabel),
    startsAtLocal: asString(body?.startsAtLocal),
    smsOptIn: Boolean(body?.smsOptIn),
  }
  const site = await readPublishedSite(context.env)
  const invalid = validateCreateBookingInput(input, site)
  if (invalid) return jsonResponse(400, { ok: false, error: invalid })

  const slot = parseConfirmStartsAtLocal(input.startsAtLocal)
  if (!slot) {
    return jsonResponse(400, { ok: false, error: 'startsAtLocal required (YYYY-MM-DDTHH:mm)' })
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await context.env.DB.prepare(
    `INSERT INTO bookings (
       id, status, first_name, last_name, email, phone, service_type, location_label,
       service_label, preferred_date, preferred_time, sms_opt_in, created_at
     ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      input.firstName,
      input.lastName,
      input.email,
      input.phone,
      input.serviceType,
      input.locationLabel,
      input.serviceLabel,
      slot.ymd,
      slot.hm,
      input.smsOptIn ? 1 : 0,
      now
    )
    .run()

  const row = await context.env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first<BookingConfirmRow>()
  if (!row) return jsonResponse(500, { ok: false, error: 'create-failed' })

  const confirmed = await confirmBookingRow({
    env: context.env,
    waitUntil: context.waitUntil,
    site,
    row,
    startsAtLocal: slot.local,
  })
  if (!confirmed.ok) {
    return jsonResponse(400, { ok: false, error: confirmed.error, id })
  }

  return jsonResponse(200, {
    ok: true,
    id,
    startsAt: confirmed.result.startsAt,
    sent: confirmed.result.sent,
  })
}
