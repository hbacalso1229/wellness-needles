'use client'

import Image from 'next/image'
import Link from 'next/link'
import { PulsingLeaf } from '../ui/PulsingLeaf'
import { SectionHeading } from '../ui/SectionHeading'

export function PractitionerSection() {
  return (
    <section
      id="practitioner"
      className="scroll-mt-24 py-20 bg-cream"
      aria-labelledby="practitioner-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Care you can trust"
          subtitle="Meet the practitioner who will walk this path with you"
          titleClassName="font-serif text-4xl md:text-5xl font-bold text-primary mb-3"
          className="text-center"
        />

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,16rem)_1fr] gap-10 lg:gap-14 items-center max-w-4xl mx-auto">
          <div className="relative mx-auto w-44 h-44 sm:w-52 sm:h-52">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/25 to-accent/25 rounded-full blur-md" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-cream shadow-xl">
              <Image
                src="/Arkinth_clinic_founder.jpeg"
                alt="Arkinth Garcia, Naturopath and Acupuncturist"
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 z-10">
              <PulsingLeaf size="small" color="text-gold/60" rotation={45} />
            </div>
            <div className="absolute -bottom-1 -left-1 z-10">
              <PulsingLeaf
                size="small"
                color="text-accent/60"
                rotation={-12}
                animationDelay="1s"
              />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
              Your practitioner
            </p>
            <h2
              id="practitioner-heading"
              className="font-serif text-3xl font-bold text-primary mb-1"
            >
              Arkinth Garcia
            </h2>
            <p className="text-secondary mb-6">
              Naturopath &amp; Acupuncturist · College of Naturopathic Medicine, Dublin
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              Arkinth’s path into acupuncture began with a personal healing journey — when
              acupuncture finally brought balance after living with alopecia. That experience
              shaped a practice grounded in compassion, clinical training, and care for the
              whole person.
            </p>
            <p className="text-secondary leading-relaxed mb-8">
              Today the focus is helping people ease pain, stress, digestive concerns, fertility
              support, and more — always listening first, then treating the root.
            </p>
            <Link
              href="/about"
              className="text-primary font-medium underline underline-offset-4 decoration-gold/60 hover:decoration-gold transition-colors"
            >
              Read Arkinth’s full story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
