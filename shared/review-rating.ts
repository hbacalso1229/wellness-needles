/** Half-star ratings: 1, 1.5, … 5. Rejects values that would round. */
export function parseHalfStarRating(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  if (Math.abs(n * 2 - Math.round(n * 2)) > 1e-6) return null
  return Math.round(n * 2) / 2
}

export const CONDITION_MAX_LEN = 40
export const REVIEW_BODY_MAX_LEN = 1000
export const REVIEW_NAME_MAX_LEN = 80

export const TREATMENT_TAG_PRESETS = [
  'Pain relief',
  'Anxiety & sleep',
  'Digestive',
  'Fertility',
  'Energy & wellbeing',
] as const

export function clipCondition(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) return ''
  if (text.length > CONDITION_MAX_LEN) return null
  return text
}

const EMPHASIS_MIN = 24
const EMPHASIS_MAX = 80
const EMPHASIS_SWEET = 50

const OUTCOME_TERMS = [
  'pain-free',
  'pain free',
  'symptom',
  'energy',
  'sleep',
  'recommend',
  'session',
  'relax',
  'better',
  'gone',
  'disappeared',
  'exceptional',
  'effective',
  'blooming',
  'alive',
  'miracle',
]

const CONTRAST_TERMS = ['first time', 'within one', 'only', ' now ', 'after']

const OPENER_PREFIXES = [
  'i had a',
  'i would like to',
  'going to arkinth',
  'i have been to',
  'i have had acupuncture',
  'had my first session',
]

function addCandidate(found: Set<string>, body: string, raw: string) {
  const phrase = raw.trim().replace(/^["“']+|["”']+$/g, '')
  if (phrase.length < EMPHASIS_MIN || phrase.length > EMPHASIS_MAX) return
  if (!body.includes(phrase)) return
  found.add(phrase)
}

function collectEmphasisCandidates(body: string): string[] {
  const found = new Set<string>()
  const quoteRe = /["“]([^"”]{24,80})["”]/g
  let match: RegExpExecArray | null
  while ((match = quoteRe.exec(body))) {
    addCandidate(found, body, match[1] ?? '')
  }

  const sentenceRe = /[^.!?]+[.!?]+|[^.!?]+$/g
  const sentences: string[] = []
  while ((match = sentenceRe.exec(body))) {
    const sentence = (match[0] ?? '').trim()
    sentences.push(sentence)
    addCandidate(found, body, sentence)
  }

  for (const sentence of sentences) {
    for (const part of sentence.split(/[;–—]/)) {
      addCandidate(found, body, part)
    }
  }

  return [...found]
}

function scoreEmphasis(candidate: string, body: string): number {
  const lower = ` ${candidate.toLowerCase()} `
  let score = 20 - Math.abs(candidate.length - EMPHASIS_SWEET) * 0.4
  for (const term of OUTCOME_TERMS) {
    if (lower.includes(term)) score += 12
  }
  for (const term of CONTRAST_TERMS) {
    if (lower.includes(term)) score += 8
  }
  const start = candidate.toLowerCase()
  for (const prefix of OPENER_PREFIXES) {
    if (start.startsWith(prefix)) score -= 18
  }
  const index = body.indexOf(candidate)
  if (index >= 0 && index < 20) score -= 6
  return score
}

/** Exact substring of `body` to bold on the testimonial card. No AI. */
export function suggestEmphasis(body: string): string {
  const text = body.trim()
  if (!text) return ''
  const candidates = collectEmphasisCandidates(text)
  let best = ''
  let bestScore = -Infinity
  for (const candidate of candidates) {
    const score = scoreEmphasis(candidate, text)
    if (score > bestScore) {
      bestScore = score
      best = candidate
    }
  }
  if (best && bestScore > 0) return best
  if (candidates.length) {
    return [...candidates].sort(
      (a, b) => Math.abs(a.length - EMPHASIS_SWEET) - Math.abs(b.length - EMPHASIS_SWEET)
    )[0]
  }
  if (text.length <= EMPHASIS_MAX) return text
  const slice = text.slice(0, EMPHASIS_MAX)
  const space = slice.lastIndexOf(' ')
  const cut = space > EMPHASIS_MIN ? slice.slice(0, space) : slice
  return text.includes(cut) ? cut : text.slice(0, EMPHASIS_MAX)
}

export function resolveEmphasis(body: string, raw: unknown): string {
  const phrase = typeof raw === 'string' ? raw.trim() : ''
  if (phrase && body.includes(phrase)) return phrase
  return suggestEmphasis(body)
}

export function excerptFromReview(body: string, emphasis: string): string {
  return emphasis || body.slice(0, 120)
}
