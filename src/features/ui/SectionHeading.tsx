import { type ReactNode, type Ref } from 'react'
import { Leaf } from 'lucide-react'

interface SectionHeadingProps {
  title: string
  subtitle?: ReactNode
  /** Optional line between title and leaf divider (e.g. practitioner credit) */
  credit?: ReactNode
  /** Optional size for home-style larger titles */
  titleClassName?: string
  subtitleClassName?: string
  creditClassName?: string
  leafClassName?: string
  className?: string
  /** Heading element for the title (default h2). Use h1 on standalone result pages. */
  titleAs?: 'h1' | 'h2'
  titleRef?: Ref<HTMLHeadingElement>
  titleTabIndex?: number
}

export function SectionHeading({
  title,
  subtitle,
  credit,
  titleClassName = 'font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3',
  subtitleClassName = 'text-base sm:text-lg md:text-xl text-[var(--text-dark)]/70 max-w-3xl mx-auto leading-relaxed',
  creditClassName = 'mb-2 text-base text-[var(--text-dark)]/70 md:mb-3',
  leafClassName = 'h-3.5 w-3.5 shrink-0 text-primary md:h-4 md:w-4',
  className = 'text-center mb-6 md:mb-8 lg:mb-10',
  titleAs = 'h2',
  titleRef,
  titleTabIndex,
}: SectionHeadingProps) {
  const TitleTag = titleAs

  return (
    <div className={className}>
      <TitleTag
        ref={titleRef}
        tabIndex={titleTabIndex}
        className={`${titleClassName}${titleTabIndex !== undefined ? ' outline-none' : ''}`}
      >
        {title}
      </TitleTag>
      {credit ? <p className={creditClassName}>{credit}</p> : null}
      <div className="mb-3 flex items-center justify-center gap-2 md:mb-4" aria-hidden="true">
        <div className="h-0.5 w-8 rounded-full bg-gold md:w-14" />
        <Leaf className={leafClassName} strokeWidth={1.75} />
        <div className="h-0.5 w-8 rounded-full bg-gold md:w-14" />
      </div>
      {subtitle ? (
        <p className={subtitleClassName}>{subtitle}</p>
      ) : null}
    </div>
  )
}
