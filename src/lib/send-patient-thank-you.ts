/**
 * Asks the host API (Cloudflare Pages Function) to send the patient thank-you via Resend.
 * Failures are non-blocking: clinic Web3Forms already succeeded.
 * Safe on Vercel staging (no Pages Function) — short timeout + non-JSON/404 → ok:false.
 */

export type PatientThankYouPayload = {
  firstName: string
  lastName?: string
  email: string
  serviceLabel?: string
  locationLabel?: string
  date: string
  time: string
  serviceType: string
  message?: string
}

const THANK_YOU_TIMEOUT_MS = 8_000

export async function sendPatientThankYouEmail(
  payload: PatientThankYouPayload
): Promise<{ ok: boolean }> {
  if (process.env.NEXT_PUBLIC_E2E === 'true') {
    return { ok: false }
  }

  // Pages Function exists on Cloudflare production only — skip elsewhere so
  // staging/local never block thank-you on a missing /api route.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app')
    ) {
      return { ok: false }
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), THANK_YOU_TIMEOUT_MS)

  try {
    const response = await fetch('/api/booking-thank-you', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Survive hard navigation to /bookings/thank-you/ if the caller does not await.
      keepalive: true,
      signal: controller.signal,
      body: JSON.stringify(payload),
    })

    const contentType = response.headers.get('content-type') || ''
    if (!response.ok || !contentType.includes('application/json')) {
      console.error(
        '[patient thank-you] API unavailable or rejected',
        response.status,
        contentType
      )
      return { ok: false }
    }

    const data = (await response.json().catch(() => null)) as { ok?: boolean } | null
    return { ok: data?.ok === true }
  } catch (error) {
    console.error('[patient thank-you] Network error', error)
    return { ok: false }
  } finally {
    clearTimeout(timer)
  }
}
