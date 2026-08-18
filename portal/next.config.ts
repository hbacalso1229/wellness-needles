import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: {
    // Phone helpers live in the marketing app's src/lib.
    externalDir: true,
  },
}

export default nextConfig
