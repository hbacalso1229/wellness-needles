import { asString, type PagesEnv } from './http'
import {
  bookingDurationMinutes,
  dublinLocalToUtcIso,
  enqueueClinicCalendarCopy,
  formatDublin,
  remindAtMorningBefore,
  reminderWindowStarted,
  sendPatientBookingMessage,
  snapDateTimeLocalToQuarterHour,
} from './notify'
import { isValidEmailFormat } from '../../shared/email-check'
import {
  isAllowedLocation,
  isAllowedService,
  isAllowedServiceType,
} from '../../shared/booking-options'
import type { SiteSnapshot } from '../../shared/site-snapshot'

export type BookingConfirmRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  service_type: string | null
  location_label: string | null
  service_label: string | null
  sms_opt_in: number
  confirm_email_sent: number
  confirm_sms_sent: number
  reminder_email_sent: number
  reminder_sms_sent: number
}

export type ConfirmSlotResult = {
  startsAt: string
  combined: boolean
  sent: { email: boolean; sms: boolean }
}

export type CreateBookingInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType: string
  locationLabel: string
  serviceLabel: string
  startsAtLocal: string
  smsOptIn: boolean
}

export function parseConfirmStartsAtLocal(
  raw: string
): { local: string; ymd: string; hm: string } | null {
  const local = snapDateTimeLocalToQuarterHour(asString(raw))
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(local)
  if (!match) return null
  return { local, ymd: match[1], hm: match[2] }
}

export function validateCreateBookingInput(
  input: CreateBookingInput,
  site: SiteSnapshot
): string | null {
  if (!input.firstName.trim() || !input.lastName.trim()) return 'name-required'
  if (!isValidEmailFormat(input.email)) return 'email-required'
  if (!input.phone.trim()) return 'phone-required'
  if (!parseConfirmStartsAtLocal(input.startsAtLocal)) {
    return 'startsAtLocal required (YYYY-MM-DDTHH:mm)'
  }
  if (!isAllowedServiceType(site, input.serviceType)) return 'invalid-service-type'
  if (!isAllowedLocation(site, input.locationLabel)) return 'invalid-location'
  if (!isAllowedService(site, input.serviceType, input.serviceLabel)) {
    return 'invalid-service'
  }
  return null
}

function sentFlags(sent: { email: boolean; sms: boolean }) {
  return { email: sent.email, sms: sent.sms }
}

/** Patient mail/SMS first, then D1 confirmed, then clinic ICS waitUntil. */
export async function confirmBookingRow(options: {
  env: PagesEnv
  waitUntil?: (promise: Promise<unknown>) => void
  site: SiteSnapshot
  row: BookingConfirmRow
  startsAtLocal: string
}): Promise<{ ok: true; result: ConfirmSlotResult } | { ok: false; error: string }> {
  const parsed = parseConfirmStartsAtLocal(options.startsAtLocal)
  if (!parsed) {
    return { ok: false, error: 'startsAtLocal required (YYYY-MM-DDTHH:mm)' }
  }
  const startsAt = dublinLocalToUtcIso(parsed.ymd, parsed.hm)
  const remindAt = remindAtMorningBefore(startsAt)
  const combined = reminderWindowStarted(remindAt)
  const kind = combined ? 'combined' : 'confirm'
  const whenLabel = formatDublin(startsAt)
  const smsOptIn = Boolean(options.row.sms_opt_in) && options.site.features.smsEnabled
  const patientName = `${options.row.first_name} ${options.row.last_name}`.trim()
  const sent = await sendPatientBookingMessage({
    env: options.env,
    kind,
    toEmail: options.row.email,
    toPhone: options.row.phone,
    smsOptIn,
    whenLabel,
    locationLabel: options.row.location_label || '',
    site: options.site,
    bookingId: options.row.id,
    patientName,
    firstName: options.row.first_name,
    serviceLabel: options.row.service_label || undefined,
    startsAtIso: startsAt,
    durationMinutes: bookingDurationMinutes(options.row.service_label, options.site),
  })

  await options.env.DB!.prepare(
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
      (sent.email || options.row.confirm_email_sent) ? 1 : 0,
      (sent.sms || options.row.confirm_sms_sent) ? 1 : 0,
      combined && sent.email ? 1 : options.row.reminder_email_sent,
      combined && sent.sms ? 1 : options.row.reminder_sms_sent,
      options.row.id
    )
    .run()

  await enqueueClinicCalendarCopy(options.waitUntil, options.env, sent.clinicCopy)
  return {
    ok: true,
    result: { startsAt, combined, sent: sentFlags(sent) },
  }
}
