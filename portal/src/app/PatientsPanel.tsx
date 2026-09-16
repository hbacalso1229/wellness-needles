'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  CONSENT_FORM_VERSION,
  emptyConsentAnswers,
  emptyIntake,
  emptyVisitNote,
  parseIntake,
  parseVisitNote,
  type ConsentAnswers,
  type PatientIntake,
  type VisitNoteBody,
} from '../../../shared/patient-chart'
import {
  followUpServiceLabel,
  publishedLocationOptions,
  publishedServiceTypes,
} from '../../../shared/booking-options'
import { isDublinDateTimeLocalPast, snapDateTimeLocalToQuarterHour } from '../../../shared/quarter-hour'
import type { SiteSnapshot } from '../../../shared/site-snapshot'
import { ConsentForm, IntakeForm, TextArea, TextField, VisitForm } from './patient-chart-forms'
import {
  Card,
  DublinStartPicker,
  PageHeader,
  PORTAL_PILL,
  PORTAL_PILL_OUTLINE,
} from './portal-ui'

type ChartTab = 'intake' | 'visits' | 'files' | 'consent'

type PatientListItem = {
  id: string
  status: string
  firstName: string
  lastName: string
  email: string
  phoneMobile: string
  dateOfBirth?: string
  lastSeenAt: string | null
  consentSignedAt: string | null
  nextFollowUpDate?: string
}

type PatientIdentity = {
  id: string
  status: string
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
  lastSeenAt: string | null
}

type VisitRow = {
  id: string
  bookingId: string | null
  visitAt: string
  document: VisitNoteBody
  nextFollowUpDate: string
}

type FileRow = {
  id: string
  originalName: string
  mime: string
  sizeBytes: number
  uploadedAt: string
}

type ConsentRow = {
  formVersion: string
  signedAt: string
  signedBy: string
  practitionerName: string
  answers: ConsentAnswers
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { Accept: 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  const json = (await res.json()) as T & { error?: string }
  if (!res.ok) throw new Error(json.error || res.statusText)
  return json
}

export function PatientsPanel({
  published,
  selectedId,
  initialTab,
  bookingToLink,
  onSelect,
  onToast,
  onBookedFollowUp,
}: {
  published: SiteSnapshot
  selectedId: string | null
  initialTab?: ChartTab
  bookingToLink?: string | null
  onSelect: (id: string | null) => void
  onToast: (message: string) => void
  onBookedFollowUp: () => void
}) {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<PatientListItem[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [chartTab, setChartTab] = useState<ChartTab>(initialTab || 'intake')
  const [identity, setIdentity] = useState<PatientIdentity | null>(null)
  const [intake, setIntake] = useState<PatientIntake>(emptyIntake())
  const [consent, setConsent] = useState<ConsentRow | null>(null)
  const [consentDraft, setConsentDraft] = useState<ConsentAnswers>(emptyConsentAnswers())
  const [visits, setVisits] = useState<VisitRow[]>([])
  const [files, setFiles] = useState<FileRow[]>([])
  const [editingVisit, setEditingVisit] = useState<VisitNoteBody>(emptyVisitNote())
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [visitAt, setVisitAt] = useState('')
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newFirst, setNewFirst] = useState('')
  const [newLast, setNewLast] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [bookingFollowUp, setBookingFollowUp] = useState(false)
  const [followUpStart, setFollowUpStart] = useState('')
  const [followUpType, setFollowUpType] = useState('')
  const [followUpLocation, setFollowUpLocation] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await api<{ patients: PatientListItem[] }>(
        `/api/admin/patients?q=${encodeURIComponent(query)}`
      )
      setPatients(data.patients || [])
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not load patients')
    } finally {
      setLoadingList(false)
    }
  }, [onToast, query])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const loadChart = useCallback(
    async (id: string) => {
      const data = await api<{
        patient: PatientIdentity
        intake: PatientIntake
        consent: ConsentRow | null
        visits: VisitRow[]
        files: FileRow[]
      }>(`/api/admin/patients/${id}`)
      setIdentity(data.patient)
      setIntake(parseIntake(data.intake))
      setConsent(data.consent)
      setConsentDraft(data.consent?.answers || emptyConsentAnswers())
      setVisits(data.visits || [])
      setFiles(data.files || [])
      setChartTab(initialTab || 'intake')
    },
    [initialTab]
  )

  useEffect(() => {
    if (!selectedId) {
      setIdentity(null)
      setEditingVisitId(null)
      setEditingVisit(emptyVisitNote())
      setVisitAt('')
      return
    }
    setEditingVisitId(null)
    setEditingVisit(emptyVisitNote())
    setVisitAt('')
    void loadChart(selectedId).catch((error) =>
      onToast(error instanceof Error ? error.message : 'Could not open chart')
    )
  }, [loadChart, onToast, selectedId])

  const followUpLabel = followUpServiceLabel(published)
  const typeOptions = publishedServiceTypes(published)
  const locationOptions = publishedLocationOptions(published)

  const openFollowUp = () => {
    const nextDate =
      editingVisit.nextFollowUpDate ||
      visits[0]?.nextFollowUpDate ||
      visits[0]?.document.nextFollowUpDate ||
      ''
    setFollowUpStart(nextDate ? `${nextDate}T10:00` : '')
    setFollowUpType(typeOptions[0] || 'In Clinic')
    setFollowUpLocation(locationOptions[0] || '')
    setBookingFollowUp(true)
  }

  const saveIdentityAndIntake = async () => {
    if (!selectedId || !identity) return
    setSaving(true)
    try {
      await api(`/api/admin/patients/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity,
          intake,
          bookingId: bookingToLink || undefined,
        }),
      })
      onToast('Chart saved')
      await loadList()
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const saveVisit = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const payload = {
        visitAt: visitAt
          ? visitAt.includes('T')
            ? visitAt
            : `${visitAt}T10:00:00.000Z`
          : new Date().toISOString(),
        bookingId: bookingToLink || undefined,
        document: editingVisit,
      }
      if (editingVisitId) {
        await api(`/api/admin/patients/${selectedId}/visits/${editingVisitId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await api(`/api/admin/patients/${selectedId}/visits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      onToast('Visit note saved')
      await loadChart(selectedId)
      setEditingVisitId(null)
      setEditingVisit(emptyVisitNote())
      setVisitAt('')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not save visit')
    } finally {
      setSaving(false)
    }
  }

  const saveConsent = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      await api(`/api/admin/patients/${selectedId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consentDraft),
      })
      onToast('Consent recorded')
      await loadChart(selectedId)
      await loadList()
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not save consent')
    } finally {
      setSaving(false)
    }
  }

  const createPatient = async () => {
    if (!newFirst.trim() || !newLast.trim()) {
      onToast('Name is required')
      return
    }
    setCreating(true)
    try {
      const created = await api<{ id: string; existing?: boolean }>('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newFirst,
          lastName: newLast,
          email: newEmail,
          phone: newPhone,
        }),
      })
      setNewFirst('')
      setNewLast('')
      setNewEmail('')
      setNewPhone('')
      onToast(created.existing ? 'Opened existing chart' : 'Chart created')
      onSelect(created.id)
      await loadList()
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not create chart')
    } finally {
      setCreating(false)
    }
  }

  const bookFollowUp = async () => {
    if (!selectedId) return
    const startsAt = snapDateTimeLocalToQuarterHour(followUpStart)
    if (isDublinDateTimeLocalPast(startsAt)) {
      onToast('Choose a start that is not in the past.')
      return
    }
    setSaving(true)
    try {
      await api(`/api/admin/patients/${selectedId}/follow-up`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startsAtLocal: startsAt,
          serviceType: followUpType,
          locationLabel: followUpLocation,
        }),
      })
      setBookingFollowUp(false)
      onToast('Follow-up booked')
      onBookedFollowUp()
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Could not book follow-up')
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (file: File) => {
    if (!selectedId) return
    const form = new FormData()
    form.append('file', file)
    setSaving(true)
    try {
      const data = await api<{ files: FileRow[] }>(`/api/admin/patients/${selectedId}/files`, {
        method: 'POST',
        body: form,
      })
      setFiles(data.files || [])
      onToast('File uploaded')
    } catch (error) {
      onToast(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setSaving(false)
    }
  }

  const previewFile = async (file: FileRow) => {
    if (!selectedId) return
    const res = await fetch(`/api/admin/patients/${selectedId}/files/${file.id}`, {
      credentials: 'include',
    })
    if (!res.ok) {
      onToast('Could not open file')
      return
    }
    const blob = await res.blob()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(blob))
  }

  const deleteFile = async (file: FileRow) => {
    if (!selectedId) return
    await api(`/api/admin/patients/${selectedId}/files/${file.id}`, { method: 'DELETE' })
    setFiles((prev) => prev.filter((row) => row.id !== file.id))
    onToast('File deleted')
  }

  const exportChart = async () => {
    if (!selectedId || !identity) return
    const data = await api<unknown>(`/api/admin/patients/${selectedId}/export`)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${identity.lastName}-${identity.firstName}-chart.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const archiveChart = async () => {
    if (!selectedId) return
    if (!window.confirm('Archive this chart? It will leave the active patient list.')) return
    await api(`/api/admin/patients/${selectedId}/archive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    onToast('Chart archived')
    onSelect(null)
    await loadList()
  }

  if (selectedId && !identity) {
    return (
      <section>
        <p className="text-sm text-secondary">Loading chart…</p>
      </section>
    )
  }

  if (selectedId && identity) {
    return (
      <section className="space-y-4 print:space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => onSelect(null)}
            >
              All patients
            </button>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-[var(--text-dark)]">
              {identity.firstName} {identity.lastName}
            </h1>
            <p className="text-sm text-[var(--text-dark)]/65">
              {identity.email || 'No email'} · {identity.phoneMobile || 'No mobile'}
              {consent ? '' : ' · Unsigned consent'}
            </p>
            {visits[0]?.nextFollowUpDate ? (
              <p className="mt-1 text-sm font-medium">Next follow-up {visits[0].nextFollowUpDate}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 print:hidden">
            <button type="button" className={PORTAL_PILL} onClick={openFollowUp}>
              Book follow-up
            </button>
            <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => void exportChart()}>
              Export
            </button>
            <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => window.print()}>
              Print
            </button>
            <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => void archiveChart()}>
              Archive
            </button>
          </div>
        </div>

        {bookingFollowUp ? (
          <Card title="Book follow-up">
            <p className="mb-3 text-sm text-[var(--text-dark)]/65">
              Service is {followUpLabel}. The patient gets the usual confirm email, not clinical notes.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <DublinStartPicker value={followUpStart} onChange={setFollowUpStart} />
              <label className="text-sm">
                Visit type
                <select
                  className="mt-1 block w-full rounded border px-2 py-1"
                  value={followUpType}
                  onChange={(e) => setFollowUpType(e.target.value)}
                >
                  {typeOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm sm:col-span-2">
                Location
                <select
                  className="mt-1 block w-full rounded border px-2 py-1"
                  value={followUpLocation}
                  onChange={(e) => setFollowUpLocation(e.target.value)}
                >
                  {locationOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className={PORTAL_PILL} disabled={saving} onClick={() => void bookFollowUp()}>
                Confirm follow-up
              </button>
              <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => setBookingFollowUp(false)}>
                Back
              </button>
            </div>
          </Card>
        ) : null}

        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-black/[0.08] print:hidden">
          {(
            [
              ['intake', 'Intake'],
              ['visits', 'Visits'],
              ['files', 'Files'],
              ['consent', 'Consent'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setChartTab(id)}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                chartTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[var(--text-dark)]/60 hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {chartTab === 'intake' ? (
          <div className="space-y-4">
            <Card title="Patient identity">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="First name"
                  value={identity.firstName}
                  onChange={(firstName) => setIdentity({ ...identity, firstName })}
                />
                <TextField
                  label="Last name"
                  value={identity.lastName}
                  onChange={(lastName) => setIdentity({ ...identity, lastName })}
                />
                <TextField
                  label="Date of birth"
                  type="date"
                  value={identity.dateOfBirth}
                  onChange={(dateOfBirth) => setIdentity({ ...identity, dateOfBirth })}
                />
                <TextField
                  label="Age"
                  value={identity.age}
                  onChange={(age) => setIdentity({ ...identity, age })}
                />
                <TextField
                  label="Email"
                  value={identity.email}
                  onChange={(email) => setIdentity({ ...identity, email })}
                />
                <TextField
                  label="Mobile"
                  value={identity.phoneMobile}
                  onChange={(phoneMobile) => setIdentity({ ...identity, phoneMobile })}
                />
                <TextField
                  label="Work phone"
                  value={identity.phoneWork}
                  onChange={(phoneWork) => setIdentity({ ...identity, phoneWork })}
                />
                <TextField
                  label="Home phone"
                  value={identity.phoneHome}
                  onChange={(phoneHome) => setIdentity({ ...identity, phoneHome })}
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="Address"
                    value={identity.address}
                    onChange={(address) => setIdentity({ ...identity, address })}
                  />
                </div>
                <TextField
                  label="Occupation"
                  value={identity.occupation}
                  onChange={(occupation) => setIdentity({ ...identity, occupation })}
                />
                <TextField
                  label="Marital status"
                  value={identity.maritalStatus}
                  onChange={(maritalStatus) => setIdentity({ ...identity, maritalStatus })}
                />
                <TextField
                  label="Dependants"
                  value={identity.dependants}
                  onChange={(dependants) => setIdentity({ ...identity, dependants })}
                />
                <TextField
                  label="Permission to contact GP"
                  value={identity.gpPermission}
                  onChange={(gpPermission) => setIdentity({ ...identity, gpPermission })}
                />
                <TextField
                  label="GP name"
                  value={identity.gpName}
                  onChange={(gpName) => setIdentity({ ...identity, gpName })}
                />
                <TextField
                  label="GP telephone"
                  value={identity.gpTelephone}
                  onChange={(gpTelephone) => setIdentity({ ...identity, gpTelephone })}
                />
                <div className="sm:col-span-2">
                  <TextArea
                    label="GP address"
                    value={identity.gpAddress}
                    onChange={(gpAddress) => setIdentity({ ...identity, gpAddress })}
                  />
                </div>
              </div>
            </Card>
            <IntakeForm
              intake={intake}
              onChange={setIntake}
              patientName={`${identity.firstName} ${identity.lastName}`.trim()}
              practitionerName={
                consent?.practitionerName || consentDraft.practitionerSignedName || 'Arkinth Garcia'
              }
            />
            <div className="print:hidden">
              <button
                type="button"
                className={PORTAL_PILL}
                disabled={saving}
                onClick={() => void saveIdentityAndIntake()}
              >
                {saving ? 'Saving…' : 'Save intake'}
              </button>
            </div>
          </div>
        ) : null}

        {chartTab === 'visits' ? (
          <div className="space-y-4">
            <Card title={editingVisitId ? 'Edit follow-up' : 'New follow-up'}>
              <VisitForm
                visit={editingVisit}
                onChange={setEditingVisit}
                patientName={`${identity.firstName} ${identity.lastName}`.trim()}
                dateOfBirth={identity.dateOfBirth}
                practitionerName={
                  consent?.practitionerName || consentDraft.practitionerSignedName || 'Arkinth Garcia'
                }
                visitDate={visitAt.slice(0, 10)}
                onVisitDateChange={setVisitAt}
              />
              <div className="mt-4 flex flex-wrap gap-2 print:hidden">
                <button type="button" className={PORTAL_PILL} disabled={saving} onClick={() => void saveVisit()}>
                  Save visit note
                </button>
                <button
                  type="button"
                  className={PORTAL_PILL}
                  onClick={openFollowUp}
                >
                  Book follow-up
                </button>
                {editingVisitId ? (
                  <button
                    type="button"
                    className={PORTAL_PILL_OUTLINE}
                    onClick={() => {
                      setEditingVisitId(null)
                      setEditingVisit(emptyVisitNote())
                      setVisitAt('')
                    }}
                  >
                    New note
                  </button>
                ) : null}
              </div>
            </Card>
            <ul className="space-y-2">
              {visits.map((visit) => (
                <li key={visit.id}>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-black/[0.08] bg-white px-4 py-3 text-left text-sm"
                    onClick={() => {
                      setEditingVisitId(visit.id)
                      setEditingVisit(parseVisitNote(visit.document))
                      setVisitAt(visit.visitAt)
                      setChartTab('visits')
                    }}
                  >
                    <span className="font-medium">{visit.visitAt.slice(0, 10)}</span>
                    {visit.document.diagnosis ? (
                      <span className="mt-0.5 block text-[var(--text-dark)]/65">{visit.document.diagnosis}</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {chartTab === 'files' ? (
          <Card title="Private files">
            <p className="mb-3 text-sm text-[var(--text-dark)]/65">
              PDF, JPEG, PNG, WebP, or HEIC. Max 10MB. Downloads stay behind portal login.
            </p>
            <input
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
              className="mb-4 block text-sm print:hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void uploadFile(file)
                e.target.value = ''
              }}
            />
            {previewUrl ? (
              <img src={previewUrl} alt="Patient file preview" className="mb-4 max-h-80 rounded border" />
            ) : null}
            <ul className="space-y-2">
              {files.map((file) => (
                <li
                  key={file.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-black/[0.06] px-3 py-2 text-sm"
                >
                  <span>
                    {file.originalName}{' '}
                    <span className="text-[var(--text-dark)]/45">
                      ({Math.ceil(file.sizeBytes / 1024)} KB)
                    </span>
                  </span>
                  <span className="flex gap-2 print:hidden">
                    <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => void previewFile(file)}>
                      Open
                    </button>
                    <a
                      className={PORTAL_PILL_OUTLINE}
                      href={`/api/admin/patients/${selectedId}/files/${file.id}?download=1`}
                    >
                      Download
                    </a>
                    <button type="button" className={PORTAL_PILL_OUTLINE} onClick={() => void deleteFile(file)}>
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {chartTab === 'consent' ? (
          <Card title={`Consent (${CONSENT_FORM_VERSION})`}>
            {consent ? (
              <p className="mb-3 text-sm text-[var(--text-dark)]/65">
                Last signed {consent.signedAt.slice(0, 10)} by {consent.signedBy}. Saving records a new
                version.
              </p>
            ) : (
              <p className="mb-3 text-sm text-amber-800">No signed consent yet.</p>
            )}
            <ConsentForm answers={consentDraft} onChange={setConsentDraft} />
            <button
              type="button"
              className={`${PORTAL_PILL} mt-4 print:hidden`}
              disabled={saving}
              onClick={() => void saveConsent()}
            >
              Record consent
            </button>
          </Card>
        ) : null}
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <PageHeader description="Staff-only charts. Intake, visit notes, and files stay in the portal. Do not email clinical notes." />
      <Card title="New chart">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            First name
            <input
              className="mt-1 block w-full rounded-md border border-black/10 px-3 py-2 text-sm"
              value={newFirst}
              onChange={(e) => setNewFirst(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Last name
            <input
              className="mt-1 block w-full rounded-md border border-black/10 px-3 py-2 text-sm"
              value={newLast}
              onChange={(e) => setNewLast(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Email
            <input
              className="mt-1 block w-full rounded-md border border-black/10 px-3 py-2 text-sm"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </label>
          <label className="text-sm">
            Mobile
            <input
              className="mt-1 block w-full rounded-md border border-black/10 px-3 py-2 text-sm"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className={`${PORTAL_PILL} mt-4`}
          disabled={creating}
          onClick={() => void createPatient()}
        >
          Create chart
        </button>
      </Card>
      <label className="block w-full sm:w-64">
        <span className="sr-only">Search patients</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone, email…"
          className="w-full rounded-md border border-black/10 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>
      {loadingList ? (
        <p className="text-sm text-secondary">Loading…</p>
      ) : patients.length === 0 ? (
        <p className="rounded-xl border border-dashed border-accent/40 bg-white p-6 text-sm">
          No patient charts yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {patients.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                className="w-full rounded-xl border border-accent/20 bg-white p-4 text-left"
                onClick={() => onSelect(row.id)}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-semibold">
                    {row.firstName} {row.lastName}
                  </span>
                  {row.consentSignedAt ? null : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                      Unsigned consent
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-[var(--text-dark)]/65">
                  {row.email || 'No email'} · {row.phoneMobile || 'No mobile'}
                </span>
                {row.nextFollowUpDate ? (
                  <span className="mt-1 block text-sm">Next follow-up {row.nextFollowUpDate}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
