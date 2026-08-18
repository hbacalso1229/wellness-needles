/**
 * Public patient review submit. Turnstile + pending D1 insert.
 * Self-contained (no _lib) so a compile error cannot take down booking via shared imports.
 * Secret: TURNSTILE_SECRET_KEY. Binding: DB (same D1 as portal).
 */

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type Env = {
  TURNSTILE_SECRET_KEY?: string
  DB?: {
    prepare: (query: string) => {
      bind: (...values: unknown[]) => { run: () => Promise<unknown> }
    }
  }
}

type Body = {
  turnstileToken?: string
  name?: string
  condition?: string
  rating?: number
  emphasis?: string
  body?: string
  excerpt?: string
}

type TurnstileVerifyJson = {
  success?: boolean
  hostname?: string
  'error-codes'?: string[]
}

const CONDITION_MAX_LEN = 40
const REVIEW_NAME_MAX_LEN = 80
const REVIEW_BODY_MAX_LEN = 1000

function isAllowedTurnstileHostname(hostname: string): boolean {
  return (
    hostname === 'www.wellnessneedles.ie' ||
    hostname === 'wellnessneedles.ie' ||
    hostname === 'wellness-needles.pages.dev' ||
    hostname.endsWith('.wellness-needles.pages.dev')
  )
}

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/* Keep in sync with shared/review-rating.ts — this Function cannot import shared. */
function titleCasePersonName(name: string): string {
  const text = name.trim().replace(/\s+/g, ' ')
  if (!text) return ''
  return text.replace(/[A-Za-zÀ-ÿ]+/g, (chunk) =>
    chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase()
  )
}

function parseHalfStarRating(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  if (Math.abs(n * 2 - Math.round(n * 2)) > 1e-6) return null
  return Math.round(n * 2) / 2
}

/* Keep in sync with shared/review-rating.ts — this Function cannot import shared. */
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

function suggestEmphasis(body: string): string {
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

function resolveEmphasis(body: string, raw: unknown): string {
  const phrase = typeof raw === 'string' ? raw.trim() : ''
  if (phrase && body.includes(phrase)) return phrase
  return suggestEmphasis(body)
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteip: string | null
): Promise<boolean> {
  const params = new URLSearchParams()
  params.set('secret', secret)
  params.set('response', token)
  if (remoteip) params.set('remoteip', remoteip)

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  )
  const data = (await response.json()) as TurnstileVerifyJson
  const hostname = asString(data.hostname)
  if (!data.success || !hostname || !isAllowedTurnstileHostname(hostname)) {
    console.error(
      '[review-submit] Turnstile siteverify failed',
      data['error-codes'] || [],
      hostname
    )
    return false
  }
  return true
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const turnstileSecret = context.env.TURNSTILE_SECRET_KEY?.trim()
  if (!turnstileSecret) {
    return jsonResponse(503, { ok: false, error: 'not-configured' })
  }
  if (!context.env.DB) {
    return jsonResponse(503, { ok: false, error: 'not-configured' })
  }

  let payload: Body
  try {
    payload = (await context.request.json()) as Body
  } catch {
    return jsonResponse(400, { ok: false, error: 'Invalid JSON' })
  }

  const token = asString(payload.turnstileToken)
  if (!token) {
    return jsonResponse(400, { ok: false, error: 'captcha-required' })
  }
  const remoteip = context.request.headers.get('CF-Connecting-IP')
  const verified = await verifyTurnstile(turnstileSecret, token, remoteip)
  if (!verified) {
    return jsonResponse(400, { ok: false, error: 'captcha-required' })
  }

  const name = titleCasePersonName(asString(payload.name))
  const reviewBody = asString(payload.body) || asString(payload.excerpt)
  if (!name || !reviewBody) {
    return jsonResponse(400, { ok: false, error: 'name and review text required' })
  }
  if (name.length > REVIEW_NAME_MAX_LEN) {
    return jsonResponse(400, { ok: false, error: 'name too long' })
  }
  if (reviewBody.length > REVIEW_BODY_MAX_LEN) {
    return jsonResponse(400, { ok: false, error: 'review too long' })
  }

  const rating = parseHalfStarRating(payload.rating)
  if (rating == null) {
    return jsonResponse(400, { ok: false, error: 'rating must be 1–5 in half-star steps' })
  }

  const condition = asString(payload.condition)
  if (condition.length > CONDITION_MAX_LEN) {
    return jsonResponse(400, { ok: false, error: 'condition too long' })
  }

  const emphasis = resolveEmphasis(reviewBody, payload.emphasis)
  const excerpt = emphasis || reviewBody.slice(0, 120)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const reviewedAt = now.slice(0, 10)

  await context.env.DB.prepare(
    `INSERT INTO reviews (
      id, status, name, condition, reviewed_at, rating, source, emphasis, excerpt, body, created_at
    ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      name,
      condition,
      reviewedAt,
      rating,
      'Verified patient review',
      emphasis,
      excerpt,
      reviewBody,
      now
    )
    .run()

  return jsonResponse(200, { ok: true, id })
}
