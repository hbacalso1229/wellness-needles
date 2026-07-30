'use client'

import { useState, type KeyboardEvent, type ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  className?: string
  /** When true, icon + title show first; tap/click flips to reveal description */
  flippable?: boolean
  /** Optional content shown below the description (e.g. link or tag) */
  footer?: ReactNode
}

const hoverFromClasses: Record<string, string> = {
  'from-accent/10': 'group-hover:from-accent/20',
  'from-blue-light/10': 'group-hover:from-blue-light/20',
  'from-primary/10': 'group-hover:from-primary/20',
}

const hoverToClasses: Record<string, string> = {
  'to-blue-light/10': 'group-hover:to-blue-light/20',
  'to-accent/10': 'group-hover:to-accent/20',
  'to-blue-primary/10': 'group-hover:to-blue-primary/20',
  'to-primary/10': 'group-hover:to-primary/20',
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradientFrom = 'from-accent/10',
  gradientTo = 'to-blue-light/10',
  className = '',
  flippable = false,
  footer,
}: FeatureCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const hoverFrom = hoverFromClasses[gradientFrom] ?? ''
  const hoverTo = hoverToClasses[gradientTo] ?? ''

  const iconCircle = (
    <div
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} ${hoverFrom} ${hoverTo} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 transition-all duration-300 shadow-[0_8px_20px_rgba(74,124,42,0.28),0_2px_8px_rgba(45,80,22,0.14)]`}
    >
      <Icon className="w-10 h-10 text-primary" />
    </div>
  )

  if (!flippable) {
    return (
      <div
        className={`text-center group rounded-lg bg-cream/80 p-6 shadow-sm card-emboss ${className}`}
      >
        {iconCircle}
        <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
          {title}
        </h3>
        <p className="text-secondary">{description}</p>
        {footer ? <div className="mt-4">{footer}</div> : null}
      </div>
    )
  }

  const toggle = () => setIsFlipped((prev) => !prev)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <div className={`[perspective:1000px] min-h-[280px] ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-expanded={isFlipped}
        aria-label={
          isFlipped
            ? `${title}. Tap to hide description.`
            : `${title}. Tap to learn more.`
        }
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="relative w-full h-full min-h-[280px] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-lg overflow-hidden"
      >
        <div
          className={`relative w-full h-full min-h-[280px] transition-transform duration-[2000ms] ease-in-out [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front: icon + title */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-cream p-6 shadow-sm group"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'translateZ(1px)',
            }}
          >
            {iconCircle}
            <h3 className="font-serif text-2xl font-semibold text-primary mb-3">
              {title}
            </h3>
            <p className="text-xs text-secondary/60 tracking-wide">
              Tap to learn more
            </p>
          </div>

          {/* Back: description (+ optional footer) */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-lg bg-cream p-6 shadow-sm"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(1px)',
            }}
          >
            <h3 className="font-serif text-xl font-semibold text-primary mb-4">
              {title}
            </h3>
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
  )
}
