import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | Wellness Needles',
  description:
    'Meet Arkinth Garcia, qualified Naturopath and Acupuncturist serving Celbridge and Carlow with holistic acupuncture care.',
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
