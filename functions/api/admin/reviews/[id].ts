import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../../_lib/http'
import { approvedReviews, publishSite, readPublishedSite } from '../../../../_lib/site'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
}) => Response | Promise<Response>

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const body = (await readJsonBody(context.request)) as { action?: string } | null
  const action = asString(body?.action)
  const status = action === 'confirm' ? 'approved' : action === 'cancel' ? 'cancelled' : ''
  if (!status) return jsonResponse(400, { ok: false, error: 'unknown-action' })

  await context.env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ?')
    .bind(status, id)
    .run()

  if (status === 'approved') {
    try {
      const site = await readPublishedSite(context.env)
      site.reviews = await approvedReviews(context.env)
      await publishSite(context.env, site, caches)
    } catch (error) {
      console.error('[admin/reviews confirm publish]', error)
    }
  }

  return jsonResponse(200, { ok: true, status })
}
