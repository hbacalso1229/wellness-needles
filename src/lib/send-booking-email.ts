import {
  isBookingEmailConfigured,
  readBookingFeatures,
  type BookingFeatureFlags,
} from '@/lib/booking-features'

export type BookingEmailPayload = {
  serviceType: string
  locationLabel?: string
  serviceLabel?: string
  addOnLabels?: string[]
  practitioner: string
  date: string
  time: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
}

function formatBookingMessage(payload: BookingEmailPayload): string {
  const lines = [
    'New appointment request from the website booking form.',
    '',
    `Visit type: ${payload.serviceType}`,
    `Location: ${payload.locationLabel || 'Not specified'}`,
    `Service: ${payload.serviceLabel || 'Not specified'}`,
    `Add-ons: ${payload.addOnLabels?.length ? payload.addOnLabels.join(', ') : 'None'}`,
    `Preferred date: ${payload.date}`,
    `Preferred time: ${payload.time}`,
    `Practitioner: ${payload.practitioner}`,
    '',
    `Name: ${payload.firstName} ${payload.lastName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Date of birth: ${payload.dateOfBirth}`,
  ]
  return lines.join('\n')
}

export type SendBookingEmailResult =
  | { ok: true }
  | {
      ok: false
      reason: 'disabled' | 'not-configured' | 'captcha-required' | 'request-failed'
      message?: string
    }

export async function sendBookingRequestEmail(
  payload: BookingEmailPayload,
  features: BookingFeatureFlags = readBookingFeatures(),
  hCaptchaToken?: string
): Promise<SendBookingEmailResult> {
  if (!features.bookingEmailEnabled) {
    return { ok: false, reason: 'disabled' }
  }
  if (!isBookingEmailConfigured(features)) {
    return { ok: false, reason: 'not-configured' }
  }

  const token = hCaptchaToken?.trim() ?? ''
  if (!token) {
    return {
      ok: false,
      reason: 'captcha-required',
      message: 'Please complete the security check to send your request.',
    }
  }

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: features.bookingEmailAccessKey.trim(),
        subject: `New booking request — ${payload.firstName} ${payload.lastName}`,
        from_name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email,
        replyto: payload.email,
        to: features.bookingEmailTo.trim(),
        message: formatBookingMessage(payload),
        'h-captcha-response': token,
        // Structured fields for Web3Forms dashboard
        visit_type: payload.serviceType,
        location: payload.locationLabel || '',
        service: payload.serviceLabel || '',
        add_ons: payload.addOnLabels?.join(', ') || 'None',
        preferred_date: payload.date,
        preferred_time: payload.time,
        phone: payload.phone,
        date_of_birth: payload.dateOfBirth,
      }),
    })

    const data = (await response.json()) as { success?: boolean; message?: string }
    if (!response.ok || !data.success) {
      return {
        ok: false,
        reason: 'request-failed',
        message: data.message || 'Email service rejected the request.',
      }
    }
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      reason: 'request-failed',
      message: error instanceof Error ? error.message : 'Network error while sending email.',
    }
  }
}
