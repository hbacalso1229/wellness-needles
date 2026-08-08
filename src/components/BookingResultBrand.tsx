'use client'

import Image from 'next/image'
import Link from 'next/link'
import { contactConfig } from '@/lib/contact-config'

/** Logo + brand for full-screen booking result pages (no site header/footer). */
export function BookingResultBrand() {
  return (
    <div className="mb-6 flex justify-center sm:mb-7 lg:mb-9">
      <Link
        href="/"
        className="inline-flex items-center gap-2 outline-none transition-opacity hover:opacity-90 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:gap-2.5"
      >
        <span className="relative block size-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-primary/15 sm:size-11 lg:size-12 lg:ring-[3px]">
          <Image
            src="/logo_wellness.jpeg"
            alt="Wellness Needles Logo"
            fill
            sizes="(max-width: 639px) 40px, (max-width: 1023px) 44px, 48px"
            className="object-cover object-center"
            priority
          />
        </span>
        <span className="font-serif text-lg font-extrabold tracking-wide text-primary sm:text-xl lg:text-2xl">
          {contactConfig.businessInfo.name}
        </span>
      </Link>
    </div>
  )
}
