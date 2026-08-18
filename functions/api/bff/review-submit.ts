import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'
import { verifyTurnstile } from '../../_lib/turnstile'
import {
  clipCondition,
  excerptFromReview,
  parseHalfStarRating,
  resolveEmphasis,
  titleCasePersonName,
} from '../../../shared/review-rating'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type Body = {
  turnstileToken?: string
  name?: string
  condition?: string
  rating?: number
  source?: string
  excerpt?: string
  body?: string
  emphasis?: string
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  const secret = context.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret || !context.env.DB) {
    return jsonResponse(503, { ok: false, error: 'not-configured' })
  }

  const payload = (await readJsonBody(context.request)) as Body | null
  if (!payload) return jsonResponse(400, { ok: false, error: 'Invalid JSON' })

  const token = asString(payload.turnstileToken)
  const remoteip = context.request.headers.get('CF-Connecting-IP')
  const ok = token && (await verifyTurnstile(secret, token, remoteip))
  if (!ok) {
    return jsonResponse(400, { ok: false, error: 'captcha-required' })
  }

  const name = titleCasePersonName(asString(payload.name))
  const reviewBody = asString(payload.body) || asString(payload.excerpt)
  if (!name || !reviewBody) {
    return jsonResponse(400, { ok: false, error: 'name and review text required' })
  }

  const rating = parseHalfStarRating(payload.rating)
  if (rating == null) {
    return jsonResponse(400, { ok: false, error: 'rating must be 1–5 in half-star steps' })
  }
  const condition = clipCondition(payload.condition)
  if (condition == null) {
    return jsonResponse(400, { ok: false, error: 'condition too long' })
  }
  const emphasis = resolveEmphasis(reviewBody, payload.emphasis)
  const excerpt = excerptFromReview(reviewBody, emphasis)
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
      asString(payload.source) || 'Verified patient review',
      emphasis,
      excerpt,
      reviewBody,
      now
    )
    .run()

  return jsonResponse(200, { ok: true, id })
}
