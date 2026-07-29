'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

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
        'group flex h-full flex-col items-center text-center rounded-2xl p-6 sm:p-7',
        'transition-all duration-300 motion-safe:hover:-translate-y-0.5',
        isPrimary
          ? 'bg-primary text-cream shadow-lg shadow-primary/20'
          : `bg-white border ${borderColor} shadow-sm hover:shadow-md`,
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
        className={`font-serif text-xl font-semibold mb-3 ${
          isPrimary ? 'text-cream' : 'text-primary'
        }`}
      >
        {title}
      </h3>

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
        <span className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#e8c84a] to-gold px-5 py-2.5 text-sm font-bold text-primary shadow-md shadow-primary/20 transition-all duration-200 group-hover:from-[#f0d45c] group-hover:to-[#c9a52f]">
          Book now →
        </span>
      ) : (
        <span className="text-sm font-semibold text-primary group-hover:text-accent transition-colors">
          Explore →
        </span>
      )}
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
