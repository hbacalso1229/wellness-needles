/**
 * Rasterize Lucide icons used on /bookings/thank-you for HTML email.
 * Uses local Chrome (no extra npm packages).
 */
import { mkdirSync, mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { __iconNode as calendar } from '../node_modules/lucide-react/dist/esm/icons/calendar.js'
import { __iconNode as circleCheck } from '../node_modules/lucide-react/dist/esm/icons/circle-check.js'
import { __iconNode as clock } from '../node_modules/lucide-react/dist/esm/icons/clock.js'
import { __iconNode as heartHandshake } from '../node_modules/lucide-react/dist/esm/icons/heart-handshake.js'
import { __iconNode as leaf } from '../node_modules/lucide-react/dist/esm/icons/leaf.js'
import { __iconNode as mail } from '../node_modules/lucide-react/dist/esm/icons/mail.js'
import { __iconNode as mapPin } from '../node_modules/lucide-react/dist/esm/icons/map-pin.js'
import { __iconNode as messageSquare } from '../node_modules/lucide-react/dist/esm/icons/message-square.js'
import { __iconNode as phone } from '../node_modules/lucide-react/dist/esm/icons/phone.js'
import { __iconNode as user } from '../node_modules/lucide-react/dist/esm/icons/user.js'

const PRIMARY = '#2d5016'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'email')
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

function nodeToSvg(tag, attrs) {
  const skip = new Set(['key'])
  const attr = Object.entries(attrs)
    .filter(([name]) => !skip.has(name))
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ')
  return `<${tag} ${attr}/>`
}

function lucideSvg(iconNode, { size, strokeWidth }) {
  const inner = iconNode.map(([tag, attrs]) => nodeToSvg(tag, attrs)).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${PRIMARY}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`
}

function screenshotSvg(svg, size, destPng) {
  const dir = mkdtempSync(join(tmpdir(), 'email-icon-'))
  const htmlPath = join(dir, 'icon.html')
  writeFileSync(
    htmlPath,
    `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden}svg{display:block}</style></head><body>${svg}</body></html>`
  )
  const result = spawnSync(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--window-size=${size},${size}`,
      '--default-background-color=00000000',
      `--screenshot=${destPng}`,
      pathToFileURL(htmlPath).href,
    ],
    { encoding: 'utf8' }
  )
  rmSync(dir, { recursive: true, force: true })
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `chrome exited ${result.status}`)
  }
}

mkdirSync(OUT, { recursive: true })

const icons = [
  ['leaf', leaf, { size: 28, strokeWidth: 1.75 }],
  ['user', user, { size: 32, strokeWidth: 2 }],
  ['check', circleCheck, { size: 32, strokeWidth: 2 }],
  ['map-pin', mapPin, { size: 32, strokeWidth: 2 }],
  ['calendar', calendar, { size: 32, strokeWidth: 2 }],
  ['clock', clock, { size: 32, strokeWidth: 2 }],
  ['message', messageSquare, { size: 32, strokeWidth: 2 }],
  ['heart-handshake', heartHandshake, { size: 40, strokeWidth: 2 }],
  ['phone', phone, { size: 32, strokeWidth: 2 }],
  ['mail', mail, { size: 32, strokeWidth: 2 }],
]

for (const [name, iconNode, opts] of icons) {
  const dest = join(OUT, `${name}.png`)
  screenshotSvg(lucideSvg(iconNode, opts), opts.size, dest)
  const bytes = readFileSync(dest).length
  console.log(`wrote ${name}.png (${opts.size}x${opts.size}, ${bytes} bytes)`)
}
