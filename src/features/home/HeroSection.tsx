'use client'

import Image from 'next/image'
import { Leaf, Star } from 'lucide-react'
import { CTAButton } from '../ui/CTAButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export function HeroSection() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <section
      data-page-hero=""
      data-home-hero="true"
      className="page-hero relative flex items-start md:items-center overflow-x-hidden md:overflow-hidden"
      aria-label="Wellness Needles"
    >
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/hero_home_zen.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_32%] sm:object-[72%_center] md:object-right"
          priority
        />
        {/* Readability wash — darker on the copy side, soft fade into the photo */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(20, 40, 20, 0.72) 0%, rgba(20, 40, 20, 0.45) 42%, rgba(20, 40, 20, 0.18) 68%, rgba(20, 40, 20, 0.05) 100%)',
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/15" />
      </div>

      {/* Extra top padding on mobile so copy isn’t tight under the menu bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:py-12 md:py-12 xl:py-16">
        <div className="max-w-xl text-left text-cream">
          <h1 className="font-serif text-[1.75rem] leading-tight sm:text-5xl sm:leading-[1.15] md:text-6xl xl:text-[4.25rem] font-normal tracking-wide">
            <span className="block font-normal">Restore Balance.</span>
            <span className="block font-normal">Feel Better,</span>
            <span className="mt-1.5 sm:mt-2 inline-block">
              <span
                className="block font-serif text-[0.92em] italic font-normal text-light-green"
                style={{ textShadow: '0 1px 8px rgba(0, 0, 0, 0.3)' }}
              >
                Naturally.
              </span>

              <span
                className="mt-2.5 sm:mt-4 flex w-full items-center"
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-light-green/85" />
                <Leaf
                  className="mx-2 sm:mx-2.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-light-green"
                  strokeWidth={1.6}
                />
                <span className="h-px flex-1 bg-light-green/85" />
              </span>
            </span>
          </h1>

          <div className="mt-5 sm:mt-8 max-w-[34rem] space-y-2.5 sm:space-y-3 text-sm sm:text-lg leading-relaxed text-cream/95 font-light">
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

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-5 items-stretch sm:items-center">
            <div className="inline-flex justify-center sm:justify-start">
              <CTAButton
                href={bookHref}
                variant="gold"
                size="large"
                showArrow
                className="!px-7 !py-3.5 !text-base sm:!px-9 sm:!py-4 sm:!text-lg !shadow-lg !shadow-black/25 font-bold motion-safe:hover:-translate-y-0.5"
                external={isExternal}
                target={target}
                rel={rel}
              >
                Book your appointment
              </CTAButton>
            </div>
            <a
              href="#practitioner"
              className="text-cream/70 hover:text-cream/90 underline underline-offset-4 decoration-cream/40 hover:decoration-cream/70 text-sm sm:text-base font-normal transition-colors text-center sm:text-left"
            >
              Meet your practitioner
            </a>
          </div>

          <p className="mt-5 sm:mt-6 flex items-center justify-center sm:justify-start gap-1.5 text-sm text-cream/85">
            <span className="inline-flex items-center gap-0.5 text-gold" aria-hidden>
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
            </span>
            <span>Rated 5★ by clients</span>
          </p>
        </div>
      </div>
    </section>
  )
}
