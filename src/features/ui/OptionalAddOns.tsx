'use client'

import { Check, Droplets, Flame, Info, Sparkles, type LucideIcon } from 'lucide-react'

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
      <div className="mb-4">
        <h3 className="text-xl font-bold text-[var(--text-dark)]">Popular add-ons</h3>
        <p className="mt-1 text-sm text-secondary">Enhance your treatment — optional, select any that apply.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id)
          const Icon = iconForAddOn(addOn.id)
          const isFree = /^\s*free\b/i.test(addOn.price)

          return (
            <label
              key={addOn.id}
              className={`booking-select-card relative block box-border cursor-pointer rounded-xl border p-4 ${
                selected
                  ? 'z-[1] border-[3px] border-primary bg-primary/15 shadow-lg shadow-primary/20 motion-safe:scale-[1.02]'
                  : 'border-2 border-accent/25 bg-white [@media(hover:hover)]:hover:border-primary/40 [@media(hover:hover)]:hover:shadow-md [@media(hover:hover)]:hover:-translate-y-0.5'
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(addOn.id)}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                aria-label={addOn.name}
              />
              <span
                className={`booking-select-card__check pointer-events-none absolute top-2.5 right-2.5 z-0 flex h-8 w-8 items-center justify-center rounded-full ${
                  selected
                    ? 'bg-primary text-cream opacity-100 shadow-md shadow-primary/35 ring-2 ring-white'
                    : 'border-2 border-accent/35 bg-white opacity-100'
                }`}
                aria-hidden
              >
                {selected ? <Check className="h-5 w-5" strokeWidth={3.5} /> : null}
              </span>
              <div className="pointer-events-none relative z-0 flex items-start gap-3 pr-10">
                <span
                  className={`booking-select-card__icon flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                    selected ? 'bg-primary text-cream' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
                    <h4 className="min-w-0 max-w-full font-semibold leading-snug text-[var(--text-dark)]">
                      {addOn.name}
                    </h4>
                    {isFree ? (
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold leading-snug ${
                          selected
                            ? 'bg-primary text-cream shadow-sm'
                            : 'border border-primary/25 bg-primary/10 text-primary'
                        }`}
                      >
                        Free
                      </span>
                    ) : (
                      <span className="shrink-0 self-start text-right font-serif text-xl font-extrabold tracking-tight tabular-nums text-primary">
                        +{addOn.price}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-secondary">{addOn.description}</p>
                </div>
              </div>
            </label>
          )
        })}
      </div>
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-accent/10 px-4 py-3 text-sm font-semibold text-secondary shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>Add-ons can only be booked in combination with an acupuncture session.</p>
      </div>
    </div>
  )
}
