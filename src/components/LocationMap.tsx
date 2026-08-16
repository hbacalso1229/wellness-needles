'use client'

import { ArrowRight, MapPin } from 'lucide-react'

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
      <div className="relative h-44 overflow-hidden rounded-lg border border-accent/20 bg-accent/10 sm:h-48">
        <iframe
          title={title}
          src={embedSrc}
          className="pointer-events-none h-full w-full border-0"
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div
          className="pointer-events-none absolute left-2 top-2 flex h-8 w-[4.75rem] items-center justify-center rounded-md bg-white shadow-sm"
          aria-hidden
        >
          <MapPin className="h-4 w-4 text-primary" strokeWidth={2.25} />
        </div>
      </div>
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary underline-offset-4 transition-[gap,color] duration-300 ease-out [@media(hover:hover)]:hover:gap-1.5 [@media(hover:hover)]:hover:text-secondary [@media(hover:hover)]:hover:underline"
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
