'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X } from 'lucide-react'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { isAdminUiEnabled } from '@/lib/admin-ui'

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

  const bookNowClassName =
    'inline-flex items-center justify-center gap-2 no-underline bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-5 py-2 rounded-full text-sm font-semibold normal-case shadow-md whitespace-nowrap transition-all duration-300 hover:from-[#f0d45c] hover:to-[#c9a52f] hover:no-underline'
  const bookNowHeaderMobileClassName =
    'inline-flex items-center justify-center gap-1 no-underline bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-2.5 py-1 rounded-full text-xs font-semibold normal-case shadow-md whitespace-nowrap transition-all duration-300 hover:from-[#f0d45c] hover:to-[#c9a52f] hover:no-underline sm:gap-1.5 sm:px-3.5 sm:py-1.5 sm:text-sm'

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
      'text-sm font-medium whitespace-nowrap transition-colors duration-200',
      active
        ? 'text-primary border-b-2 border-gold pb-0.5'
        : 'text-secondary hover:text-primary',
    ].join(' ')
  }

  const mobileNavLinkClass = (href: string) => {
    const active = isNavActive(href)
    return [
      'block px-3 py-2.5 text-base font-medium rounded-md transition-colors duration-200',
      active
        ? 'text-primary bg-gold/10 border-l-2 border-gold'
        : 'text-secondary hover:text-primary hover:bg-accent/10',
    ].join(' ')
  }

  // Close the drawer when navigating or resizing up to desktop nav.
  useEffect(() => {
    setIsMenuOpen(false)
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
    <header className="fixed top-0 w-full z-50 overflow-visible border-b border-accent/20 bg-[rgba(249,247,244,0.88)] backdrop-blur-md supports-[backdrop-filter]:bg-[rgba(249,247,244,0.78)]">
      <nav className="w-full pl-2 sm:pl-3 pr-3 sm:pr-4 lg:pr-6 overflow-visible">
        <div className="relative flex items-center gap-2 sm:gap-3 h-16 overflow-visible">
          {/* Logo + wordmark — can shrink on phones so Book + hamburger stay visible */}
          <Link
            href="/"
            className="relative z-[60] flex min-w-0 items-center gap-1.5 sm:gap-3"
          >
            <span className="relative shrink-0">
              <span className="relative block size-10 overflow-hidden rounded-full bg-cream ring-2 ring-cream aspect-square sm:size-12 sm:ring-[3px]">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  fill
                  sizes="(max-width: 639px) 40px, 48px"
                  className="object-cover object-center"
                  priority
                />
              </span>
            </span>
            <span className="min-w-0 truncate font-serif text-sm font-medium tracking-wide text-primary sm:text-base xl:overflow-visible xl:text-xl">
              Wellness Needles
            </span>
          </Link>

          {/* Desktop Navigation — spaced from brand */}
          <div className="hidden xl:flex items-center gap-x-3 xl:gap-x-4 2xl:gap-x-5 min-w-0 xl:ml-24 2xl:ml-28">
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
          <div className="hidden xl:block shrink-0 xl:ml-10 2xl:ml-14">
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

          {/* Mobile / tablet: Book now + menu */}
          <div className="xl:hidden ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {headerBookCta}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex min-h-11 min-w-11 items-center justify-center p-2.5 -mr-1 text-[var(--text-dark)] hover:text-[var(--text-dark)]/70"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-[var(--text-dark)]" strokeWidth={2} />
              ) : (
                <Menu className="h-6 w-6 text-[var(--text-dark)]" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile / tablet Navigation */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="xl:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-cream border-t border-blue-light/30 max-h-[calc(100dvh-4rem)] overflow-y-auto">
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
