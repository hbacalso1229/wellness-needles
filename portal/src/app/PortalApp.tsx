'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SITE_DEFAULTS,
  buildHoursDisplay,
  parseSiteSnapshot,
  type PriceList,
  type SiteSnapshot,
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
import {
  CONDITION_MAX_LEN,
  parseHalfStarRating,
} from '../../../shared/review-rating'
import { HalfStarPicker, RatingStars } from '../../../src/features/ui/RatingStars'
import { PhoneCountrySelect } from '../../../src/features/ui/PhoneCountrySelect'
import {
  Card,
  CompactEuroField,
  HoursEditor,
  PageHeader,
  UnsavedBar,
  discountPercentLabel,
  snapshotsEqual,
} from './portal-ui'

type TabId = 'bookings' | 'reviews' | 'pricing' | 'contact' | 'settings'

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
  status?: string
  name: string
  excerpt?: string
  body?: string
  condition?: string
  source?: string
  rating?: number
  reviewedAt?: string
  emphasis?: string
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
  { id: 'bookings', label: 'Bookings' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Contact' },
  { id: 'settings', label: 'Settings' },
]

const PRICE_ROWS: ReadonlyArray<[keyof PriceList, string]> = [
  ['initial', 'Initial Consultation'],
  ['followUp', 'Follow-up Treatment'],
  ['package5', '5-Session Package'],
  ['package10', '10-Session Package'],
  ['cupping', 'Cupping'],
]

function originalKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicOriginal' | 'homeVisitOriginal' {
  return kind === 'inClinic' ? 'inClinicOriginal' : 'homeVisitOriginal'
}

function reviewBucket(status?: string): 'pending' | 'confirmed' | 'rejected' {
  if (status === 'approved') return 'confirmed'
  if (status === 'rejected' || status === 'cancelled') return 'rejected'
  return 'pending'
}

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
  const [baseline, setBaseline] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [publishing, setPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [newReviewName, setNewReviewName] = useState('')
  const [newReviewExcerpt, setNewReviewExcerpt] = useState('')
  const [newReviewRating, setNewReviewRating] = useState<number | null>(null)
  const [newReviewCondition, setNewReviewCondition] = useState('')
  const [newReviewSource, setNewReviewSource] = useState('Verified Google review')
  const [newReviewEmphasis, setNewReviewEmphasis] = useState('')
  const [newReviewBody, setNewReviewBody] = useState('')
  const [newReviewDate, setNewReviewDate] = useState('')
  const [pendingTags, setPendingTags] = useState<Record<string, string>>({})
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
        setBaseline(parsed)
        setPhoneCountryId(inferPhoneCountry(parsed.phone).id)
      }
      const inbox = await api<{ bookings: BookingRow[] }>('/api/admin/bookings?status=pending')
      setBookings(inbox.bookings || [])
      const allReviews = await api<{ reviews: ReviewRow[] }>('/api/admin/reviews?status=all')
      const rows = allReviews.reviews || []
      setReviews(rows)
      setPendingTags(
        Object.fromEntries(rows.map((row) => [row.id, row.condition || '']))
      )
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

  const dirty = useMemo(() => snapshotsEqual(draft, baseline) === false, [draft, baseline])
  const lastPublish = history[0]
    ? { at: history[0].changedAt, by: history[0].changedBy }
    : null

  const publish = async () => {
    setPublishing(true)
    try {
      await api('/api/admin/site?action=publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      setBaseline(draft)
      setPublishSuccess(true)
      window.setTimeout(() => setPublishSuccess(false), 6000)
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Publish failed')
    } finally {
      setPublishing(false)
    }
  }

  const discard = () => {
    setDraft(baseline)
    setPhoneCountryId(inferPhoneCountry(baseline.phone).id)
    setPublishSuccess(false)
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
      <header className="sticky top-0 z-10 border-b border-black/[0.08] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-serif text-xl font-semibold leading-tight text-primary">
              Wellness Needles
            </p>
            <p className="text-xs font-medium tracking-wide text-[var(--text-dark)]/50">
              Admin Portal
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[var(--text-dark)]/65">{email || 'Signed in'}</span>
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                tab === item.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[var(--text-dark)]/60 hover:text-primary'
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

      <main className="mx-auto max-w-5xl px-4 py-8 pb-28">
        {loading ? <p className="text-sm text-secondary">Loading…</p> : null}

        {tab === 'bookings' && (
          <section className="space-y-4">
            <PageHeader
              title="Bookings"
              description={`Inbox for ${draft.email.address}. Confirm sets the exact Europe/Dublin start.`}
            />
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
            <PageHeader title="Reviews" />
            <form
              className="space-y-2 rounded-xl border border-accent/20 bg-white p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const rating = parseHalfStarRating(newReviewRating)
                if (rating == null) {
                  show('Choose a star rating')
                  return
                }
                const bodyText = newReviewBody.trim() || newReviewExcerpt.trim()
                try {
                  await api('/api/admin/reviews', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: newReviewName,
                      rating,
                      condition: newReviewCondition,
                      reviewedAt: newReviewDate,
                      source: newReviewSource,
                      emphasis: newReviewEmphasis,
                      excerpt: newReviewExcerpt || bodyText,
                      body: bodyText,
                    }),
                  })
                  setNewReviewName('')
                  setNewReviewExcerpt('')
                  setNewReviewRating(null)
                  setNewReviewCondition('')
                  setNewReviewSource('Verified Google review')
                  setNewReviewEmphasis('')
                  setNewReviewBody('')
                  setNewReviewDate('')
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
              <HalfStarPicker value={newReviewRating} onChange={setNewReviewRating} />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Treatment tag"
                maxLength={CONDITION_MAX_LEN}
                value={newReviewCondition}
                onChange={(e) => setNewReviewCondition(e.target.value)}
              />
              <input
                className="w-full rounded border px-2 py-1"
                type="date"
                value={newReviewDate}
                onChange={(e) => setNewReviewDate(e.target.value)}
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Source (e.g. Verified Google review)"
                value={newReviewSource}
                onChange={(e) => setNewReviewSource(e.target.value)}
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Phrase to bold (optional)"
                value={newReviewEmphasis}
                onChange={(e) => setNewReviewEmphasis(e.target.value)}
              />
              <textarea
                className="w-full rounded border px-2 py-1"
                placeholder="Full review"
                value={newReviewBody}
                onChange={(e) => setNewReviewBody(e.target.value)}
                required
              />
              <textarea
                className="w-full rounded border px-2 py-1"
                placeholder="Short quote (optional)"
                value={newReviewExcerpt}
                onChange={(e) => setNewReviewExcerpt(e.target.value)}
              />
              <button type="submit" className="rounded-full bg-primary px-3 py-1.5 text-sm text-white">
                Save pending
              </button>
            </form>
            {(
              [
                ['pending', 'Pending'],
                ['confirmed', 'Confirmed'],
                ['rejected', 'Rejected'],
              ] as const
            ).map(([bucket, heading]) => {
              const rows = reviews.filter((row) => reviewBucket(row.status) === bucket)
              return (
                <div key={bucket} className="space-y-2">
                  <h2 className="text-base font-semibold">{heading}</h2>
                  {rows.length === 0 ? (
                    <p className="text-sm text-secondary">None.</p>
                  ) : (
                    <ul className="space-y-3">
                      {rows.map((row) => (
                        <li
                          key={row.id}
                          className="rounded-xl border border-accent/20 bg-white p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{row.name}</p>
                            <RatingStars rating={row.rating ?? 0} />
                          </div>
                          {row.condition ? (
                            <p className="mt-1 text-xs text-secondary">{row.condition}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-secondary">
                            {row.reviewedAt || ''}
                            {row.source ? ` · ${row.source}` : ''}
                          </p>
                          <p className="mt-2 text-sm italic">{row.body || row.excerpt}</p>
                          {bucket === 'pending' ? (
                            <div className="mt-2 space-y-2">
                              <label className="block text-sm">
                                Treatment tag
                                <input
                                  className="mt-1 w-full rounded border px-2 py-1"
                                  maxLength={CONDITION_MAX_LEN}
                                  value={pendingTags[row.id] ?? row.condition ?? ''}
                                  onChange={(e) =>
                                    setPendingTags((prev) => ({
                                      ...prev,
                                      [row.id]: e.target.value,
                                    }))
                                  }
                                />
                              </label>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  className="rounded-full border px-3 py-1.5 text-sm"
                                  onClick={async () => {
                                    await api(`/api/admin/reviews/${row.id}`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        action: 'update',
                                        condition: pendingTags[row.id] ?? row.condition,
                                      }),
                                    })
                                    show('Tag saved')
                                    await load()
                                  }}
                                >
                                  Save tag
                                </button>
                                <button
                                  type="button"
                                  className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                                  onClick={async () => {
                                    const tag = pendingTags[row.id]
                                    if (tag !== undefined && tag !== (row.condition || '')) {
                                      await api(`/api/admin/reviews/${row.id}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          action: 'update',
                                          condition: tag,
                                        }),
                                      })
                                    }
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
                                      body: JSON.stringify({ action: 'reject' }),
                                    })
                                    await load()
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-xs font-medium uppercase tracking-wide text-secondary">
                              {bucket === 'confirmed' ? 'Confirmed' : 'Rejected'}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}
          </section>
        )}

        {tab === 'pricing' && (
          <section className="space-y-5">
            <PageHeader
              title="Pricing"
              description="Manage the prices shown on your booking page. Update clinic and home-visit pricing, then publish your changes when you're ready."
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {(['inClinic', 'homeVisit'] as const).map((kind) => (
                <Card key={kind} title={kind === 'inClinic' ? 'In clinic' : 'Home visit'}>
                  <div className="space-y-3">
                    {PRICE_ROWS.map(([key, label]) => {
                      const origKey = originalKind(kind)
                      const original = draft.pricing[origKey][key]
                      const discounted = draft.pricing[kind][key]
                      const off = discountPercentLabel(original, discounted)
                      return (
                        <div
                          key={key}
                          className="border-b border-black/[0.06] pb-3 last:border-0 last:pb-0"
                        >
                          <p className="mb-2 text-sm font-medium">{label}</p>
                          <div className="flex flex-wrap items-end gap-2">
                            <CompactEuroField
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
                            <CompactEuroField
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
                            {off ? (
                              <span className="mb-1.5 shrink-0 text-xs font-medium text-secondary">
                                {off}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </div>
            <UnsavedBar
              dirty={dirty}
              publishing={publishing}
              success={publishSuccess}
              overlayEnabled={draft.websiteOverlayEnabled}
              lastPublishedAt={lastPublish?.at ?? null}
              lastPublishedBy={lastPublish?.by ?? null}
              onDiscard={discard}
              onPublish={() => void publish()}
            />
          </section>
        )}

        {tab === 'contact' && (
          <section className="space-y-5">
            <PageHeader
              title="Contact & Business Information"
              description="Manage the contact details, social links, and business hours displayed on your website."
            />
            <Card title="Contact details">
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Phone
                  <span className="relative mt-1 flex rounded-md border border-black/10 bg-white">
                    <PhoneCountrySelect
                      value={phoneCountry}
                      onChange={(nextCountry) => {
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
                    />
                    <input
                      type="tel"
                      className="min-w-0 flex-1 border-0 px-2 py-1.5 outline-none"
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
                <label className="block text-sm font-medium">
                  Email
                  <input
                    className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5"
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
              </div>
            </Card>
            <Card title="Social links">
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Facebook
                  <span className="mt-0.5 block text-xs font-normal text-[var(--text-dark)]/50">
                    facebook.com/…
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5"
                    value={draft.social.facebookUrl}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        social: { ...draft.social, facebookUrl: e.target.value },
                      })
                    }
                  />
                </label>
                <label className="block text-sm font-medium">
                  Instagram
                  <span className="mt-0.5 block text-xs font-normal text-[var(--text-dark)]/50">
                    instagram.com/…
                  </span>
                  <input
                    className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5"
                    value={draft.social.instagramUrl}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        social: { ...draft.social, instagramUrl: e.target.value },
                      })
                    }
                  />
                </label>
              </div>
            </Card>
            <Card title="Business hours">
              <HoursEditor
                hours={draft.hours}
                onChange={(hours) =>
                  setDraft({
                    ...draft,
                    hours,
                    hoursDisplay: buildHoursDisplay(hours),
                  })
                }
              />
            </Card>
            <UnsavedBar
              dirty={dirty}
              publishing={publishing}
              success={publishSuccess}
              overlayEnabled={draft.websiteOverlayEnabled}
              lastPublishedAt={lastPublish?.at ?? null}
              lastPublishedBy={lastPublish?.by ?? null}
              onDiscard={discard}
              onPublish={() => void publish()}
            />
          </section>
        )}

        {tab === 'settings' && (
          <section className="space-y-5">
            <PageHeader title="Settings" />
            <Card>
              <div className="space-y-3">
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
              <label className="block text-sm font-medium">
                Clinic name
                <input
                  className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5"
                  value={draft.clinicName}
                  onChange={(e) => setDraft({ ...draft, clinicName: e.target.value })}
                />
              </label>
              <p className="text-sm font-medium">Insurance</p>
              {draft.insurers.map((insurer, index) => (
                <div key={insurer.id} className="flex flex-wrap items-center gap-2 text-sm">
                  <input
                    className="rounded-md border border-black/10 px-2 py-1.5"
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
            </Card>
            <Card title="Change History">
              <ChangeHistory rows={history} />
            </Card>
            <UnsavedBar
              dirty={dirty}
              publishing={publishing}
              success={publishSuccess}
              overlayEnabled={draft.websiteOverlayEnabled}
              lastPublishedAt={lastPublish?.at ?? null}
              lastPublishedBy={lastPublish?.by ?? null}
              onDiscard={discard}
              onPublish={() => void publish()}
            />
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
  if (groups.length === 0) {
    return <p className="text-sm text-[var(--text-dark)]/60">No published changes yet.</p>
  }
  return (
    <ul className="space-y-4">
      {groups.map((group) => (
        <li key={group.publishId} className="border-b border-black/[0.06] pb-4 last:border-0 last:pb-0">
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
  )
}

