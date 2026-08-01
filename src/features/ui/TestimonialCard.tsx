'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, ChevronRight, Quote, Star, User, X } from 'lucide-react'

export type TestimonialCardProps = {
  name: string
  condition: string
  date: string
  rating: number
  text: string
  className?: string
}

const MODAL_CLOSE_MS = 360

export function TestimonialCard({
  name,
  condition,
  date,
  rating,
  text,
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

          <div className="mb-3 flex items-start gap-3 pr-8">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10"
              aria-hidden
            >
              <User className="h-5 w-5 text-secondary/50" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 id={titleId} className="font-serif text-lg font-semibold text-primary leading-snug">
                  {name}
                </h3>
                {stars}
              </div>
              <p className="text-sm text-secondary">{condition}</p>
              <p className="mt-1 flex items-center text-xs text-secondary">
                <CheckCircle className="mr-1.5 h-3.5 w-3.5 shrink-0 text-accent" />
                {date}
              </p>
            </div>
          </div>

          <Quote className="mb-2 h-6 w-6 text-accent/30" aria-hidden />
          <p id={descId} className="text-sm leading-relaxed text-secondary md:text-base">
            &quot;{text}&quot;
          </p>
        </div>
      </div>,
      document.body,
    )

  return (
    <article
      className={`group relative flex h-full flex-col rounded-xl border-2 border-accent/20 bg-white p-3.5 shadow-none transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 hover:border-primary/40 md:p-5 ${className}`}
    >
      <div className="mb-3 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10"
          aria-hidden
        >
          <User className="h-5 w-5 text-secondary/50" strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h4 className="truncate font-serif text-base font-semibold text-primary md:text-lg">
              {name}
            </h4>
            {stars}
          </div>
          <p className="truncate text-sm text-secondary">{condition}</p>
          <p className="mt-1 flex items-center text-xs text-secondary">
            <CheckCircle className="mr-1.5 h-3.5 w-3.5 shrink-0 text-accent" />
            {date}
          </p>
        </div>
      </div>

      <Quote className="mb-1.5 h-5 w-5 text-accent/30" aria-hidden />
      <p className="mb-3 line-clamp-3 flex-1 text-sm italic leading-snug text-secondary md:text-base">
        &quot;{text}&quot;
      </p>

      <button
        ref={readMoreRef}
        type="button"
        onClick={openModal}
        aria-haspopup="dialog"
        aria-expanded={modalOpen}
        className="mt-auto inline-flex items-center gap-0.5 self-start text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
      >
        Read more
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      {modal}
    </article>
  )
}
