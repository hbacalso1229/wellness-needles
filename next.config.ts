import type { NextConfig } from "next";

/**
 * Marketing /admin removed for Phase 1. Always bake Admin UI off.
 * Explicit NEXT_PUBLIC_ADMIN_UI_ENABLED=true is ignored so production cannot re-enable it by mistake.
 */
const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Keep the Next.js "N" badge off body content during local design review
  devIndicators: false,
  env: {
    NEXT_PUBLIC_ADMIN_UI_ENABLED: "false",
  },
};

export default nextConfig;
