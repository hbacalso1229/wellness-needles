'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import { RatingStars } from '../../../src/features/ui/RatingStars'
import { PhoneCountrySelect } from '../../../src/features/ui/PhoneCountrySelect'
import { CONDITION_MAX_LEN } from '../../../shared/review-rating'
import {
  dublinTodayYmd,
  isDublinDateTimeLocalPast,
  snapDateTimeLocalToQuarterHour,
} from '../../../shared/quarter-hour'
import {
  DEFAULT_PHONE_COUNTRY_ID,
  getPhoneCountry,
} from '../../../src/lib/phone-countries'
import {
  formatLocalPhoneInput,
  isValidBookingPhone,
  subscriberDigits,
  toE164,
} from '../../../src/lib/irish-phone'
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

export const PORTAL_PILL =
  'rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'

export const PORTAL_PILL_TOOLBAR =
  'shrink-0 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white sm:px-4 sm:py-2'

export const PORTAL_PILL_OUTLINE =
  'whitespace-nowrap rounded-full border border-black/10 bg-[#f4f2ec] px-2.5 py-1 text-xs font-medium text-[var(--text-dark)] sm:px-3 sm:py-1.5 sm:text-sm'

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
  children?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {title || action ? (
        <div
          className={`flex items-center justify-between gap-2 ${children ? 'mb-4' : ''}`}
        >
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

function telHref(phone: string): string | null {
  const href = `tel:${phone.trim().replace(/[^\d+]/g, '')}`
  return /^tel:\+?\d{7,}$/.test(href) ? href : null
}

function mailtoHref(email: string): string | null {
  const trimmed = email.trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? `mailto:${trimmed}` : null
}

function formatLocationLines(label?: string): string {
  const text = (label || '').trim()
  if (!text) return ''
  const spaced = text.replace(/Co\.(?=\S)/g, 'Co. ')
  const dash = spaced.indexOf(' — ')
  if (dash === -1) return spaced
  return `${spaced.slice(0, dash)}\n${spaced.slice(dash + 3)}`
}

function mapsSearchHref(label?: string): string | null {
  const query = formatLocationLines(label).replace(/\s+/g, ' ').trim()
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null
}

function BookingDetailRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string | null
}) {
  const text = (value || '').trim()
  if (!text) return null
  const isExternal = /^https?:\/\//i.test(href || '')
  return (
    <p className="min-w-0">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--text-dark)]/50">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          className="mt-0.5 block break-words whitespace-pre-line text-sm text-[var(--text-dark)] underline"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          onClick={(event) => event.stopPropagation()}
        >
          {text}
        </a>
      ) : (
        <span className="mt-0.5 block break-words whitespace-pre-line text-sm text-[var(--text-dark)]">
          {text}
        </span>
      )}
    </p>
  )
}

const BOOKING_STATUS_LABEL = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
} as const

export function BookingCardDetails({
  firstName,
  lastName,
  when,
  phone,
  email,
  serviceLabel,
  serviceType,
  locationLabel,
  smsOptIn,
  status,
  open,
  onToggle,
  children,
}: {
  firstName: string
  lastName: string
  when: string
  phone?: string
  email?: string
  serviceLabel?: string
  serviceType?: string
  locationLabel?: string
  smsOptIn?: number
  status: 'pending' | 'confirmed' | 'cancelled'
  open: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  const panelId = useId()
  const statusLabel = BOOKING_STATUS_LABEL[status]
  const displayName = `${firstName} ${lastName}`.trim()
  return (
    <div>
      <button
        type="button"
        className="flex w-full flex-col text-left"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${displayName}, ${statusLabel}`}
        onClick={onToggle}
      >
        <span className="flex w-full items-start justify-between gap-2">
          <span className="min-w-0 text-base font-semibold text-[var(--text-dark)]">
            {firstName} {lastName}
          </span>
          <span className="mt-0.5 flex shrink-0 items-center gap-1.5">
            <span className="shrink-0 rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--text-dark)]/55">
              {statusLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[var(--text-dark)]/45 transition-transform ${
                open ? 'rotate-180' : ''
              }`}
              aria-hidden
            />
          </span>
        </span>
        {when.trim() ? (
          <span className="mt-0.5 block w-full whitespace-nowrap text-[13px] font-semibold text-[var(--text-dark)]">
            {when}
          </span>
        ) : null}
      </button>
      {open ? (
        <div id={panelId}>
          <div className="space-y-4 pt-3">
            <div className="grid grid-cols-2 items-start gap-x-3 gap-y-4">
              <BookingDetailRow label="Phone" value={phone} href={phone ? telHref(phone) : null} />
              <BookingDetailRow label="Service" value={serviceLabel} />
              <BookingDetailRow label="Email" value={email} href={email ? mailtoHref(email) : null} />
              <BookingDetailRow label="Visit" value={serviceType} />
            </div>
            <BookingDetailRow
              label="Location"
              value={formatLocationLines(locationLabel)}
              href={mapsSearchHref(locationLabel)}
            />
            {smsOptIn === undefined ? null : (
              <BookingDetailRow label="SMS opt-in" value={smsOptIn ? 'YES' : 'NO'} />
            )}
          </div>
          {children}
        </div>
      ) : null}
    </div>
  )
}

export function OnOffSwitch({
  checked,
  disabled,
  ariaLabel,
  onChange,
  showLabel = true,
}: {
  checked: boolean
  disabled?: boolean
  ariaLabel: string
  onChange: (next: boolean) => void
  showLabel?: boolean
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
      {showLabel ? (checked ? 'On' : 'Off') : null}
    </button>
  )
}

export function CompactEuroField({
  label,
  value,
  onChange,
  emphasis = 'muted',
}: {
  label: string
  value: string
  onChange: (next: string) => void
  emphasis?: 'muted' | 'strong'
}) {
  const digits = priceDigits(value)
  const display =
    !digits || digits === '.' || (Number(digits) === 0 && !digits.endsWith('.'))
      ? '0.00'
      : digits
  const strong = emphasis === 'strong'
  return (
    <label
      className={`block min-w-0 text-xs font-medium ${
        strong ? 'text-[var(--text-dark)]/70' : 'text-[var(--text-dark)]/45'
      }`}
    >
      {label}
      <span
        className={`mt-1 flex min-w-0 rounded-md border bg-white ${
          strong ? 'border-black/15' : 'border-black/10'
        }`}
      >
        <span
          className={`select-none px-2 py-1.5 ${
            strong ? 'text-base text-[var(--text-dark)]/55' : 'text-sm text-[var(--text-dark)]/40'
          }`}
          aria-hidden
        >
          €
        </span>
        <input
          className={`min-w-0 flex-1 rounded-r-md border-0 px-2 py-1.5 outline-none ${
            strong
              ? 'text-base font-semibold text-[var(--text-dark)]'
              : 'text-sm text-[var(--text-dark)]/70'
          }`}
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]{0,2}"
          autoComplete="off"
          aria-label={`${label} in euro`}
          value={display}
          onChange={(e) => onChange(euroPrice(e.target.value))}
        />
      </span>
    </label>
  )
}

export function DurationMinutesField({
  value,
  onChange,
}: {
  value: number
  onChange: (minutes: number) => void
}) {
  return (
    <label className="mb-3 block text-xs font-medium text-[var(--text-dark)]/60">
      Duration
      <span className="mt-1 flex items-center gap-2">
        <input
          className="w-24 rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm outline-none"
          type="number"
          min={15}
          max={180}
          step={15}
          aria-label="Duration in minutes"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="shrink-0 text-sm font-normal text-[var(--text-dark)]/45">min</span>
      </span>
    </label>
  )
}

export { durationPhrase } from '../../../shared/site-snapshot'

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
const selectClass =
  'rounded-md border border-black/10 bg-white px-2 py-2 text-base sm:py-1 sm:text-sm'

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

export function formatYmdDisplay(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd)
  if (!match) return ymd
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return date.toLocaleDateString('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function FullWidthDateField({
  label,
  value,
  onChange,
  max,
}: {
  label: string
  value: string
  onChange: (next: string) => void
  max?: string
}) {
  return (
    <label className="block w-full text-xs font-medium text-[var(--text-dark)]/60">
      {label}
      <span className="relative mt-1 block w-full min-w-0">
        <span
          aria-hidden
          className="box-border flex w-full min-w-0 items-center rounded border bg-white px-2 py-1 text-[var(--text-dark)]"
        >
          {formatYmdDisplay(value) || 'Select date'}
        </span>
        <input
          type="date"
          aria-label={label}
          className="absolute inset-0 z-10 h-full w-full min-w-0 cursor-pointer opacity-0 [color-scheme:light]"
          value={value}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker()
            } catch {
              /* already open, or the browser has no picker */
            }
          }}
        />
      </span>
    </label>
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
  const minDate = dublinTodayYmd()
  const parts = datetimeLocalTo12(value ? snapDateTimeLocalToQuarterHour(value) : '')
  const commit = (patch: Partial<typeof parts>) => {
    const next = { ...parts, ...patch }
    if (!next.date) {
      onChange('')
      return
    }
    if (next.date < minDate) next.date = minDate
    onChange(snapDateTimeLocalToQuarterHour(datetimeLocalFrom12(next)))
  }
  return (
    <label className="block min-w-0 text-sm">
      {label}
      <span className="mt-1 flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="date"
          min={minDate}
          className={`${selectClass} w-full min-w-0 max-w-full [color-scheme:light] sm:w-auto`}
          aria-label={`${label} date`}
          value={parts.date}
          onChange={(e) => commit({ date: e.target.value })}
        />
        <span className="flex min-w-0 items-center gap-2">
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
      </span>
    </label>
  )
}

export type AddAppointmentValues = {
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType: string
  locationLabel: string
  serviceLabel: string
  startsAtLocal: string
  smsOptIn: boolean
}

export function AddAppointmentPanel({
  values,
  typeOptions,
  serviceOptions,
  locationOptions,
  busy,
  onChange,
  onSubmit,
  onCancel,
}: {
  values: AddAppointmentValues
  typeOptions: string[]
  serviceOptions: string[]
  locationOptions: string[]
  busy: boolean
  onChange: (next: AddAppointmentValues) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  const fieldClass =
    'mt-1 block w-full min-w-0 max-w-full rounded border px-2 py-2 text-base sm:py-1 sm:text-sm'
  const formRef = useRef<HTMLFormElement>(null)
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID)
  const [phoneError, setPhoneError] = useState('')
  const [startError, setStartError] = useState('')
  const phoneCountry = getPhoneCountry(phoneCountryId)
  const enforceIrishMobile = phoneCountry.id === 'IE'

  useEffect(() => {
    formRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!values.phone && !values.firstName && !values.lastName && !values.email) {
      setPhoneCountryId(DEFAULT_PHONE_COUNTRY_ID)
      setPhoneError('')
      setStartError('')
    }
  }, [values.phone, values.firstName, values.lastName, values.email])

  return (
    <form
      ref={formRef}
      className="min-w-0 scroll-mt-32 overflow-x-hidden rounded-xl border border-accent/20 bg-white p-4 pb-28 sm:pb-4"
      onSubmit={(e) => {
        e.preventDefault()
        const phone = values.phone.trim()
        if (!phone) {
          setPhoneError('Enter a phone number.')
          return
        }
        if (
          !isValidBookingPhone(phone, phoneCountry, {
            strictIrishMobile: enforceIrishMobile,
          })
        ) {
          setPhoneError(
            phoneCountry.id === 'IE'
              ? 'Enter a valid Irish mobile number (e.g. 86 054 3085).'
              : `Enter a valid ${phoneCountry.name} phone number.`
          )
          return
        }
        setPhoneError('')
        if (!values.startsAtLocal.trim()) {
          setStartError('Choose an exact start.')
          return
        }
        if (isDublinDateTimeLocalPast(values.startsAtLocal)) {
          setStartError('Choose a start that is not in the past.')
          return
        }
        setStartError('')
        onSubmit()
      }}
    >
      <h2 className="text-sm font-semibold tracking-wide text-[var(--text-dark)]">
        Add appointment
      </h2>
      <p className="mt-1 text-sm text-[var(--text-dark)]/65">
        Phone or walk-in. Confirm sends the same card and calendar invite as a website
        request.
      </p>
      <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
        <label className="text-sm">
          First name
          <input
            required
            autoComplete="given-name"
            className={fieldClass}
            value={values.firstName}
            onChange={(e) => onChange({ ...values, firstName: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Last name
          <input
            required
            autoComplete="family-name"
            className={fieldClass}
            value={values.lastName}
            onChange={(e) => onChange({ ...values, lastName: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Email
          <input
            required
            type="email"
            autoComplete="email"
            className={fieldClass}
            value={values.email}
            onChange={(e) => onChange({ ...values, email: e.target.value })}
          />
        </label>
        <label className="min-w-0 text-sm sm:col-span-2">
          Phone
          <span
            className={`relative mt-1 flex min-w-0 rounded-md border bg-white ${
              phoneError ? 'border-red-500' : 'border-black/15'
            }`}
          >
            <PhoneCountrySelect
              value={phoneCountry}
              onChange={(nextCountry) => {
                const local = subscriberDigits(values.phone, phoneCountry)
                setPhoneCountryId(nextCountry.id)
                setPhoneError('')
                onChange({ ...values, phone: toE164(local, nextCountry) })
              }}
            />
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              aria-label="Phone number"
              placeholder={phoneCountry.placeholder}
              className="w-full min-w-0 flex-1 border-0 px-2 py-2 text-base outline-none sm:py-1.5 sm:text-sm"
              value={formatLocalPhoneInput(values.phone, phoneCountry)}
              onChange={(e) => {
                setPhoneError('')
                onChange({ ...values, phone: toE164(e.target.value, phoneCountry) })
              }}
            />
          </span>
          {phoneError ? (
            <span className="mt-1 block text-xs text-red-600">{phoneError}</span>
          ) : null}
        </label>
        <div className="min-w-0">
          <DublinStartPicker
            value={values.startsAtLocal}
            onChange={(startsAtLocal) => {
              setStartError('')
              onChange({ ...values, startsAtLocal })
            }}
          />
          {startError ? (
            <span className="mt-1 block text-xs text-red-600">{startError}</span>
          ) : null}
        </div>
        <label className="text-sm">
          Visit type
          <select
            className={fieldClass}
            value={values.serviceType}
            onChange={(e) => onChange({ ...values, serviceType: e.target.value })}
          >
            {typeOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Service
          <select
            className={fieldClass}
            value={values.serviceLabel}
            onChange={(e) => onChange({ ...values, serviceLabel: e.target.value })}
          >
            {serviceOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-0 text-sm sm:col-span-2">
          Location
          <select
            className={fieldClass}
            value={values.locationLabel}
            onChange={(e) => onChange({ ...values, locationLabel: e.target.value })}
          >
            {locationOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={values.smsOptIn}
            onChange={(e) => onChange({ ...values, smsOptIn: e.target.checked })}
          />
          Patient asked for SMS
        </label>
        <div className="h-5 sm:hidden" aria-hidden />
        <div className="fixed inset-x-0 bottom-0 z-20 flex items-center gap-3 border-t border-black/[0.08] bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:col-span-2 sm:z-auto sm:mt-5 sm:border-0 sm:bg-transparent sm:p-0">
          <button
            type="button"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-black/15 bg-transparent text-[var(--text-dark)] hover:bg-black/[0.04]"
            aria-label="Back"
            onClick={onCancel}
          >
            <ChevronLeft className="size-5" strokeWidth={2.25} aria-hidden />
          </button>
          <button
            type="submit"
            disabled={busy}
            className={PORTAL_PILL}
          >
            {busy ? 'Confirming…' : 'Confirm appointment'}
          </button>
        </div>
      </div>
    </form>
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
            className={PORTAL_PILL_OUTLINE}
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
  unpublished,
  saving,
  publishing,
  success,
  overlayEnabled,
  lastPublishedAt,
  lastPublishedBy,
  unsavedDetail,
  unpublishedDetail,
  successDetail,
  onDiscard,
  onSaveDraft,
  onPublish,
}: {
  dirty: boolean
  unpublished: boolean
  saving: boolean
  publishing: boolean
  success: boolean
  overlayEnabled: boolean
  lastPublishedAt: string | null
  lastPublishedBy: string | null
  unsavedDetail: string
  unpublishedDetail: string
  successDetail: string
  onDiscard: () => void
  onSaveDraft: () => void
  onPublish: () => void
}) {
  if (!dirty && !unpublished && !success && !lastPublishedAt) return null
  const busy = saving || publishing
  const showSuccess = success && !dirty
  return (
    <div
      data-testid="publish-bar"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.06] bg-[#f4f2ec]/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <div className="mx-auto max-w-5xl space-y-2">
        {lastPublishedAt && !showSuccess ? (
          <p className="text-xs text-[var(--text-dark)]/55">
            Last published: {formatLastPublished(lastPublishedAt)}
            {` · Published by: ${lastPublishedBy || 'Admin'}`}
          </p>
        ) : null}
        {showSuccess ? (
          <div className="rounded-lg border border-accent/30 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-primary">Published just now</p>
            <p className="text-sm text-[var(--text-dark)]/65">
              {overlayEnabled
                ? successDetail
                : 'Saved. The public website overlay is still off, so www has not changed.'}
            </p>
          </div>
        ) : null}
        {dirty ? (
          <div className="flex flex-col gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--text-dark)]">Unsaved changes</p>
              <p className="text-sm text-[var(--text-dark)]/60">{unsavedDetail}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-medium text-[var(--text-dark)]/70 hover:bg-black/[0.04]"
                disabled={busy}
                onClick={onDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className={PORTAL_PILL}
                disabled={busy}
                onClick={onSaveDraft}
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button
                type="button"
                className={PORTAL_PILL}
                disabled={busy}
                onClick={onPublish}
              >
                {publishing ? 'Publishing…' : 'Publish'}
              </button>
            </div>
          </div>
        ) : unpublished ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-dark)]">Draft saved</p>
              <p className="text-sm text-[var(--text-dark)]/60">{unpublishedDetail}</p>
            </div>
            <button
              type="button"
              className={`${PORTAL_PILL} shrink-0`}
              disabled={busy}
              onClick={onPublish}
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </button>
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
      <nav className="no-scrollbar flex min-w-0 gap-1 overflow-x-auto sm:overflow-visible">
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
  open,
  onToggle,
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
  open: boolean
  onToggle: () => void
  onTagChange: (next: string) => void
  onEmphasisChange: (next: string) => void
  onSuggestEmphasis: () => void
  onSaveTagAndHighlight: () => void
  onConfirm: () => void
  onReject: () => void
  onUnpublish: () => void
  onRestore: () => void
}) {
  const panelId = useId()
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
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-start justify-between gap-2">
            <span className="font-medium text-[var(--text-dark)]">{name}</span>
            <RatingStars rating={rating} />
          </span>
          {bucket === 'rejected' && condition ? (
            <span className="mt-1 block text-xs text-secondary">{condition}</span>
          ) : null}
          <span className="mt-1 block text-xs text-secondary">
            {reviewedAt || ''}
            {source ? ` · ${source}` : ''}
          </span>
        </span>
        <ChevronDown
          className={`mt-0.5 h-4 w-4 shrink-0 text-[var(--text-dark)]/45 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>
      {open ? (
        <div id={panelId}>
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
                <textarea
                  className={`mt-1 w-full resize-y rounded-md border px-2 py-1.5 text-sm ${
                    phraseError ? 'border-red-400' : 'border-black/10'
                  }`}
                  rows={3}
                  value={emphasisValue}
                  onChange={(e) => onEmphasisChange(e.target.value.replace(/\r?\n/g, ' '))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.preventDefault()
                  }}
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
                className={PORTAL_PILL}
                onClick={onSuggestEmphasis}
              >
                Suggest from review
              </button>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={PORTAL_PILL}
                  onClick={saveEdits}
                >
                  Save tag & highlight
                </button>
                {bucket === 'pending' ? (
                  <>
                    <button
                      type="button"
                      className={PORTAL_PILL}
                      onClick={() => {
                        if (phraseError) return
                        onConfirm()
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className={PORTAL_PILL}
                      onClick={onReject}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={PORTAL_PILL}
                      onClick={onUnpublish}
                    >
                      Unpublish
                    </button>
                    <button
                      type="button"
                      className={PORTAL_PILL}
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
                className={PORTAL_PILL}
                onClick={onRestore}
              >
                Restore
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
