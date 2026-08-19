import {
  formatHourLabel,
  weekdayFromDateInput,
  type WeekHours,
} from './site-snapshot'

export type PreferredWindow = {
  id: string
  label: string
  window: string
  hint: string
}

const BAKED: ReadonlyArray<PreferredWindow> = [
  {
    id: 'morning',
    label: 'Morning',
    window: '9:00 AM – 12:00 PM',
    hint: 'Most popular',
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    window: '12:00 PM – 4:00 PM',
    hint: 'Limited availability',
  },
  {
    id: 'evening',
    label: 'Evening',
    window: '4:00 PM – 7:00 PM',
    hint: 'Next available',
  },
]

const BUCKETS: ReadonlyArray<{
  id: string
  label: string
  hint: string
  start: number
  end: number | 'close'
}> = [
  { id: 'morning', label: 'Morning', hint: 'Most popular', start: 9 * 60, end: 12 * 60 },
  { id: 'afternoon', label: 'Afternoon', hint: 'Limited availability', start: 12 * 60, end: 16 * 60 },
  { id: 'evening', label: 'Evening', hint: 'Next available', start: 16 * 60, end: 'close' },
]

function minutesFromHhmm(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + (m || 0)
}

function hhmmFromMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function windowLabel(start: number, end: number): string {
  return `${formatHourLabel(hhmmFromMinutes(start))} – ${formatHourLabel(hhmmFromMinutes(end))}`
}

export function formatPreferredWindowLabel(range: Pick<PreferredWindow, 'label' | 'window'>): string {
  return `${range.label} (${range.window})`
}

/** Clip Morning 9–12 / Afternoon 12–4 / Evening 4–close to that day's open–close. Hide empty buckets. */
export function clipPreferredWindows(
  dateStr: string,
  hours?: WeekHours | null
): PreferredWindow[] {
  if (!hours) return BAKED.map((row) => ({ ...row }))

  const weekday = weekdayFromDateInput(dateStr)
  if (!weekday || hours[weekday].closed) return []

  const open = minutesFromHhmm(hours[weekday].open)
  const close = minutesFromHhmm(hours[weekday].close)
  const clipped: PreferredWindow[] = []
  for (const bucket of BUCKETS) {
    const start = Math.max(bucket.start, open)
    const end = Math.min(bucket.end === 'close' ? close : bucket.end, close)
    if (end <= start) continue
    clipped.push({
      id: bucket.id,
      label: bucket.label,
      hint: bucket.hint,
      window: windowLabel(start, end),
    })
  }
  if (clipped.length > 0) return clipped
  if (close <= open) return []
  return [
    {
      id: 'open',
      label: 'Available',
      hint: 'Clinic hours',
      window: windowLabel(open, close),
    },
  ]
}
