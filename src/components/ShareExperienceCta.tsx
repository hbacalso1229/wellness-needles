'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { ArrowRight, X } from 'lucide-react'
import { getTurnstileSiteKey } from '@/lib/booking-features'
import { HalfStarPicker } from '@/features/ui/RatingStars'
import {
  CONDITION_MAX_LEN,
  TREATMENT_TAG_PRESETS,
  parseHalfStarRating,
} from '../../shared/review-rating'

const OTHER = 'Other'
const SHARE_CTA_CLASS =
  'group mt-3 inline-flex items-center gap-1 text-sm font-medium text-cream/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-cream hover:underline sm:mt-3.5'

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
  const [done, setDone] = useState(false)
  const [sending, setSending] = useState(false)
  const [widgetFailed, setWidgetFailed] = useState(false)

  const condition =
    preset === OTHER ? otherTag.trim() : preset === '' ? '' : preset

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    const parsed = parseHalfStarRating(rating)
    if (!parsed) {
      setError('Please choose a star rating.')
      return
    }
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
          emphasis,
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

  return createPortal(
    <div
      className="fixed inset-0 z-[200] grid min-h-[100dvh] place-items-center bg-black/50 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[min(90dvh,40rem)] w-full max-w-md overflow-y-auto rounded-xl border border-accent/20 bg-white p-5 pointer-events-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-accent/15 hover:text-primary"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
        <h2 id={titleId} className="pr-8 font-serif text-xl font-semibold text-[var(--text-dark)]">
          Share your experience
        </h2>
        {done ? (
          <p className="mt-4 text-sm text-secondary">
            Thank you. Your review has been received and may appear on this page after the
            clinic publishes it.
          </p>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={(e) => void submit(e)}>
            <label className="block text-sm font-medium">
              Your name
              <input
                className="mt-1 w-full rounded-lg border border-accent/30 px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </label>
            <div>
              <p className="text-sm font-medium">Rating</p>
              <div className="mt-1">
                <HalfStarPicker value={rating} onChange={setRating} />
              </div>
            </div>
            <label className="block text-sm font-medium">
              Treatment
              <select
                className="mt-1 w-full rounded-lg border border-accent/30 px-3 py-2"
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
                  className="mt-1 w-full rounded-lg border border-accent/30 px-3 py-2"
                  value={otherTag}
                  maxLength={CONDITION_MAX_LEN}
                  onChange={(e) => setOtherTag(e.target.value)}
                />
              </label>
            ) : null}
            <label className="block text-sm font-medium">
              Your review
              <textarea
                className="mt-1 w-full rounded-lg border border-accent/30 px-3 py-2"
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-medium">
              Phrase to highlight (optional)
              <input
                className="mt-1 w-full rounded-lg border border-accent/30 px-3 py-2"
                value={emphasis}
                onChange={(e) => setEmphasis(e.target.value)}
                placeholder="Must appear in your review"
              />
            </label>
            {siteKey && !widgetFailed ? (
              <div className="flex justify-center">
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
              <div className="flex flex-col items-center gap-1">
                <div
                  className="h-[65px] w-full max-w-[300px] rounded-md border border-accent/25 bg-accent/10"
                  aria-hidden
                />
                <p className="text-center text-xs text-secondary">
                  Security check (same size as the live site)
                </p>
              </div>
            )}
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-cream disabled:opacity-60"
            >
              {sending ? 'Sending…' : 'Send review'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
