/**
 * Runtime captcha switch for production (no new Release).
 * Pages Production variable BOOKING_CAPTCHA_PROVIDER: turnstile | hcaptcha
 * Unset defaults to turnstile.
 */

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type Env = {
  BOOKING_CAPTCHA_PROVIDER?: string
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const raw = (context.env.BOOKING_CAPTCHA_PROVIDER || 'turnstile').trim().toLowerCase()
  const provider = raw === 'hcaptcha' ? 'hcaptcha' : 'turnstile'
  return jsonResponse(200, { ok: true, provider })
}
