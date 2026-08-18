import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../_lib/http'
import { approvedReviews, readPublishedSite } from '../../../_lib/site'
import { KV_SITE_KEY } from '../../../../shared/site-snapshot'
import {
  clipCondition,
  excerptFromReview,
} from '../../../../shared/review-rating'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
}) => Response | Promise<Response>

async function refreshPublishedReviews(env: PagesEnv): Promise<void> {
  const site = await readPublishedSite(env)
  site.reviews = await approvedReviews(env)
  const json = JSON.stringify(site)
  const now = new Date().toISOString()
  if (env.DB) {
    await env.DB.prepare(
      'UPDATE site_settings SET published_json = ?, updated_at = ? WHERE id = 1'
    )
      .bind(json, now)
      .run()
  }
  await env.SITE_CACHE?.put(KV_SITE_KEY, json)
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const body = (await readJsonBody(context.request)) as {
    action?: string
    condition?: string
    emphasis?: string
  } | null
  const action = asString(body?.action)

  if (action === 'update') {
    const condition = clipCondition(body?.condition)
    if (condition == null) {
      return jsonResponse(400, { ok: false, error: 'condition too long' })
    }
    const row = await context.env.DB.prepare(
      `SELECT status, body, excerpt FROM reviews WHERE id = ?`
    )
      .bind(id)
      .first<{ status: string; body: string | null; excerpt: string | null }>()
    if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
    if (row.status !== 'pending' && row.status !== 'approved') {
      return jsonResponse(400, { ok: false, error: 'cannot-update' })
    }
    const reviewBody = asString(row.body) || asString(row.excerpt)
    const phrase = asString(body?.emphasis)
    const emphasis = phrase && reviewBody.includes(phrase) ? phrase : ''
    const excerpt = excerptFromReview(reviewBody, emphasis)
    await context.env.DB.prepare(
      `UPDATE reviews SET condition = ?, emphasis = ?, excerpt = ?
       WHERE id = ? AND status IN ('pending', 'approved')`
    )
      .bind(condition, emphasis, excerpt, id)
      .run()
    if (row.status === 'approved') {
      try {
        await refreshPublishedReviews(context.env)
      } catch (error) {
        console.error('[admin/reviews publish snapshot]', error)
      }
    }
    return jsonResponse(200, { ok: true, status: row.status })
  }

  const status =
    action === 'confirm'
      ? 'approved'
      : action === 'reject' || action === 'cancel'
        ? 'rejected'
        : action === 'restore' || action === 'unpublish'
          ? 'pending'
          : ''
  if (!status) return jsonResponse(400, { ok: false, error: 'unknown-action' })

  const previous = await context.env.DB.prepare(
    'SELECT status FROM reviews WHERE id = ?'
  )
    .bind(id)
    .first<{ status: string }>()

  await context.env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ?')
    .bind(status, id)
    .run()

  if (previous?.status === 'approved' || status === 'approved') {
    try {
      await refreshPublishedReviews(context.env)
    } catch (error) {
      console.error('[admin/reviews publish snapshot]', error)
    }
  }

  return jsonResponse(200, { ok: true, status })
}
