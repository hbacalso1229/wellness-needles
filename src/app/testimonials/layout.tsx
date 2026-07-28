import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Testimonials | Wellness Needles',
  description:
    'Explore illustrative healing journeys and treatment outcomes associated with acupuncture and holistic care.',
}

export default function TestimonialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
