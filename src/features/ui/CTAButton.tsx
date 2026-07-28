'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'gold'
  size?: 'medium' | 'large'
  showArrow?: boolean
  className?: string
  /** Open in a new tab (external Fresha / absolute URLs). */
  external?: boolean
  target?: string
  rel?: string
}

export function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'large',
  showArrow = true,
  className = '',
  external = false,
  target,
  rel,
}: CTAButtonProps) {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-gold to-blue-primary text-primary hover:from-gold/90 hover:to-blue-primary/90',
    secondary: 'border-2 border-cream text-cream hover:bg-cream hover:text-primary',
    gold: 'bg-gold text-primary hover:bg-gold/90'
  }

  const sizeClasses = {
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }

  const classes = `${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-lg ${className}`
  const isExternal = external || /^https?:\/\//i.test(href)

  if (isExternal) {
    return (
      <a
        href={href}
        target={target ?? '_blank'}
        rel={rel ?? (target === undefined || target === '_blank' ? 'noopener noreferrer' : undefined)}
        className={classes}
      >
        {children}
        {showArrow && <ArrowRight className="ml-2 w-5 h-5" />}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {showArrow && <ArrowRight className="ml-2 w-5 h-5" />}
    </Link>
  )
}
