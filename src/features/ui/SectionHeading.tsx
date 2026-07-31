import { Leaf } from 'lucide-react'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  /** Optional size for home-style larger titles */
  titleClassName?: string
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  titleClassName = 'font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3',
  className = 'text-center mb-8 md:mb-12 lg:mb-16',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className={titleClassName}>{title}</h2>
      <div className="flex flex-col items-center gap-1 mb-3 md:mb-4" aria-hidden="true">
        <Leaf className="w-4 h-4 text-primary" strokeWidth={1.75} />
        <div className="h-0.5 w-10 md:w-14 rounded-full bg-gold" />
      </div>
      {subtitle ? (
        <p className="text-base md:text-lg text-secondary max-w-3xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  )
}
