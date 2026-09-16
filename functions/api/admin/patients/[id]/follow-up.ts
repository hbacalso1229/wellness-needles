import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../../_lib/http'
import { readPublishedSite } from '../../../../_lib/site'
import {
  confirmBookingRow,
  parseConfirmStartsAtLocal,
  validateCreateBookingInput,
  type BookingConfirmRow,
} from '../../../../_lib/confirm-booking'
import { actorEmail, attachBookingPatient, getPatient, writeAudit } from '../../../../_lib/patients'
import { followUpServiceLabel } from '../../../../../shared/booking-options'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  data?: { email?: string }
  waitUntil?: (promise: Promise<unknown>) => void
}) => Response | Promise<Response>

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const patientId = context.params.id
  const patient = await getPatient(context.env.DB, patientId)
  if (!patient) return jsonResponse(404, { ok: false, error: 'not-found' })
  const body = (await readJsonBody(context.request)) as {
    startsAtLocal?: string
    serviceType?: string
    locationLabel?: string
    smsOptIn?: boolean
  } | null
  const site = await readPublishedSite(context.env)
  const last = await context.env.DB.prepare(
    `SELECT service_type as serviceType, location_label as locationLabel, sms_opt_in as smsOptIn
     FROM bookings WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1`
  )
    .bind(patientId)
    .first<{ serviceType?: string; locationLabel?: string; smsOptIn?: number }>()
  const input = {
    firstName: patient.first_name,
    lastName: patient.last_name,
    email: patient.email,
    phone: patient.phone_mobile || patient.phone_home || patient.phone_work,
    serviceType: asString(body?.serviceType) || last?.serviceType || 'In Clinic',
    locationLabel: asString(body?.locationLabel) || last?.locationLabel || '',
    serviceLabel: followUpServiceLabel(site),
    startsAtLocal: asString(body?.startsAtLocal),
    smsOptIn: body?.smsOptIn !== undefined ? Boolean(body.smsOptIn) : Boolean(last?.smsOptIn),
  }
  const invalid = validateCreateBookingInput(input, site)
  if (invalid) return jsonResponse(400, { ok: false, error: invalid })
  const slot = parseConfirmStartsAtLocal(input.startsAtLocal)
  if (!slot) return jsonResponse(400, { ok: false, error: 'startsAtLocal required (YYYY-MM-DDTHH:mm)' })

  const bookingId = crypto.randomUUID()
  const now = new Date().toISOString()
  await context.env.DB.prepare(
    `INSERT INTO bookings (
       id, status, first_name, last_name, email, phone, service_type, location_label,
       service_label, preferred_date, preferred_time, sms_opt_in, created_at, patient_id
     ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      bookingId,
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
      now,
      patientId
    )
    .run()

  const row = await context.env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(bookingId)
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
    return jsonResponse(400, { ok: false, error: confirmed.error, id: bookingId })
  }
  await attachBookingPatient(context.env.DB, bookingId, patientId)
  await writeAudit(context.env.DB, patientId, 'book-follow-up', actorEmail(context), bookingId)
  return jsonResponse(200, {
    ok: true,
    id: bookingId,
    patientId,
    serviceLabel: input.serviceLabel,
    startsAt: confirmed.result.startsAt,
    sent: confirmed.result.sent,
  })
}
