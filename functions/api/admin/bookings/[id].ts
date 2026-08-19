import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../_lib/http'
import {
  bookingDurationMinutes,
  dublinLocalToUtcIso,
  enqueueClinicCalendarCopy,
  formatDublin,
  remindAtMorningBefore,
  reminderWindowStarted,
  sendPatientBookingMessage,
  snapDateTimeLocalToQuarterHour,
} from '../../../_lib/notify'
import { readPublishedSite } from '../../../_lib/site'
import {
  isAllowedLocation,
  isAllowedService,
  isAllowedServiceType,
} from '../../../../shared/booking-options'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  waitUntil?: (promise: Promise<unknown>) => void
}) => Response | Promise<Response>

type BookingRow = {
  id: string
  status: string
  first_name: string
  last_name: string
  email: string
  phone: string
  service_type: string | null
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
  ics_sequence?: number | null
}

function sentFlags(sent: { email: boolean; sms: boolean }) {
  return { email: sent.email, sms: sent.sms }
}

function icsSequenceOf(row: BookingRow): number {
  return Number(row.ics_sequence) || 0
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const body = (await readJsonBody(context.request)) as {
    action?: string
    startsAtLocal?: string
    serviceType?: string
    locationLabel?: string
    serviceLabel?: string
  } | null
  const action = asString(body?.action)
  const row = await context.env.DB.prepare('SELECT * FROM bookings WHERE id = ?')
    .bind(id)
    .first<BookingRow>()
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })

  const site = await readPublishedSite(context.env)

  if (action === 'confirm') {
    const local = snapDateTimeLocalToQuarterHour(asString(body?.startsAtLocal))
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(local)
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

    await enqueueClinicCalendarCopy(context.waitUntil, context.env, sent.clinicCopy)
    return jsonResponse(200, { ok: true, startsAt, combined, sent: sentFlags(sent) })
  }

  if (action === 'reschedule') {
    if (row.status !== 'confirmed') {
      return jsonResponse(400, { ok: false, error: 'not-confirmed' })
    }
    const local = snapDateTimeLocalToQuarterHour(asString(body?.startsAtLocal))
    const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(local)
    if (!match) {
      return jsonResponse(400, { ok: false, error: 'startsAtLocal required (YYYY-MM-DDTHH:mm)' })
    }
    const serviceType = asString(body?.serviceType) || row.service_type || ''
    const locationLabel = asString(body?.locationLabel) || row.location_label || ''
    const serviceLabel = asString(body?.serviceLabel) || row.service_label || ''
    if (!isAllowedServiceType(site, serviceType, row.service_type)) {
      return jsonResponse(400, { ok: false, error: 'invalid-service-type' })
    }
    if (!isAllowedLocation(site, locationLabel, row.location_label)) {
      return jsonResponse(400, { ok: false, error: 'invalid-location' })
    }
    if (!isAllowedService(site, serviceType, serviceLabel, row.service_label)) {
      return jsonResponse(400, { ok: false, error: 'invalid-service' })
    }
    const startsAt = dublinLocalToUtcIso(match[1], match[2])
    const remindAt = remindAtMorningBefore(startsAt)
    const inWindow = reminderWindowStarted(remindAt)
    const nextSequence = icsSequenceOf(row) + 1
    const whenLabel = formatDublin(startsAt)
    const smsOptIn = Boolean(row.sms_opt_in) && site.features.smsEnabled
    const patientName = `${row.first_name} ${row.last_name}`.trim()
    const sent = await sendPatientBookingMessage({
      env: context.env,
      kind: 'reschedule',
      toEmail: row.email,
      toPhone: row.phone,
      smsOptIn,
      whenLabel,
      locationLabel,
      site,
      bookingId: row.id,
      patientName,
      firstName: row.first_name,
      startsAtIso: startsAt,
      durationMinutes: bookingDurationMinutes(serviceLabel),
      icsSequence: nextSequence,
    })

    await context.env.DB.prepare(
      `UPDATE bookings SET
         starts_at = ?,
         remind_at = ?,
         service_type = ?,
         location_label = ?,
         service_label = ?,
         ics_sequence = ?,
         confirm_email_sent = ?,
         confirm_sms_sent = ?,
         reminder_email_sent = ?,
         reminder_sms_sent = ?
       WHERE id = ?`
    )
      .bind(
        startsAt,
        remindAt,
        serviceType,
        locationLabel,
        serviceLabel,
        nextSequence,
        (sent.email || row.confirm_email_sent) ? 1 : 0,
        (sent.sms || row.confirm_sms_sent) ? 1 : 0,
        inWindow && sent.email ? 1 : inWindow ? row.reminder_email_sent : 0,
        inWindow && sent.sms ? 1 : inWindow ? row.reminder_sms_sent : 0,
        id
      )
      .run()

    await enqueueClinicCalendarCopy(context.waitUntil, context.env, sent.clinicCopy)
    return jsonResponse(200, {
      ok: true,
      startsAt,
      inWindow,
      sent: sentFlags(sent),
    })
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
      icsSequence: wasConfirmed ? icsSequenceOf(row) + 1 : undefined,
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
    await enqueueClinicCalendarCopy(context.waitUntil, context.env, sent.clinicCopy)
    return jsonResponse(200, { ok: true, sent: sentFlags(sent) })
  }

  return jsonResponse(400, { ok: false, error: 'unknown-action' })
}
