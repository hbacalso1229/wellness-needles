import {
  hoursUntil,
  sendPatientBookingMessage,
} from '../../functions/_lib/notify'
import { readPublishedSite } from '../../functions/_lib/site'
import type { PagesEnv } from '../../functions/_lib/http'

type BookingRow = {
  id: string
  email: string
  phone: string
  location_label: string | null
  starts_at: string
  sms_opt_in: number
  reminder_email_sent: number
  reminder_sms_sent: number
}

const worker = {
  async scheduled(_event: ScheduledEvent, env: PagesEnv): Promise<void> {
    if (!env.DB) return
    const now = new Date().toISOString()
    const { results } = await env.DB.prepare(
      `SELECT id, email, phone, location_label, starts_at, sms_opt_in,
              reminder_email_sent, reminder_sms_sent
       FROM bookings
       WHERE status = 'confirmed'
         AND starts_at IS NOT NULL
         AND remind_at IS NOT NULL
         AND remind_at <= ?
         AND reminder_email_sent = 0`
    )
      .bind(now)
      .all<BookingRow>()

    const site = await readPublishedSite(env)
    for (const row of results || []) {
      if (hoursUntil(row.starts_at) < -1) continue
      const whenLabel = new Intl.DateTimeFormat('en-IE', {
        timeZone: 'Europe/Dublin',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(new Date(row.starts_at))
      const sent = await sendPatientBookingMessage({
        env,
        kind: 'reminder',
        toEmail: row.email,
        toPhone: row.phone,
        smsOptIn: Boolean(row.sms_opt_in) && !row.reminder_sms_sent,
        whenLabel,
        locationLabel: row.location_label || '',
        site,
      })
      await env.DB.prepare(
        `UPDATE bookings SET reminder_email_sent = ?, reminder_sms_sent = ? WHERE id = ?`
      )
        .bind(
          sent.email || row.reminder_email_sent ? 1 : 0,
          sent.sms || row.reminder_sms_sent ? 1 : 0,
          row.id
        )
        .run()
    }
  },
}

export default worker
