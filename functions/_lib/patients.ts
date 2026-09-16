import { asString, type PagesEnv } from './http'
import {
  emptyIntake,
  emptyVisitNote,
  normalizePatientEmail,
  parseConsentAnswers,
  parseIntake,
  parseVisitNote,
  type ConsentAnswers,
  type PatientIntake,
  type PatientStatus,
  type VisitNoteBody,
  type YesNo,
  isLegacyPatientFileKey,
  patientFileFolderName,
  patientFileR2Key,
} from '../../shared/patient-chart'

export type StaffContext = { data?: { email?: string } }

export function actorEmail(context: StaffContext): string {
  return asString(context.data?.email)
}

export type PatientRow = {
  id: string
  status: PatientStatus
  first_name: string
  last_name: string
  date_of_birth: string
  email: string
  phone_mobile: string
  phone_work: string
  phone_home: string
  address: string
  occupation: string
  age: string
  marital_status: string
  dependants: string
  gp_permission: string
  gp_name: string
  gp_address: string
  gp_telephone: string
  last_seen_at: string | null
  created_at: string
  updated_at: string
  updated_by: string
}

export type PatientListItem = {
  id: string
  status: PatientStatus
  firstName: string
  lastName: string
  email: string
  phoneMobile: string
  dateOfBirth: string
  lastSeenAt: string | null
  consentSignedAt: string | null
  nextFollowUpDate: string
}

export type ConsentRecord = {
  id: string
  formVersion: string
  signedAt: string
  signedBy: string
  practitionerName: string
  practitionerEmail: string
  answers: ConsentAnswers
}

export type VisitRecord = {
  id: string
  bookingId: string | null
  visitAt: string
  document: VisitNoteBody
  nextFollowUpDate: string
  updatedAt: string
  updatedBy: string
}

export type FileRecord = {
  id: string
  originalName: string
  mime: string
  sizeBytes: number
  uploadedAt: string
  uploadedBy: string
}

function nowIso(): string {
  return new Date().toISOString()
}

export function publicPatient(row: PatientRow) {
  return {
    id: row.id,
    status: row.status,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    email: row.email,
    phoneMobile: row.phone_mobile,
    phoneWork: row.phone_work,
    phoneHome: row.phone_home,
    address: row.address,
    occupation: row.occupation,
    age: row.age,
    maritalStatus: row.marital_status,
    dependants: row.dependants,
    gpPermission: (row.gp_permission === 'yes' || row.gp_permission === 'no'
      ? row.gp_permission
      : '') as YesNo,
    gpName: row.gp_name,
    gpAddress: row.gp_address,
    gpTelephone: row.gp_telephone,
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }
}

export async function writeAudit(
  db: D1Database,
  patientId: string,
  action: string,
  actor: string,
  detail = ''
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO patient_audit_log (id, patient_id, action, actor_email, detail, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), patientId, action, actor, detail.slice(0, 200), nowIso())
    .run()
}

export async function getPatient(db: D1Database, id: string): Promise<PatientRow | null> {
  return db.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first<PatientRow>()
}

export async function otherPatientHasSameName(
  db: D1Database,
  patientId: string,
  firstName: string,
  lastName: string
): Promise<boolean> {
  const row = await db
    .prepare(
      `SELECT id FROM patients
       WHERE id != ?
         AND lower(first_name) = lower(?)
         AND lower(last_name) = lower(?)
       LIMIT 1`
    )
    .bind(patientId, firstName.trim(), lastName.trim())
    .first<{ id: string }>()
  return Boolean(row?.id)
}

export async function findPatientIdByEmail(
  db: D1Database,
  email: string
): Promise<string | null> {
  const normalized = normalizePatientEmail(email)
  if (!normalized) return null
  const row = await db
    .prepare(
      `SELECT id FROM patients WHERE email = ? AND status != 'archived' ORDER BY updated_at DESC LIMIT 1`
    )
    .bind(normalized)
    .first<{ id: string }>()
  return row?.id || null
}

export async function attachBookingPatient(
  db: D1Database,
  bookingId: string,
  patientId: string
): Promise<void> {
  await db
    .prepare('UPDATE bookings SET patient_id = ? WHERE id = ?')
    .bind(patientId, bookingId)
    .run()
}

export async function createPatient(
  db: D1Database,
  input: {
    firstName: string
    lastName: string
    email?: string
    phoneMobile?: string
    dateOfBirth?: string
    address?: string
  },
  actor: string
): Promise<PatientRow> {
  const id = crypto.randomUUID()
  const now = nowIso()
  const email = normalizePatientEmail(input.email || '')
  await db
    .prepare(
      `INSERT INTO patients (
         id, status, first_name, last_name, date_of_birth, email, phone_mobile,
         created_at, updated_at, updated_by, last_seen_at
       ) VALUES (?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.firstName.trim(),
      input.lastName.trim(),
      asString(input.dateOfBirth),
      email,
      asString(input.phoneMobile),
      now,
      now,
      actor,
      now
    )
    .run()
  await db
    .prepare(
      `INSERT INTO patient_intakes (patient_id, document_json, updated_at, updated_by)
       VALUES (?, ?, ?, ?)`
    )
    .bind(id, JSON.stringify(emptyIntake()), now, actor)
    .run()
  await writeAudit(db, id, 'create', actor)
  const row = await getPatient(db, id)
  if (!row) throw new Error('create-failed')
  return row
}

export async function findOrCreatePatient(
  db: D1Database,
  input: {
    firstName: string
    lastName: string
    email?: string
    phoneMobile?: string
  },
  actor: string
): Promise<{ row: PatientRow; created: boolean }> {
  const existingId = await findPatientIdByEmail(db, input.email || '')
  if (existingId) {
    const row = await getPatient(db, existingId)
    if (row) return { row, created: false }
  }
  const row = await createPatient(db, input, actor)
  return { row, created: true }
}

export async function listPatients(
  db: D1Database,
  query: string
): Promise<PatientListItem[]> {
  const needle = query.trim().toLowerCase()
  const { results } = await db
    .prepare(
      `SELECT
         p.id,
         p.status,
         p.first_name as firstName,
         p.last_name as lastName,
         p.email,
         p.phone_mobile as phoneMobile,
         p.date_of_birth as dateOfBirth,
         p.last_seen_at as lastSeenAt,
         (
           SELECT c.signed_at FROM patient_consents c
           WHERE c.patient_id = p.id
           ORDER BY c.signed_at DESC LIMIT 1
         ) as consentSignedAt,
         COALESCE((
           SELECT v.next_follow_up_date FROM visit_notes v
           WHERE v.patient_id = p.id AND v.next_follow_up_date != ''
           ORDER BY v.visit_at DESC LIMIT 1
         ), '') as nextFollowUpDate
       FROM patients p
       WHERE p.status = 'active'
       ORDER BY COALESCE(p.last_seen_at, p.updated_at) DESC
       LIMIT 200`
    )
    .all<PatientListItem>()
  const rows = results || []
  if (!needle) return rows
  return rows.filter((row) => {
    const hay = `${row.firstName} ${row.lastName} ${row.email} ${row.phoneMobile}`.toLowerCase()
    return hay.includes(needle)
  })
}

export async function readIntake(db: D1Database, patientId: string): Promise<PatientIntake> {
  const row = await db
    .prepare('SELECT document_json FROM patient_intakes WHERE patient_id = ?')
    .bind(patientId)
    .first<{ document_json: string }>()
  if (!row?.document_json) return emptyIntake()
  try {
    return parseIntake(JSON.parse(row.document_json))
  } catch {
    return emptyIntake()
  }
}

export async function saveIntake(
  db: D1Database,
  patientId: string,
  intake: PatientIntake,
  actor: string
): Promise<void> {
  const now = nowIso()
  await db
    .prepare(
      `INSERT INTO patient_intakes (patient_id, document_json, updated_at, updated_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(patient_id) DO UPDATE SET
         document_json = excluded.document_json,
         updated_at = excluded.updated_at,
         updated_by = excluded.updated_by`
    )
    .bind(patientId, JSON.stringify(parseIntake(intake)), now, actor)
    .run()
}

export async function updatePatientIdentity(
  db: D1Database,
  id: string,
  patch: Partial<{
    firstName: string
    lastName: string
    dateOfBirth: string
    email: string
    phoneMobile: string
    phoneWork: string
    phoneHome: string
    address: string
    occupation: string
    age: string
    maritalStatus: string
    dependants: string
    gpPermission: string
    gpName: string
    gpAddress: string
    gpTelephone: string
    status: PatientStatus
    lastSeenAt: string | null
  }>,
  actor: string
): Promise<PatientRow | null> {
  const current = await getPatient(db, id)
  if (!current) return null
  const next = {
    first_name: patch.firstName !== undefined ? patch.firstName.trim() : current.first_name,
    last_name: patch.lastName !== undefined ? patch.lastName.trim() : current.last_name,
    date_of_birth: patch.dateOfBirth !== undefined ? asString(patch.dateOfBirth) : current.date_of_birth,
    email:
      patch.email !== undefined ? normalizePatientEmail(patch.email) : current.email,
    phone_mobile: patch.phoneMobile !== undefined ? asString(patch.phoneMobile) : current.phone_mobile,
    phone_work: patch.phoneWork !== undefined ? asString(patch.phoneWork) : current.phone_work,
    phone_home: patch.phoneHome !== undefined ? asString(patch.phoneHome) : current.phone_home,
    address: patch.address !== undefined ? asString(patch.address) : current.address,
    occupation: patch.occupation !== undefined ? asString(patch.occupation) : current.occupation,
    age: patch.age !== undefined ? asString(patch.age) : current.age,
    marital_status: patch.maritalStatus !== undefined ? asString(patch.maritalStatus) : current.marital_status,
    dependants: patch.dependants !== undefined ? asString(patch.dependants) : current.dependants,
    gp_permission: patch.gpPermission !== undefined ? asString(patch.gpPermission) : current.gp_permission,
    gp_name: patch.gpName !== undefined ? asString(patch.gpName) : current.gp_name,
    gp_address: patch.gpAddress !== undefined ? asString(patch.gpAddress) : current.gp_address,
    gp_telephone: patch.gpTelephone !== undefined ? asString(patch.gpTelephone) : current.gp_telephone,
    status: patch.status || current.status,
    last_seen_at: patch.lastSeenAt !== undefined ? patch.lastSeenAt : current.last_seen_at,
  }
  const now = nowIso()
  await db
    .prepare(
      `UPDATE patients SET
         status = ?, first_name = ?, last_name = ?, date_of_birth = ?, email = ?,
         phone_mobile = ?, phone_work = ?, phone_home = ?, address = ?, occupation = ?,
         age = ?, marital_status = ?, dependants = ?, gp_permission = ?, gp_name = ?,
         gp_address = ?, gp_telephone = ?, last_seen_at = ?, updated_at = ?, updated_by = ?
       WHERE id = ?`
    )
    .bind(
      next.status,
      next.first_name,
      next.last_name,
      next.date_of_birth,
      next.email,
      next.phone_mobile,
      next.phone_work,
      next.phone_home,
      next.address,
      next.occupation,
      next.age,
      next.marital_status,
      next.dependants,
      next.gp_permission,
      next.gp_name,
      next.gp_address,
      next.gp_telephone,
      next.last_seen_at,
      now,
      actor,
      id
    )
    .run()
  return getPatient(db, id)
}

export async function latestConsent(
  db: D1Database,
  patientId: string
): Promise<ConsentRecord | null> {
  const row = await db
    .prepare(
      `SELECT id, form_version as formVersion, signed_at as signedAt, signed_by as signedBy,
              practitioner_name as practitionerName, practitioner_email as practitionerEmail,
              answers_json as answersJson
       FROM patient_consents WHERE patient_id = ? ORDER BY signed_at DESC LIMIT 1`
    )
    .bind(patientId)
    .first<{
      id: string
      formVersion: string
      signedAt: string
      signedBy: string
      practitionerName: string
      practitionerEmail: string
      answersJson: string
    }>()
  if (!row) return null
  let answers: ConsentAnswers
  try {
    answers = parseConsentAnswers(JSON.parse(row.answersJson))
  } catch {
    answers = parseConsentAnswers({})
  }
  return {
    id: row.id,
    formVersion: row.formVersion,
    signedAt: row.signedAt,
    signedBy: row.signedBy,
    practitionerName: row.practitionerName,
    practitionerEmail: row.practitionerEmail,
    answers,
  }
}

export async function listVisits(db: D1Database, patientId: string): Promise<VisitRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT id, booking_id as bookingId, visit_at as visitAt, document_json as documentJson,
              next_follow_up_date as nextFollowUpDate, updated_at as updatedAt, updated_by as updatedBy
       FROM visit_notes WHERE patient_id = ? ORDER BY visit_at DESC`
    )
    .bind(patientId)
    .all<{
      id: string
      bookingId: string | null
      visitAt: string
      documentJson: string
      nextFollowUpDate: string
      updatedAt: string
      updatedBy: string
    }>()
  return (results || []).map((row) => {
    let document: VisitNoteBody
    try {
      document = parseVisitNote(JSON.parse(row.documentJson))
    } catch {
      document = emptyVisitNote()
    }
    return {
      id: row.id,
      bookingId: row.bookingId,
      visitAt: row.visitAt,
      document,
      nextFollowUpDate: row.nextFollowUpDate || document.nextFollowUpDate,
      updatedAt: row.updatedAt,
      updatedBy: row.updatedBy,
    }
  })
}

export async function getVisit(
  db: D1Database,
  patientId: string,
  visitId: string
): Promise<VisitRecord | null> {
  const visits = await listVisits(db, patientId)
  return visits.find((row) => row.id === visitId) || null
}

export async function saveVisit(
  db: D1Database,
  patientId: string,
  input: {
    id?: string
    bookingId?: string | null
    visitAt: string
    document: VisitNoteBody
  },
  actor: string
): Promise<VisitRecord> {
  const document = parseVisitNote(input.document)
  const nextFollowUpDate = document.nextFollowUpDate
  const now = nowIso()
  const id = input.id || crypto.randomUUID()
  const existing = input.id ? await getVisit(db, patientId, id) : null
  if (existing) {
    await db
      .prepare(
        `UPDATE visit_notes SET booking_id = ?, visit_at = ?, document_json = ?,
           next_follow_up_date = ?, updated_at = ?, updated_by = ?
         WHERE id = ? AND patient_id = ?`
      )
      .bind(
        input.bookingId ?? existing.bookingId,
        input.visitAt,
        JSON.stringify(document),
        nextFollowUpDate,
        now,
        actor,
        id,
        patientId
      )
      .run()
    await writeAudit(db, patientId, 'update-visit', actor, id)
  } else {
    await db
      .prepare(
        `INSERT INTO visit_notes (
           id, patient_id, booking_id, visit_at, document_json, next_follow_up_date,
           created_at, updated_at, updated_by
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        patientId,
        input.bookingId || null,
        input.visitAt,
        JSON.stringify(document),
        nextFollowUpDate,
        now,
        now,
        actor
      )
      .run()
    await writeAudit(db, patientId, 'create-visit', actor, id)
  }
  await db
    .prepare('UPDATE patients SET last_seen_at = ?, updated_at = ?, updated_by = ? WHERE id = ?')
    .bind(input.visitAt, now, actor, patientId)
    .run()
  const saved = await getVisit(db, patientId, id)
  if (!saved) throw new Error('visit-save-failed')
  return saved
}

export async function listFiles(db: D1Database, patientId: string): Promise<FileRecord[]> {
  const { results } = await db
    .prepare(
      `SELECT id, original_name as originalName, mime, size_bytes as sizeBytes,
              uploaded_at as uploadedAt, uploaded_by as uploadedBy
       FROM patient_files WHERE patient_id = ? ORDER BY uploaded_at DESC`
    )
    .bind(patientId)
    .all<FileRecord>()
  return results || []
}

export async function getFileRow(
  db: D1Database,
  patientId: string,
  fileId: string
): Promise<(FileRecord & { r2Key: string }) | null> {
  const row = await db
    .prepare(
      `SELECT id, original_name as originalName, mime, size_bytes as sizeBytes,
              uploaded_at as uploadedAt, uploaded_by as uploadedBy, r2_key as r2Key
       FROM patient_files WHERE patient_id = ? AND id = ?`
    )
    .bind(patientId, fileId)
    .first<FileRecord & { r2Key: string }>()
  return row || null
}

export async function insertFileRow(
  db: D1Database,
  row: {
    id: string
    patientId: string
    originalName: string
    mime: string
    sizeBytes: number
    r2Key: string
    uploadedBy: string
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO patient_files (
         id, patient_id, original_name, mime, size_bytes, r2_key, uploaded_at, uploaded_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      row.id,
      row.patientId,
      row.originalName,
      row.mime,
      row.sizeBytes,
      row.r2Key,
      nowIso(),
      row.uploadedBy
    )
    .run()
}

export async function deleteFileRow(
  db: D1Database,
  patientId: string,
  fileId: string
): Promise<string | null> {
  const row = await getFileRow(db, patientId, fileId)
  if (!row) return null
  await db
    .prepare('DELETE FROM patient_files WHERE id = ? AND patient_id = ?')
    .bind(fileId, patientId)
    .run()
  return row.r2Key
}

export async function relocateUuidFolderFiles(
  env: PagesEnv,
  patient: PatientRow
): Promise<void> {
  const db = env.DB
  const bucket = env.PATIENT_FILES
  if (!db || !bucket) return
  const { results } = await db
    .prepare('SELECT id, r2_key as r2Key FROM patient_files WHERE patient_id = ?')
    .bind(patient.id)
    .all<{ id: string; r2Key: string }>()
  const legacy = (results || []).filter((row) => isLegacyPatientFileKey(row.r2Key, patient.id))
  if (!legacy.length) return
  const nameClash = await otherPatientHasSameName(db, patient.id, patient.first_name, patient.last_name)
  const folder = patientFileFolderName(patient.first_name, patient.last_name, patient.id, nameClash)
  const prefix = `patients/${patient.id}/`
  for (const row of legacy) {
    const fileId = row.r2Key.slice(prefix.length) || row.id
    const nextKey = patientFileR2Key(folder, fileId)
    if (nextKey === row.r2Key) continue
    const object = await bucket.get(row.r2Key)
    if (!object) continue
    await bucket.put(nextKey, object.body, {
      httpMetadata: object.httpMetadata,
    })
    await db
      .prepare('UPDATE patient_files SET r2_key = ? WHERE id = ? AND patient_id = ?')
      .bind(nextKey, row.id, patient.id)
      .run()
    await bucket.delete(row.r2Key)
  }
}

export async function listAudit(db: D1Database, patientId: string, limit = 50) {
  const { results } = await db
    .prepare(
      `SELECT id, action, actor_email as actorEmail, detail, created_at as createdAt
       FROM patient_audit_log WHERE patient_id = ? ORDER BY created_at DESC LIMIT ?`
    )
    .bind(patientId, limit)
    .all()
  return results || []
}

export async function erasePatient(
  env: PagesEnv,
  patientId: string
): Promise<void> {
  const db = env.DB
  if (!db) return
  const files = await db
    .prepare('SELECT r2_key as r2Key FROM patient_files WHERE patient_id = ?')
    .bind(patientId)
    .all<{ r2Key: string }>()
  if (env.PATIENT_FILES) {
    for (const file of files.results || []) {
      await env.PATIENT_FILES.delete(file.r2Key)
    }
  }
  await db.batch([
    db.prepare('DELETE FROM patient_files WHERE patient_id = ?').bind(patientId),
    db.prepare('DELETE FROM visit_notes WHERE patient_id = ?').bind(patientId),
    db.prepare('DELETE FROM patient_consents WHERE patient_id = ?').bind(patientId),
    db.prepare('DELETE FROM patient_intakes WHERE patient_id = ?').bind(patientId),
    db.prepare('DELETE FROM patient_audit_log WHERE patient_id = ?').bind(patientId),
    db.prepare('UPDATE bookings SET patient_id = NULL WHERE patient_id = ?').bind(patientId),
    db.prepare('DELETE FROM patients WHERE id = ?').bind(patientId),
  ])
}
