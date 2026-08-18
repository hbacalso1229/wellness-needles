'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PHONE_COUNTRIES, type PhoneCountry } from '../../lib/phone-countries'
import { PhoneFlagIcon } from './PhoneFlagIcon'

type PhoneCountrySelectProps = {
  value: PhoneCountry
  onChange: (country: PhoneCountry) => void
}

export function PhoneCountrySelect({ value, onChange }: PhoneCountrySelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  useEffect(() => {
    if (!open) return
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className="flex h-full max-w-[13.5rem] items-center gap-2 border-r bg-white px-2 py-1 text-left text-sm"
        aria-label="Country code"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
      >
        <PhoneFlagIcon countryId={value.id} />
        <span className="min-w-0 truncate">
          {value.name} ({value.dial})
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-secondary/60" aria-hidden strokeWidth={2.25} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Country code"
          className="absolute left-0 top-full z-30 mt-1 max-h-60 w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-md border border-accent/20 bg-white py-1 shadow-lg"
        >
          {PHONE_COUNTRIES.map((country) => {
            const selected = country.id === value.id
            return (
              <li key={country.id} role="none">
                <button
                  ref={selected ? selectedRef : undefined}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent/15 ${
                    selected ? 'bg-accent/10 font-medium' : ''
                  }`}
                  onClick={() => {
                    onChange(country)
                    setOpen(false)
                  }}
                >
                  <PhoneFlagIcon countryId={country.id} />
                  <span>
                    {country.name} ({country.dial})
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
