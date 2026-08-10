import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Testimonials | Wellness Needles',
  description:
    'Read verified Google reviews and real patient outcomes from acupuncture and Traditional Chinese Medicine at Wellness Needles.',
}

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
