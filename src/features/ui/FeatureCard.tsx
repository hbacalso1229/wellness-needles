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
import Link from 'next/link'
import { LucideIcon, X, ChevronRight, ArrowRight } from 'lucide-react'

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
  /**
   * Keep cream panel + shadow on mobile.
   * Use when the section has a tinted background (e.g. bg-accent/10);
   * omit on cream sections so cards stay flat on small screens.
   */
  elevated?: boolean
  /**
   * Soft icon badge: white circle + muted accent outline icon (without requiring elevated panel).
   * Also enabled automatically when elevated + compact (e.g. home Services).
   */
  softIcon?: boolean
  /**
   * Layout alignment for static (non-flippable) cards.
   * `start` = left-aligned icon+copy row on mobile; centered column from md+.
   */
  align?: 'center' | 'start'
  /** Optional content shown below the description (e.g. link or tag) */
  footer?: ReactNode
  /** Override default serif card title (e.g. sans for denser home grids) */
  titleClassName?: string
  /** When set on static (non-flippable) cards, wraps the card as a link and shows Learn more → */
  href?: string
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = '',
  flippable = false,
  compact = false,
  elevated = false,
  softIcon = false,
  align = 'center',
  footer,
  titleClassName,
  href,
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
  const softBadge = softIcon || (elevated && compact)
  const iconBadgeClass = softBadge
    ? 'border border-accent/25 bg-white shadow-sm'
    : 'bg-white'
  const alignStart = align === 'start'

  const hoverIconCircle = (
    <div
      className={`group/icon flex shrink-0 items-center justify-center rounded-full ${iconBadgeClass} ${
        alignStart ? 'mx-0 md:mx-auto' : 'mx-auto'
      } ${
        softBadge
          ? `${alignStart ? 'mb-0 h-11 w-11' : 'mb-2 h-12 w-12'} md:mb-3 md:h-14 md:w-14 md:transition-[transform,color,background-color] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:motion-safe:group-hover:scale-105`
          : `md:transition-[transform,color,background-color] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:will-change-transform md:motion-safe:hover:-translate-y-3 md:motion-safe:hover:scale-125 md:motion-safe:group-hover:-translate-y-3 md:motion-safe:group-hover:scale-125 ${
              compact
                ? 'mb-1.5 h-9 w-9 md:mb-3 md:h-14 md:w-14'
                : 'mb-2 h-11 w-11 md:mb-5 md:h-16 md:w-16'
            }`
      }`}
    >
      <Icon
        strokeWidth={1.75}
        className={`${
          softBadge
            ? `${alignStart ? 'h-5 w-5' : 'h-6 w-6'} text-accent md:h-8 md:w-8`
            : `text-secondary/70 md:transition-[transform,color] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/icon:text-primary md:group-hover:text-primary md:motion-safe:group-hover/icon:scale-110 md:motion-safe:group-hover:scale-110 ${
                compact ? 'h-4 w-4 md:h-7 md:w-7' : 'h-5 w-5 md:h-8 md:w-8'
              }`
        }`}
      />
    </div>
  )

  const flatIconCircle = (
    <div
      className={`mx-auto flex items-center justify-center rounded-full bg-white md:transition-[transform,color] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:will-change-transform md:motion-safe:group-hover:-translate-y-1.5 md:motion-safe:group-hover:scale-110 ${
        compact
          ? 'mb-2 h-9 w-9 md:mb-2.5 md:h-12 md:w-12'
          : 'mb-2 h-11 w-11 md:mb-5 md:h-16 md:w-16'
      }`}
    >
      <Icon
        strokeWidth={1.75}
        className={`text-secondary/70 md:transition-[transform,color] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover:text-primary md:motion-safe:group-hover:scale-110 ${
          compact ? 'h-4 w-4 md:h-6 md:w-6' : 'h-5 w-5 md:h-8 md:w-8'
        }`}
      />
    </div>
  )

  const cardTitleClass =
    titleClassName ??
    'text-lg font-semibold leading-snug text-[var(--text-dark)] md:text-xl'

  // elevated + align=start: flat list on mobile, full card from md
  const panelClass =
    elevated && alignStart
      ? 'rounded-lg border border-transparent bg-transparent shadow-none md:border-accent/15 md:bg-white md:shadow-sm'
      : elevated
        ? 'rounded-lg border border-accent/15 bg-white shadow-sm'
        : 'rounded-lg border border-transparent bg-transparent shadow-none md:border-accent/15 md:bg-white md:shadow-sm'

  const learnMoreStatic = href ? (
    <span
      className={`mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 md:mt-4 md:transition-[gap,color] md:duration-200 md:group-hover:gap-1.5 md:group-hover:text-secondary md:group-hover:underline ${
        alignStart ? 'justify-start md:justify-center' : 'justify-center'
      }`}
    >
      Learn more
      <ArrowRight
        className="h-4 w-4 md:transition-transform md:duration-200 md:motion-safe:group-hover:translate-x-0.5"
        aria-hidden
      />
    </span>
  ) : null

  const staticCardInner = alignStart ? (
    <>
      {/* Mobile: icon beside copy. md+: centered column (desktop card look) */}
      <div className="flex flex-row items-start gap-3 text-left md:flex-col md:items-center md:gap-0 md:text-center">
        {hoverIconCircle}
        <div className="min-w-0 flex-1 md:flex md:w-full md:flex-col md:items-center">
          <h3 className={`${cardTitleClass} mb-1.5 md:mb-3`}>{title}</h3>
          <p className="text-base leading-relaxed text-[var(--text-dark)]/70">{description}</p>
          {learnMoreStatic}
          {footer ? <div className="mt-3 md:mt-4">{footer}</div> : null}
        </div>
      </div>
    </>
  ) : (
    <>
      {hoverIconCircle}
      <h3 className={`${cardTitleClass} mb-2 md:mb-3`}>{title}</h3>
      <p className="flex-1 text-base leading-relaxed text-[var(--text-dark)]/70">{description}</p>
      {learnMoreStatic}
      {footer ? <div className="mt-3 md:mt-4">{footer}</div> : null}
    </>
  )

  const elevatedHoverClass =
    'md:motion-safe:hover:-translate-y-1.5 md:hover:border-primary/30 md:hover:shadow-[0_14px_32px_rgba(27,59,43,0.12)]'

  // Benefits use align=start without elevated (flat mobile); still need md+ card hover like Services
  const staticCardClassName = `group flex h-full flex-col card-emboss md:transition-[transform,border-color,box-shadow] md:duration-500 md:ease-[cubic-bezier(0.22,1,0.36,1)] ${
    alignStart ? 'items-stretch text-left md:text-center' : 'text-center'
  } ${panelClass} ${
    compact
      ? alignStart
        ? 'p-0 py-1 md:p-5'
        : 'p-4 md:p-5'
      : 'p-5 md:p-6'
  } ${
    href || elevated || alignStart ? elevatedHoverClass : ''
  } ${
    href
      ? 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white'
      : ''
  } ${className}`

  const staticCard = href ? (
    <Link href={href} className={`block h-full ${staticCardClassName}`}>
      {staticCardInner}
    </Link>
  ) : (
    <div className={staticCardClassName}>{staticCardInner}</div>
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

  const minH = compact ? 'min-h-[240px]' : 'min-h-[220px]'
  const facePad = compact ? 'p-5 md:p-6' : 'p-4 md:p-5'
  const titleClass = `${cardTitleClass} ${compact ? 'mb-2' : 'mb-2'}`

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
          className="pointer-events-auto relative max-h-[min(90dvh,32rem)] w-full max-w-sm overflow-y-auto rounded-xl border border-accent/20 bg-white px-4 pb-4 pt-3 text-center shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
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

          <h3 id={titleId} className={`${cardTitleClass} mb-2.5 pr-8 leading-snug`}>
            {title}
          </h3>
          <p id={descId} className="text-base leading-relaxed text-[var(--text-dark)]/70">
            {description}
          </p>
          {footer ? <div className="mt-3">{footer}</div> : null}
        </div>
      </div>,
      document.body,
    )

  const learnMoreClass =
    'inline-flex items-center gap-0.5 text-sm font-medium text-primary tracking-wide transition-colors duration-200 md:group-hover:text-primary'

  return (
    <div className={`h-full min-w-0 ${className}`}>
      {/* Mobile: compact teaser → modal (whole card is the tap target) */}
      <div className="h-full md:hidden">
        <button
          ref={teaserRef}
          type="button"
          onClick={openModal}
          aria-haspopup="dialog"
          aria-expanded={modalOpen}
          aria-label={`${title}. Tap to learn more.`}
          className={`flex h-full w-full flex-col items-center justify-center text-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream active:bg-accent/10 ${panelClass} ${
            compact
              ? 'min-h-[7.5rem] p-5'
              : 'min-h-[7rem] p-2.5 sm:p-3'
          }`}
        >
          {flatIconCircle}
          <h3
            className={`flex items-center justify-center px-0.5 font-semibold leading-snug text-[var(--text-dark)] line-clamp-2 ${
              compact
                ? 'mb-2 text-base sm:text-lg'
                : 'mb-1.5 min-h-[2.5rem] text-lg'
            }`}
          >
            {title}
          </h3>
          <span className={learnMoreClass} aria-hidden>
            Learn more
            <ChevronRight className="h-4 w-4" />
          </span>
        </button>
        {modal}
      </div>

      {/* Tablet + desktop: 3D flip (whole card is the click target) */}
      <div
        className={`hidden md:block [perspective:1000px] ${minH} transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:hover:-translate-y-1.5`}
      >
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
          className={`group relative w-full h-full ${minH} text-left cursor-pointer rounded-lg overflow-hidden border border-accent/15 bg-white shadow-sm transition-[box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-primary/30 hover:shadow-[0_14px_32px_rgba(27,59,43,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream`}
        >
          <div
            className={`feature-card-flip relative w-full h-full ${minH}`}
            style={{
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-white ${facePad}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(1px)',
              }}
            >
              {flatIconCircle}
              <h3 className={titleClass}>{title}</h3>
              <span className={learnMoreClass} aria-hidden>
                Learn more
                <ChevronRight className="h-4 w-4 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5" />
              </span>
            </div>

            <div
              className={`absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-white ${facePad}`}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg) translateZ(1px)',
              }}
            >
              <h3 className={`${cardTitleClass} mb-3`}>
                {title}
              </h3>
              <p className="max-w-full text-base leading-relaxed text-[var(--text-dark)]/70">
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
