'use client'

import { ArrowRight } from 'lucide-react'

interface LocationMapProps {
  query: string
  title: string
  directionsUrl?: string
  className?: string
}

export default function LocationMap({
  query,
  title,
  directionsUrl,
  className = '',
}: LocationMapProps) {
  const embedSrc = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`

  return (
    <div className={className}>
      <div className="relative h-44 sm:h-48 overflow-hidden rounded-lg border border-accent/20 bg-accent/10">
        <iframe
          title={title}
          src={embedSrc}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 transition-[gap,color] duration-300 ease-out hover:gap-1.5 hover:text-secondary hover:underline"
        >
          Get Directions
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
            aria-hidden
          />
        </a>
      )}
    </div>
  )
}
