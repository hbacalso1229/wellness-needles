'use client'

import { CheckCircle, MapPin } from 'lucide-react'

export type ClinicLocationOption = {
  readonly id: string
  readonly label: string
  readonly formatted: {
    readonly street: string
    readonly city: string
    readonly county: string
    readonly postcode: string
  }
}

type ClinicLocationCardsProps = {
  locations: ReadonlyArray<ClinicLocationOption>
  selectedId: string
  onSelect: (id: string) => void
  name?: string
  hasError?: boolean
}

export function ClinicLocationCards({
  locations,
  selectedId,
  onSelect,
  name = 'clinic-location',
  hasError = false,
}: ClinicLocationCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {locations.map((location) => {
        const selected = selectedId === location.id

        return (
          <label
            key={location.id}
            className={`booking-select-card relative block box-border cursor-pointer rounded-xl border-2 p-4 ${
              selected
                ? 'border-primary bg-primary/5'
                : hasError
                  ? 'border-red-400 bg-white [@media(hover:hover)]:hover:border-red-500'
                  : 'border-accent/15 bg-white [@media(hover:hover)]:hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={location.id}
              checked={selected}
              onChange={() => onSelect(location.id)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label={location.label}
            />
            <CheckCircle
              className={`booking-select-card__check pointer-events-none absolute top-3 right-3 z-0 h-5 w-5 text-primary ${
                selected ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden
            />
            <div className="pointer-events-none relative z-0 flex items-start gap-3 pr-6">
              <span
                className={`booking-select-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'
                }`}
              >
                <MapPin className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="mb-1 font-semibold text-primary">{location.label}</h4>
                <p className="text-sm text-secondary">{location.formatted.street}</p>
                <p className="text-sm text-secondary">
                  {location.formatted.city}, {location.formatted.county}{' '}
                  {location.formatted.postcode}
                </p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
