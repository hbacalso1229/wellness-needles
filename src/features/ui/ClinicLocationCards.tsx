'use client'

import { CheckCircle, MapPin } from 'lucide-react'

export type ClinicLocationOption = {
  id: string
  label: string
  formatted: {
    street: string
    city: string
    county: string
    postcode: string
  }
}

type ClinicLocationCardsProps = {
  locations: ClinicLocationOption[]
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
            className={`relative block p-4 border-2 rounded-lg cursor-pointer card-emboss ${
              selected
                ? 'border-primary bg-primary/5 shadow-sm'
                : hasError
                  ? 'border-red-400 hover:border-red-500'
                  : 'border-accent/20 hover:border-accent/40 hover:bg-accent/5'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={location.id}
              checked={selected}
              onChange={() => onSelect(location.id)}
              className="sr-only"
            />
            {selected && (
              <CheckCircle
                className="absolute top-3 right-3 w-5 h-5 text-primary"
                aria-hidden
              />
            )}
            <div className="flex items-start gap-3 pr-6">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'
                }`}
              >
                <MapPin className="w-5 h-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-primary mb-1">{location.label}</h4>
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
