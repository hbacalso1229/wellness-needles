import { jsonResponse, type PagesEnv } from '../../../../../_lib/http'
import {
  actorEmail,
  deleteFileRow,
  getFileRow,
  getPatient,
  writeAudit,
} from '../../../../../_lib/patients'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  params: Record<string, string>
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  if (!context.env.PATIENT_FILES) return jsonResponse(503, { ok: false, error: 'no-r2' })
  const patientId = context.params.id
  const fileId = context.params.fileId
  const patient = await getPatient(context.env.DB, patientId)
  if (!patient) return jsonResponse(404, { ok: false, error: 'not-found' })
  const row = await getFileRow(context.env.DB, patientId, fileId)
  if (!row) return jsonResponse(404, { ok: false, error: 'file-not-found' })
  const object = await context.env.PATIENT_FILES.get(row.r2Key)
  if (!object) return jsonResponse(404, { ok: false, error: 'file-missing' })
  await writeAudit(context.env.DB, patientId, 'download', actorEmail(context), row.originalName)
  const download = new URL(context.request.url).searchParams.get('download') === '1'
  const headers = new Headers()
  headers.set('Content-Type', row.mime || 'application/octet-stream')
  headers.set('Cache-Control', 'no-store')
  headers.set(
    'Content-Disposition',
    `${download ? 'attachment' : 'inline'}; filename="${row.originalName.replace(/"/g, '')}"`
  )
  return new Response(object.body, { status: 200, headers })
}

export const onRequestDelete: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const patientId = context.params.id
  const fileId = context.params.fileId
  const patient = await getPatient(context.env.DB, patientId)
  if (!patient) return jsonResponse(404, { ok: false, error: 'not-found' })
  const key = await deleteFileRow(context.env.DB, patientId, fileId)
  if (!key) return jsonResponse(404, { ok: false, error: 'file-not-found' })
  if (context.env.PATIENT_FILES) await context.env.PATIENT_FILES.delete(key)
  await writeAudit(context.env.DB, patientId, 'delete-file', actorEmail(context), fileId)
  return jsonResponse(200, { ok: true })
}
