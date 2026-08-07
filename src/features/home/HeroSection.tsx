'use client'

import Image from 'next/image'
import { Calendar, Leaf, Star } from 'lucide-react'
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
          aria-hidden
          className="hero-home-backdrop scale-110 object-cover object-center blur-2xl"
        />
        <div className="hero-home-photo-frame absolute inset-0">
          <Image
            src="/hero_home_zen.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[70%_32%] sm:object-[72%_center] md:object-right"
            priority
          />
        </div>
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
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[90rem] 2xl:max-w-[110rem] mx-auto pl-8 pr-4 sm:pl-10 sm:pr-6 lg:pl-16 lg:pr-8 xl:pl-20 2xl:pl-24 pt-12 pb-10 sm:py-12 md:py-12 xl:py-16">
        <div className="max-w-xl text-left text-cream">
          <h1 className="font-serif text-[1.75rem] leading-tight sm:text-5xl sm:leading-[1.15] md:text-6xl xl:text-[4.25rem] font-normal tracking-wide">
            <span className="block font-normal">Restore Balance.</span>
            <span className="mt-1.5 block font-normal sm:mt-2">Feel Better,</span>
            <span className="mt-1 inline-flex flex-col items-stretch sm:mt-1.5">
              <span
                className="font-serif italic font-medium"
                style={{
                  color: '#c5e07a',
                  textShadow: '0 1px 10px rgba(0, 0, 0, 0.35)',
                }}
              >
                Naturally.
              </span>
              <span
                className="mt-2.5 flex w-full items-center sm:mt-4"
                aria-hidden="true"
              >
                <span className="h-px min-w-0 flex-1 bg-[#c5e07a]/95" />
                <Leaf
                  className="mx-1.5 h-3 w-3 shrink-0 text-[#c5e07a] sm:mx-2 sm:h-3.5 sm:w-3.5"
                  strokeWidth={1.75}
                />
                <span className="h-px min-w-0 flex-1 bg-[#c5e07a]/95" />
              </span>
            </span>
          </h1>

          <div className="mt-5 max-w-[32rem] space-y-2.5 text-base font-light leading-relaxed text-cream/95 sm:mt-8 sm:max-w-[520px] sm:space-y-3 sm:text-lg">
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

          <div className="mt-6 flex flex-col items-stretch gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-5">
            <div className="inline-flex justify-center sm:justify-start">
              <CTAButton
                href={bookHref}
                variant="gold"
                size="large"
                className="!px-7 !py-3.5 !text-base sm:!px-9 sm:!py-4 sm:!text-lg"
                external={isExternal}
                target={target}
                rel={rel}
              >
                <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                Book your session
              </CTAButton>
            </div>
            <a
              href="#practitioner"
              className="text-center text-base font-normal text-cream/70 underline decoration-cream/40 underline-offset-4 transition-colors hover:text-cream/90 hover:decoration-cream/70 sm:text-left"
            >
              Meet Arkinth
            </a>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-base text-cream/85 sm:mt-6 sm:justify-start">
            <span className="inline-flex items-center gap-0.5 text-gold" aria-hidden>
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
            </span>
            <span>Rated 5.0 by verified clients</span>
          </p>
        </div>
      </div>
    </section>
  )
}
