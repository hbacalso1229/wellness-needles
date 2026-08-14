/**
 * Cloudflare Pages Function — verify Turnstile only.
 * Clinic mail is sent from the browser to Web3Forms after this returns ok
 * (Web3Forms Free spam filter rejects posts from Cloudflare IPs).
 * Secret (Pages Production): TURNSTILE_SECRET_KEY.
 */

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type BookingBody = {
  turnstileToken?: string
}

type Env = {
  TURNSTILE_SECRET_KEY: string
}

type TurnstileVerifyJson = {
  success?: boolean
  hostname?: string
  'error-codes'?: string[]
}

function isAllowedTurnstileHostname(hostname: string): boolean {
  return (
    hostname === 'www.wellnessneedles.ie' ||
    hostname === 'wellnessneedles.ie' ||
    hostname === 'wellness-needles.pages.dev' ||
    hostname.endsWith('.wellness-needles.pages.dev')
  )
}

function jsonResponse(status: number, payload: Record<string, unknown>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  })
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteip: string | null
): Promise<boolean> {
  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', token)
  if (remoteip) body.set('remoteip', remoteip)

  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    }
  )
  const data = (await response.json()) as TurnstileVerifyJson
  const hostname = asString(data.hostname)
  if (!data.success || !hostname || !isAllowedTurnstileHostname(hostname)) {
    console.error(
      '[booking-request] Turnstile siteverify failed',
      data['error-codes'] || [],
      hostname
    )
    return false
  }
  return true
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const turnstileSecret = context.env.TURNSTILE_SECRET_KEY?.trim()
  if (!turnstileSecret) {
    return jsonResponse(503, {
      ok: false,
      reason: 'not-configured',
      error: 'TURNSTILE_SECRET_KEY not configured',
    })
  }

  let body: BookingBody
  try {
    body = (await context.request.json()) as BookingBody
  } catch {
    return jsonResponse(400, { ok: false, reason: 'request-failed', error: 'Invalid JSON body' })
  }

  const turnstileToken = asString(body.turnstileToken)
  if (!turnstileToken) {
    return jsonResponse(400, {
      ok: false,
      reason: 'captcha-required',
      error: 'Please complete the security check to send your request.',
    })
  }

  const remoteip = context.request.headers.get('CF-Connecting-IP')
  const verified = await verifyTurnstile(turnstileSecret, turnstileToken, remoteip)
  if (!verified) {
    return jsonResponse(400, {
      ok: false,
      reason: 'captcha-required',
      error: 'Security check failed. Please try again.',
    })
  }

  return jsonResponse(200, { ok: true })
}
