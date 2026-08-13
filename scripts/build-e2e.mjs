/**
 * Build the static export for Playwright E2E.
 * Forces booking email / captcha off so submit can reach /bookings/thank-you/.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const env = {
  ...process.env,
  NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY: '',
  NEXT_PUBLIC_CAPTCHA_PROVIDER: '',
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: '',
  NEXT_PUBLIC_E2E: 'true',
}

const result = spawnSync('npx', ['next', 'build'], {
  stdio: 'inherit',
  env,
  cwd: root,
  shell: true,
})

process.exit(result.status ?? 1)
