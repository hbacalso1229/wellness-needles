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
        <h3 className="text-sm font-semibold text-[var(--text-dark)]">Popular add-ons</h3>
        <p className="mt-1 text-sm text-[var(--text-dark)]/70">
          Enhance your treatment — optional, select any that apply.
        </p>
      </div>
      <div className="mb-4 flex items-start gap-2 rounded-xl border border-primary/15 bg-accent/10 px-4 py-3 text-sm font-semibold text-secondary shadow-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
        <p>Add-ons can only be booked in combination with an acupuncture session.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {addOns.map((addOn) => {
          const selected = selectedIds.includes(addOn.id)
          const Icon = iconForAddOn(addOn.id)
          const isFree = /^\s*free\b/i.test(addOn.price)

          return (
            <label
              key={addOn.id}
              className={`booking-select-card relative flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 ${
                selected
                  ? 'z-[1] border-primary bg-accent/20'
                  : 'border-[var(--text-dark)]/12 [@media(hover:hover)]:hover:border-primary/40'
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
                className={`booking-select-card__icon pointer-events-none relative z-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  selected ? 'bg-primary text-cream' : 'bg-accent/15 text-primary'
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="pointer-events-none relative z-0 min-w-0 flex-1">
                <h4 className="font-semibold leading-snug text-[var(--text-dark)]">{addOn.name}</h4>
                <p className="mt-0.5 text-sm leading-relaxed text-[var(--text-dark)]/70">
                  {addOn.description}
                </p>
              </div>
              <div className="pointer-events-none relative z-0 flex shrink-0 flex-col items-end gap-2">
                {isFree ? (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selected ? 'bg-primary text-cream' : 'bg-accent/20 text-primary'
                    }`}
                  >
                    Free
                  </span>
                ) : (
                  <span className="text-sm font-bold tabular-nums text-primary">+{addOn.price}</span>
                )}
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    selected
                      ? 'border-primary bg-primary text-cream'
                      : 'border-[var(--text-dark)]/25 bg-white'
                  }`}
                  aria-hidden
                >
                  {selected ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                </span>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}
