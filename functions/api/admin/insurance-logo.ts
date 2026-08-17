import { jsonResponse, type PagesEnv } from '../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

const MAX_BYTES = 512 * 1024
const ALLOWED = new Set(['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg'])

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.SITE_CACHE) {
    return jsonResponse(503, { ok: false, error: 'no-kv' })
  }
  const contentType = context.request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse(400, { ok: false, error: 'multipart required' })
  }
  const form = await context.request.formData()
  const id = String(form.get('id') || '').trim()
  const file = form.get('file')
  if (!id || !(file instanceof File)) {
    return jsonResponse(400, { ok: false, error: 'id and file required' })
  }
  if (file.size > MAX_BYTES) {
    return jsonResponse(400, { ok: false, error: 'file too large (max 512KB)' })
  }
  const type = file.type || 'image/png'
  if (!ALLOWED.has(type)) {
    return jsonResponse(400, { ok: false, error: 'png, svg, webp, or jpeg only' })
  }
  const buf = await file.arrayBuffer()
  await context.env.SITE_CACHE.put(`insurance:logo:${id}`, buf)
  await context.env.SITE_CACHE.put(`insurance:logo:${id}:type`, type)
  return jsonResponse(200, {
    ok: true,
    url: `/api/bff/insurance-logo/${encodeURIComponent(id)}`,
  })
}
