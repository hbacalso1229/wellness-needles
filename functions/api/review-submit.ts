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

function parseHalfStarRating(value: unknown): number | null {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  if (Math.abs(n * 2 - Math.round(n * 2)) > 1e-6) return null
  return Math.round(n * 2) / 2
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

  const name = asString(payload.name)
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

  const emphasisRaw = asString(payload.emphasis)
  const emphasis = emphasisRaw && reviewBody.includes(emphasisRaw) ? emphasisRaw : ''
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
