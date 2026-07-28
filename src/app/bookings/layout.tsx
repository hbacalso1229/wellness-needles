import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bookings & Pricing | Wellness Needles',
  description:
    'View in-clinic and home-visit acupuncture pricing, and contact Wellness Needles to schedule your appointment.',
}

export default function BookingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
