import { type ReactNode } from 'react'
import { Leaf } from 'lucide-react'

interface SectionHeadingProps {
  title: string
  subtitle?: ReactNode
  /** Optional size for home-style larger titles */
  titleClassName?: string
  subtitleClassName?: string
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  titleClassName = 'font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3',
  subtitleClassName = 'text-sm md:text-lg text-secondary max-w-3xl mx-auto',
  className = 'text-center mb-8 md:mb-12 lg:mb-16',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className={titleClassName}>{title}</h2>
      <div className="mb-2 flex items-center justify-center gap-2 md:mb-4" aria-hidden="true">
        <div className="h-0.5 w-8 rounded-full bg-gold md:w-14" />
        <Leaf className="h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4" strokeWidth={1.75} />
        <div className="h-0.5 w-8 rounded-full bg-gold md:w-14" />
      </div>
      {subtitle ? (
        <p className={subtitleClassName}>{subtitle}</p>
      ) : null}
    </div>
  )
}
