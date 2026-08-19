/** Shared Resend HTML — keep confirm/reminder aligned with /bookings/thank-you. */

export const SITE = 'https://www.wellnessneedles.ie'
export const PRIMARY = '#2d5016'
export const SECONDARY = '#4a7c2a'
export const GOLD = '#d4af37'
export const HEADING = '#1B3B2B'
export const TEXT = '#2a2a28'
export const TEXT_MUTED = '#6a6a69'
export const TEXT_DETAIL = '#757573'
export const TEXT_LABEL = '#959594'
export const ROW_BORDER = '#d4e4cc'
export const BADGE_BG = '#f2f7f0'
export const BADGE_BORDER = '#c5dcb8'
export const SANS = "Arial,Helvetica,sans-serif"
export const SERIF = "Georgia,'Times New Roman',serif"

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function iconUrl(name: string): string {
  return `${SITE}/email/${name}.png`
}

export function iconImg(name: string, size: number): string {
  return `<img src="${iconUrl(name)}" alt="" width="${size}" height="${size}" style="display:block;width:${size}px;height:${size}px;border:0;margin:0 auto;" />`
}

/** Stop mail apps painting auto-detected email/phone/address in default blue. */
export function brandedLink(href: string, label: string, color: string, extra = ''): string {
  const html = escapeHtml(label).replace(/\n/g, '<br />')
  return `<a href="${href}" style="color:${color} !important;text-decoration:none !important;${extra}">${html}</a>`
}

export function displayCounty(county: string): string {
  return county.replace(/^Co\.(?=\S)/, 'Co. ')
}

export type KnownLocation = {
  label: string
  street: string
  city: string
  county: string
  postcode: string
  full?: string
  directionsUrl?: string
}

export const BAKED_LOCATIONS: KnownLocation[] = [
  {
    label: 'Celbridge',
    street: '56 The Orchard, Oldtown Mill',
    city: 'Celbridge',
    county: 'Co.Kildare',
    postcode: 'W23 K603',
  },
  {
    label: 'Carlow',
    street: '16 Kennedy St',
    city: 'Graigue',
    county: 'Carlow',
    postcode: 'R93 H2X8',
  },
]

export function asLocationRow(value: unknown): KnownLocation | null {
  if (!value || typeof value !== 'object') return null
  const row = value as Record<string, unknown>
  if (row.enabled === false) return null
  const label = typeof row.label === 'string' ? row.label.trim() : ''
  if (!label) return null
  return {
    label,
    street: typeof row.street === 'string' ? row.street : '',
    city: typeof row.city === 'string' ? row.city : '',
    county: typeof row.county === 'string' ? row.county : '',
    postcode: typeof row.postcode === 'string' ? row.postcode : '',
    full: typeof row.full === 'string' ? row.full : undefined,
    directionsUrl: typeof row.directionsUrl === 'string' ? row.directionsUrl : undefined,
  }
}

/** Keep in sync with src/lib/format-location-display.ts */
export function parseLocationDisplay(
  locationLabel: string,
  known: KnownLocation[] = BAKED_LOCATIONS
): { town: string; address: string; mapsQuery: string; directionsUrl?: string } | null {
  const trimmed = locationLabel.trim()
  if (!trimmed) return null
  const loc = known.find(
    (item) =>
      trimmed === item.label ||
      trimmed.startsWith(`${item.label} —`) ||
      Boolean(item.full && trimmed === item.full)
  )
  if (loc) {
    const line2 = [`${loc.city}, ${displayCounty(loc.county)}`.replace(/^, |, $/g, ''), loc.postcode]
      .filter(Boolean)
      .join(' ')
    const address = [loc.street, line2].filter(Boolean).join('\n')
    return {
      town: loc.label,
      address,
      mapsQuery: loc.full || [loc.street, loc.city, loc.postcode].filter(Boolean).join(' '),
      directionsUrl: loc.directionsUrl,
    }
  }
  const dash = trimmed.indexOf(' — ')
  if (dash !== -1) {
    const address = trimmed.slice(dash + 3)
    return { town: trimmed.slice(0, dash), address, mapsQuery: address }
  }
  return { town: '', address: trimmed, mapsQuery: trimmed }
}

export function visitTypeDisplay(
  serviceType: string,
  locationLabel?: string,
  known: KnownLocation[] = BAKED_LOCATIONS
): { value: string; address?: string } {
  const parsed = locationLabel ? parseLocationDisplay(locationLabel, known) : null
  if (!parsed) return { value: serviceType }
  if (parsed.town) {
    return { value: `${serviceType} — ${parsed.town}`, address: parsed.address }
  }
  return { value: serviceType, address: parsed.address }
}

export function mapsHref(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

export function directionsHref(query: string, knownUrl?: string): string {
  if (knownUrl && knownUrl.startsWith('http')) return knownUrl
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`
}

export function googleCalendarTemplateUrl(options: {
  title: string
  startsAtIso: string
  durationMinutes: number
  details: string
  location: string
}): string | null {
  const start = new Date(options.startsAtIso)
  if (Number.isNaN(start.getTime())) return null
  const end = new Date(start.getTime() + options.durationMinutes * 60_000)
  const compact = (date: Date) =>
    date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: options.title,
    dates: `${compact(start)}/${compact(end)}`,
    details: options.details,
    location: options.location,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

function goldBar(): string {
  return `
    <table role="presentation" width="32" cellspacing="0" cellpadding="0" style="width:32px;border-collapse:collapse;">
      <tr>
        <td height="2" style="height:2px;line-height:2px;font-size:0;background-color:${GOLD};border-radius:999px;">&nbsp;</td>
      </tr>
    </table>`
}

export function leafDivider(): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0">
      <tr>
        <td valign="middle" width="32" style="width:32px;padding:0 8px 0 0;">${goldBar()}</td>
        <td valign="middle" style="padding:0;">${iconImg('leaf', 14)}</td>
        <td valign="middle" width="32" style="width:32px;padding:0 0 0 8px;">${goldBar()}</td>
      </tr>
    </table>`
}

export function row(
  icon: string,
  label: string,
  value: string,
  detail?: { text: string; href?: string }
): string {
  let detailHtml = ''
  if (detail?.text) {
    const inner = detail.href
      ? brandedLink(detail.href, detail.text, TEXT_DETAIL)
      : escapeHtml(detail.text).replace(/\n/g, '<br />')
    detailHtml = `<div style="margin-top:4px;font-family:${SANS};font-size:13px;line-height:1.35;color:${TEXT_DETAIL};">${inner}</div>`
  }
  const valueHtml = escapeHtml(value).replace(/\n/g, '<br />')
  return `
    <tr>
      <td style="padding:10px 12px;border:1px solid ${ROW_BORDER};border-radius:12px;background:#ffffff;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td valign="top" width="32" style="width:32px;padding-top:2px;padding-right:12px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="32" height="32" align="center" valign="middle" bgcolor="${BADGE_BG}" style="width:32px;height:32px;border:1px solid ${BADGE_BORDER};border-radius:999px;background-color:${BADGE_BG};">
                    ${iconImg(icon, 16)}
                  </td>
                </tr>
              </table>
            </td>
            <td valign="top" style="text-align:left;">
              <div style="font-family:${SANS};font-size:11px;text-transform:uppercase;letter-spacing:0.04em;color:${TEXT_LABEL};font-weight:500;">${escapeHtml(label)}</div>
              <div style="margin-top:2px;font-family:${SANS};font-size:15px;font-weight:600;color:${TEXT};line-height:1.35;">${valueHtml}</div>
              ${detailHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height:8px;font-size:0;line-height:0;">&nbsp;</td></tr>`
}

export type PillIcon = 'phone' | 'mail' | 'calendar' | 'map-pin'

/** Full-width pill — table cell is the button so Gmail cannot shrink to the label. */
export function fullWidthPill(
  href: string,
  label: string,
  variant: 'gold' | 'outline',
  icon: PillIcon
): string {
  const gold = variant === 'gold'
  const tdStyle = gold
    ? `width:100%;background-color:${GOLD};border-radius:999px;padding:10px 16px;`
    : `width:100%;background-color:#ffffff;border:2px solid ${PRIMARY};border-radius:999px;padding:8px 16px;`
  const labelStyle = [
    `font-family:${SANS}`,
    'font-size:14px',
    gold ? 'font-weight:700' : 'font-weight:500',
    `color:${PRIMARY}`,
    'text-decoration:none',
    'line-height:1.25',
  ].join(';')
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:separate;">
      <tr>
        <td width="100%" align="center" bgcolor="${gold ? GOLD : '#ffffff'}" style="${tdStyle}">
          <a href="${escapeHtml(href)}" style="display:block;width:100%;text-decoration:none;color:${PRIMARY};">
            <table role="presentation" cellspacing="0" cellpadding="0" align="center">
              <tr>
                <td valign="middle" style="padding-right:6px;">${iconImg(icon, 16)}</td>
                <td valign="middle" style="${labelStyle}">${escapeHtml(label)}</td>
              </tr>
            </table>
          </a>
        </td>
      </tr>
    </table>`
}

export function twoColPills(
  left: { href: string; label: string; variant: 'gold' | 'outline'; icon: PillIcon },
  right: { href: string; label: string; variant: 'gold' | 'outline'; icon: PillIcon }
): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:separate;">
      <tr>
        <td width="50%" valign="top" style="width:50%;padding-right:4px;">${fullWidthPill(left.href, left.label, left.variant, left.icon)}</td>
        <td width="50%" valign="top" style="width:50%;padding-left:4px;">${fullWidthPill(right.href, right.label, right.variant, right.icon)}</td>
      </tr>
    </table>`
}

export function orDivider(): string {
  const hairline = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;">
      <tr>
        <td height="1" style="height:1px;line-height:1px;font-size:1px;mso-line-height-rule:exactly;border-top:1px solid ${ROW_BORDER};">&nbsp;</td>
      </tr>
    </table>`
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;margin:10px 0;">
      <tr>
        <td width="42%" valign="middle" style="padding:0;font-size:0;line-height:0;">${hairline}</td>
        <td width="16%" align="center" valign="middle" style="font-family:${SANS};font-size:10px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;color:${SECONDARY};white-space:nowrap;padding:0 8px;">Or</td>
        <td width="42%" valign="middle" style="padding:0;font-size:0;line-height:0;">${hairline}</td>
      </tr>
    </table>`
}

export function emailShell(options: {
  title: string
  introHtml: string
  cardTitle?: string
  cardSubtitle?: string
  cardIcon?: string
  rowsHtml: string
  actionsHtml?: string
  footerNote?: string
}): string {
  const logoUrl = `${SITE}/logo_wellness_transparent.png`
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="format-detection" content="telephone=no,address=no,email=no" />
  <meta name="x-apple-data-detectors" content="false" />
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${SANS};color:${TEXT};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:448px;width:100%;">
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="${SITE}/" style="text-decoration:none;">
                <img src="${logoUrl}" alt="Wellness Needles" width="56" height="56" style="display:block;width:56px;height:56px;border:0;margin:0 auto;" />
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:8px;">
              <h1 style="margin:0;font-family:${SERIF};font-size:24px;line-height:1.25;font-weight:700;color:${TEXT};text-align:center;">${escapeHtml(options.title)}</h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:10px;font-family:${SANS};font-size:16px;line-height:1.5;color:${TEXT_MUTED};">
              ${options.introHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom:16px;">
              ${leafDivider()}
            </td>
          </tr>
          <tr>
            <td style="padding:14px 16px 16px;border:1px solid #b7d0a8;border-radius:12px;background:#f4f8f2;box-shadow:0 8px 24px rgba(27,59,43,0.10);">
              ${
                options.cardTitle
                  ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom:12px;">
                <tr>
                  <td valign="top" style="padding-right:8px;padding-top:2px;">${iconImg(options.cardIcon || 'heart-handshake', 20)}</td>
                  <td valign="top">
                    <div style="font-family:${SANS};font-size:16px;font-weight:600;color:${TEXT};line-height:1.3;">${escapeHtml(options.cardTitle)}</div>
                    ${
                      options.cardSubtitle
                        ? `<div style="font-family:${SANS};font-size:13px;line-height:1.35;color:${TEXT_MUTED};margin-top:2px;">${escapeHtml(options.cardSubtitle)}</div>`
                        : ''
                    }
                  </td>
                </tr>
              </table>`
                  : ''
              }
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${options.rowsHtml}
              </table>
              ${options.actionsHtml || ''}
            </td>
          </tr>
          ${
            options.footerNote
              ? `<tr>
            <td align="center" style="padding-top:16px;font-family:${SANS};font-size:13px;line-height:1.5;color:${TEXT_MUTED};">
              ${escapeHtml(options.footerNote)}
            </td>
          </tr>`
              : ''
          }
          <tr>
            <td align="center" style="padding-top:22px;font-family:${SANS};font-size:12px;line-height:1.5;color:${TEXT_LABEL};">
              Wellness Needles
              <br />
              <a href="${SITE}/" style="color:${SECONDARY};text-decoration:none;">wellnessneedles.ie</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function firstNameOnly(fullOrFirst: string): string {
  const trimmed = fullOrFirst.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] || ''
}
