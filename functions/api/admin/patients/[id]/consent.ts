import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../../_lib/http'
import { actorEmail, getPatient, latestConsent, writeAudit } from '../../../../_lib/patients'
import {
  CONSENT_FORM_VERSION,
  parseConsentAnswers,
} from '../../../../../shared/patient-chart'

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
  const body = (await readJsonBody(context.request)) as Record<string, unknown> | null
  const answers = parseConsentAnswers(body)
  const signedBy = asString(answers.patientSignedName) || `${row.first_name} ${row.last_name}`.trim()
  if (!signedBy) return jsonResponse(400, { ok: false, error: 'signature-required' })
  const actor = actorEmail(context)
  const now = new Date().toISOString()
  const consentId = crypto.randomUUID()
  await context.env.DB.prepare(
    `INSERT INTO patient_consents (
       id, patient_id, form_version, signed_at, signed_by, practitioner_name,
       practitioner_email, answers_json, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      consentId,
      id,
      CONSENT_FORM_VERSION,
      now,
      signedBy,
      asString(answers.practitionerSignedName) || actor,
      actor,
      JSON.stringify(answers),
      now
    )
    .run()
  await writeAudit(context.env.DB, id, 'consent', actor, CONSENT_FORM_VERSION)
  const consent = await latestConsent(context.env.DB, id)
  return jsonResponse(200, { ok: true, consent })
}
