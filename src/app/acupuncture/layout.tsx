import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Why Acupuncture | Wellness Needles',
  description:
    'Learn how acupuncture works, what conditions it can support, and what to expect from treatment at Wellness Needles.',
}

export default function AcupunctureLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
