'use client'

import {
  CheckCircle,
  ClipboardList,
  Clock,
  Package,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type BookingServiceOption = {
  readonly id: string
  readonly name: string
  readonly duration: string
  readonly price: string
  readonly description: string
  readonly savings?: string
}

type ServiceSelectionCardsProps = {
  services: ReadonlyArray<BookingServiceOption>
  selectedId: string
  onSelect: (id: string) => void
  name?: string
  hasError?: boolean
  /** Larger price text (bookings pricing section). */
  largePrice?: boolean
}

function iconForService(id: string): LucideIcon {
  if (id.includes('package')) return Package
  if (id.includes('follow-up') || id.includes('follow_up')) return RefreshCw
  if (id.includes('initial')) return ClipboardList
  return Sparkles
}

export function ServiceSelectionCards({
  services,
  selectedId,
  onSelect,
  name = 'booking-service',
  hasError = false,
  largePrice = false,
}: ServiceSelectionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => {
        const selected = selectedId === service.id
        const Icon = iconForService(service.id)

        return (
          <label
            key={service.id}
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
              value={service.id}
              checked={selected}
              onChange={() => onSelect(service.id)}
              className="sr-only"
            />
            {selected && (
              <CheckCircle
                className="absolute top-3 right-3 w-5 h-5 text-primary"
                aria-hidden
              />
            )}
            <div className="flex items-start gap-3 pr-7">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'
                }`}
              >
                <Icon className="w-5 h-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <h3 className="font-semibold text-primary leading-snug min-w-0">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-serif font-bold text-primary ${
                        largePrice ? 'text-2xl' : 'text-xl'
                      }`}
                    >
                      {service.price}
                    </span>
                    {service.savings && (
                      <div className="text-green-600 text-sm font-medium">
                        {service.savings}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center text-sm text-secondary mb-2">
                  <Clock className="w-4 h-4 mr-1 shrink-0" aria-hidden />
                  {service.duration}
                </div>
                <p className="text-sm text-secondary">{service.description}</p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
