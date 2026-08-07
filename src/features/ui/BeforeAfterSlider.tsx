'use client'

import Image from 'next/image'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react'

export type BeforeAfterSliderProps = {
  beforeSrc: string
  afterSrc: string
  title: string
  description?: string
  /** Short result line under the title, e.g. outcome highlight */
  highlight?: string
  /** Compact trust/proof bullets under the highlight */
  proofPoints?: string[]
  altBefore: string
  altAfter: string
  /** CSS angle to level tilted source photos, e.g. "-35deg" */
  beforeRotate?: string
  afterRotate?: string
  /** Frame aspect; default square. Use taller ratios for portrait collages. */
  aspectClassName?: string
  /** cover crops to fill; contain shows the full image (better for collages). */
  imageFit?: 'cover' | 'contain'
  className?: string
}

const KEY_STEP = 4

function LayerImage({
  src,
  alt,
  rotate,
  fit,
  priority,
}: {
  src: string
  alt: string
  rotate?: string
  fit: 'cover' | 'contain'
  priority?: boolean
}) {
  return (
    <div className="absolute inset-0 overflow-hidden [isolation:isolate]">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={priority}
        className={
          fit === 'contain'
            ? 'object-contain object-center'
            : 'object-cover object-center'
        }
        style={rotate ? { transform: `rotate(${rotate}) scale(1.72)` } : undefined}
      />
    </div>
  )
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  title,
  description,
  highlight,
  proofPoints,
  altBefore,
  altAfter,
  beforeRotate,
  afterRotate,
  aspectClassName = 'aspect-square',
  imageFit = 'cover',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const [dragging, setDragging] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [hintPulse, setHintPulse] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const interactedRef = useRef(false)
  const titleId = useId()
  const descId = useId()
  const highlightId = useId()

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    let cancelled = false

    const runPreview = async () => {
      await sleep(400)
      if (cancelled || interactedRef.current) return
      setPreviewing(true)
      setPosition(42)
      await sleep(350)
      if (cancelled || interactedRef.current) {
        setPreviewing(false)
        return
      }
      setPosition(58)
      await sleep(350)
      if (cancelled || interactedRef.current) {
        setPreviewing(false)
        return
      }
      setPosition(50)
      await sleep(300)
      if (!cancelled) setPreviewing(false)
    }

    void runPreview()
    return () => {
      cancelled = true
    }
  }, [])

  const markInteracted = useCallback(() => {
    interactedRef.current = true
    setPreviewing(false)
    setHintPulse(false)
  }, [])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      setHintPulse(false)
      return
    }

    const timeout = window.setTimeout(() => {
      if (!interactedRef.current) setHintPulse(false)
    }, 3200)

    return () => window.clearTimeout(timeout)
  }, [])

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }, [])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    markInteracted()
    draggingRef.current = true
    setDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromClientX(event.clientX)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromClientX(event.clientX)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const nudgePosition = useCallback(
    (delta: number) => {
      markInteracted()
      setPosition((prev) => Math.min(100, Math.max(0, prev + delta)))
    },
    [markInteracted],
  )

  const onTrackKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      nudgePosition(-KEY_STEP)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      nudgePosition(KEY_STEP)
    } else if (event.key === 'Home') {
      event.preventDefault()
      markInteracted()
      setPosition(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      markInteracted()
      setPosition(100)
    }
  }

  const transitionClass =
    dragging ? '' : 'transition-[clip-path,left] duration-300 ease-out'

  const describedBy =
    [
      highlight ? highlightId : null,
      description ? descId : null,
      proofPoints?.length ? `${titleId}-proof` : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <figure
      className={`group/ba patient-card-body w-full ${className}`}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
    >
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-label={`Compare before and after: ${title}`}
        className={`before-after-slider card-media-wrapper relative touch-none overflow-hidden border border-[#1B3B2B]/10 bg-[#FAF8F5] outline-none select-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
          dragging ? 'cursor-grabbing' : 'cursor-ew-resize'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onTrackKeyDown}
      >
        <LayerImage
          src={afterSrc}
          alt={altAfter}
          rotate={afterRotate}
          fit={imageFit}
          priority
        />

        <div
          className={`absolute inset-0 ${transitionClass}`}
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden={position < 2}
        >
          <LayerImage
            src={beforeSrc}
            alt={altBefore}
            rotate={beforeRotate}
            fit={imageFit}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-black/15 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 bg-gradient-to-t from-black/25 to-transparent"
          aria-hidden
        />

        <div
          className={`pointer-events-none absolute inset-y-0 z-10 ${transitionClass}`}
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          aria-hidden
        >
          <div className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2" />
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#FAF8F5]/90 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
          <div
            className={`absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full border-2 border-[#1B3B2B] bg-[#FAF8F5] text-[#1B3B2B] shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-[transform,box-shadow,opacity] duration-200 md:size-12 ${
              hintPulse ? 'ba-handle-pulse' : ''
            } ${
              dragging || previewing
                ? 'scale-[1.06] shadow-[0_6px_16px_rgba(0,0,0,0.3)]'
                : 'group-hover/ba:scale-[1.06] group-hover/card:scale-[1.06] group-focus-within/ba:scale-[1.06]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            <ChevronRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          </div>
          {hintPulse ? (
            <span className="pointer-events-none absolute top-[calc(50%+1.85rem)] left-1/2 -translate-x-1/2 rounded-full bg-[#1B3B2B]/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#FAF8F5] shadow-sm backdrop-blur-[2px] md:top-[calc(50%+2.1rem)]">
              Drag
            </span>
          ) : null}
        </div>

        <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70 backdrop-blur-[4px] bg-black/30">
          Before
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 z-20 rounded border border-gold/45 bg-[#1B3B2B]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#FAF8F5] backdrop-blur-[4px] shadow-sm">
          After
        </span>
      </div>

      <figcaption className="result-card-caption px-0.5 text-center">
        <h3
          id={titleId}
          className="result-card-title text-xl leading-tight text-[var(--text-dark)] md:text-2xl"
        >
          {title}
        </h3>
        {highlight ? (
          <p
            id={highlightId}
            className="mt-1.5 text-base font-medium leading-snug text-[var(--text-dark)]/85 md:mt-2"
          >
            {highlight}
          </p>
        ) : null}
        {proofPoints && proofPoints.length > 0 ? (
          <ul
            id={`${titleId}-proof`}
            className="mx-auto mt-3 flex w-full max-w-xs flex-col gap-1.5 text-left md:mt-4"
          >
            {proofPoints.map((point) => (
              <li
                key={point}
                className="inline-flex items-start gap-1.5 text-xs leading-snug text-[#1B3B2B]/80 md:text-sm"
              >
                <BadgeCheck
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1B3B2B]"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {description ? (
          <p
            id={descId}
            className="patient-card-subtext pt-3 text-xs leading-snug text-[var(--text-dark)]/55 md:pt-4 md:text-sm md:leading-relaxed"
          >
            {description}
          </p>
        ) : null}
      </figcaption>
    </figure>
  )
}
