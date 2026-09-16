import { jsonResponse, readJsonBody, type PagesEnv } from '../../../../_lib/http'
import { readPublishedSite } from '../../../../_lib/site'
import {
  actorEmail,
  erasePatient,
  getPatient,
  updatePatientIdentity,
  writeAudit,
} from '../../../../_lib/patients'
import { isWithinRetention } from '../../../../../shared/patient-chart'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const row = await getPatient(context.env.DB, id)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const body = (await readJsonBody(context.request)) as {
    erase?: boolean
    legalException?: boolean
  } | null
  const actor = actorEmail(context)
  if (!body?.erase) {
    await updatePatientIdentity(context.env.DB, id, { status: 'archived' }, actor)
    await writeAudit(context.env.DB, id, 'archive', actor)
    return jsonResponse(200, { ok: true, archived: true })
  }
  const site = await readPublishedSite(context.env)
  const months = site.features.patientRecordRetentionMonths
  if (isWithinRetention(row.last_seen_at, months) && !body.legalException) {
    return jsonResponse(409, {
      ok: false,
      error: 'within-retention',
      retentionMonths: months,
    })
  }
  await writeAudit(context.env.DB, id, 'erase', actor)
  await erasePatient(context.env, id)
  return jsonResponse(200, { ok: true, erased: true })
}
