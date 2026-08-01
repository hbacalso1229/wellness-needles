import type { Metadata } from 'next'
import Link from 'next/link'
import { isAdminUiEnabled } from '@/lib/admin-ui'

export const metadata: Metadata = {
  title: 'Admin | Wellness Needles',
  description: 'Administration area for Wellness Needles.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  if (!isAdminUiEnabled()) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl font-bold text-primary mb-3">Admin unavailable</h1>
        <p className="text-secondary text-sm mb-6">
          The Admin tools are only enabled on the <code className="text-xs">dev</code> branch
          (and local development). Production builds from <code className="text-xs">main</code>{' '}
          keep the legacy booking form as the default.
        </p>
        <Link
          href="/bookings/"
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-cream hover:bg-secondary transition-colors"
        >
          Go to Bookings
        </Link>
      </div>
    )
  }

  return children
}
