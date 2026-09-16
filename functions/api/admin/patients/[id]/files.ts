import { jsonResponse, type PagesEnv } from '../../../../_lib/http'
import {
  actorEmail,
  getPatient,
  insertFileRow,
  listFiles,
  otherPatientHasSameName,
  relocateUuidFolderFiles,
  writeAudit,
} from '../../../../_lib/patients'
import {
  PATIENT_FILE_MAX_BYTES,
  isAllowedPatientFileMime,
  patientFileFolderName,
  patientFileR2Key,
} from '../../../../../shared/patient-chart'

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
  try {
    await relocateUuidFolderFiles(context.env, row)
  } catch {
    /* keep listing even if a copy/delete fails */
  }
  return jsonResponse(200, { files: await listFiles(context.env.DB, id) })
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  if (!context.env.PATIENT_FILES) return jsonResponse(503, { ok: false, error: 'no-r2' })
  const id = context.params.id
  const row = await getPatient(context.env.DB, id)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const contentType = context.request.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return jsonResponse(400, { ok: false, error: 'multipart required' })
  }
  const form = await context.request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return jsonResponse(400, { ok: false, error: 'file required' })
  if (file.size > PATIENT_FILE_MAX_BYTES) {
    return jsonResponse(400, { ok: false, error: 'file too large (max 10MB)' })
  }
  const mime = file.type || 'application/octet-stream'
  if (!isAllowedPatientFileMime(mime)) {
    return jsonResponse(400, { ok: false, error: 'pdf, jpeg, png, webp, or heic only' })
  }
  const fileId = crypto.randomUUID()
  const nameClash = await otherPatientHasSameName(
    context.env.DB,
    id,
    row.first_name,
    row.last_name
  )
  const folder = patientFileFolderName(row.first_name, row.last_name, id, nameClash)
  const key = patientFileR2Key(folder, fileId)
  const buf = await file.arrayBuffer()
  await context.env.PATIENT_FILES.put(key, buf, {
    httpMetadata: { contentType: mime },
  })
  const actor = actorEmail(context)
  await insertFileRow(context.env.DB, {
    id: fileId,
    patientId: id,
    originalName: file.name || 'upload',
    mime,
    sizeBytes: file.size,
    r2Key: key,
    uploadedBy: actor,
  })
  await writeAudit(context.env.DB, id, 'upload', actor, file.name || fileId)
  const files = await listFiles(context.env.DB, id)
  return jsonResponse(200, { ok: true, id: fileId, files })
}
