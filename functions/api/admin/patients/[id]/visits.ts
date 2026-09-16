import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../../_lib/http'
import { actorEmail, getPatient, listVisits, saveVisit } from '../../../../_lib/patients'
import { parseVisitNote } from '../../../../../shared/patient-chart'

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
  return jsonResponse(200, { visits: await listVisits(context.env.DB, id) })
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const row = await getPatient(context.env.DB, id)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const body = (await readJsonBody(context.request)) as {
    visitAt?: string
    bookingId?: string
    document?: unknown
  } | null
  const visitAt = asString(body?.visitAt) || new Date().toISOString()
  const visit = await saveVisit(
    context.env.DB,
    id,
    {
      bookingId: asString(body?.bookingId) || null,
      visitAt,
      document: parseVisitNote(body?.document),
    },
    actorEmail(context)
  )
  return jsonResponse(200, { ok: true, visit })
}
