function collapseSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

/**
 * If the string is the same full name twice ("Heno Bacalso Heno Bacalso"),
 * keep one copy. Used for mobile/iOS autofill into a single Full Name field.
 * Requires 4+ words so "John John" (given + family) is left alone.
 */
export function collapseRepeatedFullName(value: string): string {
  let current = collapseSpaces(value)
  for (let i = 0; i < 3; i += 1) {
    const parts = current.split(' ').filter(Boolean)
    if (parts.length < 4 || parts.length % 2 !== 0) break
    const mid = parts.length / 2
    const left = parts.slice(0, mid).join(' ')
    const right = parts.slice(mid).join(' ')
    if (left.toLowerCase() !== right.toLowerCase()) break
    current = left
  }
  return current
}

/** Split a single full-name field into given / family parts (first space). */
export function splitFullName(raw: string): { firstName: string; lastName: string } {
  const trimmedStart = collapseSpaces(raw)
  const spaceIdx = trimmedStart.search(/\s/)
  if (spaceIdx === -1) {
    return { firstName: trimmedStart, lastName: '' }
  }
  return {
    firstName: trimmedStart.slice(0, spaceIdx),
    lastName: trimmedStart.slice(spaceIdx + 1).replace(/^\s+/, ''),
  }
}

/**
 * Join given + family name without duplicating when autofill puts the full
 * name in both fields or twice in one field, on any device.
 */
export function joinPersonName(firstName: string, lastName: string): string {
  const first = collapseRepeatedFullName(firstName)
  const last = collapseRepeatedFullName(lastName)
  if (!first) return last
  if (!last) return first
  const firstLower = first.toLowerCase()
  const lastLower = last.toLowerCase()
  if (firstLower === lastLower) return first
  if (firstLower.endsWith(` ${lastLower}`)) return first
  if (lastLower.startsWith(`${firstLower} `)) return last
  return collapseRepeatedFullName(`${first} ${last}`)
}

/** Canonical first/last for payload. Collapses duplicates but keeps two-word given names. */
export function normalizeNameParts(
  firstName: string,
  lastName: string
): { firstName: string; lastName: string } {
  const first = collapseRepeatedFullName(firstName)
  const last = collapseRepeatedFullName(lastName)
  const joined = joinPersonName(first, last)
  const naiveJoin = [first, last].filter(Boolean).join(' ')
  const wasDuplicated =
    joined.toLowerCase() !== naiveJoin.toLowerCase() ||
    (Boolean(first) && Boolean(last) && first.toLowerCase() === last.toLowerCase())
  if (wasDuplicated) {
    return splitFullName(joined)
  }
  return { firstName: first, lastName: last }
}
