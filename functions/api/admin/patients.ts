import { asString, jsonResponse, readJsonBody, type PagesEnv } from '../../_lib/http'
import {
  actorEmail,
  attachBookingPatient,
  findOrCreatePatient,
  findPatientIdByEmail,
  getPatient,
  listPatients,
} from '../../_lib/patients'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
  data?: { email?: string }
}) => Response | Promise<Response>

export const onRequestGet: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(200, { patients: [] })
  const query = new URL(context.request.url).searchParams.get('q') || ''
  try {
    const patients = await listPatients(context.env.DB, query)
    return jsonResponse(200, { patients })
  } catch (error) {
    console.error('[admin/patients get]', error)
    return jsonResponse(200, { patients: [] })
  }
}

export const onRequestPost: PagesFunction<PagesEnv> = async (context) => {
  if (!context.env.DB) return jsonResponse(503, { ok: false, error: 'no-db' })
  const body = (await readJsonBody(context.request)) as {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    phoneMobile?: string
    dateOfBirth?: string
    bookingId?: string
  } | null
  const firstName = asString(body?.firstName)
  const lastName = asString(body?.lastName)
  if (!firstName || !lastName) {
    return jsonResponse(400, { ok: false, error: 'name-required' })
  }
  const actor = actorEmail(context)
  const email = asString(body?.email)
  const phoneMobile = asString(body?.phoneMobile) || asString(body?.phone)
  const existingId = await findPatientIdByEmail(context.env.DB, email)
  const created = existingId
    ? { row: (await getPatient(context.env.DB, existingId))!, created: false }
    : await findOrCreatePatient(
        context.env.DB,
        { firstName, lastName, email, phoneMobile },
        actor
      )
  if (!created.row) return jsonResponse(500, { ok: false, error: 'create-failed' })
  if (!existingId && asString(body?.dateOfBirth)) {
    await context.env.DB.prepare('UPDATE patients SET date_of_birth = ? WHERE id = ?')
      .bind(asString(body?.dateOfBirth), created.row.id)
      .run()
  }
  const bookingId = asString(body?.bookingId)
  if (bookingId) {
    await attachBookingPatient(context.env.DB, bookingId, created.row.id)
  }
  const row = (await getPatient(context.env.DB, created.row.id)) || created.row
  return jsonResponse(200, {
    ok: true,
    id: row.id,
    existing: Boolean(existingId),
    patient: {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phoneMobile: row.phone_mobile,
    },
  })
}
