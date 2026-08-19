import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../_lib/http'
import {
  bookingDurationMinutes,
  dublinLocalToUtcIso,
  formatDublin,
  remindAtMorningBefore,
  reminderWindowStarted,
  sendPatientBookingMessage,
} from '../../../_lib/notify'
import { readPublishedSite } from '../../../_lib/site'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
}) => Response | Promise<Response>

type BookingRow = {
  id: string
  status: string
  first_name: string
  last_name: string
  email: string
  phone: string
  location_label: string | null
  service_label: string | null
  preferred_date: string | null
  preferred_time: string | null
  starts_at: string | null
  sms_opt_in: number
  confirm_email_sent: number
  confirm_sms_sent: number
  reminder_email_sent: number
  reminder_sms_sent: number
  cancel_email_sent: number
  cancel_sms_sent: number
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const body = (await readJsonBody(context.request)) as {
    action?: string
    startsAtLocal?: string
  } | null
  const action = asString(body?.action)
  const row = await context.env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first<BookingRow>()
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })

  const site = await readPublishedSite(context.env)

  if (action === 'confirm') {
    const local = asString(body?.startsAtLocal)
    const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(local)
    if (!match) {
      return jsonResponse(400, { ok: false, error: 'startsAtLocal required (YYYY-MM-DDTHH:mm)' })
    }
    const startsAt = dublinLocalToUtcIso(match[1], match[2])
    const remindAt = remindAtMorningBefore(startsAt)
    const combined = reminderWindowStarted(remindAt)
    const kind = combined ? 'combined' : 'confirm'
    const whenLabel = formatDublin(startsAt)
    const smsOptIn = Boolean(row.sms_opt_in) && site.features.smsEnabled
    const patientName = `${row.first_name} ${row.last_name}`.trim()
    const sent = await sendPatientBookingMessage({
      env: context.env,
      kind,
      toEmail: row.email,
      toPhone: row.phone,
      smsOptIn,
      whenLabel,
      locationLabel: row.location_label || '',
      site,
      bookingId: row.id,
      patientName,
      firstName: row.first_name,
      startsAtIso: startsAt,
      durationMinutes: bookingDurationMinutes(row.service_label),
    })

    await context.env.DB.prepare(
      `UPDATE bookings SET
         status = 'confirmed',
         starts_at = ?,
         remind_at = ?,
         confirm_email_sent = ?,
         confirm_sms_sent = ?,
         reminder_email_sent = ?,
         reminder_sms_sent = ?
       WHERE id = ?`
    )
      .bind(
        startsAt,
        remindAt,
        (sent.email || row.confirm_email_sent) ? 1 : 0,
        (sent.sms || row.confirm_sms_sent) ? 1 : 0,
        combined && sent.email ? 1 : row.reminder_email_sent,
        combined && sent.sms ? 1 : row.reminder_sms_sent,
        id
      )
      .run()

    return jsonResponse(200, { ok: true, startsAt, combined, sent })
  }

  if (action === 'cancel') {
    const wasConfirmed = row.status === 'confirmed'
    const whenLabel = row.starts_at
      ? formatDublin(row.starts_at)
      : [row.preferred_date, row.preferred_time].filter(Boolean).join(' ')
    const sent = await sendPatientBookingMessage({
      env: context.env,
      kind: wasConfirmed ? 'cancel-confirmed' : 'cancel-pending',
      toEmail: row.email,
      toPhone: row.phone,
      smsOptIn: Boolean(row.sms_opt_in) && site.features.smsEnabled,
      whenLabel,
      locationLabel: row.location_label || '',
      site,
      bookingId: row.id,
      patientName: `${row.first_name} ${row.last_name}`.trim(),
      firstName: row.first_name,
      startsAtIso: wasConfirmed && row.starts_at ? row.starts_at : undefined,
      durationMinutes: bookingDurationMinutes(row.service_label),
    })
    await context.env.DB.prepare(
      `UPDATE bookings SET
         status = 'cancelled',
         cancel_email_sent = ?,
         cancel_sms_sent = ?
       WHERE id = ?`
    )
      .bind(
        (sent.email || row.cancel_email_sent) ? 1 : 0,
        (sent.sms || row.cancel_sms_sent) ? 1 : 0,
        id
      )
      .run()
    return jsonResponse(200, { ok: true, sent })
  }

  return jsonResponse(400, { ok: false, error: 'unknown-action' })
}
