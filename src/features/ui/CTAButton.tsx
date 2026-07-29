'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface CTAButtonProps {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'gold' | 'outline'
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
    primary: 'bg-primary text-cream hover:bg-secondary',
    secondary: 'border-2 border-cream text-cream hover:bg-cream hover:text-primary',
    outline: 'border-2 border-primary text-primary bg-cream/80 hover:bg-primary hover:text-cream',
    gold: 'bg-gradient-to-b from-[#e8c84a] to-gold text-primary hover:from-[#f0d45c] hover:to-[#c9a52f]',
  }

  const sizeClasses = {
    medium: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
    large: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
  }

  const classes = `${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-md ${className}`
  const isExternal = external || /^(https?:\/\/|tel:|mailto:)/i.test(href)

  if (isExternal) {
    const isTelOrMailto = /^(tel:|mailto:)/i.test(href)
    const resolvedTarget = target ?? (isTelOrMailto ? undefined : '_blank')
    const resolvedRel =
      rel ?? (resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined)
    return (
      <a
        href={href}
        target={resolvedTarget}
        rel={resolvedRel}
        className={classes}
      >
        {children}
        {showArrow && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
      {showArrow && <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />}
    </Link>
  )
}
