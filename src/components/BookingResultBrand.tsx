'use client'

import Image from 'next/image'
import Link from 'next/link'
import { contactConfig } from '@/lib/contact-config'
import { useSiteOverlay } from '@/lib/site-overlay'

/** Logo + brand for full-screen booking result pages (no site header/footer). */
export function BookingResultBrand({ logoOnly = false }: { logoOnly?: boolean }) {
  const { overlayEnabled, site } = useSiteOverlay()
  const name = overlayEnabled ? site.clinicName : contactConfig.businessInfo.name
  return (
    <div className="mb-6 flex justify-center sm:mb-7 lg:mb-9">
      <Link
        href="/"
        className="inline-flex items-center gap-2 outline-none transition-opacity hover:opacity-90 focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 sm:gap-2.5"
      >
        <span className="relative block size-10 shrink-0 sm:size-11 lg:size-12">
          <Image
            src="/logo_wellness_transparent.png"
            alt={name}
            fill
            sizes="(max-width: 639px) 40px, (max-width: 1023px) 44px, 48px"
            className="object-contain object-center"
            priority
          />
        </span>
        {logoOnly ? null : (
          <span className="font-serif text-lg font-extrabold tracking-wide text-primary sm:text-xl lg:text-2xl">
            {name}
          </span>
        )}
      </Link>
    </div>
  )
}
