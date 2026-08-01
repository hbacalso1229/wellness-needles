'use client'

import Image from 'next/image'
import { useCallback, useId, useRef, useState } from 'react'
import { GripVertical } from 'lucide-react'

export type BeforeAfterSliderProps = {
  beforeSrc: string
  afterSrc: string
  title: string
  description?: string
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
        sizes="(max-width: 768px) 100vw, 40vw"
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

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  title,
  description,
  altBefore,
  altAfter,
  beforeRotate,
  afterRotate,
  aspectClassName = 'aspect-square',
  imageFit = 'cover',
  className = '',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const titleId = useId()
  const descId = useId()
  const rangeId = useId()

  const updateFromClientX = useCallback((clientX: number) => {
    const el = trackRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0) return
    const next = ((clientX - rect.left) / rect.width) * 100
    setPosition(Math.min(100, Math.max(0, next)))
  }, [])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromClientX(event.clientX)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    updateFromClientX(event.clientX)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <figure
      className={`group mx-auto w-full max-w-lg ${className}`}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <div
        ref={trackRef}
        className={`relative w-full touch-none overflow-hidden rounded-xl border border-accent/15 bg-cream select-none transition-transform duration-300 motion-safe:md:group-hover:-translate-y-1 ${aspectClassName}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <LayerImage
          src={afterSrc}
          alt={altAfter}
          rotate={afterRotate}
          fit={imageFit}
          priority
        />

        <div
          className="absolute inset-0"
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
          className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-cream"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          aria-hidden
        >
          <div className="absolute top-1/2 left-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/25 bg-primary text-cream shadow-none md:h-9 md:w-9">
            <GripVertical className="h-3.5 w-3.5 md:h-4 md:w-4" aria-hidden />
          </div>
        </div>

        <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream md:text-xs">
          Before
        </span>
        <span className="pointer-events-none absolute right-3 top-3 z-20 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream md:text-xs">
          After
        </span>

        <label className="sr-only" htmlFor={rangeId}>
          Compare before and after photos
        </label>
        <input
          id={rangeId}
          type="range"
          min={0}
          max={100}
          value={Math.round(position)}
          onChange={(event) => setPosition(Number(event.target.value))}
          onPointerDown={(event) => event.stopPropagation()}
          className="absolute inset-x-3 bottom-3 z-20 h-8 cursor-ew-resize appearance-none bg-transparent accent-primary"
        />
      </div>

      <figcaption className="mt-2.5 px-1 text-center md:mt-4">
        <h3 id={titleId} className="text-sm font-semibold leading-snug text-primary md:text-lg">
          {title}
        </h3>
        {description ? (
          <p
            id={descId}
            className="mt-1 line-clamp-2 text-xs leading-snug text-secondary md:mt-1.5 md:line-clamp-none md:text-sm md:leading-relaxed"
          >
            {description}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] text-secondary/80 md:mt-2 md:text-xs">
          Drag to compare
        </p>
      </figcaption>
    </figure>
  )
}
