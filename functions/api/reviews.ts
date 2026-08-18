/**
 * Public approved reviews for the testimonials carousel.
 * Empty D1 / missing DB → { reviews: [] } so www stays on baked Google cards.
 * Never falls back to seeded defaults (that would duplicate the carousel).
 */

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type Env = {
  DB?: {
    prepare: (query: string) => {
      all: <T>() => Promise<{ results?: T[] }>
    }
  }
}

type ReviewRow = {
  id: string
  name: string
  condition: string | null
  reviewedAt: string
  rating: number
  source: string | null
  emphasis: string | null
  excerpt: string | null
  body: string | null
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { reviews: [] })
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT id, name, condition, reviewed_at as reviewedAt, rating, source,
              emphasis, excerpt, body
       FROM reviews WHERE status = 'approved' ORDER BY reviewed_at DESC LIMIT 100`
    ).all<ReviewRow>()
    return jsonResponse(200, { reviews: results || [] })
  } catch (error) {
    console.error('[reviews get]', error)
    return jsonResponse(200, { reviews: [] })
  }
}
