import { verifyAccessJwt } from '../../_lib/access'
import { jsonResponse, type PagesEnv } from '../../_lib/http'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const identity = await verifyAccessJwt(context.env, context.request)
  return jsonResponse(200, { email: identity?.email || '' })
}
