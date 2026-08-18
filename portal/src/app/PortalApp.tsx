'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  SITE_DEFAULTS,
  buildHoursDisplay,
  euroPrice,
  formatHourLabel,
  parseSiteSnapshot,
  priceDigits,
  pricesDiffer,
  type PriceList,
  type SiteSnapshot,
  type Weekday,
} from '../../../shared/site-snapshot'
import {
  DEFAULT_PHONE_COUNTRY_ID,
  PHONE_COUNTRIES,
  getPhoneCountry,
  type PhoneCountry,
} from '../../../src/lib/phone-countries'
import {
  formatLocalPhoneInput,
  subscriberDigits,
  toE164,
} from '../../../src/lib/irish-phone'

type TabId = 'bookings' | 'reviews' | 'pricing' | 'contact' | 'settings' | 'history'

type BookingRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType?: string
  locationLabel?: string
  preferredDate?: string
  preferredTime?: string
  smsOptIn?: number
  createdAt?: string
}

type ReviewRow = {
  id: string
  name: string
  excerpt?: string
  source?: string
  reviewedAt?: string
}

type HistoryRow = {
  id: string
  publishId: string
  changedAt: string
  changedBy: string
  action: 'update' | 'add' | 'delete' | string
  fieldPath: string
  fieldLabel: string
  fromValue: string
  toValue: string
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'bookings', label: 'Booking Email' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact Info' },
  { id: 'history', label: 'Change History' },
  { id: 'settings', label: 'System Settings' },
]

const PRICE_ROWS: ReadonlyArray<[keyof PriceList, string]> = [
  ['initial', 'Initial'],
  ['followUp', 'Follow-up'],
  ['package5', '5 sessions'],
  ['package10', '10 sessions'],
  ['cupping', 'Cupping'],
]

function originalKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicOriginal' | 'homeVisitOriginal' {
  return kind === 'inClinic' ? 'inClinicOriginal' : 'homeVisitOriginal'
}

const DISPLAY_DAYS: ReadonlyArray<[label: string, key: Weekday]> = [
  ['Monday', 'monday'],
  ['Tuesday', 'tuesday'],
  ['Wednesday', 'wednesday'],
  ['Thursday', 'thursday'],
  ['Friday', 'friday'],
  ['Saturday', 'saturday'],
  ['Sunday', 'sunday'],
]

function inferPhoneCountry(phone: SiteSnapshot['phone']): PhoneCountry {
  const hay = `${phone.href} ${phone.displayText} ${phone.number}`
  const digits = hay.replace(/\D/g, '')
  let match = getPhoneCountry(DEFAULT_PHONE_COUNTRY_ID)
  let best = 0
  for (const country of PHONE_COUNTRIES) {
    const code = country.dial.replace(/\D/g, '')
    if (digits.startsWith(code) && code.length > best) {
      match = country
      best = code.length
    }
  }
  return match
}

function phoneSnapshot(country: PhoneCountry, rawLocal: string): SiteSnapshot['phone'] {
  const local = subscriberDigits(rawLocal, country)
  const grouped = formatLocalPhoneInput(local, country)
  const displayText = toE164(local, country)
  const href = local ? `tel:+${country.dial.replace(/\D/g, '')}${local}` : ''
  const number = country.id === 'IE' && local ? `0${local}` : local
  const formatted = country.id === 'IE' && local ? `0${grouped}` : grouped
  return { number, formatted, displayText, href }
}

/** Native time inputs may emit HH:mm:ss; snapshot parse requires HH:mm. */
function toHhmm(value: string, fallback: string): string {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)/.exec(value.trim())
  if (!match) return fallback
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

function EuroField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="block min-w-0 flex-1 text-sm">
      {label}
      <span className="mt-1 flex rounded border bg-white">
        <span className="select-none px-2 py-1 text-[var(--text-dark)]/55" aria-hidden>
          €
        </span>
        <input
          className="min-w-0 flex-1 rounded-r border-0 px-2 py-1 outline-none"
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

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const json = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

export function PortalApp() {
  const [tab, setTab] = useState<TabId>('bookings')
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [newReviewName, setNewReviewName] = useState('')
  const [newReviewExcerpt, setNewReviewExcerpt] = useState('')
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID)
  const phoneCountry = getPhoneCountry(phoneCountryId)

  const show = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const me = await api<{ email: string }>('/api/admin/me')
      setEmail(me.email)
      const site = await api<SiteSnapshot>('/api/admin/site')
      const parsed = parseSiteSnapshot(site)
      if (parsed) {
        setDraft(parsed)
        setPhoneCountryId(inferPhoneCountry(parsed.phone).id)
      }
      const inbox = await api<{ bookings: BookingRow[] }>('/api/admin/bookings?status=pending')
      setBookings(inbox.bookings || [])
      const pending = await api<{ reviews: ReviewRow[] }>('/api/admin/reviews?status=pending')
      setReviews(pending.reviews || [])
      try {
        const log = await api<{ changes: HistoryRow[] }>('/api/admin/site-history')
        setHistory(log.changes || [])
      } catch {
        setHistory([])
      }
    } catch (error) {
      show(error instanceof Error ? error.message : 'Could not load portal')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const publish = async () => {
    try {
      await api('/api/admin/site?action=publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      show('Published to website')
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Publish failed')
    }
  }

  const confirmBooking = async (id: string) => {
    try {
      await api(`/api/admin/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', startsAtLocal }),
      })
      setConfirmId(null)
      setStartsAtLocal('')
      show('Booking confirmed')
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Confirm failed')
    }
  }

  const cancelBooking = async (id: string) => {
    try {
      await api(`/api/admin/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      show('Cancel notice sent')
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Cancel failed')
    }
  }

  const logout = () => {
    window.location.href = '/cdn-cgi/access/logout'
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/5 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-serif text-lg font-semibold text-primary">
            Wellness Needles - Admin Portal
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[var(--text-dark)]/70">{email || 'Signed in'}</span>
            <button type="button" className="text-primary underline" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
                tab === item.id ? 'bg-primary text-white' : 'text-primary hover:bg-accent/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {toast ? (
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <p className="rounded-lg bg-accent/20 px-3 py-2 text-sm text-primary">{toast}</p>
        </div>
      ) : null}

      <main className="mx-auto max-w-5xl px-4 py-6">
        {loading ? <p className="text-sm text-secondary">Loading…</p> : null}

        {tab === 'bookings' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Booking Email</h1>
            <p className="text-sm text-secondary">
              Inbox for {draft.email.address}. Confirm sets the exact Europe/Dublin start.
            </p>
            {bookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                No requests yet.
              </p>
            ) : (
              <ul className="space-y-3">
                {bookings.map((row) => (
                  <li key={row.id} className="rounded-xl border border-accent/20 bg-white p-4">
                    <p className="font-medium">
                      {row.firstName} {row.lastName}
                    </p>
                    <p className="text-sm text-secondary">
                      {row.phone} · {row.email}
                    </p>
                    <p className="text-sm">
                      {row.serviceType} · {row.preferredDate} {row.preferredTime}
                    </p>
                    <p className="text-xs text-secondary">
                      SMS opt-in: {row.smsOptIn ? 'yes' : 'no'}
                    </p>
                    {confirmId === row.id ? (
                      <div className="mt-3 flex flex-wrap items-end gap-2">
                        <label className="text-sm">
                          Exact start
                          <input
                            type="datetime-local"
                            className="mt-1 block rounded border px-2 py-1"
                            value={startsAtLocal}
                            onChange={(e) => setStartsAtLocal(e.target.value)}
                          />
                        </label>
                        <button
                          type="button"
                          className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                          onClick={() => void confirmBooking(row.id)}
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                          onClick={() => setConfirmId(row.id)}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-primary px-3 py-1.5 text-sm text-primary"
                          onClick={() => void cancelBooking(row.id)}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'reviews' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Reviews</h1>
            <form
              className="space-y-2 rounded-xl border border-accent/20 bg-white p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                try {
                  await api('/api/admin/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newReviewName,
                      excerpt: newReviewExcerpt,
                    }),
                  })
                  setNewReviewName('')
                  setNewReviewExcerpt('')
                  show('Review added (pending)')
                  await load()
                } catch (error) {
                  show(error instanceof Error ? error.message : 'Could not add review')
                }
              }}
            >
              <p className="text-sm font-medium">Add a review</p>
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Name"
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                required
              />
              <textarea
                className="w-full rounded border px-2 py-1"
                placeholder="Short quote"
                value={newReviewExcerpt}
                onChange={(e) => setNewReviewExcerpt(e.target.value)}
                required
              />
              <button type="submit" className="rounded-full bg-primary px-3 py-1.5 text-sm text-white">
                Save pending
              </button>
            </form>
            {reviews.length === 0 ? (
              <p className="text-sm text-secondary">No pending reviews.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((row) => (
                  <li key={row.id} className="rounded-xl border border-accent/20 bg-white p-4">
                    <p className="font-medium">{row.name}</p>
                    <p className="text-sm italic">{row.excerpt}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                        onClick={async () => {
                          await api(`/api/admin/reviews/${row.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'confirm' }),
                          })
                          show('Review published')
                          await load()
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="rounded-full border px-3 py-1.5 text-sm"
                        onClick={async () => {
                          await api(`/api/admin/reviews/${row.id}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'cancel' }),
                          })
                          await load()
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === 'pricing' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Pricing</h1>
            <div className="grid gap-4 sm:grid-cols-2">
              {(['inClinic', 'homeVisit'] as const).map((kind) => (
                <div key={kind} className="rounded-xl border border-accent/20 bg-white p-4">
                  <h2 className="mb-2 font-medium">
                    {kind === 'inClinic' ? 'In clinic' : 'Home visit'}
                  </h2>
                  {PRICE_ROWS.map(([key, label]) => {
                    const origKey = originalKind(kind)
                    const original = draft.pricing[origKey][key]
                    const discounted = draft.pricing[kind][key]
                    const showStrike = pricesDiffer(original, discounted)
                    return (
                      <div
                        key={key}
                        className="mb-3 border-b border-accent/15 pb-3 last:mb-0 last:border-0 last:pb-0"
                      >
                        <p className="mb-2 text-sm font-medium">{label}</p>
                        <div className="flex flex-wrap items-end gap-2">
                          <EuroField
                            label="Original"
                            value={original}
                            onChange={(next) =>
                              setDraft({
                                ...draft,
                                pricing: {
                                  ...draft.pricing,
                                  [origKey]: { ...draft.pricing[origKey], [key]: next },
                                },
                              })
                            }
                          />
                          <EuroField
                            label="Discounted"
                            value={discounted}
                            onChange={(next) =>
                              setDraft({
                                ...draft,
                                pricing: {
                                  ...draft.pricing,
                                  [kind]: { ...draft.pricing[kind], [key]: next },
                                },
                              })
                            }
                          />
                          <div className="mb-1 shrink-0 self-end text-right leading-none">
                            {showStrike ? (
                              <span className="mb-0.5 block text-sm font-semibold tabular-nums text-secondary/70 line-through">
                                {original}
                              </span>
                            ) : null}
                            <span className="block font-serif text-xl font-extrabold tabular-nums text-primary">
                              {discounted || '—'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <PublishBar onPublish={() => void publish()} />
          </section>
        )}

        {tab === 'contact' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Contact Info</h1>
            <div className="rounded-xl border border-accent/20 bg-white p-4 space-y-3">
              <label className="block text-sm">
                Phone display
                <span className="mt-1 flex overflow-hidden rounded border bg-white">
                  <select
                    className="max-w-[11rem] shrink-0 border-r bg-white px-2 py-1"
                    aria-label="Country code"
                    value={phoneCountry.id}
                    onChange={(e) => {
                      const nextCountry = getPhoneCountry(e.target.value)
                      const local = subscriberDigits(
                        draft.phone.displayText || draft.phone.number,
                        phoneCountry
                      )
                      setPhoneCountryId(nextCountry.id)
                      setDraft({
                        ...draft,
                        phone: phoneSnapshot(nextCountry, local),
                      })
                    }}
                  >
                    {PHONE_COUNTRIES.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name} ({country.dial})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="min-w-0 flex-1 border-0 px-2 py-1 outline-none"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    aria-label="Phone number"
                    placeholder={phoneCountry.placeholder}
                    value={formatLocalPhoneInput(
                      draft.phone.displayText || draft.phone.number,
                      phoneCountry
                    )}
                    onChange={(e) => {
                      setDraft({
                        ...draft,
                        phone: phoneSnapshot(phoneCountry, e.target.value),
                      })
                    }}
                  />
                </span>
              </label>
              <label className="block text-sm">
                Email
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={draft.email.address}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      email: {
                        ...draft.email,
                        address: e.target.value,
                        href: `mailto:${e.target.value}`,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-sm">
                Facebook URL
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={draft.social.facebookUrl}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      social: { ...draft.social, facebookUrl: e.target.value },
                    })
                  }
                />
              </label>
              <label className="block text-sm">
                Instagram URL
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={draft.social.instagramUrl}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      social: { ...draft.social, instagramUrl: e.target.value },
                    })
                  }
                />
              </label>
              <div className="rounded-xl border border-accent/20 bg-[var(--bg)]/40 p-3">
                <h2 className="mb-2 text-base font-semibold">Business hours</h2>
                <ul className="space-y-0">
                  {DISPLAY_DAYS.map(([label, day]) => {
                    const row = draft.hours[day]
                    const closed = row.closed
                    return (
                      <li
                        key={day}
                        className="border-b border-accent/15 py-2 last:border-b-0"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="w-28 shrink-0 text-[var(--text-dark)]/70">
                            {label}
                          </span>
                          <span className="shrink-0 text-right font-semibold tabular-nums text-[var(--text-dark)]">
                            {closed
                              ? 'Closed'
                              : `${formatHourLabel(row.open)} – ${formatHourLabel(row.close)}`}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-end gap-2 text-sm">
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={closed}
                              onChange={(e) => {
                                const hours = {
                                  ...draft.hours,
                                  [day]: { ...row, closed: e.target.checked },
                                }
                                setDraft({
                                  ...draft,
                                  hours,
                                  hoursDisplay: buildHoursDisplay(hours),
                                })
                              }}
                            />
                            Closed
                          </label>
                          <input
                            type="time"
                            step={60}
                            className="rounded border px-2 py-1 disabled:opacity-40"
                            aria-label={`${label} opens`}
                            disabled={closed}
                            value={toHhmm(row.open, '09:00')}
                            onChange={(e) => {
                              const hours = {
                                ...draft.hours,
                                [day]: { ...row, open: toHhmm(e.target.value, row.open) },
                              }
                              setDraft({
                                ...draft,
                                hours,
                                hoursDisplay: buildHoursDisplay(hours),
                              })
                            }}
                          />
                          <input
                            type="time"
                            step={60}
                            className="rounded border px-2 py-1 disabled:opacity-40"
                            aria-label={`${label} closes`}
                            disabled={closed}
                            value={toHhmm(row.close, '20:00')}
                            onChange={(e) => {
                              const hours = {
                                ...draft.hours,
                                [day]: { ...row, close: toHhmm(e.target.value, row.close) },
                              }
                              setDraft({
                                ...draft,
                                hours,
                                hoursDisplay: buildHoursDisplay(hours),
                              })
                            }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
            <PublishBar onPublish={() => void publish()} />
          </section>
        )}

        {tab === 'settings' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">System Settings</h1>
            <div className="rounded-xl border border-accent/20 bg-white p-4 space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.websiteOverlayEnabled}
                  onChange={(e) =>
                    setDraft({ ...draft, websiteOverlayEnabled: e.target.checked })
                  }
                />
                <span>
                  Show portal changes on the public website (off by default — www stays as
                  today until you publish this on).
                </span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.features.bookingFormEnabled}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      features: {
                        ...draft.features,
                        bookingFormEnabled: e.target.checked,
                      },
                    })
                  }
                />
                Booking form
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.features.calendlyEnabled}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      features: { ...draft.features, calendlyEnabled: e.target.checked },
                    })
                  }
                />
                Calendly
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.features.freshaEnabled}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      features: { ...draft.features, freshaEnabled: e.target.checked },
                    })
                  }
                />
                Fresha
              </label>
              <label className="block text-sm">
                Clinic name
                <input
                  className="mt-1 w-full rounded border px-2 py-1"
                  value={draft.clinicName}
                  onChange={(e) => setDraft({ ...draft, clinicName: e.target.value })}
                />
              </label>
              <p className="text-sm font-medium">Insurance</p>
              {draft.insurers.map((insurer, index) => (
                <div key={insurer.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    className="rounded border px-2 py-1"
                    value={insurer.name}
                    onChange={(e) => {
                      const insurers = [...draft.insurers]
                      insurers[index] = { ...insurer, name: e.target.value }
                      setDraft({ ...draft, insurers })
                    }}
                  />
                  <label className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={insurer.enabled}
                      onChange={(e) => {
                        const insurers = [...draft.insurers]
                        insurers[index] = { ...insurer, enabled: e.target.checked }
                        setDraft({ ...draft, insurers })
                      }}
                    />
                    On
                  </label>
                </div>
              ))}
            </div>
            <PublishBar onPublish={() => void publish()} />
          </section>
        )}

        {tab === 'history' && (
          <section className="space-y-4">
            <h1 className="text-xl font-semibold">Change History</h1>
            <ChangeHistory rows={history} />
          </section>
        )}
      </main>
    </div>
  )
}

function displayValue(value: string, action: string, side: 'from' | 'to'): string {
  if (value) return value
  if (side === 'from' && action === 'add') return '(empty)'
  if (side === 'to' && action === 'delete') return '(removed)'
  return '(empty)'
}

function formatChangedAt(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleString('en-IE', {
    timeZone: 'Europe/Dublin',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function groupHistory(rows: HistoryRow[]): Array<{
  publishId: string
  changedAt: string
  changedBy: string
  rows: HistoryRow[]
}> {
  const groups: Array<{
    publishId: string
    changedAt: string
    changedBy: string
    rows: HistoryRow[]
  }> = []
  const index = new Map<string, (typeof groups)[number]>()
  for (const row of rows) {
    let group = index.get(row.publishId)
    if (!group) {
      group = {
        publishId: row.publishId,
        changedAt: row.changedAt,
        changedBy: row.changedBy,
        rows: [],
      }
      index.set(row.publishId, group)
      groups.push(group)
    }
    group.rows.push(row)
  }
  return groups
}

function ChangeHistory({ rows }: { rows: HistoryRow[] }) {
  const groups = groupHistory(rows)
  return (
    <section className="space-y-3">
      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
          No published changes yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li
              key={group.publishId}
              className="rounded-xl border border-accent/20 bg-white p-4"
            >
              <p className="text-sm font-medium">
                {formatChangedAt(group.changedAt)}
                {group.changedBy ? (
                  <span className="font-normal text-secondary"> · {group.changedBy}</span>
                ) : null}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {group.rows.map((row) => (
                  <li key={row.id}>
                    <span className="font-medium">{row.fieldLabel}</span>
                    <span className="text-secondary"> · </span>
                    <span>{displayValue(row.fromValue, row.action, 'from')}</span>
                    <span className="text-secondary"> → </span>
                    <span>{displayValue(row.toValue, row.action, 'to')}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PublishBar({ onPublish }: { onPublish: () => void }) {
  return (
    <div className="sticky bottom-3 rounded-full border border-primary/20 bg-white px-4 py-3 shadow">
      <button
        type="button"
        onClick={onPublish}
        className="w-full rounded-full bg-primary py-2 text-sm font-medium text-white"
      >
        Publish to website
      </button>
    </div>
  )
}
