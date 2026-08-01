'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { isClosedBookingDate } from './TimeRangeCards'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const

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

function formatDisplayDate(dateStr: string): string {
  const date = parseDateInputValue(dateStr)
  if (!date) return 'Select a date'
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

function isDateDisabled(date: Date, minDateStr: string): boolean {
  const value = toDateInputValue(date)
  if (minDateStr && value < minDateStr) return true
  return isClosedBookingDate(value)
}

type BookingDatePickerProps = {
  id?: string
  value: string
  min?: string
  hasError?: boolean
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  onChange: (nextDate: string) => void
}

export function BookingDatePicker({
  id = 'booking-date',
  value,
  min = '',
  hasError = false,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  onChange,
}: BookingDatePickerProps) {
  const listboxId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const selected = parseDateInputValue(value)
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(selected ?? parseDateInputValue(min) ?? new Date())
  )

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    if (open && value) {
      const selectedDate = parseDateInputValue(value)
      if (selectedDate) setVisibleMonth(startOfMonth(selectedDate))
    }
  }, [open, value])

  const cells = useMemo(() => {
    const first = startOfMonth(visibleMonth)
    const startOffset = first.getDay() // Sunday = 0
    const daysInMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      0
    ).getDate()
    const total = Math.ceil((startOffset + daysInMonth) / 7) * 7
    const result: Array<{ date: Date; inMonth: boolean } | null> = []

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

  const monthLabel = visibleMonth.toLocaleDateString('en-IE', {
    month: 'long',
    year: 'numeric',
  })

  const triggerClassName = hasError
    ? 'w-full min-w-0 max-w-full box-border px-4 py-3 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-red-50/40 text-left flex items-center justify-between gap-3 text-primary'
    : 'w-full min-w-0 max-w-full box-border px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-left flex items-center justify-between gap-3 text-primary'

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
        <span>{formatDisplayDate(value)}</span>
        <Calendar className="w-5 h-5 shrink-0 text-primary/70" aria-hidden />
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Choose preferred date"
          className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-accent/25 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
              className="p-2 rounded-lg text-primary hover:bg-accent/15 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
            </button>
            <p className="font-serif text-base font-semibold text-primary capitalize">
              {monthLabel}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
              className="p-2 rounded-lg text-primary hover:bg-accent/15 transition-colors"
            >
              <ChevronRight className="w-4 h-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden>
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className={`text-center text-xs font-medium py-1 ${
                  day === 'Sa' ? 'text-secondary/50' : 'text-secondary'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell, index) => {
              if (!cell) return <div key={index} />
              const { date, inMonth } = cell
              const valueStr = toDateInputValue(date)
              const disabled = isDateDisabled(date, min)
              const selectedDay = selected ? isSameDay(date, selected) : false
              const isSaturday = date.getDay() === 6

              return (
                <button
                  key={valueStr + String(inMonth)}
                  type="button"
                  disabled={disabled || !inMonth}
                  aria-label={date.toLocaleDateString('en-IE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  aria-disabled={disabled || !inMonth}
                  aria-pressed={selectedDay}
                  title={
                    isSaturday
                      ? 'Closed on Saturdays'
                      : disabled
                        ? 'Unavailable'
                        : undefined
                  }
                  onClick={() => {
                    if (disabled || !inMonth) return
                    onChange(valueStr)
                    setOpen(false)
                  }}
                  className={[
                    'aspect-square rounded-lg text-sm transition-colors',
                    !inMonth ? 'invisible pointer-events-none' : '',
                    disabled
                      ? 'text-secondary/35 cursor-not-allowed line-through decoration-secondary/30 pointer-events-none'
                      : 'text-primary hover:bg-accent/20',
                    selectedDay && !disabled
                      ? 'bg-accent/35 text-primary hover:bg-accent/35 font-semibold ring-2 ring-primary'
                      : '',
                    isSaturday && inMonth && !selectedDay
                      ? 'opacity-40 bg-accent/5'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-xs text-secondary">
            Closed Saturdays · Sunday–Friday
          </p>
        </div>
      )}
    </div>
  )
}
