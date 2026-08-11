'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X } from 'lucide-react'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { isAdminUiEnabled } from '@/lib/admin-ui'
import { headerGoldCtaClassName, headerGoldCtaMobileClassName } from '@/features/ui/CTAButton'

const HEADER_CLASS =
  'fixed inset-x-0 top-0 z-50 w-full overflow-visible border-b border-white/40 shadow-sm bg-white/90 backdrop-blur-md max-xl:supports-[backdrop-filter]:bg-white/80 xl:bg-white/40 xl:backdrop-blur-[2px] xl:supports-[backdrop-filter]:bg-white/30'

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
  const [isMenuMounted, setIsMenuMounted] = useState(false)
  const [isMenuSlidingIn, setIsMenuSlidingIn] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
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
    setPortalReady(true)
  }, [])

  // Keep drawer mounted through close animation; lock body scroll while open.
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuMounted(true)
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      // Defer slide-in so the initial -translate-x-full paint can apply first.
      const t = window.setTimeout(() => setIsMenuSlidingIn(true), 20)
      return () => {
        window.clearTimeout(t)
        document.body.style.overflow = prevOverflow
      }
    }
    setIsMenuSlidingIn(false)
    const t = window.setTimeout(() => setIsMenuMounted(false), 500)
    return () => window.clearTimeout(t)
  }, [isMenuOpen])

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
  const hideHeaderBookCta = pathname.startsWith('/bookings')

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

  const closeMenu = () => setIsMenuOpen(false)

  const mobileDrawer =
    portalReady && isMenuMounted
      ? createPortal(
          <div className="xl:hidden" aria-hidden={!isMenuOpen}>
            <button
              type="button"
              tabIndex={isMenuOpen ? 0 : -1}
              className={`mobile-nav-backdrop fixed inset-x-0 bottom-0 top-12 z-[40] bg-black/35 sm:top-14 ${
                isMenuSlidingIn ? 'is-open opacity-100' : 'pointer-events-none opacity-0'
              }`}
              aria-label="Close navigation menu"
              onClick={closeMenu}
            />
            <div
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className={`mobile-nav-drawer fixed bottom-0 left-0 top-12 z-[45] flex w-[min(20rem,86vw)] max-w-full flex-col border-r border-accent/15 bg-white sm:top-14 ${
                isMenuSlidingIn ? 'is-open translate-x-0' : '-translate-x-full'
              }`}
            >
              <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-2 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${mobileNavLinkClass(item.href)}${
                      isMenuSlidingIn ? ' mobile-nav-link-enter' : ''
                    }`}
                    style={
                      isMenuSlidingIn
                        ? { animationDelay: `${220 + index * 90}ms` }
                        : undefined
                    }
                    aria-current={isNavActive(item.href) ? 'page' : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      <header className={HEADER_CLASS} suppressHydrationWarning>
        <nav className="w-full overflow-visible pl-3 pr-3 sm:pl-4 sm:pr-4 lg:pr-6">
          <div className="relative flex h-12 min-w-0 items-center overflow-visible sm:h-14">
            {/* Mobile / tablet: hamburger — left */}
            <div className="relative z-[70] flex shrink-0 items-center xl:hidden">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                className="inline-flex size-9 shrink-0 items-center justify-center text-dark hover:text-dark/70 sm:size-10"
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

            {/* Logo — leftmost on desktop; centered on mobile/tablet */}
            <Link
              href="/"
              className="relative z-[60] block max-xl:absolute max-xl:left-1/2 max-xl:top-1/2 max-xl:-translate-x-1/2 max-xl:-translate-y-1/2 xl:shrink-0"
              aria-label="Wellness Needles home"
            >
              <span className="relative block h-10 w-[5.5rem] sm:h-11 sm:w-24 xl:h-11 xl:w-24">
                <Image
                  src="/logo_wellness_transparent.png"
                  alt=""
                  fill
                  sizes="96px"
                  className="object-contain object-center"
                  priority
                />
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden min-w-0 items-center gap-x-3 xl:ml-6 xl:flex xl:gap-x-4 2xl:ml-8 2xl:gap-x-5">
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

            {/* Desktop Book — directly after nav */}
            {!hideHeaderBookCta ? (
              <div className="hidden shrink-0 xl:ml-6 xl:block 2xl:ml-8">
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
            ) : null}

            {/* Mobile / tablet: CTA — right */}
            <div className="relative z-[70] ml-auto flex shrink-0 items-center xl:hidden">
              {!hideHeaderBookCta ? headerBookCta : null}
            </div>
          </div>
        </nav>
      </header>
      {mobileDrawer}
    </>
  )
}
