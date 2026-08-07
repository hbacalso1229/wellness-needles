'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

/** Shared gold fill tokens — color only (no size). */
const goldBookingFillClassName =
  'isolate !rounded-full !bg-[#d4af37] !bg-gradient-to-b !from-[#e8c84a] !via-[#d4af37] !to-[#c49a2a] text-primary font-bold whitespace-nowrap transition-[transform,box-shadow,filter] duration-200 ease-out hover:!from-[#f0d45c] hover:!via-[#e0c040] hover:!to-[#d4af37] hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white'

const goldSizeClassName = {
  /** Sticky sidebars / compact panels — matches outline helper buttons */
  medium:
    'min-h-0 px-4 py-2.5 text-sm gap-1.5 shadow-[0_6px_16px_rgba(196,154,42,0.28)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]',
  /** Page destination CTAs */
  large:
    'min-h-11 px-5 py-3 text-base gap-2 shadow-[0_10px_28px_rgba(196,154,42,0.35)] md:px-6 md:py-3.5 md:text-lg motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_14px_34px_rgba(196,154,42,0.45)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98]',
} as const

/** Shared gold booking CTA only — Book / Start journey / Call Now. Do not use for browse/explore links. */
export const primaryGoldCtaClassName =
  `w-auto inline-flex items-center justify-center ${goldBookingFillClassName} ${goldSizeClassName.large}`

/** Compact header Book — same gold fill as primary; sized for h-14 only (no large CTA padding / hover lift). */
export const headerGoldCtaClassName =
  `inline-flex items-center justify-center gap-2 ${goldBookingFillClassName} px-5 py-2 text-sm shadow-[0_10px_28px_rgba(196,154,42,0.35)] no-underline hover:no-underline`

/** Compact header Book (mobile / tablet) — same gold fill; stays out of the way of the menu button. */
export const headerGoldCtaMobileClassName =
  `inline-flex shrink-0 items-center justify-center gap-1 ${goldBookingFillClassName} px-2 py-1 text-[11px] shadow-[0_8px_22px_rgba(196,154,42,0.32)] no-underline hover:no-underline sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-sm`

/** Shared jungle-green section CTA — home Benefits / Services / Practitioner. Equal width; floating elevation; hover lift md+ only. Not for booking. */
export const sectionGreenCtaClassName =
  'inline-flex h-11 w-[17.5rem] max-w-full shrink-0 items-center justify-center gap-2 rounded-full border border-[#1B3B2B]/35 bg-gradient-to-r from-[#3d6b2e] via-[#2d5016] to-[#1B3B2B] px-5 text-sm font-semibold text-cream whitespace-nowrap shadow-[0_8px_24px_rgba(27,59,43,0.32),0_2px_6px_rgba(27,59,43,0.18)] transition-[transform,box-shadow,filter] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white md:motion-safe:hover:-translate-y-1.5 md:hover:shadow-[0_14px_32px_rgba(27,59,43,0.4),0_4px_10px_rgba(27,59,43,0.2)] md:hover:brightness-105 md:motion-safe:active:translate-y-0 md:active:scale-[0.98]'

/** Shared glass-green fill — same tint/blur as Integrative Approach, Evidence, Find Us, etc. */
export const glassGreenFillClassName =
  'bg-accent/5 backdrop-blur-[3px] supports-[backdrop-filter]:bg-accent/[0.04]'

/** Full-width section band (border-y + glass fill) */
export const glassGreenBandClassName = `border-y border-white/50 ${glassGreenFillClassName}`

/** Rounded card/panel surface (full border + glass fill) — e.g. bookings form */
export const glassGreenPanelClassName = `rounded-xl border border-white/50 ${glassGreenFillClassName}`

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
  showArrow = false,
  className = '',
  external = false,
  target,
  rel,
}: CTAButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-cream hover:bg-secondary',
    secondary: 'border-2 border-cream text-cream hover:bg-white hover:text-primary',
    outline: 'border-2 border-primary text-primary bg-white/80 hover:bg-primary hover:text-cream',
    gold: '',
  }

  const sizeClasses = {
    medium: 'px-5 py-2.5 text-sm sm:px-6 sm:py-3 sm:text-base',
    large: 'px-6 py-3 text-base sm:px-8 sm:py-4 sm:text-lg',
  }

  const classes =
    variant === 'gold'
      ? `inline-flex items-center justify-center ${goldBookingFillClassName} ${goldSizeClassName[size]} ${className}`
      : `${variantClasses[variant]} ${sizeClasses[size]} rounded-full font-semibold transition-all duration-300 inline-flex items-center justify-center shadow-md ${className}`
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
