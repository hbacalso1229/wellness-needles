'use client'

import {
  Check,
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
            className={`booking-select-card relative block box-border cursor-pointer rounded-xl border p-4 ${
              selected
                ? 'border-[3px] border-primary bg-accent/20 shadow-sm shadow-primary/10'
                : hasError
                  ? 'border-2 border-red-400 bg-white [@media(hover:hover)]:hover:border-red-500'
                  : 'border-2 border-accent/15 bg-white [@media(hover:hover)]:hover:border-primary/40 [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:-translate-y-0.5'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={service.id}
              checked={selected}
              onChange={() => onSelect(service.id)}
              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              aria-label={service.name}
            />
            <span
              className={`booking-select-card__check pointer-events-none absolute top-3 right-3 z-0 flex h-6 w-6 items-center justify-center rounded-full ${
                selected
                  ? 'bg-primary text-white opacity-100'
                  : 'bg-transparent opacity-0'
              }`}
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <div className="pointer-events-none relative z-0 flex items-start gap-3 pr-8">
              <span
                className={`booking-select-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="min-w-0 font-semibold leading-snug text-primary">
                      {service.name}
                    </h3>
                  </div>
                  <div className="shrink-0 self-start text-right leading-none">
                    <span
                      className={`font-serif font-extrabold text-primary tracking-tight tabular-nums ${
                        largePrice ? 'text-3xl' : 'text-2xl'
                      }`}
                    >
                      {service.price}
                    </span>
                    {service.savings ? (
                      <div className="mt-1 text-sm font-semibold text-secondary">
                        {service.savings}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="mb-2 flex items-center text-sm text-secondary">
                  <Clock className="mr-1 h-4 w-4 shrink-0" aria-hidden />
                  {service.duration}
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  {service.description}
                </p>
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}
