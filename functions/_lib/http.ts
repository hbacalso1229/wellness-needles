export type PagesEnv = {
  DB?: D1Database
  SITE_CACHE?: KVNamespace
  RESEND_API_KEY?: string
  TURNSTILE_SECRET_KEY?: string
  CF_ACCESS_AUD?: string
  CF_ACCESS_TEAM_DOMAIN?: string
  TWILIO_ACCOUNT_SID?: string
  TWILIO_AUTH_TOKEN?: string
  TWILIO_FROM?: string
}

export function jsonResponse(
  status: number,
  payload: unknown,
  extraHeaders?: Record<string, string>
): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

export function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export function requestHost(request: Request): string {
  return (request.headers.get('Host') || '').split(':')[0].toLowerCase()
}

export function isPortalHost(host: string): boolean {
  return (
    host === 'portal.wellnessneedles.ie' ||
    host === 'wellness-needles-portal.pages.dev' ||
    host.endsWith('.wellness-needles-portal.pages.dev')
  )
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}
