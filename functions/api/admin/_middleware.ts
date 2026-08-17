import { verifyAccessJwt } from '../../_lib/access'
import { isPortalHost, jsonResponse, requestHost, type PagesEnv } from '../../_lib/http'

type PagesContext = {
  request: Request
  env: PagesEnv
  data?: Record<string, unknown>
  next: () => Promise<Response>
}

export async function onRequest(context: PagesContext): Promise<Response> {
  const host = requestHost(context.request)
  if (!isPortalHost(host)) {
    return jsonResponse(404, { ok: false, error: 'not-found' })
  }
  const identity = await verifyAccessJwt(context.env, context.request)
  if (!identity) {
    return jsonResponse(401, { ok: false, error: 'unauthorized' })
  }
  if (!context.data) context.data = {}
  context.data.email = identity.email
  return context.next()
}
