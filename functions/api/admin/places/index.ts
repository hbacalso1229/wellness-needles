import { jsonResponse, type PagesEnv } from '../../../_lib/http'
import { autocompletePlaces } from '../../../_lib/places'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const params = new URL(context.request.url).searchParams
  const query = params.get('q')?.trim() || ''
  const country = params.get('country')?.trim() || ''
  if (query.length < 3) {
    return jsonResponse(200, { suggestions: [] })
  }

  try {
    const suggestions = await autocompletePlaces(query, country)
    return jsonResponse(200, { suggestions })
  } catch {
    return jsonResponse(502, { ok: false, error: 'places-failed' })
  }
}
