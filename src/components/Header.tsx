'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X } from 'lucide-react'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { isAdminUiEnabled } from '@/lib/admin-ui'
import { headerGoldCtaClassName, headerGoldCtaMobileClassName } from '@/features/ui/CTAButton'

const HEADER_CLASS =
  'fixed top-0 z-50 w-full overflow-visible border-b border-white/40 bg-white/40 backdrop-blur-[2px] supports-[backdrop-filter]:bg-white/30 shadow-sm'

function BookNowLabel({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Calendar
        className={`${
          compact ? 'h-3.5 w-3.5 sm:h-4 sm:w-4' : 'h-4 w-4'
        } shrink-0`}
        aria-hidden
      />
      Book Appointment
    </>
  )
}

function normalizePathname(path: string | null) {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = normalizePathname(usePathname())
  const [navReady, setNavReady] = useState(false)
  const pathnameReadyRef = useRef(false)
  const {
    href: bookHref,
    isExternal: bookExternal,
    target: bookTarget,
    rel: bookRel,
    hydrated: bookCtaReady,
  } = useBookingCtaHref()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about/', label: 'About' },
    { href: '/acupuncture/', label: 'Why Acupuncture' },
    { href: '/chinese-medicine/', label: 'Chinese Medicine' },
    { href: '/testimonials/', label: 'Testimonials' },
    // { href: '/blog/', label: 'Blog' },
    { href: '/contact/', label: 'Contact' },
    { href: '/bookings/', label: 'Bookings' },
    ...(isAdminUiEnabled() ? [{ href: '/admin/', label: 'Admin' }] : []),
  ]

  const bookNowClassName = headerGoldCtaClassName
  const bookNowHeaderMobileClassName = headerGoldCtaMobileClassName

  // Apply active styles only after mount so SSR/client pathname quirks don't hydrate-mismatch.
  useEffect(() => {
    setNavReady(true)
  }, [])

  const isNavActive = (href: string) => {
    if (!navReady) return false
    const normalizedHref = normalizePathname(href)
    return normalizedHref === '/'
      ? pathname === '/'
      : pathname.startsWith(normalizedHref)
  }

  const navLinkClass = (href: string) => {
    const active = isNavActive(href)
    return [
      'text-sm font-semibold whitespace-nowrap transition-colors duration-200 outline-none',
      'focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      active
        ? 'font-bold text-primary border-b-2 border-gold pb-0.5'
        : 'text-dark/80 hover:text-primary',
    ].join(' ')
  }

  const mobileNavLinkClass = (href: string) => {
    const active = isNavActive(href)
    return [
      'block px-3 py-2.5 text-base font-semibold rounded-md transition-colors duration-200 outline-none',
      'focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      active
        ? 'font-bold text-primary bg-gold/10 border-l-2 border-gold'
        : 'text-dark/80 hover:text-primary hover:bg-accent/10',
    ].join(' ')
  }

  // Close the drawer when navigating or resizing up to desktop nav.
  useEffect(() => {
    setIsMenuOpen(false)
    // Skip the first run (mount) so hydration is undisturbed; blur after real navigations.
    if (pathnameReadyRef.current) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
    } else {
      pathnameReadyRef.current = true
    }
  }, [pathname])
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia('(min-width: 1280px)').matches) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Stable SSR markup: always Link to /bookings until booking features hydrate.
  const bookUsesExternal = bookCtaReady && bookExternal
  const bookLinkHref = bookUsesExternal ? bookHref : '/bookings/'

  const headerBookCta = bookUsesExternal ? (
    <a
      href={bookHref}
      target={bookTarget}
      rel={bookRel}
      className={`${bookNowHeaderMobileClassName} shrink-0`}
    >
      <BookNowLabel compact />
    </a>
  ) : (
    <Link href={bookLinkHref} className={`${bookNowHeaderMobileClassName} shrink-0`}>
      <BookNowLabel compact />
    </Link>
  )

  return (
    <header className={HEADER_CLASS} suppressHydrationWarning>
      <nav className="w-full overflow-visible pl-3 pr-3 sm:pl-4 sm:pr-4 lg:pr-6">
        <div className="relative flex h-14 min-w-0 items-center gap-1.5 overflow-visible sm:gap-3">
          {/* Logo + wordmark — text truncates; logo never clipped */}
          <Link
            href="/"
            className="relative z-[60] flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2.5 xl:flex-none"
          >
            <span className="relative shrink-0 p-0.5">
              <span className="relative block size-9 aspect-square overflow-hidden rounded-full bg-white ring-2 ring-primary/15 sm:size-10 sm:ring-[3px]">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  fill
                  sizes="(max-width: 639px) 36px, 40px"
                  className="object-cover object-center"
                  priority
                />
              </span>
            </span>
            <span className="min-w-0 flex-1 truncate font-serif text-base font-bold tracking-wide text-primary sm:flex-none sm:text-lg xl:overflow-visible xl:text-xl">
              Wellness Needles
            </span>
          </Link>

          {/* Desktop Navigation — spaced from brand */}
          <div className="hidden min-w-0 items-center gap-x-3 xl:ml-24 xl:flex xl:gap-x-4 2xl:ml-28 2xl:gap-x-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(item.href)}
                aria-current={isNavActive(item.href) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Book — beside menu */}
          <div className="hidden shrink-0 xl:ml-10 xl:block 2xl:ml-14">
            {bookUsesExternal ? (
              <a
                href={bookHref}
                target={bookTarget}
                rel={bookRel}
                className={bookNowClassName}
              >
                <BookNowLabel />
              </a>
            ) : (
              <Link href={bookLinkHref} className={bookNowClassName}>
                <BookNowLabel />
              </Link>
            )}
          </div>

          {/* Mobile / tablet: Book now + menu — never shrink off-screen */}
          <div className="relative z-[70] ml-auto flex shrink-0 items-center gap-1 sm:gap-2 xl:hidden">
            {headerBookCta}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex size-10 shrink-0 items-center justify-center text-dark hover:text-dark/70"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-dark" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6 text-dark" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / tablet Navigation */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="xl:hidden">
            <div className="max-h-[calc(100dvh-3.5rem)] space-y-1 overflow-y-auto border-t border-white/40 bg-white/50 backdrop-blur-[2px] px-2 pb-3 pt-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={mobileNavLinkClass(item.href)}
                  aria-current={isNavActive(item.href) ? 'page' : undefined}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
