'use client'

import { Star } from 'lucide-react'

export function RatingStars({
  rating,
  className = 'h-3.5 w-3.5',
}: {
  rating: number
  className?: string
}) {
  const clamped = Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0
  const label = Number.isInteger(clamped) ? `${clamped}` : clamped.toFixed(1)
  return (
    <div className="flex items-center" aria-label={`${label} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill =
          clamped >= star ? 'full' : clamped >= star - 0.5 ? 'half' : 'empty'
        return <StarGlyph key={star} fill={fill} className={className} />
      })}
    </div>
  )
}

export function StarGlyph({
  fill,
  className = 'h-3.5 w-3.5',
}: {
  fill: 'full' | 'half' | 'empty'
  className?: string
}) {
  return (
    <span className={`relative inline-block ${className}`}>
      <Star className={`${className} text-gold/25`} aria-hidden />
      {fill !== 'empty' ? (
        <Star
          className={`absolute inset-0 ${className} fill-gold text-gold`}
          style={fill === 'half' ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
          aria-hidden
        />
      ) : null}
    </span>
  )
}

export function HalfStarPicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (next: number) => void
}) {
  return (
    <div role="radiogroup" aria-label="Star rating" className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const half = star === 1 ? 1 : star - 0.5
        const fill =
          value != null && value >= star
            ? 'full'
            : value != null && value >= star - 0.5
              ? 'half'
              : 'empty'
        return (
          <span key={star} className="relative inline-flex h-8 w-8">
            <button
              type="button"
              aria-label={`${half} stars`}
              aria-checked={value === half}
              role="radio"
              className="absolute left-0 top-0 z-10 h-full w-1/2"
              onClick={() => onChange(half)}
            />
            <button
              type="button"
              aria-label={`${star} stars`}
              aria-checked={value === star}
              role="radio"
              className="absolute right-0 top-0 z-10 h-full w-1/2"
              onClick={() => onChange(star)}
            />
            <span className="pointer-events-none flex h-8 w-8 items-center justify-center">
              <StarGlyph fill={fill} className="h-6 w-6" />
            </span>
          </span>
        )
      })}
    </div>
  )
}
