'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'
import { isClosedBookingDate } from './TimeRangeCards'
import { calendarFooter, weekdayFromDateInput, type WeekHours } from '../../../shared/site-snapshot'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function parseDateInputValue(dateStr: string): Date | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDisplayDate(dateStr: string, placeholder: string): string {
  const date = parseDateInputValue(dateStr)
  if (!date) return placeholder
  return date.toLocaleDateString('en-IE', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isDateDisabled(
  date: Date,
  minDateStr: string,
  maxDateStr: string,
  disableClosedDays: boolean,
  hours?: WeekHours | null
): boolean {
  const value = toDateInputValue(date)
  if (minDateStr && value < minDateStr) return true
  if (maxDateStr && value > maxDateStr) return true
  if (disableClosedDays && isClosedBookingDate(value, hours)) return true
  return false
}

function clampMonthToRange(month: Date, min: string, max: string): Date {
  let next = startOfMonth(month)
  const minDate = parseDateInputValue(min)
  const maxDate = parseDateInputValue(max)
  if (minDate && next < startOfMonth(minDate)) next = startOfMonth(minDate)
  if (maxDate && next > startOfMonth(maxDate)) next = startOfMonth(maxDate)
  return next
}

/** True when no day in this month falls within [min, max]. */
function isMonthOutOfRange(
  year: number,
  monthIndex: number,
  min: string,
  max: string
): boolean {
  const monthStart = toDateInputValue(new Date(year, monthIndex, 1))
  const monthEnd = toDateInputValue(new Date(year, monthIndex + 1, 0))
  if (max && monthStart > max) return true
  if (min && monthEnd < min) return true
  return false
}

type InitialView = 'value' | 'min' | 'max' | 'today'
type PanelMode = 'none' | 'month' | 'year'

function defaultVisibleMonth(
  value: string,
  min: string,
  max: string,
  initialView: InitialView
): Date {
  const selected = parseDateInputValue(value)
  if (selected) return startOfMonth(selected)

  if (initialView === 'max' && max) {
    const maxDate = parseDateInputValue(max)
    if (maxDate) return startOfMonth(maxDate)
  }
  if (initialView === 'today') {
    return startOfMonth(new Date())
  }
  if (initialView === 'min' && min) {
    const minDate = parseDateInputValue(min)
    if (minDate) return startOfMonth(minDate)
  }

  const minDate = parseDateInputValue(min)
  if (minDate) return startOfMonth(minDate)
  const maxDate = parseDateInputValue(max)
  if (maxDate) return startOfMonth(maxDate)
  return startOfMonth(new Date())
}

function yearOptions(min: string, max: string): number[] {
  const nowYear = new Date().getFullYear()
  // DOB: capped by max. Booking (no max): allow current year + 1.
  const maxYear = parseDateInputValue(max)?.getFullYear() ?? nowYear + 1
  const minYear = parseDateInputValue(min)?.getFullYear() ?? maxYear - 100
  const years: number[] = []
  for (let y = maxYear; y >= minYear; y--) years.push(y)
  return years
}

type BookingDatePickerProps = {
  id?: string
  value: string
  min?: string
  max?: string
  /** When true (booking preferred date), closed clinic days are disabled. */
  disableClosedDays?: boolean
  hours?: WeekHours | null
  /** Where to open when no value is selected. */
  initialView?: InitialView
  placeholder?: string
  dialogLabel?: string
  footerNote?: string
  hasError?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  onChange: (nextDate: string) => void
}

export function BookingDatePicker({
  id = 'booking-date',
  value,
  min = '',
  max = '',
  disableClosedDays = true,
  hours = null,
  initialView = 'min',
  placeholder = 'Select a date',
  dialogLabel = 'Choose preferred date',
  footerNote,
  hasError = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onChange,
}: BookingDatePickerProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const yearListRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [panel, setPanel] = useState<PanelMode>('none')
  const selected = parseDateInputValue(value)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    defaultVisibleMonth(value, min, max, initialView)
  )

  const years = useMemo(() => yearOptions(min, max), [min, max])

  const resolvedFooter =
    footerNote ??
    (disableClosedDays
      ? hours
        ? calendarFooter(hours)
        : 'Closed Saturdays · Sunday–Friday'
      : undefined)

  const closePicker = () => {
    setPanel('none')
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setPanel('none')
      return
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (rootRef.current?.contains(target)) return
      closePicker()
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (panel !== 'none') {
        setPanel('none')
        return
      }
      closePicker()
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, panel])

  useEffect(() => {
    if (!open) return
    setVisibleMonth(defaultVisibleMonth(value, min, max, initialView))
    setPanel('none')
  }, [open, value, min, max, initialView])

  useEffect(() => {
    if (panel !== 'year' || !yearListRef.current) return
    const active = yearListRef.current.querySelector('[data-active-year="true"]')
    if (active instanceof HTMLElement) {
      active.scrollIntoView({ block: 'center' })
    }
  }, [panel, visibleMonth])

  const cells = useMemo(() => {
    const first = startOfMonth(visibleMonth)
    const startOffset = first.getDay() // Sunday = 0
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    ).getDate()
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7
    const result: Array<{ date: Date; inMonth: boolean }> = []

    for (let i = 0; i < total; i++) {
      const dayNumber = i - startOffset + 1
      const date = new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth(),
        dayNumber
      )
      result.push({
        date,
        inMonth: dayNumber >= 1 && dayNumber <= daysInMonth,
      })
    }
    return result
  }, [visibleMonth])

  const canGoPrev = (() => {
    if (!min) return true
    const prev = addMonths(visibleMonth, -1)
    const minMonth = startOfMonth(parseDateInputValue(min) ?? visibleMonth)
    return prev >= minMonth
  })()

  const canGoNext = (() => {
    if (!max) return true
    const next = addMonths(visibleMonth, 1)
    const maxMonth = startOfMonth(parseDateInputValue(max) ?? visibleMonth)
    return next <= maxMonth
  })()

  const setMonthYear = (monthIndex: number, year: number) => {
    setVisibleMonth(
      clampMonthToRange(new Date(year, monthIndex, 1), min, max)
    )
    setPanel('none')
  }

  const triggerClassName = hasError
    ? 'w-full min-w-0 max-w-full box-border px-4 py-3 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-red-50/40 text-left flex items-center justify-between gap-3 text-[var(--text-dark)] transition-colors'
    : 'w-full min-w-0 max-w-full box-border px-4 py-3 border-2 border-accent/35 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/35 focus:border-primary bg-white text-left flex items-center justify-between gap-3 text-[var(--text-dark)] transition-colors [@media(hover:hover)]:hover:border-primary/50 [@media(hover:hover)]:hover:bg-accent/5'

  const monthLabel = MONTH_OPTIONS[visibleMonth.getMonth()]
  const yearLabel = visibleMonth.getFullYear()

  return (
    <div ref={rootRef} className="relative min-w-0 w-full">
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        onClick={() => setOpen((prev) => !prev)}
        className={triggerClassName}
      >
        <span className={!value ? 'text-[var(--text-dark)]/55' : undefined}>
          {formatDisplayDate(value, placeholder)}
        </span>
        <Calendar className="h-6 w-6 shrink-0 text-primary" aria-hidden strokeWidth={2.25} />
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label={dialogLabel}
          className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-accent/25 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex min-w-0 items-center gap-1 sm:gap-2">
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={panel === 'month'}
                  aria-haspopup="listbox"
                  onClick={() =>
                    setPanel((p) => (p === 'month' ? 'none' : 'month'))
                  }
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-bold uppercase tracking-wide text-[var(--text-dark)] hover:bg-accent/15 transition-colors"
                >
                  {monthLabel}
                  {panel === 'month' ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-secondary" aria-hidden />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-secondary" aria-hidden />
                  )}
                </button>

                {panel === 'month' && (
                  <div
                    role="listbox"
                    aria-label="Choose month"
                    className="absolute left-0 top-full z-50 mt-1 w-44 max-h-56 overflow-y-auto rounded-lg border border-accent/25 bg-white py-1 shadow-lg"
                  >
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dark)]">
                      Month
                    </p>
                    {MONTH_OPTIONS.map((label, index) => {
                      const outOfRange = isMonthOutOfRange(
                        visibleMonth.getFullYear(),
                        index,
                        min,
                        max
                      )
                      const active = index === visibleMonth.getMonth()
                      return (
                        <button
                          key={label}
                          type="button"
                          role="option"
                          aria-selected={active}
                          disabled={outOfRange}
                          onClick={() =>
                            setMonthYear(index, visibleMonth.getFullYear())
                          }
                          className={[
                            'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                            outOfRange
                              ? 'cursor-not-allowed text-[var(--text-dark)]/45'
                              : 'text-[var(--text-dark)] hover:bg-accent/15',
                            active && !outOfRange
                              ? 'bg-accent/25 font-semibold text-[var(--text-dark)]'
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={panel === 'year'}
                  aria-haspopup="listbox"
                  onClick={() =>
                    setPanel((p) => (p === 'year' ? 'none' : 'year'))
                  }
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-sm font-bold text-primary hover:bg-accent/15 transition-colors"
                >
                  {yearLabel}
                  {panel === 'year' ? (
                    <ChevronUp className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <ChevronDown className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                  )}
                </button>

                {panel === 'year' && (
                  <div
                    role="listbox"
                    aria-label="Choose year"
                    className="absolute left-0 top-full z-50 mt-1 w-28 max-h-56 overflow-y-auto rounded-lg border border-accent/25 bg-white py-1 shadow-lg"
                  >
                    <p className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dark)]">
                      Year
                    </p>
                    <div ref={yearListRef}>
                      {years.map((year) => {
                        const active = year === visibleMonth.getFullYear()
                        return (
                          <button
                            key={year}
                            type="button"
                            role="option"
                            aria-selected={active}
                            data-active-year={active ? 'true' : undefined}
                            onClick={() =>
                              setMonthYear(visibleMonth.getMonth(), year)
                            }
                            className={[
                              'flex w-full items-center px-3 py-2 text-left text-sm transition-colors',
                              active
                                ? 'bg-accent/25 font-semibold text-[var(--text-dark)]'
                                : 'text-[var(--text-dark)] hover:bg-accent/15',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          >
                            {year}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                aria-label="Previous month"
                disabled={!canGoPrev}
                onClick={() => {
                  setPanel('none')
                  setVisibleMonth((m) => addMonths(m, -1))
                }}
                className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-accent/15 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Next month"
                disabled={!canGoNext}
                onClick={() => {
                  setPanel('none')
                  setVisibleMonth((m) => addMonths(m, 1))
                }}
                className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-accent/15 transition-colors disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronRight className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden>
            {WEEKDAYS.map((day, index) => {
              const closedHeader = disableClosedDays
                ? hours
                  ? hours[
                      (
                        [
                          'sunday',
                          'monday',
                          'tuesday',
                          'wednesday',
                          'thursday',
                          'friday',
                          'saturday',
                        ] as const
                      )[index]
                    ].closed
                  : day === 'Sa'
                : false
              return (
                <div
                  key={day}
                  className={`text-center text-xs font-semibold py-1 ${
                    closedHeader
                      ? 'text-[var(--text-dark)]/40'
                      : 'text-[var(--text-dark)]'
                  }`}
                >
                  {day}
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const { date, inMonth } = cell
              const valueStr = toDateInputValue(date)
              const disabled = isDateDisabled(
                date,
                min,
                max,
                disableClosedDays,
                hours
              )
              const selectedDay = selected ? isSameDay(date, selected) : false
              const closedDay =
                disableClosedDays && isClosedBookingDate(valueStr, hours)
              const isFuture = Boolean(max && valueStr > max)
              const weekdayName = weekdayFromDateInput(valueStr)

              return (
                <button
                  key={valueStr}
                  type="button"
                  disabled={disabled}
                  aria-label={date.toLocaleDateString('en-IE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  aria-disabled={disabled}
                  aria-pressed={selectedDay}
                  title={
                    closedDay && inMonth
                      ? weekdayName
                        ? `Closed ${weekdayName.charAt(0).toUpperCase()}${weekdayName.slice(1)}`
                        : 'Closed'
                      : isFuture
                        ? 'Future dates are not available'
                        : disabled
                          ? 'Unavailable'
                          : undefined
                  }
                  onClick={() => {
                    if (disabled) return
                    onChange(valueStr)
                    closePicker()
                  }}
                  className={[
                    'aspect-square rounded-full text-sm font-medium transition-colors',
                    selectedDay && !disabled
                      ? 'bg-primary text-white hover:bg-primary hover:text-white font-semibold'
                      : '',
                    disabled
                      ? 'cursor-not-allowed pointer-events-none'
                      : selectedDay
                        ? ''
                        : 'hover:border hover:border-white/50 hover:bg-accent/10 hover:text-[var(--text-dark)] hover:backdrop-blur-[3px] supports-[backdrop-filter]:hover:bg-accent/[0.08]',
                    !(selectedDay && !disabled) &&
                      (!inMonth
                        ? disabled
                          ? 'text-[var(--text-dark)]/35'
                          : 'text-[var(--text-dark)]/50'
                        : disabled
                          ? 'text-[var(--text-dark)]/40 line-through decoration-[var(--text-dark)]/25'
                          : 'text-[var(--text-dark)]'),
                    closedDay && inMonth && !selectedDay ? 'opacity-50' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          {resolvedFooter ? (
            <p className="mt-3 text-xs text-secondary">{resolvedFooter}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
