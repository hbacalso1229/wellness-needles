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
  /** Optional patient note from Personal Information (not the Web3Forms reserved `message`). */
  message?: string
}

/** Short clinic message — booking details live in structured fields only. */
const CLINIC_MESSAGE = 'New appointment request from the website booking form.'

function formatDisplayDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate)
  if (!match) return isoDate
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-IE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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

/**
 * Sends the booking request to the clinic inbox via Web3Forms.
 *
 * Details are sent once as structured fields (not duplicated in `message`).
 * Patient thank-you email: Resend via Cloudflare Pages Function `/api/booking-thank-you`
 * (Autoresponder must stay OFF on Web3Forms).
 */
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
        'Booking email needs a valid Web3Forms access key (UUID) and recipient email. Set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY (or the production secret on Release builds).',
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

  const fullName = `${payload.firstName} ${payload.lastName}`.trim()
  const preferredDateDisplay = formatDisplayDate(payload.date)
  const patientMessage = payload.message?.trim() ?? ''

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject: `New booking request — ${fullName}`,
        from_name: fullName,
        name: fullName,
        email: payload.email,
        replyto: payload.email,
        to: emailTo,
        message: CLINIC_MESSAGE,
        'h-captcha-response': token,
        // Single detail list for clinic email + Autoresponder submission copy
        visit_type: payload.serviceType,
        location: payload.locationLabel || 'Not specified',
        service: payload.serviceLabel || 'Not specified',
        add_ons: payload.addOnLabels?.length ? payload.addOnLabels.join(', ') : 'None',
        preferred_date: preferredDateDisplay,
        preferred_time: payload.time,
        practitioner: payload.practitioner,
        phone: payload.phone,
        date_of_birth: payload.dateOfBirth,
        ...(patientMessage ? { patient_message: patientMessage } : {}),
      }),
    })

    const data = (await response.json()) as { success?: boolean; message?: string }
    if (!response.ok || !data.success) {
      const rawMessage = data.message || 'Email service rejected the request.'
      const message = /access_key|form_id|uuid/i.test(rawMessage)
        ? 'Web3Forms rejected the access key. It must be a valid UUID from https://web3forms.com — check NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY, then rebuild.'
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

const TURNSTILE_BOOKING_TIMEOUT_MS = 15_000

/**
 * Production clinic send: Pages Function verifies Turnstile then posts to Web3Forms.
 * Staging/local must not call this (no Function / hCaptcha path instead).
 */
export async function sendTurnstileBookingRequest(
  payload: BookingEmailPayload,
  turnstileToken: string
): Promise<SendBookingEmailResult> {
  const token = turnstileToken.trim()
  if (!token) {
    return {
      ok: false,
      reason: 'captcha-required',
      message: 'Please complete the security check to send your request.',
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TURNSTILE_BOOKING_TIMEOUT_MS)

  try {
    const response = await fetch('/api/booking-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        turnstileToken: token,
        ...payload,
      }),
    })

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? ((await response.json().catch(() => null)) as {
          ok?: boolean
          reason?: string
          error?: string
          message?: string
        } | null)
      : null

    if (!response.ok || !data?.ok) {
      const reason =
        data?.reason === 'captcha-required' ||
        data?.reason === 'not-configured' ||
        data?.reason === 'disabled'
          ? data.reason
          : 'request-failed'
      return {
        ok: false,
        reason,
        message:
          data?.message ||
          data?.error ||
          'Could not send the booking email. Please try again or call the clinic.',
      }
    }
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      reason: 'request-failed',
      message: error instanceof Error ? error.message : 'Network error while sending email.',
    }
  } finally {
    clearTimeout(timer)
  }
}
