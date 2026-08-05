'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PulsingLeaf } from '../ui/PulsingLeaf'
import { SectionHeading } from '../ui/SectionHeading'

export function PractitionerSection() {
  return (
    <section
      id="practitioner"
      className="scroll-mt-24 py-12 md:py-16 lg:py-20 bg-cream"
      aria-labelledby="practitioner-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Care you can trust"
          subtitle="Meet the practitioner who will walk this path with you"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,16rem)_1fr] gap-5 md:gap-10 lg:gap-14 items-center max-w-4xl mx-auto">
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
              className="mb-1 font-serif text-2xl font-bold text-[var(--text-dark)] md:text-3xl"
            >
              Arkinth Garcia
            </h2>
            <p className="mb-4 text-sm text-[var(--text-dark)]/70 md:mb-6 md:text-base">
              Naturopath &amp; Acupuncturist · College of Naturopathic Medicine, Dublin
            </p>
            <p className="mb-4 text-sm leading-relaxed text-[var(--text-dark)]/70 md:text-base">
              Arkinth’s path into acupuncture began with a personal healing journey — when
              acupuncture finally brought balance after living with alopecia. That experience
              shaped a practice grounded in compassion, clinical training, and care for the
              whole person.
            </p>
            <p className="mb-6 text-sm leading-relaxed text-[var(--text-dark)]/70 md:mb-8 md:text-base">
              Today the focus is helping people ease pain, stress, digestive concerns, fertility
              support, and more — always listening first, then treating the root.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link
                href="/about/"
                className="inline-flex min-h-11 w-full max-w-sm items-center justify-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-3 text-sm font-medium text-primary transition-[transform,background-color,border-color] duration-200 hover:border-primary/50 hover:bg-accent/10 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto sm:min-h-0 sm:py-2.5"
              >
                Read Arkinth’s full story
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
