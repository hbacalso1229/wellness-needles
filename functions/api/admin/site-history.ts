import { jsonResponse, type PagesEnv } from '../../_lib/http'
import { labelForFieldPath } from '../../../shared/site-diff'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type HistoryRow = {
  id: string
  publishId: string
  changedAt: string
  changedBy: string
  action: string
  fieldPath: string
  fromValue: string
  toValue: string
}

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { changes: [] })

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT id,
              publish_id as publishId,
              changed_at as changedAt,
              changed_by as changedBy,
              action,
              field_path as fieldPath,
              from_value as fromValue,
              to_value as toValue
       FROM site_change_history
       ORDER BY changed_at DESC, field_path ASC
       LIMIT 200`
    ).all<HistoryRow>()

    const changes = (results || []).map((row) => ({
      ...row,
      fieldLabel: labelForFieldPath(row.fieldPath),
    }))
    return jsonResponse(200, { changes })
  } catch (error) {
    console.error('[admin/site-history]', error)
    return jsonResponse(200, { changes: [] })
  }
}
