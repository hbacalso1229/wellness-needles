import {
  isValidEmailAddress,
  pickWeb3FormsAccessKey,
  readBookingFeatures,
  type BookingFeatureFlags,
} from '@/lib/booking-features'
import { contactConfig } from '@/lib/contact-config'

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

/** Clinic inbox default for website booking requests. */
export const BOOKING_REQUEST_INBOX = contactConfig.email.address

export async function sendBookingRequestEmail(
  payload: BookingEmailPayload,
  features: BookingFeatureFlags = readBookingFeatures(),
  hCaptchaToken?: string
): Promise<SendBookingEmailResult> {
  if (!features.bookingEmailEnabled) {
    return { ok: false, reason: 'disabled' }
  }

  const accessKey = pickWeb3FormsAccessKey(features.bookingEmailAccessKey)
  const emailTo =
    (features.bookingEmailTo.trim() &&
    isValidEmailAddress(features.bookingEmailTo.trim())
      ? features.bookingEmailTo.trim()
      : '') || BOOKING_REQUEST_INBOX
  if (!accessKey || !isValidEmailAddress(emailTo)) {
    return {
      ok: false,
      reason: 'not-configured',
      message:
        'Booking email needs a valid Web3Forms access key (UUID) and recipient email. Check .env.local or Admin → Booking email setup.',
    }
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
        access_key: accessKey,
        subject: `New booking request — ${payload.firstName} ${payload.lastName}`,
        from_name: `${payload.firstName} ${payload.lastName}`.trim(),
        email: payload.email,
        replyto: payload.email,
        to: emailTo,
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
      const rawMessage = data.message || 'Email service rejected the request.'
      const message = /access_key|form_id|uuid/i.test(rawMessage)
        ? 'Web3Forms rejected the access key. It must be a valid UUID from https://web3forms.com — check .env.local or Admin, then restart the dev server.'
        : rawMessage
      return {
        ok: false,
        reason: 'request-failed',
        message,
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
