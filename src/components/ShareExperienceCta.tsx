'use client'

import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { ArrowRight, Check, ChevronDown, X } from 'lucide-react'
import { getTurnstileSiteKey } from '@/lib/booking-features'
import { HalfStarPicker } from '@/features/ui/RatingStars'
import {
  CONDITION_MAX_LEN,
  REVIEW_BODY_MAX_LEN,
  REVIEW_NAME_MAX_LEN,
  TREATMENT_TAG_PRESETS,
  parseHalfStarRating,
  suggestEmphasis,
} from '../../shared/review-rating'

const OTHER = 'Other'
const TREATMENT_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: '', label: 'None' },
  ...TREATMENT_TAG_PRESETS.map((tag) => ({ value: tag, label: tag })),
  { value: OTHER, label: OTHER },
]
const SHARE_CTA_CLASS =
  'group mt-3 inline-flex items-center gap-1 text-sm font-medium text-cream/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-cream hover:underline sm:mt-3.5'

const fieldClass = (invalid?: boolean) =>
  `mt-1 w-full rounded-lg border px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
    invalid ? 'border-red-400' : 'border-accent/30'
  }`

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'iframe',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0
  )
}

function TreatmentSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [menuRect, setMenuRect] = useState<{ top: number; left: number; width: number } | null>(
    null
  )
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const activeIndexRef = useRef(0)
  const listId = useId()
  const selectedIndex = Math.max(
    0,
    TREATMENT_OPTIONS.findIndex((option) => option.value === value)
  )
  const isPlaceholder = value === ''
  const triggerLabel = isPlaceholder
    ? 'Select a treatment'
    : (TREATMENT_OPTIONS[selectedIndex]?.label ?? 'Select a treatment')

  activeIndexRef.current = activeIndex

  const placeMenu = () => {
    const el = triggerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    setMenuRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }

  const choose = (next: string) => {
    onChange(next)
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    placeMenu()
    setActiveIndex(selectedIndex)

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        event.stopPropagation()
        setActiveIndex((index) => Math.min(TREATMENT_OPTIONS.length - 1, index + 1))
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        event.stopPropagation()
        setActiveIndex((index) => Math.max(0, index - 1))
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        const option = TREATMENT_OPTIONS[activeIndexRef.current]
        if (option) choose(option.value)
      }
    }
    const onScrollOrResize = (event: Event) => {
      if (event.type === 'scroll' && listRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
    }
  }, [open, selectedIndex, onChange])

  useEffect(() => {
    if (!open) return
    const option = optionRefs.current[activeIndex]
    const list = listRef.current
    if (!option || !list) return
    const optionRect = option.getBoundingClientRect()
    const listRect = list.getBoundingClientRect()
    if (optionRect.top < listRect.top) {
      list.scrollTop -= listRect.top - optionRect.top
    } else if (optionRect.bottom > listRect.bottom) {
      list.scrollTop += optionRect.bottom - listRect.bottom
    }
  }, [open, activeIndex])

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className={`${fieldClass()} flex items-center justify-between gap-2 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-opt-${activeIndex}` : undefined}
        onClick={() => {
          setOpen((current) => {
            if (current) return false
            placeMenu()
            return true
          })
        }}
      >
        <span className={`min-w-0 truncate ${isPlaceholder ? 'text-secondary' : ''}`}>
          {triggerLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-secondary/70 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
          strokeWidth={2.25}
        />
      </button>
      {open && menuRect && typeof document !== 'undefined'
        ? createPortal(
            <ul
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label="Treatment"
              className="fixed z-[220] max-h-60 overflow-y-auto overscroll-contain rounded-lg border border-accent/20 bg-white py-1 shadow-lg [scrollbar-width:thin] [scrollbar-color:var(--accent-green)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--accent-green)]"
              style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
              onWheel={(event) => event.stopPropagation()}
            >
              {TREATMENT_OPTIONS.map((option, index) => {
                const selected = option.value === value
                const active = index === activeIndex
                return (
                  <li key={option.label} role="none">
                    <button
                      ref={(node) => {
                        optionRefs.current[index] = node
                      }}
                      type="button"
                      id={`${listId}-opt-${index}`}
                      role="option"
                      aria-selected={selected}
                      className={`w-full px-3 py-2.5 text-left text-sm ${
                        selected ? 'bg-accent/10 font-medium' : ''
                      } ${active ? 'bg-accent/15' : ''} [@media(hover:hover)]:hover:bg-accent/15`}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(option.value)}
                    >
                      {option.label}
                    </button>
                  </li>
                )
              })}
            </ul>,
            document.body
          )
        : null}
    </div>
  )
}

type FieldKey = 'name' | 'rating' | 'body' | 'emphasis'

export function ShareExperienceCta() {
  const [open, setOpen] = useState(false)
  const openerRef = useRef<HTMLButtonElement>(null)
  return (
    <>
      <button
        ref={openerRef}
        type="button"
        className={SHARE_CTA_CLASS}
        onClick={() => setOpen(true)}
      >
        Share Your Experience
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
          aria-hidden
        />
      </button>
      {open ? <ShareExperienceModal onClose={() => setOpen(false)} openerRef={openerRef} /> : null}
    </>
  )
}

function ShareExperienceModal({
  onClose,
  openerRef,
}: {
  onClose: () => void
  openerRef: RefObject<HTMLButtonElement | null>
}) {
  const titleId = useId()
  const descId = useId()
  const nameErrorId = useId()
  const ratingErrorId = useId()
  const bodyErrorId = useId()
  const bodyCountId = useId()
  const emphasisHelpId = useId()
  const emphasisErrorId = useId()
  const treatmentId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const siteKey = getTurnstileSiteKey()
  const [name, setName] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [preset, setPreset] = useState('')
  const [otherTag, setOtherTag] = useState('')
  const [body, setBody] = useState('')
  const [emphasis, setEmphasis] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [widgetFailed, setWidgetFailed] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)

  const condition =
    preset === OTHER ? otherTag.trim() : preset === '' ? '' : preset
  const isDirty = Boolean(
    name.trim() || body.trim() || emphasis.trim() || rating != null || otherTag.trim()
  )

  const setFieldError = (key: FieldKey, message: string | undefined) => {
    setFieldErrors((prev) => {
      if (!message) {
        if (!(key in prev)) return prev
        const next = { ...prev }
        delete next[key]
        return next
      }
      if (prev[key] === message) return prev
      return { ...prev, [key]: message }
    })
  }

  const validateName = (value = name) => {
    if (!value.trim()) return 'Enter your name.'
    return undefined
  }

  const validateRating = (value = rating) => {
    if (!parseHalfStarRating(value)) return 'Choose a star rating.'
    return undefined
  }

  const validateBody = (value = body) => {
    const text = value.trim()
    if (!text) return 'Write a short review.'
    if (text.length > REVIEW_BODY_MAX_LEN) {
      return `Keep your review to ${REVIEW_BODY_MAX_LEN} characters or fewer.`
    }
    return undefined
  }

  const validateEmphasis = (nextEmphasis = emphasis, nextBody = body) => {
    const phrase = nextEmphasis.trim()
    if (!phrase) return undefined
    if (!nextBody.includes(phrase)) {
      return 'Use a short phrase that appears exactly in your review.'
    }
    return undefined
  }

  const requestClose = () => {
    if (sending) return
    if (done || !isDirty) {
      onClose()
      return
    }
    setConfirmClose(true)
  }
  const requestCloseRef = useRef(requestClose)
  requestCloseRef.current = requestClose
  const confirmCloseRef = useRef(confirmClose)
  confirmCloseRef.current = confirmClose

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (confirmCloseRef.current) {
          setConfirmClose(false)
          return
        }
        requestCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const root = dialogRef.current
      if (!root) return
      const focusable = getFocusable(root)
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !root.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !root.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      openerRef.current?.focus({ preventScroll: true })
    }
  }, [openerRef])

  useEffect(() => {
    if (!done) return
    titleRef.current?.focus({ preventScroll: true })
  }, [done])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setConfirmClose(false)
    const filledEmphasis = emphasis.trim() || suggestEmphasis(body)
    if (filledEmphasis !== emphasis) setEmphasis(filledEmphasis)
    const nextErrors = {
      name: validateName(),
      rating: validateRating(),
      body: validateBody(),
      emphasis: validateEmphasis(filledEmphasis, body),
    }
    const compact = Object.fromEntries(
      Object.entries(nextErrors).filter(([, message]) => Boolean(message))
    ) as Partial<Record<FieldKey, string>>
    setFieldErrors(compact)
    if (Object.keys(compact).length) return

    const parsed = parseHalfStarRating(rating)
    if (!parsed) return

    if (condition.length > CONDITION_MAX_LEN) {
      setError(`Treatment tag must be ${CONDITION_MAX_LEN} characters or fewer.`)
      return
    }
    if (!siteKey || widgetFailed) {
      setError(
        'Layout preview: sending is on the live site. Staging has no review Function.'
      )
      return
    }
    if (!token.trim()) {
      setError('Please wait for the security check to finish.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/review-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          turnstileToken: token,
          name,
          rating: parsed,
          condition,
          body,
          emphasis: filledEmphasis,
        }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Could not send your review')
      }
      setDone(true)
    } catch (err) {
      const staging =
        typeof window !== 'undefined' &&
        /\.vercel\.app$/i.test(window.location.hostname)
      setError(
        staging
          ? 'Layout preview: sending is on the live site. Staging has no review Function.'
          : err instanceof Error
            ? err.message
            : 'Could not send your review'
      )
      turnstileRef.current?.reset()
      setToken('')
    } finally {
      setSending(false)
    }
  }

  if (typeof document === 'undefined') return null

  const bodyCount = body.length
  const nearLimit = bodyCount >= REVIEW_BODY_MAX_LEN - 80

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid min-h-[100dvh] place-items-center bg-black/50 p-4"
      role="presentation"
      onClick={requestClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={done ? descId : undefined}
        className="relative flex max-h-[min(90dvh,42rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-accent/20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] pointer-events-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          className="absolute right-1 top-1 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-secondary [@media(hover:hover)]:hover:bg-accent/15 [@media(hover:hover)]:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {done ? (
          <div className="px-5 pb-5 pt-5 pr-14">
            <span
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary"
              aria-hidden
            >
              <Check className="h-6 w-6 text-cream" strokeWidth={2.5} />
            </span>
            <h2
              ref={titleRef}
              id={titleId}
              tabIndex={-1}
              className="font-serif text-xl font-semibold text-primary outline-none"
            >
              Review submitted
            </h2>
            <p id={descId} className="mt-1.5 text-sm text-secondary">
              Thank you. Your review has been submitted and will appear once the clinic publishes
              it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-cream transition-colors duration-200 [@media(hover:hover)]:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h2
              id={titleId}
              className="shrink-0 px-5 pt-5 pr-14 font-serif text-xl font-semibold text-[var(--text-dark)]"
            >
              Share your experience
            </h2>
            <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => void submit(e)} noValidate>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-5 pt-4 [scrollbar-width:thin] [scrollbar-color:var(--accent-green)_transparent] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--accent-green)] [&::-webkit-scrollbar-thumb]:hover:bg-[var(--secondary-green)]">
              <label className="block text-sm font-medium">
                Your name{' '}
                <span className="text-red-600" aria-hidden>
                  *
                </span>
                <span className="sr-only"> (required)</span>
                <input
                  className={fieldClass(Boolean(fieldErrors.name))}
                  value={name}
                  maxLength={REVIEW_NAME_MAX_LEN}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (fieldErrors.name) setFieldError('name', validateName(e.target.value))
                  }}
                  onBlur={() => setFieldError('name', validateName())}
                  autoComplete="name"
                  aria-required
                  aria-invalid={Boolean(fieldErrors.name) || undefined}
                  aria-describedby={fieldErrors.name ? nameErrorId : undefined}
                />
              </label>
              {fieldErrors.name ? (
                <p id={nameErrorId} className="-mt-2 text-sm text-red-700" role="alert">
                  {fieldErrors.name}
                </p>
              ) : null}

              <div>
                <p className="text-sm font-medium">
                  How would you rate your experience?{' '}
                  <span className="text-red-600" aria-hidden>
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </p>
                <div className="mt-1">
                  <HalfStarPicker
                    value={rating}
                    invalid={Boolean(fieldErrors.rating)}
                    emptyHint="Select a rating from 1–5 stars."
                    onChange={(next) => {
                      setRating(next)
                      setFieldError('rating', undefined)
                    }}
                  />
                </div>
                {fieldErrors.rating ? (
                  <p id={ratingErrorId} className="text-sm text-red-700" role="alert">
                    {fieldErrors.rating}
                  </p>
                ) : null}
              </div>

              <div>
                <label htmlFor={treatmentId} className="block text-sm font-medium">
                  Treatment{' '}
                  <span className="font-normal text-secondary">· optional</span>
                </label>
                <TreatmentSelect id={treatmentId} value={preset} onChange={setPreset} />
              </div>
              {preset === OTHER ? (
                <label className="block text-sm font-medium">
                  Your own tag
                  <input
                    className={fieldClass()}
                    value={otherTag}
                    maxLength={CONDITION_MAX_LEN}
                    onChange={(e) => setOtherTag(e.target.value)}
                  />
                </label>
              ) : null}

              <label className="block text-sm font-medium">
                Your review{' '}
                <span className="text-red-600" aria-hidden>
                  *
                </span>
                <span className="sr-only"> (required)</span>
                <textarea
                  className={`${fieldClass(Boolean(fieldErrors.body))} resize-y`}
                  rows={4}
                  value={body}
                  maxLength={REVIEW_BODY_MAX_LEN}
                  placeholder="Tell us about your experience..."
                  onChange={(e) => {
                    const next = e.target.value
                    setBody(next)
                    if (fieldErrors.body) setFieldError('body', validateBody(next))
                    if (emphasis.trim()) {
                      setFieldError('emphasis', validateEmphasis(emphasis, next))
                    }
                  }}
                  onBlur={() => {
                    setFieldError('body', validateBody())
                    if (!emphasis.trim() && body.trim()) {
                      const suggested = suggestEmphasis(body)
                      if (suggested) setEmphasis(suggested)
                    }
                  }}
                  aria-required
                  aria-invalid={Boolean(fieldErrors.body) || undefined}
                  aria-describedby={`${bodyCountId}${fieldErrors.body ? ` ${bodyErrorId}` : ''}`}
                />
              </label>
              <div className="-mt-2 flex items-start justify-between gap-3">
                {fieldErrors.body ? (
                  <p id={bodyErrorId} className="text-sm text-red-700" role="alert">
                    {fieldErrors.body}
                  </p>
                ) : (
                  <span />
                )}
                <p
                  id={bodyCountId}
                  className={`shrink-0 text-xs tabular-nums ${
                    nearLimit ? 'text-secondary' : 'text-[var(--text-dark)]/45'
                  }`}
                >
                  {bodyCount} / {REVIEW_BODY_MAX_LEN}
                </p>
              </div>

              <label className="block pb-1 text-sm font-medium">
                Highlight from your experience{' '}
                <span className="font-normal text-secondary">· optional</span>
                <input
                  className={fieldClass(Boolean(fieldErrors.emphasis))}
                  value={emphasis}
                  placeholder="Add a short phrase you'd like us to highlight"
                  onChange={(e) => {
                    const next = e.target.value
                    setEmphasis(next)
                    if (fieldErrors.emphasis) {
                      setFieldError('emphasis', validateEmphasis(next, body))
                    }
                  }}
                  onBlur={() => setFieldError('emphasis', validateEmphasis())}
                  aria-invalid={Boolean(fieldErrors.emphasis) || undefined}
                  aria-describedby={
                    fieldErrors.emphasis
                      ? `${emphasisHelpId} ${emphasisErrorId}`
                      : emphasisHelpId
                  }
                />
              </label>
              <p id={emphasisHelpId} className="-mt-2 pb-1 text-xs leading-relaxed text-secondary">
                Leave blank and we’ll choose a phrase for you.
              </p>
              {fieldErrors.emphasis ? (
                <p id={emphasisErrorId} className="-mt-2 text-sm text-red-700" role="alert">
                  {fieldErrors.emphasis}
                </p>
              ) : null}
            </div>
            <div className="shrink-0 space-y-3 bg-white/95 px-5 py-4 shadow-[0_-12px_24px_-18px_rgba(27,59,43,0.28)]">
              {confirmClose ? (
                <div className="space-y-3">
                  <p className="text-sm text-secondary">Discard your review? Your text will be lost.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmClose(false)}
                      className="flex-1 rounded-lg border border-accent/25 bg-white py-3 text-sm font-semibold text-[var(--text-dark)] transition-colors duration-200 [@media(hover:hover)]:hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Keep editing
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-cream transition-colors duration-200 [@media(hover:hover)]:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Discard
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {siteKey && !widgetFailed ? (
                    <div className="flex w-full min-w-0 max-w-full justify-center overflow-hidden">
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={siteKey}
                        options={{ size: 'flexible', theme: 'light' }}
                        onSuccess={(next) => setToken(next)}
                        onExpire={() => setToken('')}
                        onError={() => {
                          setToken('')
                          setWidgetFailed(true)
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-center text-xs text-secondary">
                      Security check (same size as the live site)
                    </p>
                  )}
                  {error ? (
                    <p className="text-sm text-red-700" role="alert">
                      {error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-cream transition-colors duration-200 [@media(hover:hover)]:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 [@media(hover:hover)]:disabled:hover:bg-primary"
                  >
                    {sending ? 'Sharing…' : 'Share my experience'}
                  </button>
                </>
              )}
            </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
