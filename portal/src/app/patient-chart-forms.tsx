'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import {
  CONSENT_FORM_VERSION,
  CONTRAINDICATIONS,
  type ConsentAnswers,
  type PatientIntake,
  type VisitNoteBody,
  type YesNo,
} from '../../../shared/patient-chart'
import { FullWidthDateField } from './portal-ui'

const fieldClass =
  'mt-1 block w-full rounded-md border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30'
const areaClass = `${fieldClass} min-h-[5.5rem]`

export function ChartSection({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string
  hint?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>
          <span className="block text-sm font-semibold text-[var(--text-dark)]">{title}</span>
          {hint ? <span className="mt-0.5 block text-xs text-[var(--text-dark)]/55">{hint}</span> : null}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[var(--text-dark)]/45 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {open ? <div className="space-y-3 border-t border-black/[0.06] px-4 py-4">{children}</div> : null}
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (next: string) => void
  type?: string
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        type={type}
        className={fieldClass}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function TextArea({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (next: string) => void
}) {
  return (
    <label className="block text-sm">
      {label}
      <textarea className={areaClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  )
}

export function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string
  value: YesNo
  onChange: (next: YesNo) => void
}) {
  return (
    <fieldset className="text-sm">
      <legend className="mb-1">{label}</legend>
      <div className="flex gap-3">
        {(['yes', 'no'] as const).map((option) => (
          <label key={option} className="flex items-center gap-1.5 capitalize">
            <input
              type="radio"
              checked={value === option}
              onChange={() => onChange(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function IntakeForm({
  intake,
  onChange,
}: {
  intake: PatientIntake
  onChange: (next: PatientIntake) => void
}) {
  const set = <K extends keyof PatientIntake>(key: K, value: PatientIntake[K]) =>
    onChange({ ...intake, [key]: value })
  const setMenstrual = (key: keyof PatientIntake['menstrual'], value: string) =>
    onChange({ ...intake, menstrual: { ...intake.menstrual, [key]: value } })
  return (
    <div className="space-y-3 print:space-y-4">
      <ChartSection title="Chief complaint" hint="Onset, progression, treatment so far, location, better/worse" defaultOpen>
        <TextArea
          label="Chief complaint(s)"
          value={intake.chiefComplaint}
          onChange={(chiefComplaint) => set('chiefComplaint', chiefComplaint)}
        />
      </ChartSection>
      <ChartSection title="Medical history" hint="BP, cardiovascular, diabetes, epilepsy, surgery, family history, allergies">
        <TextArea label="Medical history" value={intake.medicalHistory} onChange={(v) => set('medicalHistory', v)} />
        <TextArea label="General constitution" value={intake.constitution} onChange={(v) => set('constitution', v)} />
        <TextArea
          label="Current medication and supplements"
          value={intake.medications}
          onChange={(v) => set('medications', v)}
        />
      </ChartSection>
      <ChartSection title="Energy, temperature, appetite">
        <TextField
          label="Energy levels (0–10)"
          value={intake.energyLevel}
          onChange={(v) => set('energyLevel', v)}
        />
        <TextArea label="Temperature, chills, fever, sweating" value={intake.temperature} onChange={(v) => set('temperature', v)} />
        <TextArea label="Appetite" value={intake.appetite} onChange={(v) => set('appetite', v)} />
      </ChartSection>
      <ChartSection title="Diet and fluids">
        <div className="grid gap-3 sm:grid-cols-2">
          <TextArea label="Breakfast" value={intake.breakfast} onChange={(v) => set('breakfast', v)} />
          <TextField label="Breakfast time" value={intake.breakfastTime} onChange={(v) => set('breakfastTime', v)} />
          <TextArea label="Lunch" value={intake.lunch} onChange={(v) => set('lunch', v)} />
          <TextField label="Lunch time" value={intake.lunchTime} onChange={(v) => set('lunchTime', v)} />
          <TextArea label="Dinner" value={intake.dinner} onChange={(v) => set('dinner', v)} />
          <TextField label="Dinner time" value={intake.dinnerTime} onChange={(v) => set('dinnerTime', v)} />
        </div>
        <TextArea label="Fluid intake and thirst" value={intake.fluids} onChange={(v) => set('fluids', v)} />
      </ChartSection>
      <ChartSection title="Bowels, urination, pain">
        <TextArea label="Bowels and digestion" value={intake.bowels} onChange={(v) => set('bowels', v)} />
        <TextArea label="Urination" value={intake.urination} onChange={(v) => set('urination', v)} />
        <TextArea
          label="Pain, breathing and palpitations"
          value={intake.painBreathingPalpitations}
          onChange={(v) => set('painBreathingPalpitations', v)}
        />
      </ChartSection>
      <ChartSection title="Sleep, menstrual cycle, lifestyle">
        <TextArea label="Sleep" value={intake.sleep} onChange={(v) => set('sleep', v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Cycle length (days)" value={intake.menstrual.cycleDays} onChange={(v) => setMenstrual('cycleDays', v)} />
          <TextField
            label="Bleeding length (days)"
            value={intake.menstrual.bleedingDays}
            onChange={(v) => setMenstrual('bleedingDays', v)}
          />
        </div>
        <YesNoField
          label="Clots"
          value={intake.menstrual.clots}
          onChange={(v) => setMenstrual('clots', v)}
        />
        <TextField label="Clot size" value={intake.menstrual.clotSize} onChange={(v) => setMenstrual('clotSize', v)} />
        <TextField label="Colour of blood" value={intake.menstrual.colour} onChange={(v) => setMenstrual('colour', v)} />
        <TextField label="Spotting" value={intake.menstrual.spotting} onChange={(v) => setMenstrual('spotting', v)} />
        <TextArea label="Pain / PMS" value={intake.menstrual.pain} onChange={(v) => setMenstrual('pain', v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="Menarche" value={intake.menstrual.menarche} onChange={(v) => setMenstrual('menarche', v)} />
          <TextField label="Menopause" value={intake.menstrual.menopause} onChange={(v) => setMenstrual('menopause', v)} />
          <TextField label="PMS" value={intake.menstrual.pms} onChange={(v) => setMenstrual('pms', v)} />
          <TextField
            label="Pregnancies"
            value={intake.menstrual.pregnancies}
            onChange={(v) => setMenstrual('pregnancies', v)}
          />
          <TextField label="Libido" value={intake.menstrual.libido} onChange={(v) => setMenstrual('libido', v)} />
          <TextField
            label="Contraceptives"
            value={intake.menstrual.contraceptives}
            onChange={(v) => setMenstrual('contraceptives', v)}
          />
        </div>
        <TextArea label="Lifestyle (smoking, alcohol, exercise)" value={intake.lifestyle} onChange={(v) => set('lifestyle', v)} />
        <TextArea label="Emotions" value={intake.emotions} onChange={(v) => set('emotions', v)} />
        <TextArea
          label="Floaters, dizziness, memory and concentration"
          value={intake.dizzinessMemory}
          onChange={(v) => set('dizzinessMemory', v)}
        />
        <TextArea
          label="Face, complexion, eyes, nails"
          value={intake.complexion}
          onChange={(v) => set('complexion', v)}
        />
      </ChartSection>
    </div>
  )
}

export function ConsentForm({
  answers,
  onChange,
}: {
  answers: ConsentAnswers
  onChange: (next: ConsentAnswers) => void
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-black/[0.08] bg-[#faf9f6] px-4 py-3 text-sm leading-relaxed text-[var(--text-dark)]/80">
        <p>
          Acupuncture consultation and treatment by Arkinth Garcia may include needles, moxibustion,
          gua sha, cupping, and electro-acupuncture. The patient is responsible for contacting their
          GP about health concerns. Form version {CONSENT_FORM_VERSION}.
        </p>
        <p className="mt-2">
          Risks can include bruising, numbness, rare nerve damage, burn from heat treatments, and
          redness from gua sha or cupping. Sterilised disposable needles are used.
        </p>
      </div>
      <div className="space-y-3">
        {CONTRAINDICATIONS.map((item) => (
          <YesNoField
            key={item.id}
            label={item.label}
            value={answers.contraindications[item.id]}
            onChange={(next) =>
              onChange({
                ...answers,
                contraindications: { ...answers.contraindications, [item.id]: next },
              })
            }
          />
        ))}
      </div>
      <TextField
        label="Patient name (signature)"
        value={answers.patientSignedName}
        onChange={(patientSignedName) => onChange({ ...answers, patientSignedName })}
      />
      <TextField
        label="Practitioner name"
        value={answers.practitionerSignedName}
        onChange={(practitionerSignedName) => onChange({ ...answers, practitionerSignedName })}
      />
    </div>
  )
}

export function VisitForm({
  visit,
  onChange,
}: {
  visit: VisitNoteBody
  onChange: (next: VisitNoteBody) => void
}) {
  const setPulse = (side: 'left' | 'right', key: keyof VisitNoteBody['pulse']['left'], value: string) =>
    onChange({
      ...visit,
      pulse: { ...visit.pulse, [side]: { ...visit.pulse[side], [key]: value } },
    })
  return (
    <div className="space-y-3">
      <ChartSection title="Tongue, pulse, vital signs" defaultOpen>
        <TextArea label="Tongue" value={visit.tongue} onChange={(tongue) => onChange({ ...visit, tongue })} />
        <div className="grid gap-3 sm:grid-cols-2">
          {(['left', 'right'] as const).map((side) => (
            <div key={side} className="space-y-2 rounded-md border border-black/[0.06] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-dark)]/50">
                {side} pulse
              </p>
              <TextField label="Rate" value={visit.pulse[side].rate} onChange={(v) => setPulse(side, 'rate', v)} />
              <TextField label="Depth" value={visit.pulse[side].depth} onChange={(v) => setPulse(side, 'depth', v)} />
              <TextField
                label="Strength"
                value={visit.pulse[side].strength}
                onChange={(v) => setPulse(side, 'strength', v)}
              />
              <TextField
                label="Quality"
                value={visit.pulse[side].quality}
                onChange={(v) => setPulse(side, 'quality', v)}
              />
            </div>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Blood pressure"
            value={visit.bloodPressure}
            onChange={(bloodPressure) => onChange({ ...visit, bloodPressure })}
          />
          <TextField
            label="Peak flow"
            value={visit.peakFlow}
            onChange={(peakFlow) => onChange({ ...visit, peakFlow })}
          />
        </div>
        <TextArea
          label="Other comments"
          value={visit.otherComments}
          onChange={(otherComments) => onChange({ ...visit, otherComments })}
        />
      </ChartSection>
      <ChartSection title="Diagnosis and points" defaultOpen>
        <TextArea
          label="Diagnosis"
          value={visit.diagnosis}
          onChange={(diagnosis) => onChange({ ...visit, diagnosis })}
        />
        <TextArea
          label="Treatment principle"
          value={visit.treatmentPrinciple}
          onChange={(treatmentPrinciple) => onChange({ ...visit, treatmentPrinciple })}
        />
        <TextArea
          label="Acupuncture points and justification"
          value={visit.acupuncturePoints}
          onChange={(acupuncturePoints) => onChange({ ...visit, acupuncturePoints })}
        />
      </ChartSection>
      <ChartSection title="Treatment plan and follow-up" defaultOpen>
        <TextArea
          label="Treatment plan"
          value={visit.treatmentPlan}
          onChange={(treatmentPlan) => onChange({ ...visit, treatmentPlan })}
        />
        <TextField
          label="Frequency of treatment"
          value={visit.frequency}
          onChange={(frequency) => onChange({ ...visit, frequency })}
        />
        <TextField
          label="How many treatments agreed?"
          value={visit.treatmentsAgreed}
          onChange={(treatmentsAgreed) => onChange({ ...visit, treatmentsAgreed })}
        />
        <TextArea
          label="Agreed treatment strategy"
          value={visit.agreedStrategy}
          onChange={(agreedStrategy) => onChange({ ...visit, agreedStrategy })}
        />
        <FullWidthDateField
          label="Next follow-up date"
          value={visit.nextFollowUpDate}
          onChange={(nextFollowUpDate) => onChange({ ...visit, nextFollowUpDate })}
        />
        <TextArea
          label="Next follow-up focus"
          value={visit.nextFollowUpFocus}
          onChange={(nextFollowUpFocus) => onChange({ ...visit, nextFollowUpFocus })}
        />
      </ChartSection>
    </div>
  )
}
