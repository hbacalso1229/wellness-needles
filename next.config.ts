import type { NextConfig } from "next";

/**
 * Bake Admin UI availability into the static client.
 * - `dev` branch (Vercel Preview) → on
 * - `main` branch (Vercel Production) → off
 * - Local `next dev` → on
 * - Explicit NEXT_PUBLIC_ADMIN_UI_ENABLED=true|false wins when set
 */
function resolveAdminUiEnabled(): string {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_UI_ENABLED?.trim()
  if (explicit === "true" || explicit === "false") return explicit

  const branch = process.env.VERCEL_GIT_COMMIT_REF?.trim() ?? ""
  if (branch === "dev") return "true"
  if (branch === "main") return "false"

  if (process.env.NODE_ENV === "development") return "true"

  return "false"
}

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Keep the Next.js "N" badge off body content during local design review
  devIndicators: false,
  env: {
    NEXT_PUBLIC_ADMIN_UI_ENABLED: resolveAdminUiEnabled(),
  },
};

export default nextConfig;
