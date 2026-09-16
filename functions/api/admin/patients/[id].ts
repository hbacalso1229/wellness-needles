import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../../_lib/http'
import {
  actorEmail,
  attachBookingPatient,
  getPatient,
  latestConsent,
  listAudit,
  listFiles,
  listVisits,
  publicPatient,
  readIntake,
  relocateUuidFolderFiles,
  saveIntake,
  updatePatientIdentity,
  writeAudit,
} from '../../../_lib/patients'
import { parseIntake } from '../../../../shared/patient-chart'

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
  const actor = actorEmail(context)
  await writeAudit(context.env.DB, id, 'view', actor)
  try {
    await relocateUuidFolderFiles(context.env, row)
  } catch {
    /* keep opening the chart even if a copy/delete fails */
  }
  const [intake, consent, visits, files, audit] = await Promise.all([
    readIntake(context.env.DB, id),
    latestConsent(context.env.DB, id),
    listVisits(context.env.DB, id),
    listFiles(context.env.DB, id),
    listAudit(context.env.DB, id),
  ])
  return jsonResponse(200, {
    patient: publicPatient(row),
    intake,
    consent,
    visits,
    files,
    audit,
  })
}

export const onRequestPatch: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const id = context.params.id
  const row = await getPatient(context.env.DB, id)
  if (!row) return jsonResponse(404, { ok: false, error: 'not-found' })
  const body = (await readJsonBody(context.request)) as Record<string, unknown> | null
  const actor = actorEmail(context)
  const identity = body?.identity && typeof body.identity === 'object'
    ? (body.identity as Record<string, unknown>)
    : body || {}
  const updated = await updatePatientIdentity(
    context.env.DB,
    id,
    {
      firstName: asString(identity.firstName) || undefined,
      lastName: asString(identity.lastName) || undefined,
      dateOfBirth: identity.dateOfBirth !== undefined ? asString(identity.dateOfBirth) : undefined,
      email: identity.email !== undefined ? asString(identity.email) : undefined,
      phoneMobile: identity.phoneMobile !== undefined ? asString(identity.phoneMobile) : undefined,
      phoneWork: identity.phoneWork !== undefined ? asString(identity.phoneWork) : undefined,
      phoneHome: identity.phoneHome !== undefined ? asString(identity.phoneHome) : undefined,
      address: identity.address !== undefined ? asString(identity.address) : undefined,
      occupation: identity.occupation !== undefined ? asString(identity.occupation) : undefined,
      age: identity.age !== undefined ? asString(identity.age) : undefined,
      maritalStatus: identity.maritalStatus !== undefined ? asString(identity.maritalStatus) : undefined,
      dependants: identity.dependants !== undefined ? asString(identity.dependants) : undefined,
      gpPermission: identity.gpPermission !== undefined ? asString(identity.gpPermission) : undefined,
      gpName: identity.gpName !== undefined ? asString(identity.gpName) : undefined,
      gpAddress: identity.gpAddress !== undefined ? asString(identity.gpAddress) : undefined,
      gpTelephone: identity.gpTelephone !== undefined ? asString(identity.gpTelephone) : undefined,
    },
    actor
  )
  if (body?.intake) {
    await saveIntake(context.env.DB, id, parseIntake(body.intake), actor)
    await writeAudit(context.env.DB, id, 'update-intake', actor)
  } else {
    await writeAudit(context.env.DB, id, 'update', actor)
  }
  const bookingId = asString(body?.bookingId)
  if (bookingId) await attachBookingPatient(context.env.DB, bookingId, id)
  const next = updated || (await getPatient(context.env.DB, id))
  return jsonResponse(200, {
    ok: true,
    patient: next ? publicPatient(next) : null,
    intake: await readIntake(context.env.DB, id),
  })
}
