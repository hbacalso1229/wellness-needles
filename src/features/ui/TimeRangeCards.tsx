'use client'

import { Check, Moon, Sun, Sunrise, type LucideIcon } from 'lucide-react'

export type TimeRangeOption = {
  readonly id: string
  readonly label: string
  readonly window: string
  readonly icon: LucideIcon
}

export const TIME_RANGES: ReadonlyArray<TimeRangeOption> = [
  {
    id: 'morning',
    label: 'Morning',
    window: '9:00 AM – 12:00 PM',
    icon: Sunrise,
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    window: '12:00 PM – 4:00 PM',
    icon: Sun,
  },
  {
    id: 'evening',
    label: 'Evening',
    window: '4:00 PM – 7:00 PM',
    icon: Moon,
  },
]

/** End of each range in minutes from midnight (exclusive past threshold). */
const RANGE_END_MINUTES: Record<string, number> = {
  morning: 12 * 60,
  afternoon: 16 * 60,
  evening: 19 * 60,
}

export function formatTimeRangeLabel(range: TimeRangeOption): string {
  return `${range.label} (${range.window})`
}

export function findTimeRange(id: string): TimeRangeOption | undefined {
  return TIME_RANGES.find((r) => r.id === id)
}

export function isPastTimeRange(dateStr: string, rangeId: string): boolean {
  if (!dateStr || dateStr !== todayDateInputValue()) return false
  const end = RANGE_END_MINUTES[rangeId]
  if (end == null) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= end
}

function todayDateInputValue(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDaysToDateInputValue(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

/** Clinic is closed Saturdays (see contact-config business hours). */
export function isClosedBookingDate(dateStr: string): boolean {
  if (!dateStr) return false
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return false
  return new Date(y, m - 1, d).getDay() === 6
}

/** First range still open for the given date, or undefined if none. */
export function firstAvailableTimeRange(
  dateStr: string
): TimeRangeOption | undefined {
  return TIME_RANGES.find((r) => !isPastTimeRange(dateStr, r.id))
}

/**
 * Next bookable day from `fromDateStr` (inclusive): not Saturday,
 * and at least one time range still available.
 */
export function nextOpenBookingDate(fromDateStr?: string): string {
  let date = fromDateStr || todayDateInputValue()
  for (let i = 0; i < 14; i++) {
    if (!isClosedBookingDate(date) && firstAvailableTimeRange(date)) {
      return date
    }
    date = addDaysToDateInputValue(date, 1)
  }
  return date
}

/**
 * Preferred date for a new booking: today if open and a range remains,
 * otherwise the next open day (skips Saturdays).
 */
export function defaultPreferredDate(): string {
  return nextOpenBookingDate(todayDateInputValue())
}

/** Prefer Morning; fall back to the first still-open range for the date. */
export function defaultPreferredTime(dateStr: string): string {
  if (!isPastTimeRange(dateStr, 'morning')) return 'morning'
  return firstAvailableTimeRange(dateStr)?.id ?? 'morning'
}

type TimeRangeCardsProps = {
  selectedId: string
  onSelect: (id: string) => void
  dateStr: string
  name?: string
  hasError?: boolean
}

export function TimeRangeCards({
  selectedId,
  onSelect,
  dateStr,
  name = 'preferred-time-range',
  hasError = false,
}: TimeRangeCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {TIME_RANGES.map((range) => {
        const selected = selectedId === range.id
        const past = isPastTimeRange(dateStr, range.id)
        const Icon = range.icon

        return (
          <label
            key={range.id}
            className={`booking-select-card relative block box-border rounded-xl border p-4 ${
              past
                ? 'cursor-not-allowed border-2 border-accent/10 bg-accent/5 opacity-50'
                : selected
                  ? 'cursor-pointer border-2 border-primary bg-primary/5 shadow-sm shadow-primary/5'
                  : hasError
                    ? 'cursor-pointer border-2 border-red-400 bg-white [@media(hover:hover)]:hover:border-red-500'
                    : 'cursor-pointer border-2 border-accent/15 bg-white [@media(hover:hover)]:hover:border-primary/40 [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:-translate-y-0.5'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={range.id}
              checked={selected}
              disabled={past}
              onChange={() => {
                if (!past) onSelect(range.id)
              }}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              aria-label={`${range.label}, ${range.window}${past ? ' (unavailable)' : ''}`}
            />
            <span
              className={`booking-select-card__check pointer-events-none absolute top-3 right-3 z-0 flex h-6 w-6 items-center justify-center rounded-full ${
                selected && !past
                  ? 'bg-primary text-white opacity-100'
                  : 'bg-transparent opacity-0'
              }`}
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <div className="pointer-events-none relative z-0 flex flex-col items-start gap-3 pr-8">
              <span
                className={`booking-select-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected && !past ? 'bg-primary/15 text-primary' : 'bg-primary/10 text-primary'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h4 className="font-semibold leading-snug text-[var(--text-dark)]">{range.label}</h4>
                <p className="text-sm leading-relaxed text-secondary mt-0.5">{range.window}</p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
