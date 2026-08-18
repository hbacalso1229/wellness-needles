'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  euroPrice,
  formatHourLabel,
  priceDigits,
  type SiteSnapshot,
  type WeekHours,
  type Weekday,
} from '../../../shared/site-snapshot'

export const DISPLAY_DAYS: ReadonlyArray<[label: string, key: Weekday]> = [
  ['Monday', 'monday'],
  ['Tuesday', 'tuesday'],
  ['Wednesday', 'wednesday'],
  ['Thursday', 'thursday'],
  ['Friday', 'friday'],
  ['Saturday', 'saturday'],
  ['Sunday', 'sunday'],
]

const COPY_DAYS = DISPLAY_DAYS.filter(([, key]) => key !== 'monday')

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h1 className="font-serif text-2xl font-semibold text-[var(--text-dark)]">{title}</h1>
      {description ? <p className="max-w-2xl text-sm text-[var(--text-dark)]/65">{description}</p> : null}
    </div>
  )
}

export function Card({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {title ? (
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-[var(--text-dark)]">{title}</h2>
      ) : null}
      {children}
    </div>
  )
}

export function CompactEuroField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="block min-w-0 flex-1 text-xs font-medium text-[var(--text-dark)]/60">
      {label}
      <span className="mt-1 flex rounded-md border border-black/10 bg-white">
        <span className="select-none px-2 py-1.5 text-sm text-[var(--text-dark)]/45" aria-hidden>
          €
        </span>
        <input
          className="min-w-0 flex-1 rounded-r-md border-0 px-2 py-1.5 text-sm outline-none"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]{0,2}"
          autoComplete="off"
          aria-label={`${label} in euro`}
          value={priceDigits(value)}
          onChange={(e) => onChange(euroPrice(e.target.value))}
        />
      </span>
    </label>
  )
}

export function discountPercentLabel(original: string, discounted: string): string | null {
  const orig = Number(priceDigits(original))
  const disc = Number(priceDigits(discounted))
  if (!Number.isFinite(orig) || !Number.isFinite(disc) || orig <= 0 || orig <= disc) return null
  const pct = ((orig - disc) / orig) * 100
  const rounded = Math.round(pct * 10) / 10
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${text}% off`
}

export function toHhmm(value: string, fallback: string): string {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)/.exec(value.trim())
  if (!match) return fallback
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

export function HoursEditor({
  hours,
  onChange,
}: {
  hours: WeekHours
  onChange: (hours: WeekHours) => void
}) {
  const [expanded, setExpanded] = useState<Weekday | null>(null)
  const [copyTo, setCopyTo] = useState<Partial<Record<Weekday, boolean>>>({
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    sunday: true,
  })

  const setDay = (day: Weekday, patch: Partial<WeekHours[Weekday]>) => {
    const next = { ...hours, [day]: { ...hours[day], ...patch } }
    onChange(next)
  }

  const applyMonday = () => {
    let next = { ...hours }
    for (const [, day] of COPY_DAYS) {
      if (!copyTo[day]) continue
      next = { ...next, [day]: { ...hours.monday } }
    }
    onChange(next)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-black/[0.06] bg-[#faf9f6] px-3 py-3">
        <p className="text-xs font-medium text-[var(--text-dark)]/70">Copy Monday hours to</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          {COPY_DAYS.map(([label, day]) => (
            <label key={day} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={Boolean(copyTo[day])}
                onChange={(e) => setCopyTo((prev) => ({ ...prev, [day]: e.target.checked }))}
              />
              {label.slice(0, 3)}
            </label>
          ))}
          <button
            type="button"
            className="rounded-md border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary hover:bg-accent/15"
            onClick={applyMonday}
          >
            Apply
          </button>
        </div>
      </div>
      <ul>
        {DISPLAY_DAYS.map(([label, day]) => {
          const row = hours[day]
          const open = !row.closed
          const isExpanded = expanded === day
          return (
            <li key={day} className="border-b border-black/[0.06] last:border-b-0">
              <button
                type="button"
                className="flex w-full items-center gap-3 py-3 text-left"
                aria-expanded={isExpanded}
                onClick={() => setExpanded(isExpanded ? null : day)}
              >
                <span className="w-28 shrink-0 text-sm text-[var(--text-dark)]/75">{label}</span>
                <span className="flex-1 text-right text-sm font-medium tabular-nums">
                  {open
                    ? `${formatHourLabel(row.open)} – ${formatHourLabel(row.close)}`
                    : 'Closed'}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--text-dark)]/40 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden
                />
              </button>
              {isExpanded ? (
                <div className="flex flex-wrap items-center gap-3 pb-3 pl-0 sm:pl-28">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      role="switch"
                      checked={open}
                      onChange={(e) => setDay(day, { closed: !e.target.checked })}
                    />
                    Open
                  </label>
                  {open ? (
                    <>
                      <input
                        type="time"
                        step={60}
                        className="rounded-md border border-black/10 px-2 py-1 text-sm"
                        aria-label={`${label} opens`}
                        value={toHhmm(row.open, '09:00')}
                        onChange={(e) => setDay(day, { open: toHhmm(e.target.value, row.open) })}
                      />
                      <span className="text-[var(--text-dark)]/40" aria-hidden>
                        →
                      </span>
                      <input
                        type="time"
                        step={60}
                        className="rounded-md border border-black/10 px-2 py-1 text-sm"
                        aria-label={`${label} closes`}
                        value={toHhmm(row.close, '20:00')}
                        onChange={(e) => setDay(day, { close: toHhmm(e.target.value, row.close) })}
                      />
                    </>
                  ) : (
                    <span className="text-sm font-medium text-[var(--text-dark)]/55">Closed</span>
                  )}
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function formatLastPublished(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const tz = 'Europe/Dublin'
  const today = new Date().toLocaleDateString('en-IE', { timeZone: tz })
  const that = date.toLocaleDateString('en-IE', { timeZone: tz })
  const time = date.toLocaleTimeString('en-IE', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
  })
  if (today === that) return `Today at ${time}`
  return date.toLocaleString('en-IE', { timeZone: tz, dateStyle: 'medium', timeStyle: 'short' })
}

export function snapshotsEqual(a: SiteSnapshot, b: SiteSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

export function UnsavedBar({
  dirty,
  publishing,
  success,
  overlayEnabled,
  lastPublishedAt,
  lastPublishedBy,
  onDiscard,
  onPublish,
}: {
  dirty: boolean
  publishing: boolean
  success: boolean
  overlayEnabled: boolean
  lastPublishedAt: string | null
  lastPublishedBy: string | null
  onDiscard: () => void
  onPublish: () => void
}) {
  if (!dirty && !success && !lastPublishedAt) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.06] bg-[#f4f2ec]/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto max-w-5xl space-y-2">
        {lastPublishedAt ? (
          <p className="text-xs text-[var(--text-dark)]/55">
            Last published: {formatLastPublished(lastPublishedAt)}
            {` · Published by: ${lastPublishedBy || 'Admin'}`}
          </p>
        ) : null}
        {success && !dirty ? (
          <div className="rounded-lg border border-accent/30 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-primary">Published successfully</p>
            <p className="text-sm text-[var(--text-dark)]/65">
              {overlayEnabled
                ? 'Your changes are now live.'
                : 'Saved. The public website overlay is still off, so www has not changed.'}
            </p>
          </div>
        ) : null}
        {dirty ? (
          <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-dark)]">Unsaved changes</p>
              <p className="text-sm text-[var(--text-dark)]/60">Your website hasn’t been updated yet.</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-dark)]/70 hover:bg-black/[0.04]"
                disabled={publishing}
                onClick={onDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={publishing}
                onClick={onPublish}
              >
                {publishing ? 'Publishing…' : 'Save & Publish'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
