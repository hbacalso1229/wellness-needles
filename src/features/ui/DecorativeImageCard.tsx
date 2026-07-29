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
  /**
   * cover = fill a fixed landscape tile (home feature photos).
   * contain = card sizes to the image (before/after collages).
   */
  objectFit?: 'cover' | 'contain'
}

const borderClasses: Record<string, string> = {
  'from-primary/5': 'border-primary/20 group-hover:border-primary/40',
  'from-secondary/5': 'border-secondary/20 group-hover:border-secondary/40',
  'from-accent/5': 'border-accent/20 group-hover:border-accent/40',
  'from-primary/10': 'border-primary/20 group-hover:border-primary/40',
  'from-secondary/10': 'border-secondary/20 group-hover:border-secondary/40',
}

function LeafAccents({
  topRight,
  bottomLeft,
}: {
  topRight: string
  bottomLeft: string
}) {
  return (
    <>
      <div className="absolute -top-1 -right-1 z-20 pointer-events-none">
        <PulsingLeaf color={topRight} rotation={12} animationDelay="0s" />
      </div>
      <div className="absolute -bottom-1 -left-1 z-20 pointer-events-none">
        <PulsingLeaf
          size="small"
          color={bottomLeft}
          rotation={-45}
          animationDelay="0.5s"
        />
      </div>
    </>
  )
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
  className = '',
  objectFit = 'cover',
}: DecorativeImageCardProps) {
  const borderClass = borderClasses[gradientFrom] ?? 'border-accent/20 group-hover:border-accent/40'
  const isContain = objectFit === 'contain'

  return (
    <div className={`group ${className}`}>
      {isContain ? (
        // Wide tile frame; show the full collage (these assets are portrait — side space is expected).
        <div className="relative">
          <div
            className={`relative flex h-80 w-full items-center justify-center rounded-xl overflow-hidden shadow-lg bg-white border-2 ${borderClass}`}
          >
            <Image
              src={src}
              alt={alt}
              width={640}
              height={960}
              sizes="(max-width: 768px) 90vw, 40vw"
              className="max-h-full w-auto max-w-full object-contain"
              priority={false}
            />
          </div>
          <LeafAccents
            topRight={leafColors.topRight}
            bottomLeft={leafColors.bottomLeft}
          />
        </div>
      ) : (
        <div className="relative">
          <div
            className={`relative h-72 w-full rounded-xl overflow-hidden shadow-lg bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div
              className={`absolute inset-0 rounded-xl border-2 ${borderClass} transition-all duration-300 pointer-events-none`}
            />
          </div>
          <LeafAccents
            topRight={leafColors.topRight}
            bottomLeft={leafColors.bottomLeft}
          />
        </div>
      )}

      {title && (
        <div className="mt-4 text-center">
          <h4 className="font-semibold text-primary">{title}</h4>
          {description && <p className="text-sm text-secondary mt-1">{description}</p>}
        </div>
      )}
    </div>
  )
}
