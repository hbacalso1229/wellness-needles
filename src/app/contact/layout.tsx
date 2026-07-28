import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Wellness Needles',
  description:
    'Contact Wellness Needles in Celbridge and Carlow for appointments, questions, and directions to our clinics.',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
