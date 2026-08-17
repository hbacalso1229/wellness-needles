import { jsonResponse, type PagesEnv } from '../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { bookings: [] })
  const url = new URL(context.request.url)
  const status = url.searchParams.get('status') || 'pending'
  const { results } = await context.env.DB.prepare(
    `SELECT id, status, first_name as firstName, last_name as lastName, email, phone,
            service_type as serviceType, location_label as locationLabel, service_label as serviceLabel,
            preferred_date as preferredDate, preferred_time as preferredTime, starts_at as startsAt,
            sms_opt_in as smsOptIn, created_at as createdAt
     FROM bookings
     WHERE status = ?
     ORDER BY created_at DESC
     LIMIT 200`
  )
    .bind(status)
    .all()
  return jsonResponse(200, { bookings: results || [] })
}
