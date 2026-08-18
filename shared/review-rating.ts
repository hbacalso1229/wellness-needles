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
