'use client'

import Image from 'next/image'
import { CTAButton } from '../ui/CTAButton'

export function CTASection() {
  return (
    <section className="py-20 bg-secondary text-cream relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/treatment_in_progress_bed.jpeg"
          alt="Acupuncture treatment in progress"
          fill
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-secondary/80"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          Ready to Begin Your Healing Journey?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Take the first step towards better health and wellness with our expert acupuncture treatments
        </p>
        <CTAButton href="/bookings" variant="gold">
          Schedule Your Consultation
        </CTAButton>
      </div>
    </section>
  )
}
