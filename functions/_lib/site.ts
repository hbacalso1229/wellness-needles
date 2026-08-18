import {
  KV_SITE_KEY,
  SITE_CACHE_TAG,
  SITE_DEFAULTS,
  parseSiteSnapshot,
  type SiteSnapshot,
} from '../../shared/site-snapshot'
import { diffSiteSnapshots } from '../../shared/site-diff'
import type { PagesEnv } from './http'

export async function readPublishedSite(env: PagesEnv): Promise<SiteSnapshot> {
  const fromKv = await env.SITE_CACHE?.get(KV_SITE_KEY, 'text')
  if (fromKv) {
    try {
      const parsed = parseSiteSnapshot(JSON.parse(fromKv))
      if (parsed) return parsed
    } catch {
      /* fall through */
    }
  }

  if (env.DB) {
    const row = await env.DB.prepare(
      'SELECT published_json FROM site_settings WHERE id = 1'
    ).first<{ published_json: string }>()
    if (row?.published_json) {
      try {
        const parsed = parseSiteSnapshot(JSON.parse(row.published_json))
        if (parsed) return parsed
      } catch {
        /* fall through */
      }
    }
  }

  return SITE_DEFAULTS
}

export async function readDraftSite(env: PagesEnv): Promise<SiteSnapshot> {
  if (!env.DB) return SITE_DEFAULTS
  const row = await env.DB.prepare(
    'SELECT draft_json FROM site_settings WHERE id = 1'
  ).first<{ draft_json: string }>()
  if (!row?.draft_json) return SITE_DEFAULTS
  try {
    return parseSiteSnapshot(JSON.parse(row.draft_json)) ?? SITE_DEFAULTS
  } catch {
    return SITE_DEFAULTS
  }
}

export async function saveDraftSite(
  env: PagesEnv,
  snapshot: SiteSnapshot
): Promise<void> {
  if (!env.DB) throw new Error('DB binding missing')
  const now = new Date().toISOString()
  const json = JSON.stringify(snapshot)
  const publishedFallback = JSON.stringify(
    (await readPublishedSite(env))
  )
  await env.DB.prepare(
    `INSERT INTO site_settings (id, published_json, draft_json, website_overlay_enabled, updated_at)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET draft_json = excluded.draft_json, updated_at = excluded.updated_at`
  )
    .bind(publishedFallback, json, snapshot.websiteOverlayEnabled ? 1 : 0, now)
    .run()
}

export async function publishSite(
  env: PagesEnv,
  snapshot: SiteSnapshot,
  caches?: CacheStorage,
  actorEmail?: string
): Promise<void> {
  if (!env.DB) throw new Error('DB binding missing')
  let previous = SITE_DEFAULTS
  try {
    previous = await readPublishedSite(env)
  } catch (error) {
    console.error('[publishSite previous]', error)
  }
  const now = new Date().toISOString()
  const json = JSON.stringify(snapshot)
  await env.DB.prepare(
    `INSERT INTO site_settings (id, published_json, draft_json, website_overlay_enabled, updated_at)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       published_json = excluded.published_json,
       draft_json = excluded.draft_json,
       website_overlay_enabled = excluded.website_overlay_enabled,
       updated_at = excluded.updated_at`
  )
    .bind(json, json, snapshot.websiteOverlayEnabled ? 1 : 0, now)
    .run()

  await env.SITE_CACHE?.put(KV_SITE_KEY, json)
  await recordSiteHistory(env, previous, snapshot, now, actorEmail || '')

  try {
    const cache = await caches?.open('site-public')
    const cacheUrl = 'https://www.wellnessneedles.ie/api/bff/site'
    await cache?.put(
      cacheUrl,
      new Response(json, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Tag': SITE_CACHE_TAG,
        },
      })
    )
  } catch {
    /* Cache API optional */
  }
}

async function recordSiteHistory(
  env: PagesEnv,
  previous: SiteSnapshot,
  next: SiteSnapshot,
  changedAt: string,
  changedBy: string
): Promise<void> {
  try {
    if (!env.DB) return
    const changes = diffSiteSnapshots(previous, next)
    if (changes.length === 0) return
    const publishId = crypto.randomUUID()
    const statements = changes.map((change) =>
      env.DB!.prepare(
        `INSERT INTO site_change_history (
          id, publish_id, changed_at, changed_by, action, field_path, from_value, to_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        crypto.randomUUID(),
        publishId,
        changedAt,
        changedBy,
        change.action,
        change.fieldPath,
        change.fromValue,
        change.toValue
      )
    )
    const chunkSize = 50
    for (let i = 0; i < statements.length; i += chunkSize) {
      await env.DB.batch(statements.slice(i, i + chunkSize))
    }
  } catch (error) {
    console.error('[site-history]', error)
  }
}

export async function approvedReviews(env: PagesEnv): Promise<SiteSnapshot['reviews']> {
  if (!env.DB) return []
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, condition, reviewed_at as reviewedAt, rating, source, emphasis, excerpt, body
       FROM reviews WHERE status = 'approved' ORDER BY reviewed_at DESC`
    ).all<SiteSnapshot['reviews'][number]>()
    return results?.length ? results : []
  } catch (error) {
    console.error('[approvedReviews]', error)
    return []
  }
}
