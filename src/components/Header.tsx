'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Calendar, Menu, X } from 'lucide-react'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

function BookNowLabel({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <Calendar className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} aria-hidden />
      Book Appointment
    </>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const [hideHeaderBook, setHideHeaderBook] = useState(() => pathname === '/')
  const { href: bookHref, isExternal: bookExternal, target: bookTarget, rel: bookRel } =
    useBookingCtaHref()

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/acupuncture', label: 'Why Acupuncture' },
    { href: '/chinese-medicine', label: 'Chinese Medicine' },
    { href: '/testimonials', label: 'Testimonials' },
    // { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/bookings', label: 'Bookings' },
    { href: '/admin', label: 'Admin' },
  ]

  const bookNowClassName =
    'inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-5 py-2 rounded-full text-sm font-bold normal-case shadow-md shadow-primary/20 card-emboss whitespace-nowrap transition-all duration-200 hover:from-[#f0d45c] hover:to-[#c9a52f] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25'
  const bookNowHeaderMobileClassName =
    'inline-flex items-center justify-center gap-1.5 bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-3 sm:px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold normal-case shadow-md shadow-primary/20 whitespace-nowrap transition-all duration-200 hover:from-[#f0d45c] hover:to-[#c9a52f]'

  const isNavActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  const navLinkClass = (href: string) => {
    const active = isNavActive(href)
    return [
      'text-sm font-medium whitespace-nowrap transition-colors duration-200',
      active
        ? 'text-accent border-b-2 border-accent pb-0.5'
        : 'text-secondary hover:text-primary',
    ].join(' ')
  }

  const mobileNavLinkClass = (href: string) => {
    const active = isNavActive(href)
    return [
      'block px-3 py-2.5 text-base font-medium rounded-md transition-colors duration-200',
      active
        ? 'text-accent bg-accent/10 border-l-2 border-accent'
        : 'text-secondary hover:text-primary hover:bg-accent/10',
    ].join(' ')
  }

  const onBookingOrAdmin =
    pathname.startsWith('/bookings') || pathname.startsWith('/admin')

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

  // Home page book CTAs (hero + booking section) — hide header Book while any is in view.
  useEffect(() => {
    if (pathname !== '/') {
      setHideHeaderBook(false)
      return
    }

    setHideHeaderBook(true)

    let cancelled = false
    let observer: IntersectionObserver | undefined
    const timers: number[] = []
    const intersecting = new Set<Element>()

    const bind = () => {
      const targets = document.querySelectorAll('[data-hide-header-book]')
      if (targets.length === 0 || cancelled) return false
      observer?.disconnect()
      intersecting.clear()
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) intersecting.add(entry.target)
            else intersecting.delete(entry.target)
          }
          if (!cancelled) setHideHeaderBook(intersecting.size > 0)
        },
        { threshold: [0, 0.15, 0.4], rootMargin: '-64px 0px 0px 0px' }
      )
      targets.forEach((target) => observer!.observe(target))
      return true
    }

    // Re-bind on retries so late-mounted markers (e.g. booking section) are included.
    bind()
    ;[50, 100, 200, 400, 800].forEach((ms) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) bind()
        }, ms)
      )
    })

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
      observer?.disconnect()
    }
  }, [pathname])

  const showHeaderBook = !onBookingOrAdmin && !hideHeaderBook

  const headerBookCta = showHeaderBook && (
    bookExternal ? (
      <a
        href={bookHref}
        target={bookTarget}
        rel={bookRel}
        className={`${bookNowHeaderMobileClassName} shrink-0`}
      >
        <BookNowLabel compact />
      </a>
    ) : (
      <Link href={bookHref} className={`${bookNowHeaderMobileClassName} shrink-0`}>
        <BookNowLabel compact />
      </Link>
    )
  )

  return (
    <header className="fixed top-0 w-full bg-cream/95 backdrop-blur-sm border-b border-blue-light/30 z-50 overflow-visible">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
        <div className="relative flex items-center justify-between gap-2 sm:gap-3 h-16 overflow-visible">
          {/* Mobile: logo + brand leftmost, vertically centered in the bar */}
          <Link
            href="/"
            className="relative z-[60] flex items-center gap-3 min-w-0 shrink md:hidden"
          >
            <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-cream ring-[3px] ring-cream shadow-[0_6px_18px_rgba(45,80,22,0.22)] aspect-square">
              <Image
                src="/logo_wellness.jpeg"
                alt=""
                fill
                sizes="44px"
                className="object-cover object-center"
                priority
              />
            </span>
            <span className="font-serif text-base font-medium text-primary truncate tracking-wide">
              Wellness Needles
            </span>
          </Link>

          {/* Tablet + desktop: logo + wordmark on the left */}
          <Link
            href="/"
            className="relative z-[60] hidden md:flex items-center gap-3 sm:gap-4 min-w-0 shrink"
          >
            <span className="relative shrink-0 translate-y-1.5 md:translate-y-2">
              <span className="relative block size-14 md:size-16 overflow-hidden rounded-full bg-cream ring-[3px] ring-cream shadow-[0_8px_24px_rgba(45,80,22,0.28)] aspect-square">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  fill
                  sizes="64px"
                  className="object-cover object-center"
                  priority
                />
              </span>
            </span>
            <span className="font-serif text-base sm:text-xl font-medium text-primary truncate tracking-wide">
              Wellness Needles
            </span>
          </Link>

          {/* Desktop Navigation + Book now */}
          <div className="hidden xl:flex items-center gap-x-5 2xl:gap-x-7 min-w-0 shrink">
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
            {showHeaderBook &&
              (bookExternal ? (
                <a
                  href={bookHref}
                  target={bookTarget}
                  rel={bookRel}
                  className={`${bookNowClassName} shrink-0`}
                >
                  <BookNowLabel />
                </a>
              ) : (
                <Link href={bookHref} className={`${bookNowClassName} shrink-0`}>
                  <BookNowLabel />
                </Link>
              ))}
          </div>

          {/* Mobile / tablet: Book now + menu */}
          <div className="xl:hidden ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {headerBookCta}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:text-secondary inline-flex items-center justify-center min-h-11 min-w-11 p-2.5 -mr-1"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
