import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CLINICAL_FIELD_NAMES,
  CONSENT_FORM_VERSION,
  clampRetentionMonths,
  emailsMatch,
  emptyIntake,
  isAllowedPatientFileMime,
  isWithinRetention,
  normalizePatientEmail,
  parseConsentAnswers,
  parseIntake,
  parseVisitNote,
  patientFileR2Key,
  payloadLooksClinical,
} from './patient-chart'

describe('patient email match', () => {
  it('normalizes case and whitespace', () => {
    assert.equal(normalizePatientEmail('  Aoife@Example.COM '), 'aoife@example.com')
    assert.equal(emailsMatch('Aoife@example.com', 'aoife@EXAMPLE.com'), true)
    assert.equal(emailsMatch('', 'aoife@example.com'), false)
    assert.equal(emailsMatch('a@b.com', 'c@d.com'), false)
  })
})

describe('intake and consent parsing', () => {
  it('fills empty intake and keeps unknown keys out', () => {
    const parsed = parseIntake({ chiefComplaint: 'Low back pain', extra: 1 })
    assert.equal(parsed.chiefComplaint, 'Low back pain')
    assert.equal(parsed.medicalHistory, '')
    assert.equal(parsed.herbalRemedies, '')
    assert.equal(parsed.tongue, '')
    assert.equal(emptyIntake().chiefComplaint, '')
    assert.equal(emptyIntake().nutritionalAdvice, '')
  })

  it('parses first-visit close and advice sheet on intake', () => {
    const parsed = parseIntake({
      tongue: 'Red tip',
      diagnosis: 'Liver Qi stagnation',
      herbalRemedies: 'Chamomile tea',
      nutritionalAdvice: 'Warm cooked foods',
      naturopathicLifestyleAdvice: 'Rest after treatment',
      adviceSheetDate: '2026-09-16',
      advicePractitionerSignedName: 'Arkinth Garcia',
    })
    assert.equal(parsed.tongue, 'Red tip')
    assert.equal(parsed.diagnosis, 'Liver Qi stagnation')
    assert.equal(parsed.herbalRemedies, 'Chamomile tea')
    assert.equal(parsed.nutritionalAdvice, 'Warm cooked foods')
    assert.equal(parsed.naturopathicLifestyleAdvice, 'Rest after treatment')
    assert.equal(parsed.adviceSheetDate, '2026-09-16')
    assert.equal(parsed.advicePractitionerSignedName, 'Arkinth Garcia')
  })

  it('stores consent version and contraindication answers', () => {
    const answers = parseConsentAnswers({
      contraindications: { pacemaker: 'yes', diabetes: 'no' },
      patientSignedName: 'Aoife Murphy',
    })
    assert.equal(answers.contraindications.pacemaker, 'yes')
    assert.equal(answers.contraindications.diabetes, 'no')
    assert.equal(answers.contraindications.epilepsy, '')
    assert.equal(CONSENT_FORM_VERSION.length > 0, true)
  })

  it('parses visit follow-up date', () => {
    const visit = parseVisitNote({ diagnosis: 'Qi stagnation', nextFollowUpDate: '2026-09-22' })
    assert.equal(visit.diagnosis, 'Qi stagnation')
    assert.equal(visit.nextFollowUpDate, '2026-09-22')
    assert.equal(visit.reviewOfComplaints, '')
    assert.equal(visit.naturopathicAdvice, '')
  })

  it('keeps older visit keys when a follow-up note is re-parsed', () => {
    const visit = parseVisitNote({
      tongue: 'Pale',
      treatmentPlan: 'Weekly for 4 weeks',
      frequency: 'weekly',
      treatmentsAgreed: '4',
      agreedStrategy: 'Reduce pain',
      reviewOfComplaints: 'Sleep improved',
      naturopathicAdvice: 'Warm foods',
    })
    assert.equal(visit.tongue, 'Pale')
    assert.equal(visit.treatmentPlan, 'Weekly for 4 weeks')
    assert.equal(visit.frequency, 'weekly')
    assert.equal(visit.treatmentsAgreed, '4')
    assert.equal(visit.agreedStrategy, 'Reduce pain')
    assert.equal(visit.reviewOfComplaints, 'Sleep improved')
    assert.equal(visit.naturopathicAdvice, 'Warm foods')
  })
})

describe('files and retention', () => {
  it('allows clinic file types and builds a private key', () => {
    assert.equal(isAllowedPatientFileMime('image/jpeg'), true)
    assert.equal(isAllowedPatientFileMime('application/pdf'), true)
    assert.equal(isAllowedPatientFileMime('text/html'), false)
    assert.equal(patientFileR2Key('p1', 'f1'), 'patients/p1/f1')
  })

  it('blocks erase while inside retention unless last seen is old', () => {
    assert.equal(clampRetentionMonths(96), 96)
    assert.equal(clampRetentionMonths(3), 12)
    const now = new Date('2026-09-16T00:00:00.000Z')
    assert.equal(isWithinRetention('2026-08-01T00:00:00.000Z', 96, now), true)
    assert.equal(isWithinRetention('2015-01-01T00:00:00.000Z', 96, now), false)
  })
})

describe('clinical payload guard', () => {
  it('flags intake-shaped JSON and ignores appointment notify fields', () => {
    assert.equal(payloadLooksClinical({ chiefComplaint: 'pain' }), true)
    assert.equal(
      payloadLooksClinical({ firstName: 'Aoife', whenLabel: 'Tue 2:00 PM', locationLabel: 'Celbridge' }),
      false
    )
    assert.ok(CLINICAL_FIELD_NAMES.includes('diagnosis'))
  })
})
