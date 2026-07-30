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
  titleClassName = 'font-serif text-4xl font-bold text-primary mb-3',
  className = 'text-center mb-16',
}: SectionHeadingProps) {
  return (
    <div className={className}>
      <h2 className={titleClassName}>{title}</h2>
      <div className="flex flex-col items-center gap-1.5 mb-4" aria-hidden="true">
        <Leaf className="w-4 h-4 text-primary" strokeWidth={1.75} />
        <div className="h-0.5 w-14 rounded-full bg-gold" />
      </div>
      {subtitle ? (
        <p className="text-lg text-secondary max-w-3xl mx-auto">{subtitle}</p>
      ) : null}
    </div>
  )
}
