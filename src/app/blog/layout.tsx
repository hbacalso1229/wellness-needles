import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Wellness Needles',
  description:
    'Wellness insights and educational articles on acupuncture and Traditional Chinese Medicine from Wellness Needles.',
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
