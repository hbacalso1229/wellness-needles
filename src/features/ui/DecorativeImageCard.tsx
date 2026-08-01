'use client'

import Image from 'next/image'

interface DecorativeImageCardProps {
  src: string
  alt: string
  title?: string
  description?: string
  /** Used for cover-mode gradient fill behind the image. */
  gradientFrom?: string
  gradientTo?: string
  className?: string
  /**
   * cover = fill a fixed landscape tile (home feature photos).
   * contain = card sizes to the image (before/after collages).
   */
  objectFit?: 'cover' | 'contain'
}

export function DecorativeImageCard({
  src,
  alt,
  title,
  description,
  gradientFrom = 'from-primary/10',
  gradientTo = 'to-gold/10',
  className = '',
  objectFit = 'cover',
}: DecorativeImageCardProps) {
  const isContain = objectFit === 'contain'

  return (
    <div className={`group ${className}`}>
      {isContain ? (
        <div className="relative overflow-hidden rounded-xl border border-accent/15 bg-cream transition-transform duration-300 motion-safe:md:group-hover:-translate-y-1">
          <Image
            src={src}
            alt={alt}
            width={640}
            height={960}
            sizes="(max-width: 768px) 70vw, 40vw"
            className="h-auto w-full"
            priority={false}
          />
        </div>
      ) : (
        <div
          className={`relative h-52 w-full overflow-hidden rounded-xl border border-accent/15 bg-gradient-to-br sm:h-64 md:h-72 ${gradientFrom} ${gradientTo} transition-transform duration-300 motion-safe:md:group-hover:-translate-y-1`}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-center transition-transform duration-500 md:group-hover:scale-105"
          />
        </div>
      )}

      {title && (
        <div className="mt-2.5 px-0.5 text-center md:mt-4">
          <h4 className="text-base font-semibold leading-snug text-primary md:text-lg">
            {title}
          </h4>
          {description && (
            <p className="mt-1 line-clamp-2 text-xs leading-snug text-secondary md:line-clamp-none md:text-sm">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
