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
            className={`relative block p-4 rounded-xl cursor-pointer transition-all duration-200 ${
              selected
                ? 'border-2 border-primary bg-primary/5 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)]'
                : hasError
                  ? 'border-2 border-red-400 bg-white hover:border-red-500'
                  : 'border border-accent/15 bg-white shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] hover:border-primary/25 hover:shadow-[0_14px_32px_rgba(45,80,22,0.18),0_4px_12px_rgba(45,80,22,0.1)]'
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
