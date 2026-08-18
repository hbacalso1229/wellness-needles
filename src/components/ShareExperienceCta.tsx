'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { ArrowRight, X } from 'lucide-react'
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
const SHARE_CTA_CLASS =
  'group mt-3 inline-flex items-center gap-1 text-sm font-medium text-cream/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-cream hover:underline sm:mt-3.5'

const fieldClass = (invalid?: boolean) =>
  `mt-1 w-full rounded-lg border px-3 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 ${
    invalid ? 'border-red-400' : 'border-accent/30'
  }`

type FieldKey = 'name' | 'rating' | 'body' | 'emphasis'

export function ShareExperienceCta() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={SHARE_CTA_CLASS} onClick={() => setOpen(true)}>
        Share Your Experience
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
          aria-hidden
        />
      </button>
      {open ? <ShareExperienceModal onClose={() => setOpen(false)} /> : null}
    </>
  )
}

function ShareExperienceModal({ onClose }: { onClose: () => void }) {
  const titleId = useId()
  const nameErrorId = useId()
  const ratingErrorId = useId()
  const bodyErrorId = useId()
  const bodyCountId = useId()
  const emphasisHelpId = useId()
  const emphasisErrorId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
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
      if (event.key !== 'Escape') return
      event.preventDefault()
      if (confirmCloseRef.current) {
        setConfirmClose(false)
        return
      }
      requestCloseRef.current()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

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
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[min(90dvh,42rem)] w-full max-w-md flex-col overflow-hidden rounded-xl border border-accent/20 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] pointer-events-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={requestClose}
          className="absolute right-1 top-1 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-secondary [@media(hover:hover)]:hover:bg-accent/15 [@media(hover:hover)]:hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close review form"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <h2
          id={titleId}
          className="shrink-0 px-5 pt-5 pr-14 font-serif text-xl font-semibold text-[var(--text-dark)]"
        >
          Share your experience
        </h2>
        {done ? (
          <div className="px-5 pb-5 pt-4">
            <p className="text-sm font-semibold text-primary">Review submitted ✓</p>
            <p className="mt-2 text-sm text-secondary">
              Thank you. Your review has been received and may appear on this page after the
              clinic publishes it.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 w-full rounded-lg bg-primary py-3 text-sm font-semibold text-cream transition-colors duration-200 [@media(hover:hover)]:hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => void submit(e)} noValidate>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-5 pt-4 [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.22)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20">
              <label className="block text-sm font-medium">
                Your name{' '}
                <span className="text-primary" aria-hidden>
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
                  Rating{' '}
                  <span className="text-primary" aria-hidden>
                    *
                  </span>
                  <span className="sr-only"> (required)</span>
                </p>
                <div className="mt-1">
                  <HalfStarPicker
                    value={rating}
                    invalid={Boolean(fieldErrors.rating)}
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

              <label className="block text-sm font-medium">
                Treatment
                <select
                  className={fieldClass()}
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                >
                  <option value="">Optional — choose a theme</option>
                  {TREATMENT_TAG_PRESETS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                  <option value={OTHER}>{OTHER}</option>
                </select>
              </label>
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
                <span className="text-primary" aria-hidden>
                  *
                </span>
                <span className="sr-only"> (required)</span>
                <textarea
                  className={`${fieldClass(Boolean(fieldErrors.body))} resize-y`}
                  rows={4}
                  value={body}
                  maxLength={REVIEW_BODY_MAX_LEN}
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
                Phrase to highlight{' '}
                <span className="font-normal text-secondary">· optional</span>
                <input
                  className={fieldClass(Boolean(fieldErrors.emphasis))}
                  value={emphasis}
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
                Optional — we’ll pick a short phrase from your review if you leave this blank.
                You can edit it. It must appear exactly in your review.
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
                        options={{
                          size: 'flexible',
                          theme: 'light',
                          appearance: 'interaction-only',
                        }}
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
                    {sending ? 'Sending…' : 'Send review'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
