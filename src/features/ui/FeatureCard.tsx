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

export function FeatureCard({
  icon: Icon,
  title,
  description,
  className = '',
  flippable = false,
  footer,
}: FeatureCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const iconCircle = (
    <div
      className="group/icon rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-white transition-all duration-300 ease-out will-change-transform shadow-[0_4px_12px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.08)] motion-safe:hover:-translate-y-2 motion-safe:hover:scale-110 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:scale-110 hover:shadow-[0_20px_40px_rgba(74,124,42,0.4),0_8px_16px_rgba(45,80,22,0.22)] group-hover:shadow-[0_20px_40px_rgba(74,124,42,0.4),0_8px_16px_rgba(45,80,22,0.22)]"
    >
      <Icon className="w-10 h-10 text-secondary/70 transition-all duration-300 ease-out group-hover/icon:text-primary group-hover:text-primary motion-safe:group-hover/icon:scale-110 motion-safe:group-hover:scale-110" />
    </div>
  )

  if (!flippable) {
    return (
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
            : `${title}. Learn more.`
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
            <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
              {title}
            </h3>
            <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
            <p className="text-xs text-secondary/60 tracking-wide">
              Learn more
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
  )
}
