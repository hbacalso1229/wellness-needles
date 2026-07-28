'use client'

import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  gradientFrom?: string
  gradientTo?: string
  className?: string
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
  className = ''
}: FeatureCardProps) {
  const hoverFrom = hoverFromClasses[gradientFrom] ?? ''
  const hoverTo = hoverToClasses[gradientTo] ?? ''

  return (
    <div className={`text-center group ${className}`}>
      <div
        className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} ${hoverFrom} ${hoverTo} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 transition-all duration-300`}
      >
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="font-serif text-2xl font-semibold text-primary mb-4">
        {title}
      </h3>
      <p className="text-secondary">
        {description}
      </p>
    </div>
  )
}
