'use client'

import Image from 'next/image'
import { PulsingLeaf } from './PulsingLeaf'

interface DecorativeImageCardProps {
  src: string
  alt: string
  title?: string
  description?: string
  gradientFrom: string
  gradientTo: string
  leafColors?: {
    topRight: string
    bottomLeft: string
  }
  className?: string
}

const borderClasses: Record<string, string> = {
  'from-primary/5': 'border-primary/20 group-hover:border-primary/40',
  'from-secondary/5': 'border-secondary/20 group-hover:border-secondary/40',
  'from-accent/5': 'border-accent/20 group-hover:border-accent/40',
  'from-primary/10': 'border-primary/20 group-hover:border-primary/40',
  'from-secondary/10': 'border-secondary/20 group-hover:border-secondary/40',
}

export function DecorativeImageCard({
  src,
  alt,
  title,
  description,
  gradientFrom,
  gradientTo,
  leafColors = {
    topRight: 'text-gold/70 group-hover:text-gold',
    bottomLeft: 'text-accent/70 group-hover:text-accent'
  },
  className = ''
}: DecorativeImageCardProps) {
  const borderClass = borderClasses[gradientFrom] ?? 'border-accent/20 group-hover:border-accent/40'

  return (
    <div className={`group ${className}`}>
      <div className={`relative h-72 rounded-xl overflow-visible shadow-lg bg-gradient-to-br ${gradientFrom} ${gradientTo} p-2`}>
        <div className="relative h-full rounded-lg overflow-hidden">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className={`absolute inset-0 rounded-xl border-2 ${borderClass} transition-all duration-300 pointer-events-none`}></div>
        
        {/* Floating leaf decorations */}
        <div className="absolute -top-1 -right-1 z-20">
          <PulsingLeaf 
            color={leafColors.topRight}
            rotation={12}
            animationDelay="0s"
          />
        </div>
        <div className="absolute -bottom-1 -left-1 z-20">
          <PulsingLeaf 
            size="small"
            color={leafColors.bottomLeft}
            rotation={-45}
            animationDelay="0.5s"
          />
        </div>
      </div>
      
      {title && (
        <div className="mt-4 text-center">
          <h4 className="font-semibold text-primary">{title}</h4>
          {description && <p className="text-sm text-secondary mt-1">{description}</p>}
        </div>
      )}
    </div>
  )
}
