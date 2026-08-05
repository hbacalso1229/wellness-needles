'use client'

import Link from 'next/link'
import { Leaf, LucideIcon } from 'lucide-react'

interface ServiceCardProps {
  href: string
  icon: LucideIcon
  title: string
  description?: string
  borderColor?: string
  variant?: 'default' | 'primary'
  /** Compact wayfinding card (Explore the Clinic style) */
  compact?: boolean
  className?: string
  external?: boolean
  target?: string
  rel?: string
}

export function ServiceCard({
  href,
  icon: Icon,
  title,
  description,
  borderColor = 'border-accent/15 group-hover:border-primary/30',
  variant = 'default',
  compact = false,
  className = '',
  external = false,
  target,
  rel,
}: ServiceCardProps) {
  const isPrimary = variant === 'primary'
  const isExternal = external || /^https?:\/\//i.test(href)

  const classes = compact
    ? [
        'group relative flex h-full flex-col items-center text-center rounded-2xl p-6 sm:p-7',
        'transition-all duration-300 motion-safe:hover:-translate-y-0.5',
        isPrimary
          ? [
              'bg-primary text-cream',
              'shadow-[0_10px_36px_rgba(212,175,55,0.55),0_4px_16px_rgba(212,175,55,0.4)]',
              'hover:shadow-[0_14px_44px_rgba(212,175,55,0.65),0_6px_20px_rgba(212,175,55,0.45)]',
            ].join(' ')
          : `bg-white border ${borderColor} shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] hover:shadow-[0_12px_28px_rgba(45,80,22,0.16),0_4px_12px_rgba(45,80,22,0.1)]`,
        className,
      ].join(' ')
    : [
        'group rounded-lg p-4 sm:p-6 text-center hover:shadow-lg transition-all duration-300',
        isPrimary
          ? 'bg-primary border border-primary text-cream'
          : `bg-cream border ${borderColor}`,
        className,
      ].join(' ')

  const content = compact ? (
    <>
      {isPrimary ? (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          aria-hidden="true"
        >
          <Leaf
            className="absolute right-2 top-2 h-8 w-8 text-cream/40 rotate-[28deg]"
            strokeWidth={1.5}
          />
          <Leaf
            className="absolute right-8 top-10 h-4 w-4 text-cream/40 -rotate-12"
            strokeWidth={1.5}
          />
          <Leaf
            className="absolute right-2 bottom-24 h-8 w-8 text-cream/40 rotate-[40deg]"
            strokeWidth={1.5}
          />
          <Leaf
            className="absolute left-3 bottom-10 h-4 w-4 text-cream/40 -rotate-45"
            strokeWidth={1.5}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex h-full w-full flex-col items-center">
        <div
          className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${
            isPrimary
              ? 'border border-gold/70 bg-primary'
              : 'bg-accent/10'
          }`}
        >
          <Icon
            className={`h-7 w-7 ${isPrimary ? 'text-gold' : 'text-primary'}`}
            strokeWidth={1.75}
          />
        </div>

        <h3
          className={`mb-2 text-xl font-semibold ${
            isPrimary ? 'text-cream' : 'text-primary'
          }`}
        >
          {title}
        </h3>
        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />

        {description ? (
          <p
            className={`text-sm leading-relaxed mb-6 flex-1 ${
              isPrimary ? 'text-cream/85' : 'text-secondary'
            }`}
          >
            {description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        {isPrimary ? (
          <span className="inline-flex w-full max-w-[220px] items-center justify-center rounded-full bg-gradient-to-r from-[#f3e5a0] via-[#e8c84a] to-gold px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-all duration-200 group-hover:from-[#f7ecc0] group-hover:via-[#f0d45c] group-hover:to-[#c9a52f]">
            Book now →
          </span>
        ) : (
          <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
            Explore →
          </span>
        )}
      </div>
    </>
  ) : (
    <>
      <Icon
        className={`w-9 h-9 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 ${
          isPrimary ? 'text-cream' : 'text-primary'
        }`}
      />
      <h3
        className={`font-semibold text-lg mb-2 ${
          isPrimary ? 'text-cream' : 'text-primary'
        }`}
      >
        {title}
      </h3>
      {description ? (
        <p className={`text-sm ${isPrimary ? 'text-cream/80' : 'text-secondary'}`}>
          {description}
        </p>
      ) : null}
    </>
  )

  if (isExternal) {
    const resolvedTarget = target ?? '_blank'
    const resolvedRel =
      rel ?? (resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined)
    return (
      <a href={href} target={resolvedTarget} rel={resolvedRel} className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
