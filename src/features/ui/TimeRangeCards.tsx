'use client'

import { Check, Moon, Sun, Sunrise, type LucideIcon } from 'lucide-react'

export type TimeRangeOption = {
  readonly id: string
  readonly label: string
  readonly window: string
  readonly hint: string
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
    hint: 'Limited availability',
    icon: Sun,
  },
  {
    id: 'evening',
    label: 'Evening',
    window: '4:00 PM – 7:00 PM',
    hint: 'Next available',
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
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {TIME_RANGES.map((range) => {
        const selected = selectedId === range.id
        const past = isPastTimeRange(dateStr, range.id)
        const Icon = range.icon

        return (
          <label
            key={range.id}
            className={`booking-select-card relative block min-w-0 box-border rounded-xl border p-2.5 sm:p-4 ${
              past
                ? 'cursor-not-allowed border-accent/20 bg-accent/[0.04]'
                : selected
                  ? 'z-[1] cursor-pointer border-primary bg-accent/20'
                  : hasError
                    ? 'cursor-pointer border-red-400 bg-white [@media(hover:hover)]:hover:border-red-500'
                    : 'cursor-pointer border-[var(--text-dark)]/12 bg-white [@media(hover:hover)]:hover:border-primary/40'
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
              aria-label={`${range.label}, ${range.window}${past ? ' (unavailable)' : `, ${range.hint}`}`}
            />
            <span
              className={`booking-select-card__check pointer-events-none absolute top-2 right-2 z-0 flex h-5 w-5 items-center justify-center rounded-full sm:top-2.5 sm:right-2.5 sm:h-6 sm:w-6 ${
                selected && !past
                  ? 'bg-primary text-cream'
                  : 'border border-[var(--text-dark)]/20 bg-white'
              }`}
              aria-hidden
            >
              {selected && !past ? (
                <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={3.5} />
              ) : null}
            </span>
            <div
              className={`pointer-events-none relative z-0 flex flex-col items-start gap-2 pr-6 sm:gap-3 sm:pr-7 ${
                past ? 'opacity-60' : ''
              }`}
            >
              <span
                className={`booking-select-card__icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${
                  selected && !past
                    ? 'bg-primary text-cream'
                    : past
                      ? 'bg-accent/15 text-secondary'
                      : 'bg-accent/15 text-primary'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
              </span>
              <div className="min-w-0 w-full">
                <h4
                  className={`text-sm font-semibold leading-snug sm:text-base ${
                    past ? 'text-[var(--text-dark)]/70' : 'text-[var(--text-dark)]'
                  }`}
                >
                  {range.label}
                </h4>
                <p
                  className={`mt-0.5 text-[11px] leading-snug sm:text-sm sm:leading-relaxed ${
                    past ? 'text-secondary/80' : 'text-[var(--text-dark)]'
                  }`}
                >
                  {range.window}
                </p>
                {past ? (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-secondary sm:mt-1.5 sm:text-xs">
                    Unavailable
                  </p>
                ) : (
                  <p className="mt-1 text-[10px] font-semibold leading-snug text-primary sm:mt-1.5 sm:text-xs">
                    {range.hint}
                  </p>
                )}
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
