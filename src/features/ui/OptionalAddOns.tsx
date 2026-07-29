'use client'

import { CheckCircle, Droplets, Flame, Sparkles, type LucideIcon } from 'lucide-react'

export type OptionalAddOn = {
  id: string
  name: string
  price: string
  description: string
}

type OptionalAddOnsProps = {
  addOns: OptionalAddOn[]
  selectedIds: string[]
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
      <h3 className="font-serif text-xl font-bold text-primary mb-4">Optional Add-ons</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id)
          const Icon = iconForAddOn(addOn.id)

          return (
            <label
              key={addOn.id}
              className={`relative block p-4 border-2 rounded-lg cursor-pointer card-emboss ${
                selected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-accent/20 hover:border-accent/40 hover:bg-accent/5'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(addOn.id)}
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
                  <div className="flex flex-col gap-0.5 mb-1 sm:flex-row sm:justify-between sm:items-start sm:gap-3">
                    <h4 className="font-semibold text-primary leading-snug min-w-0">
                      {addOn.name}
                    </h4>
                    {/^\s*free\b/i.test(addOn.price) ? (
                      <p className="text-sm font-semibold text-accent sm:text-right shrink-0 sm:text-base">
                        {addOn.price}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-secondary sm:text-right shrink-0 sm:text-base">
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
      <p className="text-xs text-secondary mt-2 px-0.5">
        * Add-ons can only be booked in combination with an acupuncture session
      </p>
    </div>
  )
}
