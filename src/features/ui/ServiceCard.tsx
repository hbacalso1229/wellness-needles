'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface ServiceCardProps {
  href: string
  icon: LucideIcon
  title: string
  description: string
  borderColor?: string
  variant?: 'default' | 'primary'
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
  borderColor = 'border-blue-light/30 group-hover:border-blue-light',
  variant = 'default',
  className = '',
  external = false,
  target,
  rel,
}: ServiceCardProps) {
  const baseClasses = "group rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300"
  
  const variantClasses = {
    default: `bg-cream border ${borderColor}`,
    primary: "bg-primary border border-primary text-cream"
  }

  const iconColorClasses = variant === 'primary' ? 'text-cream' : 'text-primary'
  const titleColorClasses = variant === 'primary' ? 'text-cream' : 'text-primary'
  const descriptionColorClasses = variant === 'primary' ? 'text-cream/80' : 'text-secondary'

  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  const isExternal = external || /^https?:\/\//i.test(href)
  const content = (
    <>
      <Icon className={`w-12 h-12 ${iconColorClasses} mx-auto mb-4`} />
      <h3 className={`font-semibold text-lg ${titleColorClasses} mb-2`}>{title}</h3>
      <p className={`text-sm ${descriptionColorClasses}`}>{description}</p>
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
