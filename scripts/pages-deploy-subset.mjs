#!/usr/bin/env node
/**
 * Deploy Pages with a functions subset so www never gets /api/admin
 * and portal never gets booking-request.
 *
 * Usage:
 *   node scripts/pages-deploy-subset.mjs www
 *   node scripts/pages-deploy-subset.mjs portal
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

const root = process.cwd()
const staging = mkdtempSync(join(tmpdir(), `wn-${mode}-`))
const functionsDest = join(staging, 'functions', 'api')
mkdirSync(functionsDest, { recursive: true })
if (mode === 'www') {
  // Same booking Functions as live www. Do not upload portal or public BFF
  // routes while overlay is off — a compile error must not take down Turnstile.
  for (const name of ['booking-request.ts', 'booking-thank-you.ts', 'booking-captcha.ts']) {
    cpSync(join(root, 'functions', 'api', name), join(functionsDest, name))
  }
} else {
  cpSync(join(root, 'functions', '_lib'), join(staging, 'functions', '_lib'), {
    recursive: true,
  })
  cpSync(join(root, 'shared'), join(staging, 'shared'), { recursive: true })
  cpSync(join(root, 'functions', 'api', 'admin'), join(functionsDest, 'admin'), {
    recursive: true,
  })
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
