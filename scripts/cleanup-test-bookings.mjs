/**
 * Preview (default) or delete D1 test bookings, test reviews, and Change History.
 *
 *   node scripts/cleanup-test-bookings.mjs
 *   node scripts/cleanup-test-bookings.mjs --apply
 *   node scripts/cleanup-test-bookings.mjs --local
 *
 * Needs Wrangler logged in. Targets D1 database wellness-needles.
 * Overlay / schema are not changed. Seeded Google reviews are not deleted.
 * Change History rows are cleared; published settings (overlay, SMS, maintenance) stay.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apply = process.argv.includes('--apply')
const remote = !process.argv.includes('--local')
const db = 'wellness-needles'

function run(file) {
  const args = ['wrangler', 'd1', 'execute', db, '--file', file]
  if (remote) args.push('--remote')
  const result = spawnSync('npx', args, {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

const listFile = path.join('d1', 'list-test-bookings.sql')
const deleteFile = path.join('d1', 'cleanup-test-bookings.sql')

console.log(
  apply
    ? `Deleting matching test bookings, reviews, and Change History on ${remote ? 'remote' : 'local'} D1 ${db}…`
    : `Preview matching test bookings, reviews, and Change History on ${remote ? 'remote' : 'local'} D1 ${db} (no delete).`
)
run(listFile)

if (!apply) {
  console.log('\nNo rows were deleted. Re-run with --apply to remove the matches above.')
  process.exit(0)
}

run(deleteFile)
console.log('\nDelete finished. Remaining matches (should be empty):')
run(listFile)
