import { jsonResponse, type PagesEnv } from '../../../../_lib/http'
import {
  actorEmail,
  getPatient,
  latestConsent,
  listFiles,
  listVisits,
  publicPatient,
  readIntake,
  writeAudit,
} from '../../../../_lib/patients'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const row = await getPatient(context.env.DB, id)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const [intake, consent, visits, files] = await Promise.all([
    readIntake(context.env.DB, id),
    latestConsent(context.env.DB, id),
    listVisits(context.env.DB, id),
    listFiles(context.env.DB, id),
  ])
  await writeAudit(context.env.DB, id, 'export', actorEmail(context))
  return jsonResponse(200, {
    exportedAt: new Date().toISOString(),
    patient: publicPatient(row),
    intake,
    consent,
    visits,
    files,
  })
}
