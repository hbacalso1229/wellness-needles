import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin | Wellness Needles',
  description: 'Administration area for Wellness Needles.',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
