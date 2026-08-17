import type { PagesEnv } from './http'

type Jwk = JsonWebKey & { kid?: string }

type Certs = { keys?: Jwk[] }

function b64urlToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

function decodeJwtPart(part: string): Record<string, unknown> {
  const json = new TextDecoder().decode(b64urlToBytes(part))
  return JSON.parse(json) as Record<string, unknown>
}

export async function verifyAccessJwt(
  env: PagesEnv,
  request: Request
): Promise<{ email: string } | null> {
  const aud = env.CF_ACCESS_AUD?.trim()
  const team = env.CF_ACCESS_TEAM_DOMAIN?.trim()?.replace(/^https?:\/\//, '')
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion')?.trim()
  if (!aud || !team || !jwt) return null

  const parts = jwt.split('.')
  if (parts.length !== 3) return null

  let header: Record<string, unknown>
  let payload: Record<string, unknown>
  try {
    header = decodeJwtPart(parts[0])
    payload = decodeJwtPart(parts[1])
  } catch {
    return null
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  if (exp * 1000 < Date.now()) return null

  const tokenAud = payload.aud
  const audOk =
    tokenAud === aud || (Array.isArray(tokenAud) && tokenAud.includes(aud))
  if (!audOk) return null

  const email =
    (typeof payload.email === 'string' && payload.email) ||
    (typeof payload.sub === 'string' && payload.sub) ||
    ''
  if (!email) return null

  try {
    const certsRes = await fetch(`https://${team}/cdn-cgi/access/certs`)
    if (!certsRes.ok) return null
    const certs = (await certsRes.json()) as Certs
    const kid = typeof header.kid === 'string' ? header.kid : ''
    const jwk = (certs.keys || []).find((key) => key.kid === kid)
    if (!jwk) return null

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const signature = b64urlToBytes(parts[2])
    const ok = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      signature,
      data
    )
    if (!ok) return null
  } catch {
    return null
  }

  return { email }
}
