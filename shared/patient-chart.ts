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
}

export type PulseSide = {
  rate: string
  depth: string
  strength: string
  quality: string
}

export type VisitNoteBody = {
  tongue: string
  pulse: { left: PulseSide; right: PulseSide }
  bloodPressure: string
  peakFlow: string
  otherComments: string
  diagnosis: string
  treatmentPrinciple: string
  acupuncturePoints: string
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
  }
}

export function emptyPulseSide(): PulseSide {
  return { rate: '', depth: '', strength: '', quality: '' }
}

export function emptyVisitNote(): VisitNoteBody {
  return {
    tongue: '',
    pulse: { left: emptyPulseSide(), right: emptyPulseSide() },
    bloodPressure: '',
    peakFlow: '',
    otherComments: '',
    diagnosis: '',
    treatmentPrinciple: '',
    acupuncturePoints: '',
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

export function patientFileR2Key(patientId: string, fileId: string): string {
  return `patients/${patientId}/${fileId}`
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
