'use client'

import { useEffect, useState } from 'react'
import LocationMap from '../../../src/components/LocationMap'

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(value), ms)
    return () => window.clearTimeout(handle)
  }, [value, ms])
  return debounced
}

export function LocationPreview({
  label,
  mapQuery,
  directionsUrl,
}: {
  label: string
  mapQuery: string
  directionsUrl: string
}) {
  const query = useDebouncedValue(mapQuery, 400)
  return (
    <div className="space-y-1.5 pt-1">
      <LocationMap
        query={query}
        title={`Map preview of ${label || 'location'}`}
        showDirections={false}
      />
      <p className="text-xs leading-relaxed text-[var(--text-dark)]/55">
        Check the pin matches the clinic before you publish.
      </p>
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:underline"
        >
          Open in Google Maps
        </a>
      ) : null}
    </div>
  )
}
