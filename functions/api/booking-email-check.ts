import { jsonResponse, asString, readJsonBody } from '../_lib/http'
import {
  checkEmailLocal,
  parseEmailAddress,
  type EmailCheckReason,
} from '../../shared/email-check'

type PagesFunction<Env = unknown> = (context: {
  request: Request
  env: Env
}) => Response | Promise<Response>

type DohAnswer = {
  type?: number
  data?: string
}

type DohJson = {
  Status?: number
  Answer?: DohAnswer[]
}

function fail(reason: EmailCheckReason, suggestion?: string): Response {
  return jsonResponse(
    200,
    suggestion ? { ok: false, reason, suggestion } : { ok: false, reason }
  )
}

async function domainHasMx(domain: string): Promise<boolean | 'unknown'> {
  try {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`
    const response = await fetch(url, {
      headers: { Accept: 'application/dns-json' },
    })
    if (!response.ok) return 'unknown'
    const body = (await response.json()) as DohJson
    if (body.Status === 2) return 'unknown'
    const answers = body.Answer || []
    if (answers.some((row) => row.type === 15 && Boolean(row.data))) return true
    return false
  } catch {
    return 'unknown'
  }
}

export const onRequestPost: PagesFunction = async (context) => {
  const body = await readJsonBody(context.request)
  const email =
    body && typeof body === 'object' && !Array.isArray(body)
      ? asString((body as { email?: unknown }).email)
      : ''

  const local = checkEmailLocal(email)
  const parsed = local.ok
    ? { domain: local.domain }
    : parseEmailAddress(email)

  if (!local.ok && local.reason === 'format') {
    console.info('[booking-email-check]', local.reason, parsed?.domain || 'invalid')
    return fail('format')
  }

  if (!parsed) {
    console.info('[booking-email-check]', 'format', 'invalid')
    return fail('format')
  }

  if (!local.ok && local.reason === 'typo') {
    console.info('[booking-email-check]', 'typo', parsed.domain)
  }

  const mx = await domainHasMx(parsed.domain)
  if (mx === false) {
    console.info('[booking-email-check]', 'mx', parsed.domain)
    return fail('mx')
  }

  console.info('[booking-email-check]', 'ok', parsed.domain)
  return jsonResponse(200, { ok: true })
}
