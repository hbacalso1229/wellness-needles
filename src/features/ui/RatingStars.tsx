'use client'

import { useState, type KeyboardEvent } from 'react'
import { Star } from 'lucide-react'

const RATING_STEPS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const

export function formatStarRating(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

export function RatingStars({
  rating,
  className = 'h-3.5 w-3.5',
}: {
  rating: number
  className?: string
}) {
  const numeric = typeof rating === 'number' ? rating : Number(rating)
  const clamped = Number.isFinite(numeric) ? Math.min(5, Math.max(0, numeric)) : 0
  const label = formatStarRating(clamped)
  return (
    <div
      className="flex items-center"
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
      aria-label={`${label} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          clamped >= star ? 'full' : clamped >= star - 0.5 ? 'half' : 'empty'
        return <StarGlyph key={star} fill={fill} className={className} />
      })}
    </div>
  )
}

const GOLD = '#d4af37'

export function StarGlyph({
  fill,
  className = 'h-3.5 w-3.5',
}: {
  fill: 'full' | 'half' | 'empty'
  className?: string
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Star
        className={className}
        style={{ color: 'rgba(212, 175, 55, 0.25)' }}
        aria-hidden
      />
      {fill !== 'empty' ? (
        <Star
          className={className}
          style={{
            position: 'absolute',
            inset: 0,
            color: GOLD,
            fill: GOLD,
            clipPath: fill === 'half' ? 'inset(0 50% 0 0)' : undefined,
          }}
          aria-hidden
        />
      ) : null}
    </span>
  )
}

function fillForValue(value: number | null, star: number): 'full' | 'half' | 'empty' {
  if (value == null) return 'empty'
  if (value >= star) return 'full'
  if (value >= star - 0.5) return 'half'
  return 'empty'
}

export function HalfStarPicker({
  value,
  onChange,
  invalid = false,
  emptyHint = 'Select 1 to 5 stars. Half stars allowed.',
}: {
  value: number | null
  onChange: (next: number) => void
  invalid?: boolean
  emptyHint?: string
}) {
  const [preview, setPreview] = useState<number | null>(null)
  const shown = preview ?? value
  const valueText =
    shown == null ? 'No rating selected' : `${formatStarRating(shown)} out of 5`

  const nudge = (delta: number) => {
    const index = value == null ? -1 : RATING_STEPS.findIndex((step) => step === value)
    const nextIndex = Math.min(
      RATING_STEPS.length - 1,
      Math.max(0, (index < 0 ? (delta > 0 ? -1 : 0) : index) + delta)
    )
    onChange(RATING_STEPS[nextIndex])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
      event.preventDefault()
      nudge(1)
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
      event.preventDefault()
      nudge(-1)
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      onChange(1)
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      onChange(5)
    }
  }

  return (
    <div>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Rating"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value ?? undefined}
        aria-valuetext={valueText}
        aria-invalid={invalid || undefined}
        aria-required
        className={`rounded-lg px-1 py-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
          invalid ? 'ring-2 ring-red-400' : ''
        }`}
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap',
          alignItems: 'center',
        }}
        onMouseLeave={() => setPreview(null)}
        onBlur={() => setPreview(null)}
        onKeyDown={onKeyDown}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const half = star === 1 ? 1 : star - 0.5
          const fill = fillForValue(shown, star)
          const selected = value === half || value === star
          return (
            <span
              key={star}
              style={{
                position: 'relative',
                display: 'inline-flex',
                width: 36,
                height: 36,
                flexShrink: 0,
                alignItems: 'center',
                justifyContent: 'center',
                transform: selected ? 'scale(1.04)' : undefined,
              }}
            >
              <button
                type="button"
                tabIndex={-1}
                aria-label={`${formatStarRating(half)} out of 5`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  zIndex: 10,
                  width: '50%',
                  height: '100%',
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setPreview(half)}
                onFocus={() => setPreview(half)}
                onClick={() => onChange(half)}
              />
              <button
                type="button"
                tabIndex={-1}
                aria-label={`${star} out of 5`}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  zIndex: 10,
                  width: '50%',
                  height: '100%',
                  padding: 0,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setPreview(star)}
                onFocus={() => setPreview(star)}
                onClick={() => onChange(star)}
              />
              <span
                style={{
                  pointerEvents: 'none',
                  position: 'relative',
                  display: 'flex',
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarGlyph fill={fill} className="h-7 w-7" />
                {fill === 'half' ? (
                  <span
                    style={{
                      position: 'absolute',
                      top: 2,
                      bottom: 2,
                      left: '50%',
                      width: 1,
                      background: 'rgba(212, 175, 55, 0.7)',
                    }}
                    aria-hidden
                  />
                ) : null}
              </span>
            </span>
          )
        })}
      </div>
      <p className="mt-1 text-sm text-secondary" aria-live="polite">
        {shown == null
          ? emptyHint
          : `${formatStarRating(shown)} out of 5`}
      </p>
    </div>
  )
}
