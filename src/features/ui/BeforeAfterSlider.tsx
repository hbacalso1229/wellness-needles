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
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type BeforeAfterSliderProps = {
  beforeSrc: string
  afterSrc: string
  title: string
  description?: string
  /** Short result line under the title, e.g. outcome highlight */
  highlight?: string
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
    <div className="absolute inset-0 overflow-hidden bg-cream">
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
        style={rotate ? { transform: `rotate(${rotate}) scale(1.35)` } : undefined}
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
    [highlight ? highlightId : null, description ? descId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <figure
      className={`group/ba mx-auto flex h-full w-full flex-col ${className}`}
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
        className={`relative w-full touch-none overflow-hidden rounded-lg border border-black/5 bg-cream outline-none select-none ring-1 ring-inset ring-black/[0.06] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white ${aspectClassName} ${
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
          className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-16 bg-gradient-to-b from-black/10 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-14 bg-gradient-to-t from-black/20 to-transparent"
          aria-hidden
        />

        <div
          className={`pointer-events-none absolute inset-y-0 z-10 ${transitionClass}`}
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          aria-hidden
        >
          <div className="absolute inset-y-0 left-1/2 w-12 -translate-x-1/2" />
          <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-cream shadow-[0_0_0_1px_rgba(45,80,22,0.4)] transition-[box-shadow] duration-200 group-hover/card:shadow-[0_0_0_1px_rgba(45,80,22,0.55)]" />
          <div
            className={`absolute top-1/2 left-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-0.5 rounded-full bg-primary text-cream ring-2 ring-cream shadow-lg transition-[transform,box-shadow,ring-width,ring-color,filter] duration-200 md:size-12 group-hover/card:brightness-110 ${
              dragging || previewing
                ? 'scale-[1.08] ring-4 ring-primary/25'
                : 'group-hover/ba:scale-[1.08] group-hover/ba:ring-4 group-hover/ba:ring-primary/25 group-hover/card:scale-[1.08] group-hover/card:ring-4 group-hover/card:ring-primary/25 group-focus-within/ba:scale-[1.08] group-focus-within/ba:ring-4 group-focus-within/ba:ring-primary/25'
            }`}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} aria-hidden />
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} aria-hidden />
          </div>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full border border-cream/70 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream backdrop-blur-[4px] md:text-[11px]">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full border border-cream/70 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cream backdrop-blur-[4px] md:text-[11px]">
          After
        </span>
      </div>

      <figcaption className="mt-4 flex flex-1 flex-col px-0.5 text-center md:mt-5">
        <h3
          id={titleId}
          className="font-serif text-lg font-bold leading-tight tracking-tight text-[var(--text-dark)] md:text-2xl"
        >
          {title}
        </h3>
        {highlight ? (
          <p
            id={highlightId}
            className="mt-1.5 text-base font-bold leading-snug text-[var(--text-dark)] md:mt-2 md:text-lg"
          >
            {highlight}
          </p>
        ) : null}
        {description ? (
          <p
            id={descId}
            className="mt-1.5 text-xs leading-snug text-secondary md:mt-2 md:text-sm md:leading-relaxed"
          >
            {description}
          </p>
        ) : null}
      </figcaption>
    </figure>
  )
}
