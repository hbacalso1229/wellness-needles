import type { SiteSnapshot } from './site-snapshot'

export type SiteChangeAction = 'update' | 'add' | 'delete'

export type SiteFieldChange = {
  action: SiteChangeAction
  fieldPath: string
  fieldLabel: string
  fromValue: string
  toValue: string
}

const SKIP_ROOT = new Set(['reviews', 'hoursDisplay'])
const MAX_VALUE_LEN = 240

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function truncate(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length <= MAX_VALUE_LEN) return trimmed
  return `${trimmed.slice(0, MAX_VALUE_LEN - 1)}…`
}

function stringifyLeaf(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'boolean') return value ? 'On' : 'Off'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return truncate(value)
  return truncate(JSON.stringify(value))
}

function flattenValue(
  prefix: string,
  value: unknown,
  out: Record<string, string>
): void {
  if (Array.isArray(value)) {
    const keyed = value.every(
      (item) => isRecord(item) && typeof item.id === 'string' && item.id
    )
    if (keyed) {
      for (const item of value) {
        const record = item as Record<string, unknown>
        const next = prefix ? `${prefix}.${record.id}` : String(record.id)
        flattenValue(next, record, out)
      }
      return
    }
    value.forEach((item, index) => {
      const next = prefix ? `${prefix}.${index}` : String(index)
      flattenValue(next, item, out)
    })
    return
  }

  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) {
      if (!prefix && SKIP_ROOT.has(key)) continue
      if (prefix && key === 'id') continue
      const next = prefix ? `${prefix}.${key}` : key
      flattenValue(next, child, out)
    }
    return
  }

  if (prefix) out[prefix] = stringifyLeaf(value)
}

export function flattenSiteSnapshot(
  snapshot: SiteSnapshot
): Record<string, string> {
  const out: Record<string, string> = {}
  flattenValue('', snapshot, out)
  return out
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

const FIELD_LABELS: Record<string, string> = {
  websiteOverlayEnabled: 'Overlay on website',
  clinicName: 'Clinic name',
  tagline: 'Tagline',
  description: 'Description',
  'phone.number': 'Phone number',
  'phone.formatted': 'Phone formatted',
  'phone.displayText': 'Phone display',
  'phone.href': 'Phone link',
  'phone.countryId': 'Phone country',
  'email.address': 'Email',
  'email.href': 'Email link',
  'social.facebookUrl': 'Facebook URL',
  'social.instagramUrl': 'Instagram URL',
  emergencyNote: 'Emergency note',
  'features.contactFormEnabled': 'Contact form',
  'features.liveChatEnabled': 'Live chat',
  'features.mapIntegrationEnabled': 'Map integration',
  'features.treatmentPackagesEnabled': 'Treatment packages',
  'features.calendlyEnabled': 'Calendly',
  'features.bookingFormEnabled': 'Booking form',
  'features.freshaEnabled': 'Fresha',
  'features.smsEnabled': 'Patient SMS',
  'features.bookingMaintenanceEnabled': 'Booking maintenance',
  'features.chatgptLogoEnabled': 'ChatGPT clinic logo',
  'calendly.schedulingUrl': 'Calendly scheduling URL',
  'calendly.initialConsultationUrl': 'Calendly initial URL',
  'calendly.followUpUrl': 'Calendly follow-up URL',
  'fresha.bookingUrl': 'Fresha booking URL',
  'pricing.inClinic.initial': 'In-clinic initial',
  'pricing.inClinic.followUp': 'In-clinic follow-up',
  'pricing.inClinic.package5': 'In-clinic 5 sessions',
  'pricing.inClinic.package10': 'In-clinic 10 sessions',
  'pricing.inClinic.cupping': 'In-clinic cupping',
  'pricing.inClinic.moxibustion': 'In-clinic moxibustion',
  'pricing.inClinicOriginal.initial': 'In-clinic initial original',
  'pricing.inClinicOriginal.followUp': 'In-clinic follow-up original',
  'pricing.inClinicOriginal.package5': 'In-clinic 5 sessions original',
  'pricing.inClinicOriginal.package10': 'In-clinic 10 sessions original',
  'pricing.inClinicOriginal.cupping': 'In-clinic cupping original',
  'pricing.inClinicOriginal.moxibustion': 'In-clinic moxibustion original',
  'pricing.homeVisit.initial': 'Home visit initial',
  'pricing.homeVisit.followUp': 'Home visit follow-up',
  'pricing.homeVisit.package5': 'Home visit 5 sessions',
  'pricing.homeVisit.package10': 'Home visit 10 sessions',
  'pricing.homeVisit.cupping': 'Home visit cupping',
  'pricing.homeVisit.moxibustion': 'Home visit moxibustion',
  'pricing.homeVisitOriginal.initial': 'Home visit initial original',
  'pricing.homeVisitOriginal.followUp': 'Home visit follow-up original',
  'pricing.homeVisitOriginal.package5': 'Home visit 5 sessions original',
  'pricing.homeVisitOriginal.package10': 'Home visit 10 sessions original',
  'pricing.homeVisitOriginal.cupping': 'Home visit cupping original',
  'pricing.homeVisitOriginal.moxibustion': 'Home visit moxibustion original',
  'insuranceParagraphs.0': 'Insurance paragraph 1',
  'insuranceParagraphs.1': 'Insurance paragraph 2',
  'insuranceParagraphs.2': 'Insurance paragraph 3',
}

export function labelForFieldPath(fieldPath: string): string {
  if (FIELD_LABELS[fieldPath]) return FIELD_LABELS[fieldPath]

  const hours = /^hours\.(\w+)\.(closed|open|close)$/.exec(fieldPath)
  if (hours) {
    const day = capitalize(hours[1])
    const part =
      hours[2] === 'closed' ? 'closed' : hours[2] === 'open' ? 'opens' : 'closes'
    return `${day} ${part}`
  }

  const insurer = /^insurers\.([^.]+)\.(.+)$/.exec(fieldPath)
  if (insurer) return `Insurer ${insurer[1]} ${insurer[2]}`

  const location = /^locations\.([^.]+)\.(.+)$/.exec(fieldPath)
  if (location) return `Location ${location[1]} ${location[2]}`

  const serviceCopy = /^pricing\.serviceCopy\.(\w+)\.(.+)$/.exec(fieldPath)
  if (serviceCopy) return `Service ${serviceCopy[1]} ${serviceCopy[2]}`

  return fieldPath.split('.').join(' · ')
}

export function diffSiteSnapshots(
  before: SiteSnapshot,
  after: SiteSnapshot
): SiteFieldChange[] {
  const fromMap = flattenSiteSnapshot(before)
  const toMap = flattenSiteSnapshot(after)
  const keys = new Set([...Object.keys(fromMap), ...Object.keys(toMap)])
  const changes: SiteFieldChange[] = []

  for (const fieldPath of keys) {
    const fromValue = fromMap[fieldPath] ?? ''
    const toValue = toMap[fieldPath] ?? ''
    if (fromValue === toValue) continue
    const action: SiteChangeAction = !fromValue
      ? 'add'
      : !toValue
        ? 'delete'
        : 'update'
    changes.push({
      action,
      fieldPath,
      fieldLabel: labelForFieldPath(fieldPath),
      fromValue,
      toValue,
    })
  }

  changes.sort((a, b) => a.fieldPath.localeCompare(b.fieldPath))
  return changes
}
