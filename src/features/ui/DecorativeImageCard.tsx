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
        <div className={`absolute inset-0 rounded-xl border-2 border-gradient-to-br ${gradientFrom.replace('/5', '/20')} ${gradientTo.replace('/5', '/20')} group-hover:${gradientFrom.replace('/5', '/40')} group-hover:${gradientTo.replace('/5', '/40')} transition-all duration-300`}></div>
        
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
