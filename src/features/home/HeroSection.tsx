'use client'

import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { CTAButton } from '../ui/CTAButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export function HeroSection() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <section
      data-page-hero=""
      className="page-hero relative flex items-center overflow-x-hidden"
      aria-label="Wellness Needles"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero_home_zen.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[72%_center] md:object-right"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-primary/35 to-transparent md:via-primary/25 md:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 xl:py-20">
        <div className="max-w-xl text-left text-cream">
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl xl:text-[4.25rem] font-normal leading-[1.15] tracking-wide">
            <span className="block font-normal">Restore Balance.</span>
            <span className="block font-normal">Feel Better,</span>
            <span className="mt-2 inline-block">
              <span
                className="block font-serif text-[0.92em] italic font-normal text-light-green"
                style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)' }}
              >
                Naturally.
              </span>

              {/* Hairline + outline leaf — stretches to full width of “Naturally.” */}
              <span
                className="mt-4 flex w-full items-center"
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-light-green/85" />
                <Leaf
                  className="mx-2.5 h-3.5 w-3.5 shrink-0 rotate-[40deg] text-light-green"
                  strokeWidth={1.6}
                />
                <span className="h-px flex-1 bg-light-green/85" />
              </span>
            </span>
          </h1>

          <div className="mt-8 max-w-lg space-y-3 text-base sm:text-lg leading-relaxed text-cream/90 font-light">
            <p>
              Experience authentic acupuncture and naturopathic medicine with
              Arkinth Garcia.
            </p>
            <p>
              Specializing in pain management, mental health, digestive issues,
              fertility support, and holistic wellness through traditional
              Chinese medicine.
            </p>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch sm:items-center">
            <CTAButton
              href={bookHref}
              variant="gold"
              size="large"
              showArrow
              external={isExternal}
              target={target}
              rel={rel}
            >
              Begin your journey
            </CTAButton>
            <a
              href="#practitioner"
              className="text-cream/95 hover:text-cream underline underline-offset-4 decoration-cream/70 hover:decoration-cream text-base sm:text-lg font-medium transition-colors text-center sm:text-left"
            >
              Meet your practitioner
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
