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
}

export function CTAButton({
  href,
  children,
  variant = 'primary',
  size = 'large',
  showArrow = true,
  className = ''
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

  return (
    <Link
      href={href}
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-lg ${className}`}
    >
      {children}
      {showArrow && <ArrowRight className="ml-2 w-5 h-5" />}
    </Link>
  )
}
