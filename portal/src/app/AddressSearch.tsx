'use client'

import { useEffect, useId, useRef, useState } from 'react'

export type PickedAddress = {
  street: string
  city: string
  county: string
  postcode: string
}

type Suggestion = {
  id: string
  label: string
  street?: string
  city?: string
  county?: string
  postcode?: string
}

export function AddressSearch({
  onPick,
}: {
  onPick: (address: PickedAddress) => void
}) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/places', { credentials: 'include', headers: { Accept: 'application/json' } })
      .then((res) => {
        if (cancelled) return
        setAvailable(res.ok || res.status === 400)
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!available) return
    const text = query.trim()
    if (text.length < 3) {
      setSuggestions([])
      setError('')
      return
    }
    const handle = window.setTimeout(() => {
      setLoading(true)
      fetch(`/api/admin/places?q=${encodeURIComponent(text)}`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
        .then(async (res) => {
          if (res.status === 503) {
            setAvailable(false)
            return
          }
          const json = (await res.json()) as { suggestions?: Suggestion[]; error?: string }
          if (!res.ok) throw new Error(json.error || 'places-failed')
          setSuggestions(json.suggestions || [])
          setOpen(true)
          setError('')
        })
        .catch(() => {
          setSuggestions([])
          setError('Could not search addresses. Try again or type the address below.')
        })
        .finally(() => setLoading(false))
    }, 500)
    return () => window.clearTimeout(handle)
  }, [available, query])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const pick = async (suggestion: Suggestion) => {
    setQuery(suggestion.label)
    setOpen(false)
    setSuggestions([])
    if (suggestion.street || suggestion.city || suggestion.postcode) {
      onPick({
        street: suggestion.street || '',
        city: suggestion.city || '',
        county: suggestion.county || '',
        postcode: suggestion.postcode || '',
      })
      setError('')
      return
    }
    try {
      const res = await fetch(
        `/api/admin/places/details?id=${encodeURIComponent(suggestion.id)}`,
        { credentials: 'include', headers: { Accept: 'application/json' } }
      )
      const json = (await res.json()) as PickedAddress & { error?: string }
      if (!res.ok) throw new Error(json.error || 'places-failed')
      onPick({
        street: json.street || '',
        city: json.city || '',
        county: json.county || '',
        postcode: json.postcode || '',
      })
      setError('')
    } catch {
      setError('Could not load that address. Try another suggestion or type it below.')
    }
  }

  if (available !== true) return null

  return (
    <div ref={rootRef} className="relative">
      <label className="block text-xs font-medium text-[var(--text-dark)]/60">
        Find address
        <input
          className="mt-1 w-full rounded-md border border-black/10 px-2 py-1.5 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length) setOpen(true)
          }}
          placeholder="Search Ireland — pick a suggestion"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
        />
      </label>
      <p className="mt-1 text-[11px] text-[var(--text-dark)]/45">
        Address search uses OpenStreetMap (free). Check the pin below before you publish.
      </p>
      {loading ? <p className="mt-1 text-xs text-[var(--text-dark)]/45">Searching…</p> : null}
      {error ? <p className="mt-1 text-xs text-red-700">{error}</p> : null}
      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-md border border-black/10 bg-white py-1 text-sm shadow-md"
        >
          {suggestions.map((suggestion) => (
            <li key={suggestion.id} role="option">
              <button
                type="button"
                className="w-full px-2 py-1.5 text-left hover:bg-accent/15"
                onClick={() => void pick(suggestion)}
              >
                {suggestion.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
