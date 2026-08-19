/** Clinic slots are 15 minutes. `datetime-local` values are `YYYY-MM-DDTHH:mm`. */
export function snapDateTimeLocalToQuarterHour(value: string): string {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})/.exec(value.trim())
  if (!match) return value
  let year = Number(match[1].slice(0, 4))
  let month = Number(match[1].slice(5, 7))
  let day = Number(match[1].slice(8, 10))
  let hour = Number(match[2])
  let minute = Math.round(Number(match[3]) / 15) * 15
  if (minute === 60) {
    minute = 0
    hour += 1
  }
  if (hour >= 24) {
    hour = 0
    const next = new Date(Date.UTC(year, month - 1, day + 1))
    year = next.getUTCFullYear()
    month = next.getUTCMonth() + 1
    day = next.getUTCDate()
  }
  const ymd = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return `${ymd}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

/** UTC ISO → `YYYY-MM-DDTHH:mm` in Europe/Dublin for datetime-local. */
export function utcIsoToDublinDateTimeLocal(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Dublin',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).formatToParts(date)
  const pick = (type: string) => parts.find((p) => p.type === type)?.value || '00'
  return `${pick('year')}-${pick('month')}-${pick('day')}T${pick('hour')}:${pick('minute')}`
}
