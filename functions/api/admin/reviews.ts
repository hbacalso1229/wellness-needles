import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'
import {
  clipCondition,
  excerptFromReview,
  parseHalfStarRating,
  resolveEmphasis,
} from '../../../shared/review-rating'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { reviews: [] })
  const status = new URL(context.request.url).searchParams.get('status') || 'pending'
  const allowed = new Set(['pending', 'approved', 'rejected', 'cancelled'])
  if (status === 'all') {
    const { results } = await context.env.DB.prepare(
      `SELECT id, status, name, condition, reviewed_at as reviewedAt, rating, source,
              emphasis, excerpt, body, created_at as createdAt
       FROM reviews ORDER BY created_at DESC LIMIT 400`
    ).all()
    return jsonResponse(200, { reviews: results || [] })
  }
  const filter = allowed.has(status) ? status : 'pending'
  const { results } = await context.env.DB.prepare(
    `SELECT id, status, name, condition, reviewed_at as reviewedAt, rating, source,
            emphasis, excerpt, body, created_at as createdAt
     FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT 200`
  )
    .bind(filter)
    .all()
  return jsonResponse(200, { reviews: results || [] })
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const body = (await readJsonBody(context.request)) as Record<string, unknown> | null
  const name = asString(body?.name)
  const reviewBody = asString(body?.body) || asString(body?.excerpt)
  if (!name || !reviewBody) {
    return jsonResponse(400, { ok: false, error: 'name and excerpt required' })
  }
  const rating = parseHalfStarRating(body?.rating)
  if (rating == null) {
    return jsonResponse(400, { ok: false, error: 'rating must be 1–5 in half-star steps' })
  }
  const condition = clipCondition(body?.condition)
  if (condition == null) {
    return jsonResponse(400, { ok: false, error: 'condition too long' })
  }
  const emphasis = resolveEmphasis(reviewBody, body?.emphasis)
  const excerpt = excerptFromReview(reviewBody, emphasis)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const reviewedAt = asString(body?.reviewedAt) || now.slice(0, 10)
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
      asString(body?.source) || 'Owner',
      emphasis,
      excerpt,
      reviewBody,
      now
    )
    .run()
  return jsonResponse(200, { ok: true, id })
}
