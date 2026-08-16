'use client'

import { MapPin } from 'lucide-react'
import LocationMap from '../../components/LocationMap'

export type ClinicVisitCardLocation = {
  readonly id: string
  readonly label: string
  readonly full: string
  readonly formatted: {
    readonly street: string
    readonly city: string
    readonly county: string
    readonly postcode: string
  }
  readonly mapQuery: string
  readonly directionsUrl: string
}

function formatCounty(county: string) {
  return county.replace(/^Co\.(?=\S)/, 'Co. ')
}

type ClinicVisitCardProps = {
  location: ClinicVisitCardLocation
  description: string
  className?: string
}

export function ClinicVisitCard({ location, description, className = '' }: ClinicVisitCardProps) {
  return (
    <article className={className}>
      <h3 className="font-semibold text-base leading-snug text-[var(--text-dark)] md:text-lg">
        {location.label}
      </h3>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-dark)]/70">{description}</p>
      ) : null}
      <address className="mt-4 flex items-start gap-2 not-italic text-base leading-relaxed text-[var(--text-dark)]/80">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden strokeWidth={2.25} />
        <span>
          <span className="block">{location.formatted.street}</span>
          <span className="block">
            {location.formatted.city}, {formatCounty(location.formatted.county)}{' '}
            {location.formatted.postcode}
          </span>
        </span>
      </address>
      <LocationMap
        className="mt-4"
        query={location.mapQuery}
        title={`Map of ${location.full}`}
        directionsUrl={location.directionsUrl}
      />
    </article>
  )
}
