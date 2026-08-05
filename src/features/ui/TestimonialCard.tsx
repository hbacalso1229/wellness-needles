'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, ChevronRight, Quote, Star, X } from 'lucide-react'

export type TestimonialCardProps = {
  name: string
  condition: string
  date: string
  rating: number
  text: string
  /** Persuasive substring of `text` to bold in preview + modal */
  emphasis?: string
  /** e.g. Verified Google review */
  source?: string
  className?: string
}

const MODAL_CLOSE_MS = 360
const EMPHASIS_PREVIEW_THRESHOLD = 60

const AVATAR_TONES = [
  'border-accent/25 bg-accent/20',
  'border-primary/20 bg-primary/10',
  'border-gold/30 bg-gold/20',
  'border-accent/30 bg-accent/10',
] as const

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

function avatarTone(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash + name.charCodeAt(i) * (i + 1)) % AVATAR_TONES.length
  }
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0]
}

function renderQuotedText(text: string, emphasis?: string): ReactNode {
  if (!emphasis) return <>{text}</>
  const index = text.indexOf(emphasis)
  if (index < 0) return <>{text}</>
  const before = text.slice(0, index)
  const after = text.slice(index + emphasis.length)
  return (
    <>
      {before}
      <strong className="font-bold not-italic text-[var(--text-dark)]">{emphasis}</strong>
      {after}
    </>
  )
}

function renderPreviewQuote(text: string, emphasis?: string): ReactNode {
  if (!emphasis) return <>{text}</>
  const index = text.indexOf(emphasis)
  if (index < 0) return <>{text}</>
  if (index > EMPHASIS_PREVIEW_THRESHOLD) {
    return (
      <>
        …
        <strong className="font-bold not-italic text-[var(--text-dark)]">{emphasis}</strong>
        …
      </>
    )
  }
  return renderQuotedText(text, emphasis)
}

function SourceLabel({ source }: { source: string }) {
  return (
    <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-secondary md:text-xs">
      <CheckCircle className="h-3 w-3 shrink-0 text-accent md:h-3.5 md:w-3.5" aria-hidden />
      {source}
    </p>
  )
}

export function TestimonialCard({
  name,
  condition,
  date,
  rating,
  text,
  emphasis,
  source = 'Verified Google review',
  className = '',
}: TestimonialCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalClosing, setModalClosing] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [backdropArmed, setBackdropArmed] = useState(false)
  const readMoreRef = useRef<HTMLButtonElement>(null)
  const scrollYRef = useRef(0)
  const wasModalOpenRef = useRef(false)
  const closeTimerRef = useRef<number | null>(null)
  const modalClosingRef = useRef(false)
  const titleId = useId()
  const descId = useId()

  const initials = initialsFromName(name)
  const tone = avatarTone(name)
  const quoteBody = renderQuotedText(text, emphasis)
  const previewBody = renderPreviewQuote(text, emphasis)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  const closeModal = () => {
    if (!modalOpen || modalClosingRef.current) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      modalClosingRef.current = false
      setModalClosing(false)
      setModalOpen(false)
      return
    }

    modalClosingRef.current = true
    setBackdropArmed(false)
    setModalClosing(true)
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null
      modalClosingRef.current = false
      setModalOpen(false)
      setModalClosing(false)
    }, MODAL_CLOSE_MS)
  }

  const openModal = () => {
    if (modalClosingRef.current) return
    scrollYRef.current = window.scrollY
    setModalClosing(false)
    setModalOpen(true)
  }

  useEffect(() => {
    if (!modalOpen) {
      setBackdropArmed(false)
      setModalClosing(false)
      modalClosingRef.current = false
      if (wasModalOpenRef.current) {
        wasModalOpenRef.current = false
        const y = scrollYRef.current
        requestAnimationFrame(() => {
          window.scrollTo(0, y)
          readMoreRef.current?.focus({ preventScroll: true })
        })
      }
      return
    }

    wasModalOpenRef.current = true
    setBackdropArmed(false)
    const arm = window.setTimeout(() => {
      if (!modalClosingRef.current) setBackdropArmed(true)
    }, 400)

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeModal()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(arm)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lock/listeners tied to open; closeModal uses refs
  }, [modalOpen])

  const stars = (
    <div className="flex items-center" aria-label={`${rating} out of 5 stars`}>
      {[...Array(rating)].map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 text-gold fill-current" />
      ))}
    </div>
  )

  const avatar = (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-semibold text-primary md:h-11 md:w-11 md:text-sm ${tone}`}
      aria-hidden
    >
      {initials}
    </div>
  )

  const modal =
    portalReady &&
    modalOpen &&
    createPortal(
      <div
        className={`feature-card-modal fixed inset-0 z-[200] grid min-h-[100dvh] w-full place-items-center bg-black/50 p-4 ${
          modalClosing ? 'feature-card-modal--closing' : ''
        } ${backdropArmed && !modalClosing ? '' : 'pointer-events-none'}`}
        role="presentation"
        onClick={backdropArmed && !modalClosing ? closeModal : undefined}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="relative max-h-[min(90dvh,36rem)] w-full max-w-md overflow-y-auto rounded-xl border border-accent/20 bg-cream px-4 pb-5 pt-3 pointer-events-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeModal}
            disabled={modalClosing}
            className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-secondary hover:bg-accent/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <div className="mb-4 flex items-start gap-3 pr-8">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold text-primary ${tone}`}
              aria-hidden
            >
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 id={titleId} className="text-lg font-semibold leading-snug text-[var(--text-dark)]">
                  {name}
                </h3>
                {stars}
              </div>
              <span className="mt-2 inline-flex rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-secondary">
                {condition}
              </span>
              <p className="mt-2 flex items-center text-xs text-secondary">{date}</p>
              {source ? <SourceLabel source={source} /> : null}
            </div>
          </div>

          <Quote className="mb-2 h-6 w-6 text-accent/30" aria-hidden />
          <p id={descId} className="text-sm leading-relaxed text-secondary md:text-base md:leading-7">
            &quot;{quoteBody}&quot;
          </p>
        </div>
      </div>,
      document.body,
    )

  return (
    <article
      className={`group relative flex h-full flex-col rounded-xl border border-accent/15 bg-white p-5 shadow-none transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 hover:border-primary/30 md:p-6 ${className}`}
    >
      <div className="mb-4 flex items-start gap-3">
        {avatar}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h4 className="truncate text-sm font-semibold text-[var(--text-dark)] md:text-lg">
              {name}
            </h4>
            {stars}
          </div>
          <span className="mt-2 inline-flex max-w-full truncate rounded-full bg-accent/15 px-2.5 py-0.5 text-xs text-secondary">
            {condition}
          </span>
          <p className="mt-2 text-[11px] text-secondary md:text-xs">{date}</p>
          {source ? <SourceLabel source={source} /> : null}
        </div>
      </div>

      <Quote className="mb-2 h-4 w-4 text-accent/30 md:h-5 md:w-5" aria-hidden />
      <p className="mb-4 line-clamp-3 flex-1 text-sm italic leading-relaxed text-secondary md:line-clamp-4 md:text-base md:leading-7">
        &quot;{previewBody}&quot;
      </p>

      <button
        ref={readMoreRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
        className="mt-auto inline-flex items-center gap-0.5 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Read full story
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      {modal}
    </article>
  )
}
