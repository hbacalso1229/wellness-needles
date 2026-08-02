'use client'

import { useState } from 'react'
import { CheckCircle, ChevronDown, Info, MapPin } from 'lucide-react'

export function TravelPolicyNotice({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <aside
      className={`rounded-xl border border-accent/20 bg-accent/5 ${className}`}
      aria-label="Home visit travel policy"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-primary shrink-0" aria-hidden />
          <span className="font-semibold text-sm text-primary">
            Home visit travel policy
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-primary transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open ? (
        <div className="border-t border-accent/15 px-4 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-secondary mb-3">
            Travel fees may apply outside the included radius.
          </p>
          <ul className="text-sm leading-relaxed text-secondary space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 shrink-0" aria-hidden />
              <span>Within 10 km included</span>
            </li>
            <li className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
              <span>Beyond 10 km: +€0.50/km or flat €15 travel fee</span>
            </li>
          </ul>
        </div>
      ) : (
        <p className="px-4 pb-3 text-xs text-secondary">
          Tap for travel fees beyond 10 km
        </p>
      )}
    </aside>
  )
}
