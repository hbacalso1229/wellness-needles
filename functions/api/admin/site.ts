import {
  parseSiteSnapshot,
  SITE_DEFAULTS,
  type SiteSnapshot,
} from '../../../shared/site-snapshot'
import { jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'
import { publishSite, readDraftSite, readPublishedSite, saveDraftSite } from '../../_lib/site'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  const [draft, published] = await Promise.all([
    readDraftSite(context.env),
    readPublishedSite(context.env),
  ])
  // Top-level snapshot fields keep the live portal load path working
  // (`parseSiteSnapshot(site)`). Nested draft/published let Save draft vs
  // Publish compare against www without changing prices until Publish.
  return jsonResponse(200, { ...draft, draft, published })
}

export const onRequestPut: PagesFunction<PagesEnv> = async (context) => {
  const body = await readJsonBody(context.request)
  const parsed = parseSiteSnapshot(body)
  if (!parsed) {
    return jsonResponse(400, { ok: false, error: 'invalid-site' })
  }
  if (
    !parsed.features.bookingFormEnabled &&
    !parsed.features.calendlyEnabled &&
    !parsed.features.freshaEnabled
  ) {
    return jsonResponse(400, {
      ok: false,
      error: 'booking-channel-required',
    })
  }
  try {
    await saveDraftSite(context.env, parsed)
    return jsonResponse(200, { ok: true, draft: parsed })
  } catch (error) {
    console.error('[admin/site put]', error)
    return jsonResponse(503, { ok: false, error: 'db-missing' })
  }
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  const url = new URL(context.request.url)
  const action = url.searchParams.get('action') || 'publish'
  const body = await readJsonBody(context.request)
  const parsed =
    parseSiteSnapshot(body) ||
    (action === 'publish' ? await readDraftSite(context.env) : null)
  if (!parsed) {
    return jsonResponse(400, { ok: false, error: 'invalid-site' })
  }
  if (
    !parsed.features.bookingFormEnabled &&
    !parsed.features.calendlyEnabled &&
    !parsed.features.freshaEnabled
  ) {
    return jsonResponse(400, { ok: false, error: 'booking-channel-required' })
  }
  try {
    const snapshot: SiteSnapshot = parsed
    if (action === 'save') {
      await saveDraftSite(context.env, snapshot)
      return jsonResponse(200, { ok: true, draft: snapshot })
    }
    await publishSite(context.env, snapshot, caches, context.data?.email)
    return jsonResponse(200, { ok: true, published: snapshot })
  } catch (error) {
    console.error('[admin/site post]', error)
    return jsonResponse(503, { ok: false, error: 'publish-failed' })
  }
}

export const SITE_FALLBACK = SITE_DEFAULTS
