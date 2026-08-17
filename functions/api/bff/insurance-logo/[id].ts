import { jsonResponse, type PagesEnv } from '../../../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const id = context.params.id
  if (!id || !context.env.SITE_CACHE) {
    return jsonResponse(404, { ok: false, error: 'not-found' })
  }
  const stored = await context.env.SITE_CACHE.get(`insurance:logo:${id}`, 'arrayBuffer')
  const meta = await context.env.SITE_CACHE.get(`insurance:logo:${id}:type`)
  if (!stored) return jsonResponse(404, { ok: false, error: 'not-found' })
  return new Response(stored, {
    status: 200,
    headers: {
      'Content-Type': meta || 'image/png',
      'Cache-Control':
        'public, max-age=0, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400',
      'Cache-Tag': 'site-public',
    },
  })
}
