import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { reviews: [] })
  const status = new URL(context.request.url).searchParams.get('status') || 'pending'
  const { results } = await context.env.DB.prepare(
    `SELECT id, status, name, condition, reviewed_at as reviewedAt, rating, source,
            emphasis, excerpt, body, created_at as createdAt
     FROM reviews WHERE status = ? ORDER BY created_at DESC LIMIT 200`
  )
    .bind(status)
    .all()
  return jsonResponse(200, { reviews: results || [] })
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const body = (await readJsonBody(context.request)) as Record<string, unknown> | null
  const name = asString(body?.name)
  const excerpt = asString(body?.excerpt) || asString(body?.body)
  if (!name || !excerpt) {
    return jsonResponse(400, { ok: false, error: 'name and excerpt required' })
  }
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const reviewedAt = asString(body?.reviewedAt) || now.slice(0, 10)
  const rating =
    typeof body?.rating === 'number' && body.rating >= 1 && body.rating <= 5
      ? Math.round(body.rating)
      : 5
  await context.env.DB.prepare(
    `INSERT INTO reviews (
      id, status, name, condition, reviewed_at, rating, source, emphasis, excerpt, body, created_at
    ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      name,
      asString(body?.condition),
      reviewedAt,
      rating,
      asString(body?.source) || 'Owner',
      excerpt,
      excerpt,
      asString(body?.body) || excerpt,
      now
    )
    .run()
  return jsonResponse(200, { ok: true, id })
}
