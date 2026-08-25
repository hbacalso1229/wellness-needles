import type { NextConfig } from 'next'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const portalRoot = path.dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: portalRoot,
  images: { unoptimized: true },
  experimental: {
    // Phone helpers live in the marketing app's src/lib.
    externalDir: true,
  },
}

export default nextConfig
