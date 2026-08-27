'use client'

import { useState } from 'react'
import { CheckCircle, ChevronDown, Info, MapPin } from 'lucide-react'
import { formatEuroCopy, publicTravelPolicy } from '../../../shared/site-snapshot'
import { useSiteOverlay } from '@/lib/site-overlay'

export function TravelPolicyNotice({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const { overlayEnabled, site } = useSiteOverlay()
  const policy = publicTravelPolicy(overlayEnabled, site)
  const km = String(policy.includedKm)
  const perKm = formatEuroCopy(policy.perKm)
  const flatFee = formatEuroCopy(policy.flatFee)

  return (
    <aside
      className={`rounded-xl border border-accent/15 bg-white shadow-sm ${className}`}
      aria-label="Home visit travel fees"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="travel-fees-panel"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-start gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
          <span className="min-w-0">
            <span className="block font-semibold text-sm text-primary">
              Home visit travel fees
            </span>
            <span
              className={`diagnosis-accordion-panel grid ${
                open ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
              }`}
            >
              <span className="overflow-hidden">
                <span
                  className={`mt-0.5 block text-xs text-secondary diagnosis-accordion-body ${
                    open ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  Travel fees may apply beyond {km} km
                </span>
              </span>
            </span>
          </span>
        </span>
        <ChevronDown
          className={`diagnosis-accordion-chevron w-4 h-4 shrink-0 text-primary ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      <div
        id="travel-fees-panel"
        role="region"
        aria-hidden={!open}
        className={`diagnosis-accordion-panel grid ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`border-t border-accent/15 px-4 pb-4 pt-3 diagnosis-accordion-body ${
              open ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <p className="text-base leading-relaxed text-secondary mb-3">
              Home visits beyond {km} km may incur an additional travel fee.
            </p>
            <p className="text-sm font-semibold text-primary mb-2">How is this calculated?</p>
            <ul className="text-base leading-relaxed text-secondary space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden />
                <span>Within {km} km included</span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
                <span>
                  Beyond {km} km:{' '}
                  <span className="font-semibold text-primary">+{perKm}</span>
                  /km or flat{' '}
                  <span className="font-semibold text-primary">{flatFee}</span>
                  {' '}travel fee
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}
