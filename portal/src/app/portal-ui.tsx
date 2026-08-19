'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { RatingStars } from '../../../src/features/ui/RatingStars'
import { CONDITION_MAX_LEN } from '../../../shared/review-rating'
import { snapDateTimeLocalToQuarterHour } from '../../../shared/quarter-hour'
import {
  euroPrice,
  formatHourLabel,
  priceDigits,
  type SiteSnapshot,
  type WeekHours,
  type Weekday,
} from '../../../shared/site-snapshot'
import {
  datetimeLocalFrom12,
  datetimeLocalTo12,
  hhmmTo12,
  hour12ToHhmm,
} from '../../../shared/twelve-hour'

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

export function PageHeader({ title, description }: { title?: string; description?: string }) {
  if (!title && !description) return null
  return (
    <div className="space-y-1">
      {title ? (
        <h1 className="font-serif text-2xl font-semibold text-[var(--text-dark)]">{title}</h1>
      ) : null}
      {description ? <p className="max-w-2xl text-sm text-[var(--text-dark)]/65">{description}</p> : null}
    </div>
  )
}

export function Card({
  title,
  action,
  children,
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title ? (
            <h2 className="text-sm font-semibold tracking-wide text-[var(--text-dark)]">{title}</h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

export function OnOffSwitch({
  checked,
  disabled,
  ariaLabel,
  onChange,
}: {
  checked: boolean
  disabled?: boolean
  ariaLabel: string
  onChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onChange(!checked)
      }}
      className={`flex items-center gap-2 text-sm ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <span
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-black/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </span>
      {checked ? 'On' : 'Off'}
    </button>
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

const HOUR_12_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const
const QUARTER_MINUTES = [0, 15, 30, 45] as const
const selectClass = 'rounded-md border border-black/10 bg-white px-2 py-1 text-sm'

function HourAmPmSelect({
  value,
  onChange,
  ariaLabel,
}: {
  value: string
  onChange: (hhmm: string) => void
  ariaLabel: string
}) {
  const clock = hhmmTo12(toHhmm(value, '09:00'))
  return (
    <span className="inline-flex items-center gap-1">
      <select
        className={selectClass}
        aria-label={`${ariaLabel} hour`}
        value={clock.hour}
        onChange={(e) => onChange(hour12ToHhmm(Number(e.target.value), clock.ampm, 0))}
      >
        {HOUR_12_OPTIONS.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        aria-label={`${ariaLabel} AM or PM`}
        value={clock.ampm}
        onChange={(e) =>
          onChange(hour12ToHhmm(clock.hour, e.target.value === 'PM' ? 'PM' : 'AM', 0))
        }
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </span>
  )
}

export function DublinStartPicker({
  value,
  onChange,
  label = 'Exact start',
}: {
  value: string
  onChange: (next: string) => void
  label?: string
}) {
  const parts = datetimeLocalTo12(value ? snapDateTimeLocalToQuarterHour(value) : '')
  const commit = (patch: Partial<typeof parts>) => {
    const next = { ...parts, ...patch }
    if (!next.date) {
      onChange('')
      return
    }
    onChange(snapDateTimeLocalToQuarterHour(datetimeLocalFrom12(next)))
  }
  return (
    <label className="text-sm">
      {label}
      <span className="mt-1 flex flex-wrap items-center gap-2">
        <input
          type="date"
          className={`${selectClass} [color-scheme:light]`}
          aria-label={`${label} date`}
          value={parts.date}
          onChange={(e) => commit({ date: e.target.value })}
        />
        <select
          className={selectClass}
          aria-label={`${label} hour`}
          value={parts.hour}
          onChange={(e) => commit({ hour: Number(e.target.value) })}
        >
          {HOUR_12_OPTIONS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          aria-label={`${label} minutes`}
          value={parts.minute}
          onChange={(e) => commit({ minute: Number(e.target.value) })}
        >
          {QUARTER_MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          aria-label={`${label} AM or PM`}
          value={parts.ampm}
          onChange={(e) => commit({ ampm: e.target.value === 'PM' ? 'PM' : 'AM' })}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </span>
    </label>
  )
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
                      <HourAmPmSelect
                        ariaLabel={`${label} opens`}
                        value={toHhmm(row.open, '09:00')}
                        onChange={(next) => setDay(day, { open: next })}
                      />
                      <span className="text-[var(--text-dark)]/40" aria-hidden>
                        →
                      </span>
                      <HourAmPmSelect
                        ariaLabel={`${label} closes`}
                        value={toHhmm(row.close, '20:00')}
                        onChange={(next) => setDay(day, { close: next })}
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

export type ReviewStatusTab = 'pending' | 'confirmed' | 'rejected'

export const REVIEW_STATUS_TABS: { id: ReviewStatusTab; label: string }[] = [
  { id: 'pending', label: 'Awaiting review' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'rejected', label: 'Rejected' },
]

export function ReviewStatusTabs({
  value,
  counts,
  onChange,
  query,
  onQueryChange,
}: {
  value: ReviewStatusTab
  counts: Record<ReviewStatusTab, number>
  onChange: (next: ReviewStatusTab) => void
  query: string
  onQueryChange: (next: string) => void
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-black/[0.08] sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex gap-1 overflow-x-auto">
        {REVIEW_STATUS_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
              value === item.id
                ? 'border-primary text-primary'
                : 'border-transparent text-[var(--text-dark)]/60 hover:text-primary'
            }`}
          >
            {item.label}
            <span className="ml-1.5 tabular-nums text-[var(--text-dark)]/45">
              {counts[item.id]}
            </span>
          </button>
        ))}
      </nav>
      <label className="block pb-2 sm:w-64 sm:shrink-0">
        <span className="sr-only">Search reviews</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search name, treatment, text…"
          className="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>
    </div>
  )
}

export function ReviewCard({
  bucket,
  name,
  rating,
  condition,
  reviewedAt,
  source,
  body,
  tagValue,
  emphasisValue,
  onTagChange,
  onEmphasisChange,
  onSuggestEmphasis,
  onSaveTagAndHighlight,
  onConfirm,
  onReject,
  onUnpublish,
  onRestore,
}: {
  bucket: ReviewStatusTab
  name: string
  rating: number
  condition?: string
  reviewedAt?: string
  source?: string
  body: string
  tagValue: string
  emphasisValue: string
  onTagChange: (next: string) => void
  onEmphasisChange: (next: string) => void
  onSuggestEmphasis: () => void
  onSaveTagAndHighlight: () => void
  onConfirm: () => void
  onReject: () => void
  onUnpublish: () => void
  onRestore: () => void
}) {
  const phrase = emphasisValue.trim()
  const phraseError =
    phrase && !body.includes(phrase)
      ? 'Must appear exactly in the full review.'
      : undefined
  const saveEdits = () => {
    if (phraseError) return
    onSaveTagAndHighlight()
  }

  return (
    <article className="flex h-full flex-col rounded-lg border border-black/[0.08] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-[var(--text-dark)]">{name}</p>
        <RatingStars rating={rating} />
      </div>
      {bucket === 'rejected' && condition ? (
        <p className="mt-1 text-xs text-secondary">{condition}</p>
      ) : null}
      <p className="mt-1 text-xs text-secondary">
        {reviewedAt || ''}
        {source ? ` · ${source}` : ''}
      </p>
      <p className="mt-3 flex-1 text-sm italic leading-relaxed text-[var(--text-dark)]/80">
        {body}
      </p>
      {bucket === 'pending' || bucket === 'confirmed' ? (
        <div className="mt-3 space-y-2 border-t border-black/[0.06] pt-3">
          <label className="block text-xs font-medium text-[var(--text-dark)]/60">
            Treatment tag
            <input
              className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
              maxLength={CONDITION_MAX_LEN}
              value={tagValue}
              onChange={(e) => onTagChange(e.target.value)}
            />
          </label>
          <label className="block text-xs font-medium text-[var(--text-dark)]/60">
            Phrase to highlight
            <input
              className={`mt-1 w-full rounded-md border px-2 py-1.5 text-sm ${
                phraseError ? 'border-red-400' : 'border-black/10'
              }`}
              value={emphasisValue}
              onChange={(e) => onEmphasisChange(e.target.value)}
              aria-invalid={Boolean(phraseError) || undefined}
            />
          </label>
          {phraseError ? (
            <p className="text-sm text-red-700" role="alert">
              {phraseError}
            </p>
          ) : null}
          <button
            type="button"
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
            onClick={onSuggestEmphasis}
          >
            Suggest from review
          </button>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
              onClick={saveEdits}
            >
              Save tag & highlight
            </button>
            {bucket === 'pending' ? (
              <>
                <button
                  type="button"
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white"
                  onClick={() => {
                    if (phraseError) return
                    onConfirm()
                  }}
                >
                  Confirm
                </button>
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
                  onClick={onReject}
                >
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
                  onClick={onUnpublish}
                >
                  Unpublish
                </button>
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
                  onClick={onReject}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
      {bucket === 'rejected' ? (
        <div className="mt-3 border-t border-black/[0.06] pt-3">
          <button
            type="button"
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
            onClick={onRestore}
          >
            Restore
          </button>
        </div>
      ) : null}
    </article>
  )
}
