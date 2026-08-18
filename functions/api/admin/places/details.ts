import { jsonResponse, type PagesEnv } from '../../../_lib/http'
import { placeAddressDetails } from '../../../_lib/places'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const placeId = new URL(context.request.url).searchParams.get('id')?.trim() || ''
  if (!placeId) {
    return jsonResponse(400, { ok: false, error: 'id required' })
  }

  try {
    const address = await placeAddressDetails(placeId)
    return jsonResponse(200, address)
  } catch {
    return jsonResponse(502, { ok: false, error: 'places-failed' })
  }
}
