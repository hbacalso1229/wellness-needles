import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type PersistBody = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  serviceType?: string
  locationLabel?: string
  serviceLabel?: string
  date?: string
  time?: string
  smsOptIn?: boolean
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) {
    return jsonResponse(200, { ok: true, skipped: 'no-db' })
  }

  const body = (await readJsonBody(context.request)) as PersistBody | null
  if (!body) return jsonResponse(400, { ok: false, error: 'Invalid JSON' })

  const firstName = asString(body.firstName)
  const lastName = asString(body.lastName)
  const email = asString(body.email)
  const phone = asString(body.phone)
  if (!firstName || !lastName || !email || !phone) {
    return jsonResponse(400, { ok: false, error: 'Missing contact fields' })
  }

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  try {
    await context.env.DB.prepare(
      `INSERT INTO bookings (
        id, status, first_name, last_name, email, phone, service_type, location_label,
        service_label, preferred_date, preferred_time, sms_opt_in, created_at
      ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        firstName,
        lastName,
        email,
        phone,
        asString(body.serviceType),
        asString(body.locationLabel),
        asString(body.serviceLabel),
        asString(body.date),
        asString(body.time),
        body.smsOptIn ? 1 : 0,
        now
      )
      .run()
    return jsonResponse(200, { ok: true, id })
  } catch (error) {
    console.error('[bff/booking-persist]', error)
    return jsonResponse(200, { ok: true, skipped: 'd1-error' })
  }
}
