/** Convert stored 24-hour `HH:mm` to a 12-hour clock (minutes stay as given). */
export function hhmmTo12(hhmm: string): { hour: number; minute: number; ampm: 'AM' | 'PM' } {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)/.exec(hhmm.trim())
  const hour24 = match ? Number(match[1]) : 9
  const minute = match ? Number(match[2]) : 0
  const ampm: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM'
  const hour = hour24 % 12 || 12
  return { hour, minute, ampm }
}

export function hour12ToHhmm(hour: number, ampm: 'AM' | 'PM', minute = 0): string {
  let hour24 = hour % 12
  if (ampm === 'PM') hour24 += 12
  const m = Math.min(59, Math.max(0, minute))
  return `${String(hour24).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export type DatetimeLocal12 = {
  date: string
  hour: number
  minute: number
  ampm: 'AM' | 'PM'
}

/** Parse `YYYY-MM-DDTHH:mm` into a 12-hour picker model. */
export function datetimeLocalTo12(value: string): DatetimeLocal12 {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/.exec(value.trim())
  if (!match) {
    return { date: '', hour: 9, minute: 0, ampm: 'AM' }
  }
  const clock = hhmmTo12(`${match[2]}:${match[3]}`)
  return { date: match[1], hour: clock.hour, minute: clock.minute, ampm: clock.ampm }
}

export function datetimeLocalFrom12(parts: DatetimeLocal12): string {
  if (!parts.date) return ''
  return `${parts.date}T${hour12ToHhmm(parts.hour, parts.ampm, parts.minute)}`
}
