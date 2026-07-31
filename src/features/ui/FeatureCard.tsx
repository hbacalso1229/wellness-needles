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
import { LucideIcon, X } from 'lucide-react'

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
  const [portalReady, setPortalReady] = useState(false)
  const [backdropArmed, setBackdropArmed] = useState(false)
  const teaserRef = useRef<HTMLButtonElement>(null)
  const scrollYRef = useRef(0)
  const wasModalOpenRef = useRef(false)
  const titleId = useId()
  const descId = useId()

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!modalOpen) {
      setBackdropArmed(false)
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
    const arm = window.setTimeout(() => setBackdropArmed(true), 400)

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setModalOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(arm)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [modalOpen])
  const iconCircle = (
    <div
      className={`group/icon rounded-full flex items-center justify-center mx-auto bg-white transition-[transform,box-shadow,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform shadow-[0_4px_12px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)] motion-safe:hover:-translate-y-3 motion-safe:hover:scale-125 motion-safe:group-hover:-translate-y-3 motion-safe:group-hover:scale-125 hover:shadow-[0_28px_56px_rgba(74,124,42,0.38),0_12px_24px_rgba(45,80,22,0.2)] group-hover:shadow-[0_28px_56px_rgba(74,124,42,0.38),0_12px_24px_rgba(45,80,22,0.2)] ${
        compact ? 'h-14 w-14 mb-3' : 'h-16 w-16 mb-5'
      }`}
    >
      <Icon
        className={`text-secondary/70 transition-[transform,color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/icon:text-primary group-hover:text-primary motion-safe:group-hover/icon:scale-110 motion-safe:group-hover:scale-110 ${
          compact ? 'h-7 w-7' : 'h-8 w-8'
        }`}
      />
    </div>
  )

  const staticCard = (
    <div
      className={`text-center group rounded-lg bg-cream/80 p-6 shadow-sm card-emboss ${className}`}
    >
      {iconCircle}
      <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
        {title}
      </h3>
      <div className="mx-auto mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
      <p className="text-secondary">{description}</p>
      {footer ? <div className="mt-4">{footer}</div> : null}
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
    scrollYRef.current = window.scrollY
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)
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
          backdropArmed ? '' : 'pointer-events-none'
        }`}
        role="presentation"
        onClick={backdropArmed ? closeModal : undefined}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className="relative max-h-[min(90dvh,32rem)] w-full max-w-sm overflow-y-auto rounded-xl border border-accent/20 bg-cream p-6 text-center shadow-[0_20px_48px_rgba(45,80,22,0.25)] pointer-events-auto"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={closeModal}
            className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-secondary hover:bg-accent/15 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
            <Icon className="h-8 w-8 text-secondary/70" strokeWidth={1.75} />
          </div>
          <h3 id={titleId} className="font-serif text-2xl font-semibold text-primary mb-2 pr-6">
            {title}
          </h3>
          <div className="mx-auto mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
          <p id={descId} className="text-secondary leading-relaxed">
            {description}
          </p>
          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      {/* Mobile: compact teaser → modal */}
      <div className="md:hidden">
        <button
          ref={teaserRef}
          type="button"
          onClick={openModal}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          aria-label={`${title}. Tap to learn more.`}
          className={`w-full text-center group rounded-lg bg-cream/80 p-5 shadow-sm card-emboss focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${className}`}
        >
          {iconCircle}
          <h3 className="font-serif text-xl font-semibold text-primary mb-2">
            {title}
          </h3>
          <div className="mx-auto h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
        </button>
        {modal}
      </div>

      {/* Tablet + desktop: 3D flip */}
      <div className={`hidden md:block [perspective:1000px] ${minH} ${className}`}>
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
    </>
  )
}
