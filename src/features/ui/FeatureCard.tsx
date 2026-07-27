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

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradientFrom = 'from-accent/10',
  gradientTo = 'to-blue-light/10',
  className = ''
}: FeatureCardProps) {
  return (
    <div className={`text-center group ${className}`}>
      <div className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:${gradientFrom.replace('/10', '/20')} group-hover:${gradientTo.replace('/10', '/20')} transition-all duration-300`}>
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
