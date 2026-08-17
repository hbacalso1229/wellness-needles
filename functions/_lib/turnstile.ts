import { asString } from './http'

type TurnstileVerifyJson = {
  success?: boolean
  hostname?: string
}

export function isAllowedTurnstileHostname(hostname: string): boolean {
  return (
    hostname === 'www.wellnessneedles.ie' ||
    hostname === 'wellnessneedles.ie' ||
    hostname === 'wellness-needles.pages.dev' ||
    hostname.endsWith('.wellness-needles.pages.dev')
  )
}

export async function verifyTurnstile(
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
  return Boolean(data.success && hostname && isAllowedTurnstileHostname(hostname))
}
