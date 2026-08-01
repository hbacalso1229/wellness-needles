'use client'

import { CheckCircle, Droplets, Flame, Sparkles, type LucideIcon } from 'lucide-react'

export type OptionalAddOn = {
  readonly id: string
  readonly name: string
  readonly price: string
  readonly description: string
}

type OptionalAddOnsProps = {
  addOns: ReadonlyArray<OptionalAddOn>
  selectedIds: readonly string[]
  onToggle: (id: string) => void
}

function iconForAddOn(id: string): LucideIcon {
  if (id.includes('cupping')) return Droplets
  if (id.includes('moxibustion')) return Flame
  return Sparkles
}

export function OptionalAddOns({ addOns, selectedIds, onToggle }: OptionalAddOnsProps) {
  return (
    <div>
      <h3 className="mb-2 font-serif text-xl font-bold text-primary">Optional add-ons</h3>
      <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id)
          const Icon = iconForAddOn(addOn.id)

          return (
            <label
              key={addOn.id}
              className={`booking-select-card relative block box-border cursor-pointer rounded-xl border-2 p-4 ${
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-accent/15 bg-white [@media(hover:hover)]:hover:border-primary/40'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(addOn.id)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                aria-label={addOn.name}
              />
              <CheckCircle
                className={`booking-select-card__check pointer-events-none absolute top-3 right-3 z-0 h-5 w-5 text-primary ${
                  selected ? 'opacity-100' : 'opacity-0'
                }`}
                aria-hidden
              />
              <div className="pointer-events-none relative z-0 flex items-start gap-3 pr-7">
                <span
                  className={`booking-select-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    selected ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-start justify-between gap-3 md:max-lg:flex-col md:max-lg:items-stretch md:max-lg:gap-0.5">
                    <h4 className="min-w-0 font-semibold leading-snug text-primary">
                      {addOn.name}
                    </h4>
                    {/^\s*free\b/i.test(addOn.price) ? (
                      <p className="shrink-0 text-right text-sm font-semibold text-accent sm:text-base md:max-lg:text-left">
                        {addOn.price}
                      </p>
                    ) : (
                      <p className="shrink-0 text-right text-sm font-semibold text-secondary sm:text-base md:max-lg:text-left">
                        +{addOn.price} add-on
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-secondary">{addOn.description}</p>
                </div>
              </div>
            </label>
          )
        })}
      </div>
      <p className="mt-2 px-0.5 text-xs text-secondary">
        * Add-ons can only be booked in combination with an acupuncture session
      </p>
    </div>
  )
}
