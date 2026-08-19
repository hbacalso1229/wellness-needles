'use client'

import { Check, Moon, Sun, Sunrise, type LucideIcon } from 'lucide-react'
import {
  clipPreferredWindows,
  formatPreferredWindowLabel,
} from '../../../shared/preferred-time-windows'
import {
  isClosedBookingDate as isClosedForHours,
  type WeekHours,
} from '../../../shared/site-snapshot'

export type TimeRangeOption = {
  readonly id: string
  readonly label: string
  readonly window: string
  readonly hint: string
  readonly icon: LucideIcon
}

const ICONS: Record<string, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon,
  open: Sun,
}

export const TIME_RANGES: ReadonlyArray<TimeRangeOption> = clipPreferredWindows(
  '2000-01-03',
  null
).map((row) => ({
  ...row,
  icon: ICONS[row.id] ?? Sun,
}))

/** End of each range in minutes from midnight (exclusive past threshold). */
const RANGE_END_MINUTES: Record<string, number> = {
  morning: 12 * 60,
  afternoon: 16 * 60,
  evening: 19 * 60,
}

export function formatTimeRangeLabel(range: TimeRangeOption): string {
  return formatPreferredWindowLabel(range)
}

export function findTimeRange(id: string): TimeRangeOption | undefined {
  return TIME_RANGES.find((r) => r.id === id)
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

/** Clinic closed days. Overlay off: Saturday only. */
export function isClosedBookingDate(
  dateStr: string,
  hours?: WeekHours | null
): boolean {
  return isClosedForHours(dateStr, hours)
}

export function firstAvailableTimeRange(
  dateStr: string,
  hours?: WeekHours | null
): TimeRangeOption | undefined {
  return visibleTimeRanges(dateStr, hours).find(
    (r) => !r.unavailable && !isPastTimeRange(dateStr, r.id, hours)
  )
}

export function nextOpenBookingDate(
  fromDateStr?: string,
  hours?: WeekHours | null
): string {
  let date = fromDateStr || todayDateInputValue()
  for (let i = 0; i < 14; i++) {
    if (!isClosedBookingDate(date, hours) && firstAvailableTimeRange(date, hours)) {
      return date
    }
    date = addDaysToDateInputValue(date, 1)
  }
  return date
}

export function defaultPreferredDate(hours?: WeekHours | null): string {
  return nextOpenBookingDate(todayDateInputValue(), hours)
}

export function defaultPreferredTime(
  dateStr: string,
  hours?: WeekHours | null
): string {
  return firstAvailableTimeRange(dateStr, hours)?.id ?? visibleTimeRanges(dateStr, hours)[0]?.id ?? 'morning'
}

export function visibleTimeRanges(
  dateStr: string,
  hours?: WeekHours | null
): Array<TimeRangeOption & { unavailable?: boolean; window: string }> {
  return clipPreferredWindows(dateStr, hours).map((row) => ({
    ...row,
    icon: ICONS[row.id] ?? Sun,
  }))
}

export function isPastTimeRange(
  dateStr: string,
  rangeId: string,
  hours?: WeekHours | null
): boolean {
  if (!dateStr || dateStr !== todayDateInputValue()) return false
  const ranges = visibleTimeRanges(dateStr, hours)
  const range = ranges.find((r) => r.id === rangeId)
  if (!range || range.unavailable) return true
  const endMatch = /(\d{1,2}):(\d{2})\s*(AM|PM)/i.exec(range.window.split('–')[1] || '')
  let end = RANGE_END_MINUTES[rangeId]
  if (endMatch) {
    let h = Number(endMatch[1])
    const min = Number(endMatch[2])
    const ap = endMatch[3].toUpperCase()
    if (ap === 'PM' && h !== 12) h += 12
    if (ap === 'AM' && h === 12) h = 0
    end = h * 60 + min
  }
  if (end == null) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= end
}

type TimeRangeCardsProps = {
  selectedId: string
  onSelect: (id: string) => void
  dateStr: string
  name?: string
  hasError?: boolean
  hours?: WeekHours | null
}

export function TimeRangeCards({
  selectedId,
  onSelect,
  dateStr,
  name = 'preferred-time-range',
  hasError = false,
  hours = null,
}: TimeRangeCardsProps) {
  const ranges = visibleTimeRanges(dateStr, hours)
  return (
    <div className="grid grid-cols-3 gap-2 md:gap-3 lg:gap-4">
      {ranges.map((range) => {
        const selected = selectedId === range.id
        const past = Boolean(range.unavailable) || isPastTimeRange(dateStr, range.id, hours)
        const Icon = range.icon

        return (
          <label
            key={range.id}
            className={`booking-select-card relative block min-w-0 box-border rounded-xl border p-2.5 md:p-3 lg:p-4 ${
              past
                ? 'cursor-not-allowed border-accent/20 bg-accent/[0.04]'
                : selected
                  ? 'z-[1] cursor-pointer border-primary bg-accent/20'
                  : hasError
                    ? 'cursor-pointer border-red-400 bg-white [@media(hover:hover)]:hover:border-red-500'
                    : 'cursor-pointer border-[var(--text-dark)]/12 bg-white [@media(hover:hover)]:hover:border-primary/40 [@media(hover:hover)]:hover:bg-accent/10 [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:-translate-y-0.5'
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
              className={`pointer-events-none relative z-0 flex flex-col items-start gap-2 pr-6 lg:gap-3 ${
                past ? 'opacity-60' : ''
              }`}
            >
              <span
                className={`booking-select-card__icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full lg:h-11 lg:w-11 ${
                  selected && !past
                    ? 'bg-primary text-cream'
                    : past
                      ? 'bg-accent/15 text-secondary'
                      : 'bg-accent/15 text-primary'
                }`}
              >
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" aria-hidden />
              </span>
              <div className="min-w-0 w-full">
                <h4
                  className={`text-sm font-semibold leading-snug lg:text-base ${
                    past ? 'text-[var(--text-dark)]/70' : 'text-[var(--text-dark)]'
                  }`}
                >
                  {range.label}
                </h4>
                <p
                  className={`mt-0.5 text-[11px] leading-tight tabular-nums md:whitespace-nowrap lg:text-sm lg:leading-relaxed ${
                    past ? 'text-secondary/80' : 'text-[var(--text-dark)]'
                  }`}
                >
                  {range.window}
                </p>
                {past ? (
                  <span className="mt-1 inline-flex max-w-full items-center rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary md:whitespace-nowrap lg:mt-1.5 lg:text-xs">
                    Unavailable
                  </span>
                ) : (
                  <span
                    className={`mt-1 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-semibold leading-snug md:whitespace-nowrap lg:mt-1.5 lg:text-xs ${
                      selected ? 'bg-white text-primary' : 'bg-accent/20 text-primary'
                    }`}
                  >
                    {range.hint}
                  </span>
                )}
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
