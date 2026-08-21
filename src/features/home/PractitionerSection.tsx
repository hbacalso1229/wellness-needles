'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, GraduationCap, School, ArrowRight, type LucideIcon } from 'lucide-react'
import { SectionHeading } from '../ui/SectionHeading'
import { sectionGreenCtaClassName, glassGreenPanelClassName } from '../ui/CTAButton'

const credentials: { label: string; icon: LucideIcon }[] = [
  { label: 'Registered Acupuncturist', icon: BadgeCheck },
  { label: 'Master’s in Acupuncture', icon: GraduationCap },
  { label: 'CNM Dublin Graduate', icon: School },
]

export function PractitionerSection() {
  return (
    <section
      id="practitioner"
      className="scroll-mt-24 bg-white py-12 md:py-14"
      aria-labelledby="practitioner-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Care you can trust"
          subtitle="Meet the practitioner who will walk this path with you"
          titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
          className="text-center mb-5 md:mb-6 lg:mb-8"
        />

        <article className="mx-auto max-w-4xl rounded-[20px] border border-[#1B3B2B]/08 bg-white p-4 shadow-[0_6px_20px_rgba(27,59,43,0.06)] md:p-5">
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[12.5rem_1fr] md:gap-6 lg:grid-cols-[15rem_1fr]">
            <div className="relative mx-auto h-48 w-48 shrink-0 overflow-hidden rounded-full border border-accent/15 bg-accent/10 shadow-sm sm:mx-0 sm:aspect-square sm:h-auto sm:w-full sm:rounded-2xl">
              <Image
                src="/Arkinth_clinic_founder.jpeg"
                alt="Arkinth Garcia, Naturopath and Acupuncturist"
                width={240}
                height={240}
                sizes="(max-width: 640px) 192px, 240px"
                className="h-full w-full object-cover object-top"
              />
            </div>

            <div className="min-w-0 text-center sm:text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-secondary">
                Your practitioner
              </p>
              <h2
                id="practitioner-heading"
                className="mb-0.5 font-serif text-xl font-bold text-[var(--text-dark)] md:text-2xl"
              >
                Arkinth Garcia
              </h2>
              <p className="mb-2.5 text-base font-medium text-[var(--text-dark)]/80">
                Naturopath &amp; Acupuncturist
              </p>

              <ul className="mb-3 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {credentials.map(({ label, icon: Icon }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-accent/25 bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                  >
                    <Icon className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>

              <p className="mb-3 text-base leading-relaxed text-[var(--text-dark)]/70">
                Arkinth’s path into acupuncture began with a personal healing journey — when
                acupuncture finally brought balance after living with alopecia. Today the focus
                is easing pain, stress, digestive concerns, and more — with care for the whole
                person.
              </p>

              <blockquote
                className={`${glassGreenPanelClassName} border-l-[3px] border-l-gold px-3 py-2 text-left shadow-[0_12px_32px_-14px_rgba(27,59,43,0.22)]`}
              >
                <p className="font-serif text-base font-medium italic leading-relaxed text-[var(--text-dark)]">
                  “Always listening first, then treating the root.”
                </p>
              </blockquote>
            </div>
          </div>
        </article>

        <div className="mt-5 flex w-full justify-center md:mt-6">
          <Link href="/about/" className={sectionGreenCtaClassName}>
            Read Arkinth’s full story
            <ArrowRight
              className="h-4 w-4 shrink-0 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
