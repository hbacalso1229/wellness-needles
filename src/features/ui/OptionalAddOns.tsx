'use client'

import { CheckCircle, Droplets, Flame, Info, Sparkles, type LucideIcon } from 'lucide-react'

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
      <h3 className="mb-4 text-xl font-bold text-[var(--text-dark)]">Optional add-ons</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id)
          const Icon = iconForAddOn(addOn.id)

          return (
            <label
              key={addOn.id}
              className={`booking-select-card relative block box-border cursor-pointer rounded-xl border-2 p-4 ${
                selected
                  ? 'z-[1] border-primary bg-primary/10 shadow-md shadow-primary/10 motion-safe:scale-[1.02]'
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
                className={`booking-select-card__check pointer-events-none absolute top-3 right-3 z-0 h-6 w-6 text-primary drop-shadow-sm ${
                  selected ? 'opacity-100' : 'opacity-0'
                }`}
                strokeWidth={2.5}
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
                  <div className="mb-1 flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h4 className="min-w-0 font-semibold leading-snug text-[var(--text-dark)]">
                      {addOn.name}
                    </h4>
                    {/^\s*free\b/i.test(addOn.price) ? (
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-semibold md:px-2 md:text-[11px] md:leading-snug ${
                          selected
                            ? 'bg-primary text-cream shadow-sm'
                            : 'border border-primary/25 bg-primary/10 text-primary'
                        }`}
                      >
                        {addOn.price}
                      </span>
                    ) : (
                      <p className="shrink-0 text-sm font-semibold text-primary">
                        +{addOn.price}
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
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-accent/10 px-4 py-3 text-sm text-secondary shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>Add-ons can only be booked in combination with an acupuncture session.</p>
      </div>
    </div>
  )
}
