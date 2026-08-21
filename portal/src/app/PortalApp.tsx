'use client'

import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import {
  SITE_DEFAULTS,
  buildHoursDisplay,
  composeLocation,
  createUnifiedPricingExtra,
  createSiteInsurer,
  parseSiteSnapshot,
  BOOKABLE_PRICE_KEYS,
  DEFAULT_SERVICE_COPY,
  isBookableExtraKind,
  isBookablePriceKey,
  mergePricingExtras,
  splitUnifiedPricingExtras,
  type PriceList,
  type PricingExtraKind,
  type ServiceCopyItem,
  type SiteSnapshot,
  type UnifiedPricingExtra,
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
  suggestEmphasis,
} from '../../../shared/review-rating'
import { HalfStarPicker } from '../../../src/features/ui/RatingStars'
import { PhoneCountrySelect } from '../../../src/features/ui/PhoneCountrySelect'
import {
  Card,
  CompactEuroField,
  DublinStartPicker,
  DurationMinutesField,
  FullWidthDateField,
  HoursEditor,
  BookingCardDetails,
  OnOffSwitch,
  PageHeader,
  ReviewCard,
  ReviewStatusTabs,
  UnsavedBar,
  discountPercentLabel,
  durationPhrase,
  formatYmdDisplay,
  snapshotsEqual,
  type ReviewStatusTab,
} from './portal-ui'
import { AddressSearch } from './AddressSearch'
import { LocationPreview } from './LocationPreview'
import { snapDateTimeLocalToQuarterHour, utcIsoToDublinDateTimeLocal } from '../../../shared/quarter-hour'
import {
  SERVICE_TYPE_IN_CLINIC,
  publishedLocationOptions,
  publishedServiceLabels,
  publishedServiceTypes,
} from '../../../shared/booking-options'

type TabId = 'appointments' | 'reviews' | 'pricing' | 'contact' | 'settings' | 'history'
type BookingInboxTab = 'pending' | 'confirmed' | 'cancelled'

type BookingRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceType?: string
  locationLabel?: string
  serviceLabel?: string
  preferredDate?: string
  preferredTime?: string
  startsAt?: string
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
  { id: 'appointments', label: 'Appointments' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'contact', label: 'Business Info' },
  { id: 'history', label: 'Change History' },
  { id: 'settings', label: 'Settings' },
]

const PRICE_ROWS: ReadonlyArray<[keyof PriceList, string]> = [
  ['initial', 'Initial Consultation'],
  ['followUp', 'Follow-up Treatment'],
  ['package5', '5-Session Package'],
  ['package10', '10-Session Package'],
  ['cupping', 'Cupping'],
  ['moxibustion', 'Moxibustion'],
]

function priceRowKindLabel(key: keyof PriceList): 'Service' | 'Package' | 'Add-on' {
  if (key === 'cupping' || key === 'moxibustion') return 'Add-on'
  if (key === 'package5' || key === 'package10') return 'Package'
  return 'Service'
}

function originalKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicOriginal' | 'homeVisitOriginal' {
  return kind === 'inClinic' ? 'inClinicOriginal' : 'homeVisitOriginal'
}

const EXTRA_KIND_OPTIONS: ReadonlyArray<{ id: PricingExtraKind; label: string }> = [
  { id: 'service', label: 'Service' },
  { id: 'package', label: 'Package' },
  { id: 'addon', label: 'Add-on' },
]

function extraKindLabel(kind: PricingExtraKind): string {
  if (kind === 'service') return 'Service'
  if (kind === 'package') return 'Package'
  return 'Add-on'
}

function extrasKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicExtras' | 'homeVisitExtras' {
  return kind === 'inClinic' ? 'inClinicExtras' : 'homeVisitExtras'
}

function itemsKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicItems' | 'homeVisitItems' {
  return kind === 'inClinic' ? 'inClinicItems' : 'homeVisitItems'
}

function categoryEnabledKind(
  kind: 'inClinic' | 'homeVisit'
): 'inClinicEnabled' | 'homeVisitEnabled' {
  return kind === 'inClinic' ? 'inClinicEnabled' : 'homeVisitEnabled'
}

function bookableOnCount(
  pricing: SiteSnapshot['pricing'],
  kind: 'inClinic' | 'homeVisit'
): number {
  const items = pricing[itemsKind(kind)]
  const extras = pricing[extrasKind(kind)]
  return (
    BOOKABLE_PRICE_KEYS.filter((key) => items[key]).length +
    extras.filter(
      (row) => isBookableExtraKind(row.kind) && row.enabled && Boolean(row.price.trim())
    ).length
  )
}

function UnifiedExtrasEditor({
  draft,
  setDraft,
  bookableOnCount: countBookable,
}: {
  draft: SiteSnapshot
  setDraft: Dispatch<SetStateAction<SiteSnapshot>>
  bookableOnCount: (
    pricing: SiteSnapshot['pricing'],
    kind: 'inClinic' | 'homeVisit'
  ) => number
}) {
  const unifiedExtras = mergePricingExtras(
    draft.pricing.inClinicExtras,
    draft.pricing.homeVisitExtras
  )
  const writeExtras = (rows: UnifiedPricingExtra[]) => {
    const { inClinicExtras, homeVisitExtras } = splitUnifiedPricingExtras(rows)
    setDraft((current) => ({
      ...current,
      pricing: { ...current.pricing, inClinicExtras, homeVisitExtras },
    }))
  }
  const patchUnified = (id: string, patch: Partial<UnifiedPricingExtra>) =>
    writeExtras(unifiedExtras.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  return (
    <div className="space-y-3">
      {unifiedExtras.map((extra) => {
        const lastBookable =
          extra.enabled &&
          isBookableExtraKind(extra.kind) &&
          ((draft.pricing.inClinicEnabled &&
            Boolean(extra.inClinic.price.trim()) &&
            countBookable(draft.pricing, 'inClinic') <= 1) ||
            (draft.pricing.homeVisitEnabled &&
              Boolean(extra.homeVisit.price.trim()) &&
              countBookable(draft.pricing, 'homeVisit') <= 1))
        return (
          <div
            key={extra.id}
            className="rounded-lg border border-black/[0.08] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="text-base font-semibold text-[var(--text-dark)]">
                  {extra.name.trim() || extraKindLabel(extra.kind)}
                </p>
                <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--text-dark)]/55">
                  {extraKindLabel(extra.kind)}
                </span>
              </div>
              <OnOffSwitch
                checked={extra.enabled}
                disabled={lastBookable}
                ariaLabel={`${extra.enabled ? 'Disable' : 'Enable'} ${extra.name || extra.kind}`}
                onChange={(enabled) => {
                  if (!enabled && lastBookable) return
                  patchUnified(extra.id, { enabled })
                }}
              />
            </div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-dark)]/60">
              Type
              <select
                className="mt-1 w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm font-normal"
                value={extra.kind}
                aria-label={`${extra.name || 'Item'} type`}
                onChange={(e) =>
                  patchUnified(extra.id, { kind: e.target.value as PricingExtraKind })
                }
              >
                {EXTRA_KIND_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="mb-2 block text-xs font-medium text-[var(--text-dark)]/60">
              Name
              <input
                className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm font-normal"
                value={extra.name}
                onChange={(e) => patchUnified(extra.id, { name: e.target.value })}
              />
            </label>
            <label className="mb-2 block text-xs font-medium text-[var(--text-dark)]/60">
              Description
              <textarea
                rows={3}
                className="mt-1 w-full min-h-[4.5rem] resize-y rounded-md border border-black/10 px-2 py-1.5 text-sm font-normal"
                value={extra.description}
                onChange={(e) => patchUnified(extra.id, { description: e.target.value })}
              />
            </label>
            {extra.kind === 'service' ? (
              <DurationMinutesField
                value={extra.durationMinutes || 0}
                onChange={(durationMinutes) => patchUnified(extra.id, { durationMinutes })}
              />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              {(['inClinic', 'homeVisit'] as const).map((channel) => {
                const prices = extra[channel]
                const off = discountPercentLabel(prices.original, prices.price)
                const categoryOn = draft.pricing[categoryEnabledKind(channel)]
                return (
                  <div
                    key={channel}
                    className={`rounded-md border border-black/[0.06] bg-[#faf9f6] px-3 py-3 ${
                      categoryOn ? '' : 'opacity-50'
                    }`}
                  >
                    <p className="mb-2 text-xs font-medium text-[var(--text-dark)]/60">
                      {channel === 'inClinic' ? 'In clinic' : 'Home visit'}
                    </p>
                    <div className="space-y-2">
                      <CompactEuroField
                        label="Original"
                        emphasis="muted"
                        value={prices.original}
                        onChange={(next) =>
                          patchUnified(extra.id, {
                            [channel]: { ...prices, original: next },
                          })
                        }
                      />
                      <CompactEuroField
                        label="Discounted"
                        emphasis="strong"
                        value={prices.price}
                        onChange={(next) =>
                          patchUnified(extra.id, {
                            [channel]: { ...prices, price: next },
                          })
                        }
                      />
                      {off ? <p className="text-xs text-primary">{off}</p> : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
          onClick={() => writeExtras([...unifiedExtras, createUnifiedPricingExtra('service')])}
        >
          Add service
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
          onClick={() => writeExtras([...unifiedExtras, createUnifiedPricingExtra('package')])}
        >
          Add package
        </button>
        <button
          type="button"
          className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
          onClick={() => writeExtras([...unifiedExtras, createUnifiedPricingExtra('addon')])}
        >
          Add add-on
        </button>
      </div>
    </div>
  )
}

function reviewBucket(status?: string): 'pending' | 'confirmed' | 'rejected' {
  if (status === 'approved') return 'confirmed'
  if (status === 'rejected' || status === 'cancelled') return 'rejected'
  return 'pending'
}

function reviewMatchesQuery(
  row: {
    name: string
    condition?: string
    source?: string
    reviewedAt?: string
    body?: string
    excerpt?: string
    emphasis?: string
  },
  query: string
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    row.name,
    row.condition,
    row.source,
    row.reviewedAt,
    row.body,
    row.excerpt,
    row.emphasis,
  ]
    .filter((value): value is string => Boolean(value))
    .join('\n')
    .toLowerCase()
    .includes(q)
}

function bookingMatchesQuery(row: BookingRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const phoneDigits = (row.phone || '').replace(/\D/g, '')
  const queryDigits = q.replace(/\D/g, '')
  if (queryDigits && phoneDigits.includes(queryDigits)) return true
  return [
    row.firstName,
    row.lastName,
    `${row.firstName || ''} ${row.lastName || ''}`,
    row.email,
    row.phone,
    row.serviceType,
    row.serviceLabel,
    row.locationLabel,
    row.preferredDate,
    row.preferredTime,
    formatDublinSlot(row.startsAt),
  ]
    .filter((value): value is string => Boolean(value))
    .join('\n')
    .toLowerCase()
    .includes(q)
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

function looksLikeEircode(value: string): boolean {
  const text = value.trim()
  if (!text) return true
  return /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i.test(text)
}

function formatDublinSlot(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

function formatPreferredWhen(date?: string, time?: string): string {
  const day = (date || '').trim()
  const window = (time || '').trim()
  const pretty = day ? formatYmdDisplay(day) : ''
  return [pretty, window].filter(Boolean).join(' ')
}

function dublinTodayYmd(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
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

async function uploadInsuranceLogo(id: string, file: File): Promise<string> {
  const form = new FormData()
  form.append('id', id)
  form.append('file', file)
  const res = await fetch('/api/admin/insurance-logo', {
    method: 'POST',
    credentials: 'include',
    body: form,
  })
  const json = (await res.json()) as { url?: string; error?: string }
  if (!res.ok || !json.url) throw new Error(json.error || res.statusText)
  return json.url
}

export function PortalApp() {
  const [tab, setTab] = useState<TabId>('appointments')
  const [email, setEmail] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [baseline, setBaseline] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [published, setPublished] = useState<SiteSnapshot>(SITE_DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [publishSuccess, setPublishSuccess] = useState(false)
  const [bookings, setBookings] = useState<BookingRow[]>([])
  const [confirmedBookings, setConfirmedBookings] = useState<BookingRow[]>([])
  const [cancelledBookings, setCancelledBookings] = useState<BookingRow[]>([])
  const [bookingTab, setBookingTab] = useState<BookingInboxTab>('pending')
  const [bookingQuery, setBookingQuery] = useState('')
  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [history, setHistory] = useState<HistoryRow[]>([])
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [rescheduleId, setRescheduleId] = useState<string | null>(null)
  const [openBookingId, setOpenBookingId] = useState<string | null>(null)
  const [openReviewId, setOpenReviewId] = useState<string | null>(null)
  const [startsAtLocal, setStartsAtLocal] = useState('')
  const [rescheduleServiceType, setRescheduleServiceType] = useState(SERVICE_TYPE_IN_CLINIC)
  const [rescheduleLocation, setRescheduleLocation] = useState('')
  const [rescheduleService, setRescheduleService] = useState('')
  const [newReviewName, setNewReviewName] = useState('')
  const [newReviewRating, setNewReviewRating] = useState<number | null>(null)
  const [newReviewCondition, setNewReviewCondition] = useState('')
  const [newReviewSource, setNewReviewSource] = useState('Verified Google review')
  const [newReviewEmphasis, setNewReviewEmphasis] = useState('')
  const [newReviewBody, setNewReviewBody] = useState('')
  const [newReviewDate, setNewReviewDate] = useState(dublinTodayYmd)
  const [pendingTags, setPendingTags] = useState<Record<string, string>>({})
  const [pendingEmphasis, setPendingEmphasis] = useState<Record<string, string>>({})
  const [reviewStatusTab, setReviewStatusTab] = useState<ReviewStatusTab>('pending')
  const [reviewQuery, setReviewQuery] = useState('')
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
      const site = await api<{ draft?: unknown; published?: unknown }>('/api/admin/site')
      const parsedDraft = parseSiteSnapshot(site.draft ?? site)
      const parsedPublished = parseSiteSnapshot(site.published) ?? parsedDraft
      if (parsedDraft) {
        setDraft(parsedDraft)
        setBaseline(parsedDraft)
        setPhoneCountryId(inferPhoneCountry(parsedDraft.phone).id)
      }
      if (parsedPublished) setPublished(parsedPublished)
      const inbox = await api<{ bookings: BookingRow[] }>('/api/admin/bookings?status=pending')
      setBookings(inbox.bookings || [])
      const confirmed = await api<{ bookings: BookingRow[] }>(
        '/api/admin/bookings?status=confirmed'
      )
      setConfirmedBookings(confirmed.bookings || [])
      const cancelled = await api<{ bookings: BookingRow[] }>(
        '/api/admin/bookings?status=cancelled'
      )
      setCancelledBookings(cancelled.bookings || [])
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
  const unpublished = useMemo(
    () => snapshotsEqual(baseline, published) === false,
    [baseline, published]
  )
  const reviewCounts = useMemo(
    () => ({
      pending: reviews.filter((row) => reviewBucket(row.status) === 'pending').length,
      confirmed: reviews.filter((row) => reviewBucket(row.status) === 'confirmed').length,
      rejected: reviews.filter((row) => reviewBucket(row.status) === 'rejected').length,
    }),
    [reviews]
  )
  const reviewRows = useMemo(
    () =>
      reviews.filter(
        (row) =>
          reviewBucket(row.status) === reviewStatusTab &&
          reviewMatchesQuery(row, reviewQuery)
      ),
    [reviews, reviewStatusTab, reviewQuery]
  )
  const pendingRows = useMemo(
    () => bookings.filter((row) => bookingMatchesQuery(row, bookingQuery)),
    [bookings, bookingQuery]
  )
  const confirmedRows = useMemo(
    () => confirmedBookings.filter((row) => bookingMatchesQuery(row, bookingQuery)),
    [confirmedBookings, bookingQuery]
  )
  const cancelledRows = useMemo(
    () => cancelledBookings.filter((row) => bookingMatchesQuery(row, bookingQuery)),
    [cancelledBookings, bookingQuery]
  )
  const openAppointmentId = confirmId ?? rescheduleId ?? openBookingId
  const toggleBooking = (id: string) => {
    if (confirmId === id || rescheduleId === id) return
    setConfirmId(null)
    setRescheduleId(null)
    setOpenBookingId((prev) => (prev === id ? null : id))
  }
  const toggleReview = (id: string) => {
    setOpenReviewId((prev) => (prev === id ? null : id))
  }
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
      setPublished(draft)
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

  const saveDraft = async () => {
    setSaving(true)
    try {
      await api('/api/admin/site?action=save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      setBaseline(draft)
      setPublishSuccess(false)
      show('Draft saved')
    } catch (error) {
      show(error instanceof Error ? error.message : 'Could not save draft')
    } finally {
      setSaving(false)
    }
  }

  const postReview = async (
    id: string,
    action: string,
    extra?: Record<string, unknown>
  ) => {
    await api(`/api/admin/reviews/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
  }

  const confirmBooking = async (id: string) => {
    try {
      const startsAt = snapDateTimeLocalToQuarterHour(startsAtLocal)
      setStartsAtLocal(startsAt)
      await api(`/api/admin/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', startsAtLocal: startsAt }),
      })
      setConfirmId(null)
      setRescheduleId(null)
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
      setConfirmId(null)
      setRescheduleId(null)
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Cancel failed')
    }
  }

  const openReschedule = (row: BookingRow) => {
    setConfirmId(null)
    setRescheduleId(row.id)
    setStartsAtLocal(
      snapDateTimeLocalToQuarterHour(utcIsoToDublinDateTimeLocal(row.startsAt || ''))
    )
    setRescheduleServiceType(row.serviceType || SERVICE_TYPE_IN_CLINIC)
    setRescheduleLocation(row.locationLabel || '')
    setRescheduleService(row.serviceLabel || '')
  }

  const rescheduleBooking = async (id: string) => {
    try {
      const startsAt = snapDateTimeLocalToQuarterHour(startsAtLocal)
      setStartsAtLocal(startsAt)
      await api(`/api/admin/bookings/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reschedule',
          startsAtLocal: startsAt,
          serviceType: rescheduleServiceType,
          locationLabel: rescheduleLocation,
          serviceLabel: rescheduleService,
        }),
      })
      setRescheduleId(null)
      setStartsAtLocal('')
      show('Appointment updated')
      await load()
    } catch (error) {
      show(error instanceof Error ? error.message : 'Reschedule failed')
    }
  }

  const logout = () => {
    window.location.href = '/cdn-cgi/access/logout'
  }

  const unsavedBar = (
    <UnsavedBar
      dirty={dirty}
      unpublished={unpublished}
      saving={saving}
      publishing={publishing}
      success={publishSuccess}
      overlayEnabled={draft.websiteOverlayEnabled}
      lastPublishedAt={lastPublish?.at ?? null}
      lastPublishedBy={lastPublish?.by ?? null}
      unsavedDetail={
        tab === 'pricing'
          ? 'Your booking page still shows the previous prices.'
          : 'The live website still shows the last published version.'
      }
      unpublishedDetail={
        tab === 'pricing'
          ? 'Publish to update prices on your booking page.'
          : 'Publish to update the live website.'
      }
      successDetail={
        tab === 'pricing'
          ? 'Your booking page is showing the latest prices.'
          : 'Your changes are now live.'
      }
      onDiscard={discard}
      onSaveDraft={() => void saveDraft()}
      onPublish={() => void publish()}
    />
  )

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-black/[0.08] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-x-2.5">
            <p className="shrink-0 font-serif text-xl font-semibold leading-tight text-primary">
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

        {tab === 'appointments' && (
          <section className="space-y-4">
            <PageHeader
              description={`Inbox for ${draft.email.address}. Confirm sets the exact Europe/Dublin start. Reschedule from Confirmed. Cancelled is look-up only.`}
            />
            <div className="flex flex-col gap-2 border-b border-black/[0.08] sm:flex-row sm:items-center sm:justify-between">
              <nav className="flex gap-1 overflow-x-auto">
                {(
                  [
                    { id: 'pending', label: 'Pending', count: bookings.length },
                    { id: 'confirmed', label: 'Confirmed', count: confirmedBookings.length },
                    { id: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setBookingTab(item.id)
                      setConfirmId(null)
                      setRescheduleId(null)
                      setOpenBookingId(null)
                    }}
                    className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                      bookingTab === item.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-[var(--text-dark)]/60 hover:text-primary'
                    }`}
                  >
                    {item.label}
                    <span className="ml-1.5 tabular-nums text-[var(--text-dark)]/45">
                      {item.count}
                    </span>
                  </button>
                ))}
              </nav>
              <label className="block pb-2 sm:w-64 sm:shrink-0">
                <span className="sr-only">Search appointments</span>
                <input
                  type="search"
                  value={bookingQuery}
                  onChange={(e) => setBookingQuery(e.target.value)}
                  placeholder="Search name, phone, email…"
                  className="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                />
              </label>
            </div>
            {bookingTab === 'pending' ? (
              bookings.length === 0 ? (
                <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                  No requests yet.
                </p>
              ) : pendingRows.length === 0 ? (
                <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                  No appointments match “{bookingQuery.trim()}”.
                </p>
              ) : (
                <ul className="space-y-3">
                  {pendingRows.map((row) => (
                    <li key={row.id} className="rounded-xl border border-accent/20 bg-white p-4">
                      <BookingCardDetails
                        firstName={row.firstName}
                        lastName={row.lastName}
                        when={formatPreferredWhen(row.preferredDate, row.preferredTime)}
                        phone={row.phone}
                        email={row.email}
                        serviceLabel={row.serviceLabel}
                        serviceType={row.serviceType}
                        locationLabel={row.locationLabel}
                        smsOptIn={row.smsOptIn}
                        open={openAppointmentId === row.id}
                        onToggle={() => toggleBooking(row.id)}
                      >
                      {confirmId === row.id ? (
                        <div className="mt-3 flex flex-wrap items-end gap-2">
                          <DublinStartPicker
                            value={startsAtLocal}
                            onChange={setStartsAtLocal}
                          />
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
                            onClick={() => {
                              setRescheduleId(null)
                              setConfirmId(row.id)
                            }}
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
                      </BookingCardDetails>
                    </li>
                  ))}
                </ul>
              )
            ) : bookingTab === 'confirmed' ? (
              confirmedBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                No confirmed appointments yet.
              </p>
            ) : confirmedRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                No appointments match “{bookingQuery.trim()}”.
              </p>
            ) : (
              <ul className="space-y-3">
                {confirmedRows.map((row) => {
                  const typeOptions = publishedServiceTypes(draft, row.serviceType)
                  const serviceOptions = publishedServiceLabels(
                    draft,
                    rescheduleId === row.id ? rescheduleServiceType : row.serviceType || '',
                    row.serviceLabel
                  )
                  const locationOptions = publishedLocationOptions(draft, row.locationLabel)
                  return (
                    <li key={row.id} className="rounded-xl border border-accent/20 bg-white p-4">
                      <BookingCardDetails
                        firstName={row.firstName}
                        lastName={row.lastName}
                        when={formatDublinSlot(row.startsAt) || 'Time not set'}
                        phone={row.phone}
                        email={row.email}
                        serviceLabel={row.serviceLabel}
                        serviceType={row.serviceType}
                        locationLabel={row.locationLabel}
                        smsOptIn={row.smsOptIn}
                        open={openAppointmentId === row.id}
                        onToggle={() => toggleBooking(row.id)}
                      >
                      {rescheduleId === row.id ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <DublinStartPicker
                            value={startsAtLocal}
                            onChange={setStartsAtLocal}
                          />
                          <label className="text-sm">
                            Visit type
                            <select
                              className="mt-1 block w-full rounded border px-2 py-1"
                              value={rescheduleServiceType}
                              onChange={(e) => {
                                const next = e.target.value
                                setRescheduleServiceType(next)
                                const labels = publishedServiceLabels(draft, next, null)
                                if (!labels.includes(rescheduleService)) {
                                  setRescheduleService(labels[0] || '')
                                }
                              }}
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
                              className="mt-1 block w-full rounded border px-2 py-1"
                              value={rescheduleService}
                              onChange={(e) => setRescheduleService(e.target.value)}
                            >
                              {serviceOptions.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm sm:col-span-2">
                            Location
                            <select
                              className="mt-1 block w-full rounded border px-2 py-1"
                              value={rescheduleLocation}
                              onChange={(e) => setRescheduleLocation(e.target.value)}
                            >
                              {locationOptions.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </label>
                          <div className="flex gap-2 sm:col-span-2">
                            <button
                              type="button"
                              className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                              onClick={() => void rescheduleBooking(row.id)}
                            >
                              Save new time
                            </button>
                            <button
                              type="button"
                              className="rounded-full border border-primary px-3 py-1.5 text-sm text-primary"
                              onClick={() => setRescheduleId(null)}
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="rounded-full bg-primary px-3 py-1.5 text-sm text-white"
                            onClick={() => openReschedule(row)}
                          >
                            Reschedule
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
                      </BookingCardDetails>
                    </li>
                  )
                })}
              </ul>
              )
            ) : cancelledBookings.length === 0 ? (
              <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                No cancelled appointments yet.
              </p>
            ) : cancelledRows.length === 0 ? (
              <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
                No appointments match “{bookingQuery.trim()}”.
              </p>
            ) : (
              <ul className="space-y-3">
                {cancelledRows.map((row) => {
                  const when =
                    formatDublinSlot(row.startsAt) ||
                    formatPreferredWhen(row.preferredDate, row.preferredTime) ||
                    'Time not set'
                  return (
                    <li key={row.id} className="rounded-xl border border-accent/20 bg-white p-4">
                      <BookingCardDetails
                        firstName={row.firstName}
                        lastName={row.lastName}
                        when={when}
                        phone={row.phone}
                        email={row.email}
                        serviceLabel={row.serviceLabel}
                        serviceType={row.serviceType}
                        locationLabel={row.locationLabel}
                        open={openAppointmentId === row.id}
                        onToggle={() => toggleBooking(row.id)}
                      >
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-dark)]/55">
                        Cancelled
                      </p>
                      </BookingCardDetails>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        )}

        {tab === 'reviews' && (
          <section className="space-y-4">
            <PageHeader
              description="Visitor submissions from the website land in Awaiting review. Confirm to publish on the live site, or reject to keep them off."
            />
            <form
              className="space-y-2 rounded-lg border border-black/[0.08] bg-white p-4"
              onSubmit={async (e) => {
                e.preventDefault()
                const rating = parseHalfStarRating(newReviewRating)
                if (rating == null) {
                  show('Choose a star rating')
                  return
                }
                const bodyText = newReviewBody.trim()
                if (!bodyText) {
                  show('Write the full review')
                  return
                }
                let phrase = newReviewEmphasis.trim()
                if (!phrase) {
                  phrase = suggestEmphasis(bodyText)
                  setNewReviewEmphasis(phrase)
                } else if (!bodyText.includes(phrase)) {
                  show('Phrase to bold must appear exactly in the full review')
                  return
                }
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
                      emphasis: phrase,
                      body: bodyText,
                    }),
                  })
                  setNewReviewName('')
                  setNewReviewRating(null)
                  setNewReviewCondition('')
                  setNewReviewSource('Verified Google review')
                  setNewReviewEmphasis('')
                  setNewReviewBody('')
                  setNewReviewDate(dublinTodayYmd())
                  setReviewStatusTab('pending')
                  show('Added to Awaiting review')
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
              <FullWidthDateField
                label="Review date"
                value={newReviewDate}
                max={dublinTodayYmd()}
                onChange={setNewReviewDate}
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Source (e.g. Verified Google review)"
                value={newReviewSource}
                onChange={(e) => setNewReviewSource(e.target.value)}
              />
              <textarea
                className="w-full rounded border px-2 py-1"
                placeholder="Full review"
                value={newReviewBody}
                onChange={(e) => setNewReviewBody(e.target.value)}
                onBlur={() => {
                  if (!newReviewEmphasis.trim() && newReviewBody.trim()) {
                    setNewReviewEmphasis(suggestEmphasis(newReviewBody))
                  }
                }}
                required
              />
              <input
                className="w-full rounded border px-2 py-1"
                placeholder="Phrase to bold (optional — auto-filled from the review)"
                value={newReviewEmphasis}
                onChange={(e) => setNewReviewEmphasis(e.target.value)}
              />
              <button type="submit" className="rounded-full bg-primary px-3 py-1.5 text-sm text-white">
                Save to Awaiting review
              </button>
            </form>
            <div className="space-y-4">
              <ReviewStatusTabs
                value={reviewStatusTab}
                counts={reviewCounts}
                onChange={(next) => {
                  setReviewStatusTab(next)
                  setOpenReviewId(null)
                }}
                query={reviewQuery}
                onQueryChange={setReviewQuery}
              />
              {reviewRows.length === 0 ? (
                <p className="text-sm text-secondary">
                  {reviewQuery.trim()
                    ? `No reviews match “${reviewQuery.trim()}”.`
                    : reviewStatusTab === 'pending'
                      ? 'Nothing awaiting review.'
                      : 'None.'}
                </p>
              ) : (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {reviewRows.map((row) => (
                    <li key={row.id}>
                      <ReviewCard
                        bucket={reviewStatusTab}
                        name={row.name}
                        rating={row.rating ?? 0}
                        condition={row.condition}
                        reviewedAt={row.reviewedAt}
                        source={row.source}
                        body={row.body || row.excerpt || ''}
                        tagValue={pendingTags[row.id] ?? row.condition ?? ''}
                        emphasisValue={pendingEmphasis[row.id] ?? row.emphasis ?? ''}
                        open={openReviewId === row.id}
                        onToggle={() => toggleReview(row.id)}
                        onTagChange={(next) =>
                          setPendingTags((prev) => ({ ...prev, [row.id]: next }))
                        }
                        onEmphasisChange={(next) =>
                          setPendingEmphasis((prev) => ({ ...prev, [row.id]: next }))
                        }
                        onSuggestEmphasis={() => {
                          const suggested = suggestEmphasis(row.body || row.excerpt || '')
                          if (suggested) {
                            setPendingEmphasis((prev) => ({ ...prev, [row.id]: suggested }))
                          }
                        }}
                        onSaveTagAndHighlight={async () => {
                          await postReview(row.id, 'update', {
                            condition: pendingTags[row.id] ?? row.condition,
                            emphasis: pendingEmphasis[row.id] ?? row.emphasis ?? '',
                          })
                          show('Tag and highlight saved')
                          await load()
                        }}
                        onConfirm={async () => {
                          await postReview(row.id, 'update', {
                            condition: pendingTags[row.id] ?? row.condition,
                            emphasis: pendingEmphasis[row.id] ?? row.emphasis ?? '',
                          })
                          await postReview(row.id, 'confirm')
                          show('Published to the website.')
                          setReviewStatusTab('confirmed')
                          await load()
                        }}
                        onReject={async () => {
                          await postReview(row.id, 'reject')
                          show('Review rejected')
                          setReviewStatusTab('rejected')
                          await load()
                        }}
                        onUnpublish={async () => {
                          await postReview(row.id, 'unpublish')
                          show('Moved to Awaiting review')
                          setReviewStatusTab('pending')
                          await load()
                        }}
                        onRestore={async () => {
                          await postReview(row.id, 'restore')
                          show('Moved to Awaiting review')
                          setReviewStatusTab('pending')
                          await load()
                        }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {tab === 'pricing' && (
          <section className="space-y-5">
            <PageHeader
              description="Manage the prices shown on your booking page. Update clinic and home-visit pricing, then publish your changes when you're ready."
            />
            <div className="space-y-2">
              <h2 className="text-sm font-semibold tracking-wide text-[var(--text-dark)]">
                Booking channels
              </h2>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                {(['inClinic', 'homeVisit'] as const).map((kind) => {
                  const enabledKey = categoryEnabledKind(kind)
                  const categoryOn = draft.pricing[enabledKey]
                  const otherOn =
                    kind === 'inClinic'
                      ? draft.pricing.homeVisitEnabled
                      : draft.pricing.inClinicEnabled
                  const lastCategory = categoryOn && !otherOn
                  return (
                    <Card
                      key={kind}
                      title={kind === 'inClinic' ? 'In clinic' : 'Home visit'}
                      action={
                        <OnOffSwitch
                          checked={categoryOn}
                          disabled={lastCategory}
                          ariaLabel={`${categoryOn ? 'Disable' : 'Enable'} ${kind === 'inClinic' ? 'in clinic' : 'home visit'}`}
                          onChange={(enabled) => {
                            if (!enabled && lastCategory) return
                            setDraft({
                              ...draft,
                              pricing: { ...draft.pricing, [enabledKey]: enabled },
                            })
                          }}
                        />
                      }
                    />
                  )
                })}
              </div>
            </div>
            <div className="space-y-4">
              {PRICE_ROWS.map(([key, label]) => {
                const copy = draft.pricing.serviceCopy?.[key] ?? DEFAULT_SERVICE_COPY[key]
                const isBookable = isBookablePriceKey(key)
                const itemOn =
                  draft.pricing.inClinicItems[key] || draft.pricing.homeVisitItems[key]
                const lastBookable =
                  isBookable &&
                  ((draft.pricing.inClinicEnabled &&
                    draft.pricing.inClinicItems[key] &&
                    bookableOnCount(draft.pricing, 'inClinic') <= 1) ||
                    (draft.pricing.homeVisitEnabled &&
                      draft.pricing.homeVisitItems[key] &&
                      bookableOnCount(draft.pricing, 'homeVisit') <= 1))
                const patchCopy = (patch: Partial<ServiceCopyItem>) =>
                  setDraft({
                    ...draft,
                    pricing: {
                      ...draft.pricing,
                      serviceCopy: {
                        ...DEFAULT_SERVICE_COPY,
                        ...draft.pricing.serviceCopy,
                        [key]: { ...copy, ...patch },
                      },
                    },
                  })
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-black/[0.08] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-[var(--text-dark)]">{label}</p>
                        <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-medium text-[var(--text-dark)]/55">
                          {priceRowKindLabel(key)}
                        </span>
                      </div>
                      <OnOffSwitch
                        checked={itemOn}
                        disabled={lastBookable}
                        ariaLabel={`${itemOn ? 'Disable' : 'Enable'} ${label}`}
                        onChange={(enabled) => {
                          if (!enabled && lastBookable) return
                          setDraft({
                            ...draft,
                            pricing: {
                              ...draft.pricing,
                              inClinicItems: { ...draft.pricing.inClinicItems, [key]: enabled },
                              homeVisitItems: { ...draft.pricing.homeVisitItems, [key]: enabled },
                            },
                          })
                        }}
                      />
                    </div>
                    <label className="mb-2 block text-xs font-medium text-[var(--text-dark)]/60">
                      Name
                      <input
                        className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm font-normal"
                        value={copy.name}
                        onChange={(e) => patchCopy({ name: e.target.value })}
                      />
                    </label>
                    <label className="mb-2 block text-xs font-medium text-[var(--text-dark)]/60">
                      Description
                      <textarea
                        rows={3}
                        className="mt-1 w-full min-h-[4.5rem] resize-y rounded-md border border-black/10 px-2 py-1.5 text-sm font-normal"
                        value={copy.description}
                        onChange={(e) => patchCopy({ description: e.target.value })}
                      />
                    </label>
                    {isBookable ? (
                      <DurationMinutesField
                        value={copy.durationMinutes || 0}
                        onChange={(durationMinutes) =>
                          patchCopy({
                            durationMinutes,
                            duration:
                              key === 'package5' || key === 'package10'
                                ? copy.duration.trim() || 'Multiple visits'
                                : durationPhrase(durationMinutes),
                          })
                        }
                      />
                    ) : null}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(['inClinic', 'homeVisit'] as const).map((kind) => {
                        const origKey = originalKind(kind)
                        const original = draft.pricing[origKey][key]
                        const discounted = draft.pricing[kind][key]
                        const off = discountPercentLabel(original, discounted)
                        const categoryOn = draft.pricing[categoryEnabledKind(kind)]
                        return (
                          <div
                            key={kind}
                            className={`rounded-md border border-black/[0.06] bg-[#faf9f6] px-3 py-3 ${
                              categoryOn ? '' : 'opacity-50'
                            }`}
                          >
                            <p className="mb-2 text-xs font-medium text-[var(--text-dark)]/60">
                              {kind === 'inClinic' ? 'In clinic' : 'Home visit'}
                            </p>
                            <div className="space-y-2">
                              <CompactEuroField
                                label="Original"
                                emphasis="muted"
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
                                label={key === 'moxibustion' ? 'Price' : 'Discounted'}
                                emphasis="strong"
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
                                <p className="text-xs text-primary">{off}</p>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <Card title="More services, packages & add-ons">
              <p className="mb-3 text-xs text-[var(--text-dark)]/55">
                Services and packages show as booking options. Add-ons show under Popular add-ons.
              </p>
              <UnifiedExtrasEditor
                draft={draft}
                setDraft={setDraft}
                bookableOnCount={bookableOnCount}
              />
            </Card>
            {unsavedBar}
          </section>
        )}

        {tab === 'contact' && (
          <section className="space-y-5">
            <PageHeader
              description="Manage the contact details, social links, and business hours displayed on your website."
            />
            <Card title="Clinic">
              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  Clinic name
                  <input
                    className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5"
                    value={draft.clinicName}
                    onChange={(e) => setDraft({ ...draft, clinicName: e.target.value })}
                  />
                </label>
                <div className="space-y-3">
                  <p className="text-sm font-medium">Insurance</p>
                  {draft.insurers.map((insurer, index) => {
                    const lastRow = draft.insurers.length <= 1
                    const enabledCount = draft.insurers.filter((row) => row.enabled).length
                    const lastEnabled = insurer.enabled && enabledCount <= 1
                    return (
                    <div
                      key={insurer.id}
                      className="space-y-2 rounded-md border border-black/[0.06] bg-[#faf9f6] px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <input
                          className="min-w-[10rem] flex-1 rounded-md border border-black/10 px-2 py-1.5"
                          value={insurer.name}
                          onChange={(e) => {
                            const insurers = [...draft.insurers]
                            insurers[index] = { ...insurer, name: e.target.value }
                            setDraft({ ...draft, insurers })
                          }}
                        />
                        <OnOffSwitch
                          checked={insurer.enabled}
                          disabled={lastEnabled}
                          ariaLabel={`${insurer.enabled ? 'Disable' : 'Enable'} ${insurer.name || 'insurer'}`}
                          onChange={(enabled) => {
                            if (!enabled && lastEnabled) return
                            const insurers = [...draft.insurers]
                            insurers[index] = { ...insurer, enabled }
                            setDraft({ ...draft, insurers })
                          }}
                        />
                        <button
                          type="button"
                          className="rounded-md px-2 py-1.5 text-sm text-[var(--text-dark)]/70 hover:bg-black/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
                          disabled={lastRow}
                          onClick={() => {
                            if (lastRow) return
                            setDraft({
                              ...draft,
                              insurers: draft.insurers.filter((row) => row.id !== insurer.id),
                            })
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        Website
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm font-normal"
                          value={insurer.href}
                          placeholder="https://"
                          onChange={(e) => {
                            const insurers = [...draft.insurers]
                            insurers[index] = { ...insurer, href: e.target.value }
                            setDraft({ ...draft, insurers })
                          }}
                        />
                      </label>
                      <label className="text-xs text-[var(--text-dark)]/60">
                        Logo
                        <input
                          type="file"
                          accept="image/png,image/svg+xml,image/webp,image/jpeg"
                          className="mt-1 block max-w-[12rem] text-xs"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            e.target.value = ''
                            if (!file) return
                            void uploadInsuranceLogo(insurer.id, file)
                              .then((url) => {
                                const insurers = [...draft.insurers]
                                insurers[index] = { ...insurers[index], logo: url }
                                setDraft({ ...draft, insurers })
                              })
                              .catch((error) => {
                                show(
                                  error instanceof Error
                                    ? error.message
                                    : 'Could not upload logo'
                                )
                              })
                          }}
                        />
                      </label>
                    </div>
                    )
                  })}
                  <button
                    type="button"
                    className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
                    onClick={() => {
                      const sortOrder =
                        draft.insurers.reduce((max, row) => Math.max(max, row.sortOrder), -1) + 1
                      setDraft({
                        ...draft,
                        insurers: [...draft.insurers, createSiteInsurer(sortOrder)],
                      })
                    }}
                  >
                    Add insurance
                  </button>
                </div>
              </div>
            </Card>
            <Card title="Locations">
              <div className="space-y-5">
                {draft.locations.map((loc, index) => {
                  const enabledCount = draft.locations.filter((row) => row.enabled).length
                  const isLastEnabled = loc.enabled && enabledCount <= 1
                  return (
                    <div
                      key={loc.id}
                      className="space-y-2 rounded-md border border-black/[0.06] bg-[#faf9f6] px-3 py-3"
                    >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{loc.label || 'Location'}</p>
                      <OnOffSwitch
                        checked={loc.enabled}
                        disabled={isLastEnabled}
                        ariaLabel={`${loc.enabled ? 'Disable' : 'Enable'} ${loc.label || 'location'}`}
                        onChange={(enabled) => {
                          if (!enabled && isLastEnabled) return
                          const locations = [...draft.locations]
                          locations[index] = composeLocation({ ...loc, enabled })
                          setDraft({ ...draft, locations })
                        }}
                      />
                    </div>
                    <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                      Label
                      <input
                        className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                        value={loc.label}
                        onChange={(e) => {
                          const locations = [...draft.locations]
                          locations[index] = composeLocation({ ...loc, label: e.target.value })
                          setDraft({ ...draft, locations })
                        }}
                      />
                    </label>
                    <AddressSearch
                      onPick={(address) => {
                        const locations = [...draft.locations]
                        locations[index] = composeLocation({
                          ...loc,
                          street: address.street,
                          city: address.city,
                          county: address.county,
                          postcode: address.postcode,
                        })
                        setDraft({ ...draft, locations })
                      }}
                    />
                    <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                      Street
                      <input
                        className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                        value={loc.street}
                        onChange={(e) => {
                          const locations = [...draft.locations]
                          locations[index] = composeLocation({ ...loc, street: e.target.value })
                          setDraft({ ...draft, locations })
                        }}
                      />
                    </label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        City
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={loc.city}
                          onChange={(e) => {
                            const locations = [...draft.locations]
                            locations[index] = composeLocation({ ...loc, city: e.target.value })
                            setDraft({ ...draft, locations })
                          }}
                        />
                      </label>
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        County
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={loc.county}
                          onChange={(e) => {
                            const locations = [...draft.locations]
                            locations[index] = composeLocation({ ...loc, county: e.target.value })
                            setDraft({ ...draft, locations })
                          }}
                        />
                      </label>
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        Postcode
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={loc.postcode}
                          onChange={(e) => {
                            const locations = [...draft.locations]
                            locations[index] = composeLocation({ ...loc, postcode: e.target.value })
                            setDraft({ ...draft, locations })
                          }}
                        />
                      </label>
                    </div>
                    {!loc.street.trim() || !loc.city.trim() ? (
                      <p className="text-xs text-[var(--text-dark)]/55">
                        Add a street and city so Google Maps can find this clinic.
                      </p>
                    ) : null}
                    {loc.postcode.trim() && !looksLikeEircode(loc.postcode) ? (
                      <p className="text-xs text-[var(--text-dark)]/55">
                        Check this looks like an Eircode (e.g. W23 K603).
                      </p>
                    ) : null}
                    <LocationPreview
                      label={loc.label}
                      mapQuery={loc.mapQuery}
                      directionsUrl={loc.directionsUrl}
                    />
                  </div>
                  )
                })}
                <button
                  type="button"
                  className="rounded-md border border-black/10 px-3 py-1.5 text-sm"
                  onClick={() => {
                    setDraft({
                      ...draft,
                      locations: [
                        ...draft.locations,
                        composeLocation({
                          id: `loc-${crypto.randomUUID()}`,
                          label: 'New location',
                          street: '',
                          city: '',
                          county: '',
                          postcode: '',
                        }),
                      ],
                    })
                  }}
                >
                  Add location
                </button>
              </div>
            </Card>
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
            {unsavedBar}
          </section>
        )}

        {tab === 'settings' && (
          <section className="space-y-5">
            <Card>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Public website overlay</p>
                    <p className="mt-1 text-sm text-[var(--text-dark)]/65">
                      Show portal changes on the public website. If the live site looks
                      wrong, turn this off and Publish — the website returns to the original
                      baked content. Fetch failures also keep the baked site automatically.
                    </p>
                  </div>
                  <OnOffSwitch
                    checked={draft.websiteOverlayEnabled}
                    ariaLabel={
                      draft.websiteOverlayEnabled
                        ? 'Turn off public website overlay'
                        : 'Turn on public website overlay'
                    }
                    onChange={(enabled) =>
                      setDraft({ ...draft, websiteOverlayEnabled: enabled })
                    }
                  />
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-black/[0.06] pt-4">
                  <div>
                    <p className="text-sm font-medium">Patient SMS</p>
                    <p className="mt-1 text-sm text-[var(--text-dark)]/65">
                      Show the text-me opt-in on the booking form and send confirm,
                      day-before, and cancel texts when the patient ticks it. Email still
                      sends if this is off. Needs Twilio on the portal and reminder worker.
                    </p>
                  </div>
                  <OnOffSwitch
                    checked={draft.features.smsEnabled}
                    ariaLabel={
                      draft.features.smsEnabled ? 'Turn off patient SMS' : 'Turn on patient SMS'
                    }
                    onChange={(smsEnabled) =>
                      setDraft({
                        ...draft,
                        features: { ...draft.features, smsEnabled },
                      })
                    }
                  />
                </div>
                <div className="flex items-start justify-between gap-4 border-t border-black/[0.06] pt-4">
                  <div>
                    <p className="text-sm font-medium">Booking maintenance</p>
                    <p className="mt-1 text-sm text-[var(--text-dark)]/65">
                      Show an Under maintenance message on the public booking page until
                      you turn this off. Patients can call or email from Need help in the
                      modal.
                    </p>
                  </div>
                  <OnOffSwitch
                    checked={draft.features.bookingMaintenanceEnabled}
                    ariaLabel={
                      draft.features.bookingMaintenanceEnabled
                        ? 'Turn off booking maintenance'
                        : 'Turn on booking maintenance'
                    }
                    onChange={(bookingMaintenanceEnabled) =>
                      setDraft({
                        ...draft,
                        features: { ...draft.features, bookingMaintenanceEnabled },
                      })
                    }
                  />
                </div>
                <div className="space-y-3 border-t border-black/[0.06] pt-4">
                  <p className="text-sm font-medium">Booking method</p>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">Booking form</p>
                    <OnOffSwitch
                      checked={draft.features.bookingFormEnabled}
                      ariaLabel={
                        draft.features.bookingFormEnabled
                          ? 'Turn off booking form'
                          : 'Turn on booking form'
                      }
                      onChange={(on) =>
                        setDraft({
                          ...draft,
                          features: {
                            ...draft.features,
                            bookingFormEnabled: on,
                            ...(on ? { calendlyEnabled: false, freshaEnabled: false } : {}),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">Calendly</p>
                    <OnOffSwitch
                      checked={draft.features.calendlyEnabled}
                      ariaLabel={
                        draft.features.calendlyEnabled
                          ? 'Turn off Calendly'
                          : 'Turn on Calendly'
                      }
                      onChange={(on) =>
                        setDraft({
                          ...draft,
                          features: {
                            ...draft.features,
                            calendlyEnabled: on,
                            ...(on
                              ? { bookingFormEnabled: false, freshaEnabled: false }
                              : {}),
                          },
                        })
                      }
                    />
                  </div>
                  {draft.features.calendlyEnabled ? (
                    <div className="space-y-2 pl-1">
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        Scheduling URL
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={draft.calendly.schedulingUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              calendly: { ...draft.calendly, schedulingUrl: e.target.value },
                            })
                          }
                        />
                      </label>
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        Initial consultation URL
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={draft.calendly.initialConsultationUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              calendly: {
                                ...draft.calendly,
                                initialConsultationUrl: e.target.value,
                              },
                            })
                          }
                        />
                      </label>
                      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                        Follow-up URL
                        <input
                          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                          value={draft.calendly.followUpUrl}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              calendly: { ...draft.calendly, followUpUrl: e.target.value },
                            })
                          }
                        />
                      </label>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm">Fresha</p>
                    <OnOffSwitch
                      checked={draft.features.freshaEnabled}
                      ariaLabel={
                        draft.features.freshaEnabled
                          ? 'Turn off Fresha'
                          : 'Turn on Fresha'
                      }
                      onChange={(on) =>
                        setDraft({
                          ...draft,
                          features: {
                            ...draft.features,
                            freshaEnabled: on,
                            ...(on
                              ? { bookingFormEnabled: false, calendlyEnabled: false }
                              : {}),
                          },
                        })
                      }
                    />
                  </div>
                  {draft.features.freshaEnabled ? (
                    <label className="block text-xs font-medium text-[var(--text-dark)]/60">
                      Booking URL
                      <input
                        className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
                        value={draft.fresha.bookingUrl}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            fresha: { ...draft.fresha, bookingUrl: e.target.value },
                          })
                        }
                      />
                    </label>
                  ) : null}
                </div>
              </div>
            </Card>
            {unsavedBar}
          </section>
        )}

        {tab === 'history' && (
          <section className="space-y-5">
            <PageHeader
              description="Published updates to contact, hours, pricing, and site settings."
            />
            <Card>
              <ChangeHistory rows={history} />
            </Card>
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

