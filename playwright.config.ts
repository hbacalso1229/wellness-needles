import { defineConfig, devices } from '@playwright/test'
import { existsSync } from 'node:fs'
import path from 'node:path'

const OUT_DIR = path.join(__dirname, 'out')
const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`

if (!existsSync(OUT_DIR)) {
  throw new Error(
    `Missing static export folder "${OUT_DIR}". Run "npm run build" first (without NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY for booking E2E).`
  )
}

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npx serve out -l ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
