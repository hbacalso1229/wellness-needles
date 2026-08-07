'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function normalizePathname(path: string | null) {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

/** Booking confirmation / error — full-screen, no site header or footer. */
function isBookingResultPage(pathname: string) {
  return (
    pathname === '/bookings/thank-you' ||
    pathname === '/bookings/unable-to-process'
  )
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = normalizePathname(usePathname())
  const fullScreen = isBookingResultPage(pathname)

  if (fullScreen) {
    return <main className="min-h-dvh">{children}</main>
  }

  return (
    <>
      <Header />
      <main className="pt-14">{children}</main>
      <Footer />
    </>
  )
}
