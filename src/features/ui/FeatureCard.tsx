'use client'

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { LucideIcon, X, ChevronRight } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  className?: string
  /** When true, icon + title show first on md+; below md opens a modal for the description */
  flippable?: boolean
  /** Tighter padding and min-height for denser grids */
  compact?: boolean
  /** Optional content shown below the description (e.g. link or tag) */
  footer?: ReactNode
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = '',
  flippable = false,
  compact = false,
  footer,
}: FeatureCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalClosing, setModalClosing] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const [backdropArmed, setBackdropArmed] = useState(false)
  const teaserRef = useRef<HTMLButtonElement>(null)
  const scrollYRef = useRef(0)
  const wasModalOpenRef = useRef(false)
  const closeTimerRef = useRef<number | null>(null)
  const modalClosingRef = useRef(false)
  const titleId = useId()
  const descId = useId()

  const MODAL_CLOSE_MS = 360

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
          teaserRef.current?.focus({ preventScroll: true })
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

    // Modal is mobile-only — close if viewport crosses to tablet/desktop flip UI
    const mq = window.matchMedia('(min-width: 768px)')
    const onViewportChange = () => {
      if (mq.matches) closeModal()
    }
    onViewportChange()
    mq.addEventListener('change', onViewportChange)

    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(arm)
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current)
        closeTimerRef.current = null
      }
      mq.removeEventListener('change', onViewportChange)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lock/listeners tied to open; closeModal uses refs
  }, [modalOpen])
  const iconCircle = (
    <div
      className={`group/icon rounded-full flex items-center justify-center mx-auto bg-white transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform md:motion-safe:hover:-translate-y-3 md:motion-safe:hover:scale-125 md:motion-safe:group-hover:-translate-y-3 md:motion-safe:group-hover:scale-125 ${
        compact
          ? 'h-9 w-9 mb-1.5 md:h-14 md:w-14 md:mb-3'
          : 'h-11 w-11 mb-2 md:h-16 md:w-16 md:mb-5'
      }`}
    >
      <Icon
        className={`text-secondary/70 transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/icon:text-primary group-hover:text-primary md:motion-safe:group-hover/icon:scale-110 md:motion-safe:group-hover:scale-110 ${
          compact ? 'h-4 w-4 md:h-7 md:w-7' : 'h-5 w-5 md:h-8 md:w-8'
        }`}
      />
    </div>
  )

  const staticCard = (
    <div
      className={`text-center group rounded-lg bg-cream/80 shadow-sm card-emboss ${
        compact ? 'p-4 md:p-5' : 'p-5 md:p-6'
      } ${className}`}
    >
      {iconCircle}
      <h3
        className={`font-serif font-semibold text-primary mb-1.5 md:mb-2 ${
          compact ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'
        }`}
      >
        {title}
      </h3>
      <div
        className={`mx-auto h-0.5 rounded-full bg-gold ${
          compact ? 'mb-3 w-8 md:mb-4 md:w-10' : 'mb-3 w-9 md:mb-4 md:w-10'
        }`}
        aria-hidden="true"
      />
      <p className={`text-secondary ${compact ? 'text-sm md:text-base leading-snug' : ''}`}>
        {description}
      </p>
      {footer ? <div className="mt-3 md:mt-4">{footer}</div> : null}
    </div>
  )

  if (!flippable) {
    return staticCard
  }

  const toggle = () => setIsFlipped((prev) => !prev)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  const openModal = () => {
    if (modalClosingRef.current) return
    scrollYRef.current = window.scrollY
    setModalClosing(false)
    setModalOpen(true)
  }

  const minH = compact ? 'min-h-[200px]' : 'min-h-[280px]'
  const facePad = compact ? 'p-4' : 'p-6'
  const titleClass = compact
    ? 'font-serif text-xl font-semibold text-primary mb-1.5'
    : 'font-serif text-2xl font-semibold text-primary mb-2'

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
          className="relative max-h-[min(90dvh,32rem)] w-full max-w-sm overflow-y-auto rounded-xl border border-accent/20 bg-cream px-4 pb-4 pt-3 text-center shadow-[0_20px_48px_rgba(45,80,22,0.25)] pointer-events-auto"
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

          <h3 id={titleId} className="font-serif text-lg font-semibold text-primary mb-1.5 pr-8 leading-snug">
            {title}
          </h3>
          <div className="mx-auto mb-2.5 h-0.5 w-8 rounded-full bg-gold" aria-hidden="true" />
          <p id={descId} className="text-secondary text-sm leading-snug">
            {description}
          </p>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
      </div>,
      document.body,
    )

  return (
    <div className={`h-full ${className}`}>
      {/* Mobile: compact teaser → modal */}
      <div className="h-full md:hidden">
        <button
          ref={teaserRef}
          type="button"
          onClick={openModal}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          aria-label={`${title}. Tap to learn more.`}
          className={`flex h-full w-full flex-col items-center justify-center text-center group rounded-lg bg-cream/80 shadow-sm card-emboss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
            compact
              ? 'min-h-[5.75rem] p-2'
              : 'min-h-[7rem] p-2.5 sm:p-3'
          }`}
        >
          {iconCircle}
          <h3
            className={`font-serif font-semibold text-primary flex items-center justify-center leading-snug line-clamp-2 px-0.5 ${
              compact
                ? 'mb-1 text-xs sm:text-sm min-h-[2rem]'
                : 'mb-1 text-sm sm:text-base min-h-[2.25rem]'
            }`}
          >
            {title}
          </h3>
          <span
            className={`inline-flex items-center gap-0.5 text-secondary/60 tracking-wide ${
              compact ? 'text-[0.65rem]' : 'text-xs'
            }`}
          >
            Learn more
            <ChevronRight className={compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} aria-hidden />
          </span>
        </button>
        {modal}
      </div>

      {/* Tablet + desktop: 3D flip */}
      <div className={`hidden md:block [perspective:1000px] ${minH}`}>
        <div
          role="button"
          tabIndex={0}
          aria-pressed={isFlipped}
          aria-expanded={isFlipped}
          aria-label={
            isFlipped
              ? `${title}. Tap to hide description.`
              : `${title}. Learn more.`
          }
          onClick={toggle}
          onKeyDown={onKeyDown}
          className={`relative w-full h-full ${minH} text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-lg overflow-hidden`}
        >
          <div
            className={`feature-card-flip relative w-full h-full ${minH}`}
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-cream shadow-sm group ${facePad}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(1px)',
              }}
            >
              {iconCircle}
              <h3 className={titleClass}>{title}</h3>
              <div
                className={`mx-auto h-0.5 w-10 rounded-full bg-gold ${compact ? 'mb-2' : 'mb-3'}`}
                aria-hidden="true"
              />
              <p className="text-xs text-secondary/60 tracking-wide">Learn more</p>
            </div>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-cream shadow-sm ${facePad}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(1px)',
              }}
            >
              <h3 className="font-serif text-xl font-semibold text-primary mb-2">
                {title}
              </h3>
              <div className="mx-auto mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
              <p className="text-secondary text-sm leading-relaxed">
                {description}
              </p>
              {footer ? (
                <div
                  className="mt-4"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  {footer}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
