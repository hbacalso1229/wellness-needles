'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ReactNode } from 'react'
import { PulsingLeaf } from './PulsingLeaf'
import { CTAButton } from './CTAButton'

export interface HeroSectionProps {
  /** Main heading text */
  title: string
  /** Optional subtitle/description */
  subtitle?: string
  /** Optional longer description text */
  description?: string
  /** Background image source */
  backgroundImage?: string
  /** Background overlay color/gradient class */
  backgroundClass?: string
  /** Text color class (defaults to text-cream for dark backgrounds) */
  textColor?: string
  /** Logo to display (optional) */
  logo?: {
    src: string
    alt: string
    showGlow?: boolean
  }
  /** Call-to-action buttons */
  ctaButtons?: Array<{
    text: string
    href: string
    variant?: 'primary' | 'secondary' | 'gold' | 'outline'
    /** Render as a text link instead of a pill button */
    appearance?: 'button' | 'link'
    showArrow?: boolean
    external?: boolean
    target?: string
    rel?: string
  }>
  /** Extra classes for the CTA button row (e.g. responsive visibility) */
  ctaWrapperClassName?: string
  /** Whether to show floating leaf decorations */
  showFloatingLeaves?: boolean
  /** Custom height class */
  heightClass?: string
  /** Custom content alignment */
  alignment?: 'left' | 'center' | 'right'
  /** Additional custom content to render */
  children?: ReactNode
  /** Hide hero below md breakpoint (default true; Home opts out) */
  hideOnMobile?: boolean
}

export function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundClass = 'bg-jungle-gradient',
  textColor = 'text-cream',
  logo,
  ctaButtons = [],
  ctaWrapperClassName = '',
  showFloatingLeaves = true,
  heightClass = 'min-h-screen',
  alignment = 'center',
  children,
  hideOnMobile = true,
}: HeroSectionProps) {
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }

  const justifyClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }

  return (
    <section
      className={`${hideOnMobile ? 'hidden md:flex' : 'flex'} relative ${heightClass} items-center ${justifyClasses[alignment]} ${
        backgroundImage ? 'bg-primary' : backgroundClass
      }`}
    >
      {/* Photo heroes: full image + light brand wash (not faded image on solid green) */}
      {backgroundImage && (
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/65 via-primary/45 to-secondary/35" />
        </div>
      )}
      
      {/* Content Container */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${alignmentClasses[alignment]} ${textColor} py-20`}>
        {/* Logo Section */}
        {logo && (
          <div className="mb-8">
            <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48">
              {logo.showGlow && (
                <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-accent/30 rounded-full blur-xl"></div>
              )}
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="rounded-full object-cover shadow-2xl border-4 border-cream/20 relative z-10"
                priority
              />
              {logo.showGlow && (
                <div className="absolute inset-0 rounded-full border-2 border-gold/50 animate-pulse"></div>
              )}
              
              {/* Floating leaf decorations around logo */}
              {showFloatingLeaves && (
                <>
                  <div className="absolute -top-2 -right-2">
                    <PulsingLeaf color="text-gold/60" rotation={45} />
                  </div>
                  <div className="absolute -bottom-2 -left-2">
                    <PulsingLeaf 
                      size="small" 
                      color="text-accent/60" 
                      rotation={-12} 
                      animationDelay="1s" 
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Text Content */}
        <div className={`${alignment === 'center' ? 'max-w-4xl mx-auto' : 'max-w-4xl'}`}>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl mb-8 font-light">
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className="text-lg mb-12 opacity-90 max-w-2xl mx-auto">
              {description}
            </p>
          )}
          
          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center ${ctaWrapperClassName}`}>
              {ctaButtons.map((button, index) => {
                if (button.appearance === 'link') {
                  const isExternal =
                    button.external || /^(https?:\/\/|tel:|mailto:)/i.test(button.href)
                  const linkClassName =
                    'text-cream/90 hover:text-cream underline underline-offset-4 decoration-cream/50 hover:decoration-cream text-sm sm:text-base font-medium transition-colors'
                  if (isExternal) {
                    return (
                      <a
                        key={index}
                        href={button.href}
                        target={button.target}
                        rel={button.rel}
                        className={linkClassName}
                      >
                        {button.text}
                      </a>
                    )
                  }
                  return (
                    <Link key={index} href={button.href} className={linkClassName}>
                      {button.text}
                    </Link>
                  )
                }

                return (
                  <CTAButton
                    key={index}
                    href={button.href}
                    variant={button.variant}
                    size="medium"
                    showArrow={button.showArrow}
                    external={button.external}
                    target={button.target}
                    rel={button.rel}
                  >
                    {button.text}
                  </CTAButton>
                )
              })}
            </div>
          )}
          
          {/* Custom Children */}
          {children}
        </div>
      </div>
      
      {/* Floating Leaf Elements */}
      {showFloatingLeaves && (
        <>
          <div className="absolute top-20 left-10 opacity-40">
            <PulsingLeaf size="large" color={textColor.replace('text-', 'text-').split('/')[0]} />
          </div>
          <div className="absolute bottom-32 right-16 opacity-40">
            <PulsingLeaf color={textColor.replace('text-', 'text-').split('/')[0]} animationDelay="1s" />
          </div>
          <div className="absolute top-1/3 right-20 opacity-50">
            <PulsingLeaf 
              size="large" 
              color={textColor.replace('text-', 'text-').split('/')[0]} 
              animationDelay="2s" 
            />
          </div>
        </>
      )}
    </section>
  )
}
