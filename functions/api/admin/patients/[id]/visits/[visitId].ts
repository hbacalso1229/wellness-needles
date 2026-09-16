import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../../../_lib/http'
import { actorEmail, getPatient, getVisit, saveVisit } from '../../../../../_lib/patients'
import { parseVisitNote } from '../../../../../../shared/patient-chart'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestPatch: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const patientId = context.params.id
  const visitId = context.params.visitId
  const row = await getPatient(context.env.DB, patientId)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const existing = await getVisit(context.env.DB, patientId, visitId)
  if (!existing) return jsonResponse(404, { ok: false, error: 'visit-not-found' })
  const body = (await readJsonBody(context.request)) as {
    visitAt?: string
    bookingId?: string
    document?: unknown
  } | null
  const visit = await saveVisit(
    context.env.DB,
    patientId,
    {
      id: visitId,
      bookingId: body?.bookingId !== undefined ? asString(body.bookingId) || null : existing.bookingId,
      visitAt: asString(body?.visitAt) || existing.visitAt,
      document: body?.document ? parseVisitNote(body.document) : existing.document,
    },
    actorEmail(context)
  )
  return jsonResponse(200, { ok: true, visit })
}
