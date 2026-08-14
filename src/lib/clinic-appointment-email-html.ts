/**
 * Clinic appointment-request email body (label / value table).
 * Pre-rendered in code so Web3Forms Free does not need a Pro HTML template.
 */

export type ClinicAppointmentEmailFields = {
  name: string
  email: string
  phone: string
  visitType: string
  location: string
  service: string
  addOns: string
  preferredDate: string
  preferredTime: string
  practitioner: string
  dateOfBirth: string
  patientNote?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function row(label: string, value: string): string {
  return `<tr>
  <td style="padding:8px 12px 8px 0;border-bottom:1px solid #e8e8e8;color:#6b6b6b;font-size:13px;line-height:1.4;vertical-align:top;width:42%;">${escapeHtml(label)}</td>
  <td style="padding:8px 0;border-bottom:1px solid #e8e8e8;color:#222222;font-size:13px;line-height:1.4;font-weight:600;vertical-align:top;">${escapeHtml(value)}</td>
</tr>`
}

export function practitionerDisplayName(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'arkinth-garcia') return 'Arkinth Garcia'
  return trimmed
}

export function formatClinicDate(isoDate: string, withWeekday: boolean): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IE', withWeekday
    ? { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    : { day: 'numeric', month: 'long', year: 'numeric' })
}

/** HTML table matching the clinic field list (Patient name, Email, Phone, …). */
export function buildClinicAppointmentRequestHtml(
  fields: ClinicAppointmentEmailFields
): string {
  const rows = [
    row('Patient name', fields.name),
    row('Email', fields.email),
    row('Phone', fields.phone),
    row('Visit type', fields.visitType),
    row('Location', fields.location),
    row('Service', fields.service),
    row('Add-ons', fields.addOns),
    row('Preferred date', fields.preferredDate),
    row('Preferred time', fields.preferredTime),
    row('Practitioner', fields.practitioner),
    row('Date of birth', fields.dateOfBirth),
  ]
  const note = fields.patientNote?.trim()
  if (note) rows.push(row('Patient note', note))

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;">
${rows.join('\n')}
</table>`
}
