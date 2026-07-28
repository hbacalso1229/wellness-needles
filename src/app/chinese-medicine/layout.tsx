import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chinese Medicine | Wellness Needles',
  description:
    'Explore Traditional Chinese Medicine principles, treatment methods, and holistic care at Wellness Needles.',
}

export default function ChineseMedicineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
