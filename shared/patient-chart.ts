export const CONSENT_FORM_VERSION = '2026-09-v1'

export const DEFAULT_RETENTION_MONTHS = 96
export const MIN_RETENTION_MONTHS = 12
export const MAX_RETENTION_MONTHS = 240

export const PATIENT_FILE_MAX_BYTES = 10 * 1024 * 1024

export const PATIENT_FILE_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const

export type PatientFileMime = (typeof PATIENT_FILE_MIME)[number]

export type YesNo = 'yes' | 'no' | ''

export const CONTRAINDICATIONS = [
  { id: 'pacemaker', label: 'A pacemaker?' },
  { id: 'diabetes', label: 'Diabetes?' },
  { id: 'frailSkin', label: 'Sensitive or frail skin?' },
  { id: 'epilepsy', label: 'Epilepsy?' },
  { id: 'bloodPressure', label: 'High or low blood pressure?' },
  { id: 'infectiousDisease', label: 'An infectious disease (e.g. HIV)?' },
  { id: 'seriousIllness', label: 'Any serious illnesses?' },
  { id: 'pregnant', label: '(Females) Are you pregnant?' },
  { id: 'bloodThinners', label: 'Do you take blood-thinning medication?' },
  { id: 'waitingOperation', label: 'Are you waiting for an operation?' },
  { id: 'organTransplant', label: 'Have you ever had an organ transplant?' },
  { id: 'haemorrhagicStroke', label: 'Have you had a recent haemorrhagic stroke?' },
  { id: 'haemophilia', label: 'Do you have haemophilia?' },
] as const

export type ContraindicationId = (typeof CONTRAINDICATIONS)[number]['id']

export type PatientStatus = 'active' | 'archived'

export type PatientIdentity = {
  firstName: string
  lastName: string
  dateOfBirth: string
  address: string
  phoneMobile: string
  phoneWork: string
  phoneHome: string
  email: string
  occupation: string
  age: string
  maritalStatus: string
  dependants: string
  gpPermission: YesNo
  gpName: string
  gpAddress: string
  gpTelephone: string
}

export type PatientIntake = {
  chiefComplaint: string
  medicalHistory: string
  constitution: string
  medications: string
  energyLevel: string
  temperature: string
  appetite: string
  breakfast: string
  breakfastTime: string
  lunch: string
  lunchTime: string
  dinner: string
  dinnerTime: string
  fluids: string
  bowels: string
  urination: string
  painBreathingPalpitations: string
  sleep: string
  menstrual: {
    cycleDays: string
    bleedingDays: string
    clots: YesNo
    clotSize: string
    colour: string
    spotting: string
    pain: string
    menarche: string
    pms: string
    menopause: string
    pregnancies: string
    libido: string
    contraceptives: string
  }
  lifestyle: string
  emotions: string
  dizzinessMemory: string
  complexion: string
  tongue: string
  diagnosis: string
  treatmentPrinciple: string
  acupuncturePoints: string
  treatmentPlan: string
  frequency: string
  treatmentsAgreed: string
  agreedStrategy: string
  adviceSheetDate: string
  herbalRemedies: string
  nutritionalAdvice: string
  naturopathicLifestyleAdvice: string
  advicePractitionerSignedName: string
}

export type PulseSide = {
  rate: string
  depth: string
  strength: string
  quality: string
}

export type VisitNoteBody = {
  reviewOfComplaints: string
  tongue: string
  pulse: { left: PulseSide; right: PulseSide }
  bloodPressure: string
  peakFlow: string
  otherComments: string
  diagnosis: string
  treatmentPrinciple: string
  acupuncturePoints: string
  naturopathicAdvice: string
  treatmentPlan: string
  frequency: string
  treatmentsAgreed: string
  agreedStrategy: string
  nextFollowUpDate: string
  nextFollowUpFocus: string
}

export type ConsentAnswers = {
  contraindications: Record<ContraindicationId, YesNo>
  patientSignedName: string
  practitionerSignedName: string
}

export const CLINICAL_FIELD_NAMES = [
  'chiefComplaint',
  'medicalHistory',
  'constitution',
  'medications',
  'tongue',
  'diagnosis',
  'treatmentPrinciple',
  'acupuncturePoints',
  'contraindications',
  'herbalRemedies',
  'nutritionalAdvice',
  'reviewOfComplaints',
  'naturopathicAdvice',
] as const

export function emptyIdentity(): PatientIdentity {
  return {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    address: '',
    phoneMobile: '',
    phoneWork: '',
    phoneHome: '',
    email: '',
    occupation: '',
    age: '',
    maritalStatus: '',
    dependants: '',
    gpPermission: '',
    gpName: '',
    gpAddress: '',
    gpTelephone: '',
  }
}

export function emptyIntake(): PatientIntake {
  return {
    chiefComplaint: '',
    medicalHistory: '',
    constitution: '',
    medications: '',
    energyLevel: '',
    temperature: '',
    appetite: '',
    breakfast: '',
    breakfastTime: '',
    lunch: '',
    lunchTime: '',
    dinner: '',
    dinnerTime: '',
    fluids: '',
    bowels: '',
    urination: '',
    painBreathingPalpitations: '',
    sleep: '',
    menstrual: {
      cycleDays: '',
      bleedingDays: '',
      clots: '',
      clotSize: '',
      colour: '',
      spotting: '',
      pain: '',
      menarche: '',
      pms: '',
      menopause: '',
      pregnancies: '',
      libido: '',
      contraceptives: '',
    },
    lifestyle: '',
    emotions: '',
    dizzinessMemory: '',
    complexion: '',
    tongue: '',
    diagnosis: '',
    treatmentPrinciple: '',
    acupuncturePoints: '',
    treatmentPlan: '',
    frequency: '',
    treatmentsAgreed: '',
    agreedStrategy: '',
    adviceSheetDate: '',
    herbalRemedies: '',
    nutritionalAdvice: '',
    naturopathicLifestyleAdvice: '',
    advicePractitionerSignedName: '',
  }
}

export function emptyPulseSide(): PulseSide {
  return { rate: '', depth: '', strength: '', quality: '' }
}

export function emptyVisitNote(): VisitNoteBody {
  return {
    reviewOfComplaints: '',
    tongue: '',
    pulse: { left: emptyPulseSide(), right: emptyPulseSide() },
    bloodPressure: '',
    peakFlow: '',
    otherComments: '',
    diagnosis: '',
    treatmentPrinciple: '',
    acupuncturePoints: '',
    naturopathicAdvice: '',
    treatmentPlan: '',
    frequency: '',
    treatmentsAgreed: '',
    agreedStrategy: '',
    nextFollowUpDate: '',
    nextFollowUpFocus: '',
  }
}

export function emptyConsentAnswers(): ConsentAnswers {
  const contraindications = {} as Record<ContraindicationId, YesNo>
  for (const item of CONTRAINDICATIONS) contraindications[item.id] = ''
  return {
    contraindications,
    patientSignedName: '',
    practitionerSignedName: '',
  }
}

export function normalizePatientEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailsMatch(a: string, b: string): boolean {
  const left = normalizePatientEmail(a)
  const right = normalizePatientEmail(b)
  return Boolean(left && right && left === right)
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asYesNo(value: unknown): YesNo {
  return value === 'yes' || value === 'no' ? value : ''
}

export function parseIntake(value: unknown): PatientIntake {
  const rec = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const menstrualRec =
    rec.menstrual && typeof rec.menstrual === 'object'
      ? (rec.menstrual as Record<string, unknown>)
      : {}
  const base = emptyIntake()
  return {
    chiefComplaint: asText(rec.chiefComplaint),
    medicalHistory: asText(rec.medicalHistory),
    constitution: asText(rec.constitution),
    medications: asText(rec.medications),
    energyLevel: asText(rec.energyLevel),
    temperature: asText(rec.temperature),
    appetite: asText(rec.appetite),
    breakfast: asText(rec.breakfast),
    breakfastTime: asText(rec.breakfastTime),
    lunch: asText(rec.lunch),
    lunchTime: asText(rec.lunchTime),
    dinner: asText(rec.dinner),
    dinnerTime: asText(rec.dinnerTime),
    fluids: asText(rec.fluids),
    bowels: asText(rec.bowels),
    urination: asText(rec.urination),
    painBreathingPalpitations: asText(rec.painBreathingPalpitations),
    sleep: asText(rec.sleep),
    menstrual: {
      cycleDays: asText(menstrualRec.cycleDays),
      bleedingDays: asText(menstrualRec.bleedingDays),
      clots: asYesNo(menstrualRec.clots),
      clotSize: asText(menstrualRec.clotSize),
      colour: asText(menstrualRec.colour),
      spotting: asText(menstrualRec.spotting),
      pain: asText(menstrualRec.pain),
      menarche: asText(menstrualRec.menarche),
      pms: asText(menstrualRec.pms),
      menopause: asText(menstrualRec.menopause),
      pregnancies: asText(menstrualRec.pregnancies),
      libido: asText(menstrualRec.libido),
      contraceptives: asText(menstrualRec.contraceptives),
    },
    lifestyle: asText(rec.lifestyle),
    emotions: asText(rec.emotions),
    dizzinessMemory: asText(rec.dizzinessMemory),
    complexion: asText(rec.complexion) || base.complexion,
    tongue: asText(rec.tongue),
    diagnosis: asText(rec.diagnosis),
    treatmentPrinciple: asText(rec.treatmentPrinciple),
    acupuncturePoints: asText(rec.acupuncturePoints),
    treatmentPlan: asText(rec.treatmentPlan),
    frequency: asText(rec.frequency),
    treatmentsAgreed: asText(rec.treatmentsAgreed),
    agreedStrategy: asText(rec.agreedStrategy),
    adviceSheetDate: asText(rec.adviceSheetDate),
    herbalRemedies: asText(rec.herbalRemedies),
    nutritionalAdvice: asText(rec.nutritionalAdvice),
    naturopathicLifestyleAdvice: asText(rec.naturopathicLifestyleAdvice),
    advicePractitionerSignedName: asText(rec.advicePractitionerSignedName),
  }
}

function parsePulseSide(value: unknown): PulseSide {
  const rec = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return {
    rate: asText(rec.rate),
    depth: asText(rec.depth),
    strength: asText(rec.strength),
    quality: asText(rec.quality),
  }
}

export function parseVisitNote(value: unknown): VisitNoteBody {
  const rec = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const pulseRec =
    rec.pulse && typeof rec.pulse === 'object' ? (rec.pulse as Record<string, unknown>) : {}
  return {
    reviewOfComplaints: asText(rec.reviewOfComplaints),
    tongue: asText(rec.tongue),
    pulse: {
      left: parsePulseSide(pulseRec.left),
      right: parsePulseSide(pulseRec.right),
    },
    bloodPressure: asText(rec.bloodPressure),
    peakFlow: asText(rec.peakFlow),
    otherComments: asText(rec.otherComments),
    diagnosis: asText(rec.diagnosis),
    treatmentPrinciple: asText(rec.treatmentPrinciple),
    acupuncturePoints: asText(rec.acupuncturePoints),
    naturopathicAdvice: asText(rec.naturopathicAdvice),
    treatmentPlan: asText(rec.treatmentPlan),
    frequency: asText(rec.frequency),
    treatmentsAgreed: asText(rec.treatmentsAgreed),
    agreedStrategy: asText(rec.agreedStrategy),
    nextFollowUpDate: asText(rec.nextFollowUpDate),
    nextFollowUpFocus: asText(rec.nextFollowUpFocus),
  }
}

export function parseConsentAnswers(value: unknown): ConsentAnswers {
  const rec = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const contraRec =
    rec.contraindications && typeof rec.contraindications === 'object'
      ? (rec.contraindications as Record<string, unknown>)
      : {}
  const contraindications = {} as Record<ContraindicationId, YesNo>
  for (const item of CONTRAINDICATIONS) {
    contraindications[item.id] = asYesNo(contraRec[item.id])
  }
  return {
    contraindications,
    patientSignedName: asText(rec.patientSignedName),
    practitionerSignedName: asText(rec.practitionerSignedName),
  }
}

export function isAllowedPatientFileMime(mime: string): mime is PatientFileMime {
  return (PATIENT_FILE_MIME as readonly string[]).includes(mime)
}

export function sanitizePatientFolderName(firstName: string, lastName: string): string {
  const joined = `${firstName} ${lastName}`.trim().replace(/\s+/g, '-')
  const slug = joined
    .replace(/[^A-Za-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'patient'
}

export function patientFileFolderName(
  firstName: string,
  lastName: string,
  patientId: string,
  nameClash: boolean
): string {
  const slug = sanitizePatientFolderName(firstName, lastName)
  if (!nameClash) return slug
  return `${slug}-${patientId.slice(0, 8)}`
}

export function patientFileR2Key(folder: string, objectName: string): string {
  return `patients/${folder}/${objectName}`
}

export type PatientFileKind = 'initial' | 'follow-up'

export function parsePatientFileKind(value: unknown): PatientFileKind | '' {
  return value === 'initial' || value === 'follow-up' ? value : ''
}

const UUID_OBJECT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function r2ObjectName(r2Key: string): string {
  const parts = r2Key.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

export function isUuidFileObjectName(name: string): boolean {
  return UUID_OBJECT.test(name)
}

export function isLegacyPatientFileKey(r2Key: string, patientId: string): boolean {
  return Boolean(patientId) && r2Key.startsWith(`patients/${patientId}/`)
}

export function needsNamedFileObject(r2Key: string, patientId: string): boolean {
  return isLegacyPatientFileKey(r2Key, patientId) || isUuidFileObjectName(r2ObjectName(r2Key))
}

export function patientFileExtension(originalName: string, mime: string): string {
  const fromName = originalName.split('.').pop()?.toLowerCase() || ''
  if (fromName && fromName !== originalName.toLowerCase()) {
    if (fromName === 'jpeg' || fromName === 'jpg') return 'jpg'
    if (fromName === 'png' || fromName === 'webp' || fromName === 'pdf') return fromName
    if (fromName === 'heic' || fromName === 'heif') return 'heic'
  }
  if (mime === 'application/pdf') return 'pdf'
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/heic' || mime === 'image/heif') return 'heic'
  return 'pdf'
}

export function nextFollowUpNumber(existingKeys: string[]): number {
  let max = 0
  for (const key of existingKeys) {
    const match = r2ObjectName(key).match(/^follow-up-(\d+)\.[a-z0-9]+$/i)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return max + 1
}

export function patientFileObjectName(
  kind: PatientFileKind,
  existingKeys: string[],
  originalName: string,
  mime: string
): string {
  const ext = patientFileExtension(originalName, mime)
  if (kind === 'initial') return `initial.${ext}`
  return `follow-up-${nextFollowUpNumber(existingKeys)}.${ext}`
}

export function namedObjectForLegacyFile(
  originalName: string,
  mime: string,
  existingKeys: string[]
): string {
  const ext = patientFileExtension(originalName, mime)
  const initialTaken = existingKeys.some((key) => /^initial\./i.test(r2ObjectName(key)))
  if (/initial/i.test(originalName) && !initialTaken) return `initial.${ext}`
  return `follow-up-${nextFollowUpNumber(existingKeys)}.${ext}`
}

export function clampRetentionMonths(value: unknown): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isFinite(n)) return DEFAULT_RETENTION_MONTHS
  return Math.min(MAX_RETENTION_MONTHS, Math.max(MIN_RETENTION_MONTHS, Math.round(n)))
}

export function retentionEndsAt(lastSeenAt: string | null | undefined, months: number): Date | null {
  if (!lastSeenAt) return null
  const start = new Date(lastSeenAt)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + clampRetentionMonths(months))
  return end
}

export function isWithinRetention(
  lastSeenAt: string | null | undefined,
  months: number,
  now = new Date()
): boolean {
  const end = retentionEndsAt(lastSeenAt, months)
  if (!end) return true
  return now.getTime() < end.getTime()
}

export function payloadLooksClinical(payload: unknown): boolean {
  const text = JSON.stringify(payload)
  return CLINICAL_FIELD_NAMES.some((name) => text.includes(name))
}
