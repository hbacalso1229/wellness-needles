'use client'

interface CalendlyEmbedProps {
  url: string
  className?: string
}

export default function CalendlyEmbed({ url, className = '' }: CalendlyEmbedProps) {
  // Prefer iframe embed so tab/URL changes always remount cleanly.
  // widget.js initInlineWidget can leave a blank box after remounts / script race.
  const embedUrl = new URL(url)
  if (!embedUrl.searchParams.has('embed_type')) {
    embedUrl.searchParams.set('embed_type', 'Inline')
  }
  const embedSrc = embedUrl.toString()

  return (
    <div className={className}>
      <iframe
        key={embedSrc}
        src={embedSrc}
        title="Schedule a booking"
        className="w-full overflow-hidden rounded-lg border border-accent/20 bg-cream"
        style={{ minWidth: '320px', height: '700px' }}
        loading="lazy"
      />
      <p className="mt-3 text-center text-sm text-secondary">
        If the calendar does not appear,{' '}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:text-primary transition-colors"
        >
          open scheduling in a new tab
        </a>
        .
      </p>
    </div>
  )
}

export type CalendlyBookingSelection = {
  bookingSource: 'in-clinic' | 'home-visit'
  locationId?: string
  locationLabel?: string
  serviceId?: string
  serviceLabel?: string
  addOnIds?: string[]
  addOnLabels?: string[]
}

/** Human-readable summary shown under Calendly invitee Questions (a1). */
export function formatBookingDetailsForCalendly(options: CalendlyBookingSelection): string {
  const visitType = options.bookingSource === 'home-visit' ? 'Home Visit' : 'In Clinic'
  const service = options.serviceLabel?.trim() || 'Not selected'
  const addOns =
    options.addOnLabels && options.addOnLabels.length > 0
      ? options.addOnLabels.join(', ')
      : 'None'

  // Location is sent via Calendly's native `location=` field, not duplicated here
  return [
    `Visit type: ${visitType}`,
    `Service / package: ${service}`,
    `Add-ons: ${addOns}`,
  ].join('\n')
}

/**
 * Builds a Calendly URL that puts booking details into invitee answer `a1`
 * (shown under Questions on the meeting). Your Calendly event needs at least
 * one invitee question — the default "Please share anything..." works.
 *
 * Also sets `location=` for Calendly's native Location field. That only works
 * if the event type Location is set to **Ask invitee** (or another type that
 * accepts an invitee-provided place). With Location left empty in Calendly,
 * the meeting will still show "No location added".
 */
export function buildCalendlyUrl(base: string, options: CalendlyBookingSelection): string {
  const url = new URL(base)
  const details = formatBookingDetailsForCalendly(options)
  const visitType = options.bookingSource === 'home-visit' ? 'Home Visit' : 'In Clinic'
  const addOnsText =
    options.addOnLabels && options.addOnLabels.length > 0
      ? options.addOnLabels.join(', ')
      : 'None'

  // Primary: full details in a1 so they appear under Questions with the default single question
  url.searchParams.set('a1', details)

  // Native Calendly Location field (requires event Location = Ask invitee)
  if (options.locationLabel) {
    url.searchParams.set('location', options.locationLabel)
    url.searchParams.set('a2', options.locationLabel)
  }

  // Optional extras if you later add more invitee questions (Service / package, Add-ons)
  if (options.serviceLabel) {
    url.searchParams.set('a3', options.serviceLabel)
  }
  url.searchParams.set('a4', addOnsText)

  // Secondary tracking
  url.searchParams.set('utm_source', 'wellness-needles')
  url.searchParams.set('utm_medium', 'website')
  url.searchParams.set('utm_campaign', 'bookings')
  url.searchParams.set('utm_content', visitType)
  url.searchParams.set(
    'utm_term',
    [
      options.locationLabel,
      options.serviceLabel,
      addOnsText !== 'None' ? `Add-ons: ${addOnsText}` : undefined,
    ]
      .filter(Boolean)
      .join(' | ')
  )

  return url.toString()
}
