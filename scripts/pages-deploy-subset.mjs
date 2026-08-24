#!/usr/bin/env node
/**
 * Deploy Pages with a functions subset so www never gets /api/admin
 * and portal never gets booking-request.
 *
 * Usage:
 *   node scripts/pages-deploy-subset.mjs www
 *   node scripts/pages-deploy-subset.mjs portal
 *
 * www BFF (`/api/bff`) is uploaded only when NEXT_PUBLIC_SITE_OVERLAY_ENABLED
 * is not "false". Set that env to "false" to roll www back to booking Functions
 * only (same as live today) so a BFF compile error cannot take down Turnstile.
 */
import { cpSync, mkdirSync, mkdtempSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const mode = process.argv[2]
if (mode !== 'www' && mode !== 'portal') {
  console.error('Usage: node scripts/pages-deploy-subset.mjs www|portal')
  process.exit(1)
}

const overlayLive = process.env.NEXT_PUBLIC_SITE_OVERLAY_ENABLED !== 'false'

const root = process.cwd()
const staging = mkdtempSync(join(tmpdir(), `wn-${mode}-`))
const functionsDest = join(staging, 'functions', 'api')
mkdirSync(functionsDest, { recursive: true })

function copyLibAndShared() {
  cpSync(join(root, 'functions', '_lib'), join(staging, 'functions', '_lib'), {
    recursive: true,
  })
  cpSync(join(root, 'shared'), join(staging, 'shared'), { recursive: true })
}

function copyPublicBff() {
  const bffDest = join(functionsDest, 'bff')
  mkdirSync(bffDest, { recursive: true })
  cpSync(join(root, 'functions', 'api', 'bff', 'site.ts'), join(bffDest, 'site.ts'))
  cpSync(
    join(root, 'functions', 'api', 'bff', 'booking-persist.ts'),
    join(bffDest, 'booking-persist.ts')
  )
  mkdirSync(join(bffDest, 'insurance-logo'), { recursive: true })
  cpSync(
    join(root, 'functions', 'api', 'bff', 'insurance-logo', '[id].ts'),
    join(bffDest, 'insurance-logo', '[id].ts')
  )
}

if (mode === 'www') {
  for (const name of [
    'booking-request.ts',
    'booking-thank-you.ts',
    'booking-captcha.ts',
    'booking-email-check.ts',
    'review-submit.ts',
    'reviews.ts',
  ]) {
    cpSync(join(root, 'functions', 'api', name), join(functionsDest, name))
  }
  copyLibAndShared()
  if (overlayLive) {
    copyPublicBff()
  }
} else {
  copyLibAndShared()
  cpSync(join(root, 'functions', 'api', 'admin'), join(functionsDest, 'admin'), {
    recursive: true,
  })
  copyPublicBff()
}

const outDir = mode === 'www' ? join(root, 'out') : join(root, 'portal', 'out')
if (!existsSync(outDir)) {
  console.error(`Missing export at ${outDir}`)
  process.exit(1)
}

cpSync(outDir, join(staging, 'out'), { recursive: true })

const project =
  mode === 'www' ? 'wellness-needles' : 'wellness-needles-portal'

const result = spawnSync(
  'npx',
  [
    'wrangler@4',
    'pages',
    'deploy',
    'out',
    '--project-name',
    project,
    '--branch',
    'main',
    '--commit-dirty=true',
  ],
  { stdio: 'inherit', cwd: staging, shell: true }
)

rmSync(staging, { recursive: true, force: true })
process.exit(result.status ?? 1)
