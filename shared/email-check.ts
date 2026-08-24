export const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.ie',
  'hotmail.com',
  'hotmail.ie',
  'outlook.com',
  'outlook.ie',
  'icloud.com',
  'me.com',
  'live.com',
  'live.ie',
  'msn.com',
  'proton.me',
  'protonmail.com',
  'eircom.net',
  'btinternet.com',
  'aol.com',
] as const

export type EmailLocalCheck =
  | { ok: true; normalized: string; local: string; domain: string }
  | { ok: false; reason: 'format' }
  | { ok: false; reason: 'typo'; suggestion: string }

export type EmailCheckReason = 'format' | 'typo' | 'mx'

export function parseEmailAddress(
  value: string
): { local: string; domain: string } | null {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return null
  const at = trimmed.indexOf('@')
  if (at < 1 || at !== trimmed.lastIndexOf('@')) return null
  const local = trimmed.slice(0, at)
  const domain = trimmed.slice(at + 1).toLowerCase()
  if (!local || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return null
  }
  if (
    !domain ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    domain.includes('..') ||
    domain.startsWith('-') ||
    domain.endsWith('-')
  ) {
    return null
  }
  const labels = domain.split('.')
  if (labels.length < 2) return null
  const tld = labels[labels.length - 1]
  if (tld.length < 2 || !/^[a-z]{2,}$/.test(tld)) return null
  if (!labels.every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))) {
    return null
  }
  return { local, domain }
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const next = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
      prev = next
    }
  }
  return row[b.length]
}

function typoSuggestion(domain: string, local: string): string | null {
  if ((COMMON_EMAIL_DOMAINS as readonly string[]).includes(domain)) return null
  let best: { domain: string; distance: number } | null = null
  for (const candidate of COMMON_EMAIL_DOMAINS) {
    const lengthDelta = Math.abs(domain.length - candidate.length)
    if (lengthDelta > 2) continue
    const distance = levenshtein(domain, candidate)
    if (distance === 0 || distance > 2) continue
    if (!best || distance < best.distance) best = { domain: candidate, distance }
  }
  return best ? `${local}@${best.domain}` : null
}

export function checkEmailLocal(value: string): EmailLocalCheck {
  const parsed = parseEmailAddress(value)
  if (!parsed) return { ok: false, reason: 'format' }
  const suggestion = typoSuggestion(parsed.domain, parsed.local)
  if (suggestion) return { ok: false, reason: 'typo', suggestion }
  return {
    ok: true,
    normalized: `${parsed.local}@${parsed.domain}`,
    local: parsed.local,
    domain: parsed.domain,
  }
}

export function isValidEmailFormat(value: string): boolean {
  return parseEmailAddress(value) !== null
}

export function emailTypoSuggestion(value: string): string | null {
  const result = checkEmailLocal(value)
  if (!result.ok && result.reason === 'typo') return result.suggestion
  return null
}

export function emailCheckMessage(result: {
  reason: EmailCheckReason
  suggestion?: string
}): string {
  if (result.reason === 'typo' && result.suggestion) {
    return `Check the email domain. Did you mean ${result.suggestion}?`
  }
  if (result.reason === 'mx') {
    return 'This email domain cannot receive mail. Please check the spelling.'
  }
  return 'Please enter a valid email address.'
}
