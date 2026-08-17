import {
  PUBLIC_CACHE_CONTROL,
  SITE_CACHE_TAG,
  SITE_DEFAULTS,
  overlayKillSwitchOff,
} from '../../../shared/site-snapshot'
import { jsonResponse, type PagesEnv } from '../../_lib/http'
import { approvedReviews, readPublishedSite } from '../../_lib/site'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  try {
    const site = await readPublishedSite(context.env)
    const reviews = await approvedReviews(context.env)
    const payload = {
      ...site,
      reviews,
      websiteOverlayEnabled: overlayKillSwitchOff()
        ? false
        : site.websiteOverlayEnabled,
    }
    return jsonResponse(200, payload, {
      'Cache-Control': PUBLIC_CACHE_CONTROL,
      'Cache-Tag': SITE_CACHE_TAG,
    })
  } catch (error) {
    console.error('[bff/site]', error)
    return jsonResponse(200, SITE_DEFAULTS, {
      'Cache-Control': PUBLIC_CACHE_CONTROL,
      'Cache-Tag': SITE_CACHE_TAG,
    })
  }
}
