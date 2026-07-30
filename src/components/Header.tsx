'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePathname } from 'next/navigation'
import { ArrowRight, Calendar, Menu, X } from 'lucide-react'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

function BookNowLabel() {
  return (
    <>
      <Calendar className="w-4 h-4 shrink-0" aria-hidden />
      Book now
      <ArrowRight className="w-4 h-4 shrink-0" aria-hidden />
    </>
  )
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [inlineBookCtaInView, setInlineBookCtaInView] = useState(false)
  const [fabMounted, setFabMounted] = useState(false)
  const pathname = usePathname()
  const { href: bookHref, isExternal: bookExternal, target: bookTarget, rel: bookRel } =
    useBookingCtaHref()
  const inlineBookHideTimerRef = useRef<number | null>(null)
  const heroShowTimerRef = useRef<number | null>(null)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/acupuncture', label: 'Why Acupuncture' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/chinese-medicine', label: 'Chinese Medicine' },
    // { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/bookings', label: 'Bookings' },
    { href: '/admin', label: 'Admin' },
  ]

  const bookNowClassName =
    'inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-5 py-2 rounded-full text-sm font-bold normal-case shadow-md shadow-primary/20 card-emboss whitespace-nowrap transition-all duration-200 hover:from-[#f0d45c] hover:to-[#c9a52f] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25'
  const bookNowMobileClassName =
    'inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 mt-4 bg-gradient-to-b from-[#e8c84a] to-gold text-primary text-center rounded-full font-bold normal-case shadow-md shadow-primary/20 card-emboss transition-all duration-200 hover:from-[#f0d45c] hover:to-[#c9a52f] hover:-translate-y-0.5'
  const bookNowStickyClassName =
    'sticky-book-fab-btn inline-flex items-center justify-center gap-2 bg-gradient-to-b from-[#e8c84a] to-gold text-primary px-7 py-2.5 rounded-full text-sm font-bold normal-case shadow-lg shadow-primary/25 whitespace-nowrap hover:from-[#f0d45c] hover:to-[#c9a52f]'

  const onBookingOrAdmin =
    pathname.startsWith('/bookings') || pathname.startsWith('/admin')
  // Keep FAB at the viewport bottom, including over the footer (booking CTA always available).
  const showStickyBookNow =
    !isMenuOpen && !onBookingOrAdmin && scrolledPastHero && !inlineBookCtaInView

  useEffect(() => {
    setFabMounted(true)
  }, [])

  useEffect(() => {
    setInlineBookCtaInView(false)
    // Hide sticky until we confirm the page hero has scrolled away (avoids double CTAs).
    setScrolledPastHero(false)
    if (inlineBookHideTimerRef.current) {
      window.clearTimeout(inlineBookHideTimerRef.current)
      inlineBookHideTimerRef.current = null
    }
    if (heroShowTimerRef.current) {
      window.clearTimeout(heroShowTimerRef.current)
      heroShowTimerRef.current = null
    }

    let cancelled = false
    let heroObserver: IntersectionObserver | undefined
    const retryTimers: number[] = []

    const getPageHero = () => document.querySelector<HTMLElement>('[data-page-hero]')
    const isHeroDisplayed = (hero: HTMLElement) =>
      window.getComputedStyle(hero).display !== 'none'

    /** Hero still overlaps the viewport — keep sticky Book now hidden. */
    const isHeroOnScreen = (hero: HTMLElement) => {
      const rect = hero.getBoundingClientRect()
      return rect.bottom > 0 && rect.top < window.innerHeight
    }

    const setPastHeroSmooth = (past: boolean) => {
      if (cancelled) return
      if (heroShowTimerRef.current) {
        window.clearTimeout(heroShowTimerRef.current)
        heroShowTimerRef.current = null
      }
      if (past) {
        heroShowTimerRef.current = window.setTimeout(() => {
          if (!cancelled) setScrolledPastHero(true)
          heroShowTimerRef.current = null
        }, 120)
      } else {
        setScrolledPastHero(false)
      }
    }

    const syncFromHeroRect = () => {
      if (cancelled) return
      const hero = getPageHero()
      if (!hero || !isHeroDisplayed(hero)) {
        // Don't show sticky while we haven't bound a hero yet (App Router timing).
        setScrolledPastHero(false)
        return
      }
      setPastHeroSmooth(!isHeroOnScreen(hero))
    }

    const bindHeroObserver = (hero: HTMLElement) => {
      heroObserver?.disconnect()
      heroObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry || cancelled) return
          // Fully out of view only — full-viewport heroes still count as intersecting.
          setPastHeroSmooth(!entry.isIntersecting)
        },
        { threshold: [0, 0.001, 0.01] }
      )
      heroObserver.observe(hero)
      setPastHeroSmooth(!isHeroOnScreen(hero))
    }

    const tryBindHero = (): boolean => {
      const hero = getPageHero()
      if (!hero || !isHeroDisplayed(hero)) return false
      bindHeroObserver(hero)
      return true
    }

    // App Router: page content (and hero) may mount after this effect runs.
    if (!tryBindHero()) {
      ;[50, 100, 200, 400, 800].forEach((ms) => {
        retryTimers.push(
          window.setTimeout(() => {
            if (!cancelled) tryBindHero()
          }, ms)
        )
      })
    }

    const main = document.querySelector('main')
    const mutationObserver =
      main &&
      new MutationObserver(() => {
        if (tryBindHero()) mutationObserver.disconnect()
      })
    if (main && mutationObserver) {
      mutationObserver.observe(main, { childList: true, subtree: true })
    }

    const rafId = window.requestAnimationFrame(syncFromHeroRect)
    const timeoutId = window.setTimeout(syncFromHeroRect, 100)
    window.addEventListener('pageshow', syncFromHeroRect)
    window.addEventListener('resize', syncFromHeroRect)
    window.addEventListener('scroll', syncFromHeroRect, { passive: true })

    // Hide floating Book now when Explore card or sticky sidebars are on screen.
    const inlineBookTargets = document.querySelectorAll('[data-hide-sticky-book]')
    const inlineBookInView = new Set<Element>()
    let inlineBookObserver: IntersectionObserver | undefined

    const setInlineInViewSmooth = (inView: boolean) => {
      if (inlineBookHideTimerRef.current) {
        window.clearTimeout(inlineBookHideTimerRef.current)
        inlineBookHideTimerRef.current = null
      }
      if (inView) {
        setInlineBookCtaInView(true)
      } else {
        inlineBookHideTimerRef.current = window.setTimeout(() => {
          setInlineBookCtaInView(false)
          inlineBookHideTimerRef.current = null
        }, 220)
      }
    }

    if (inlineBookTargets.length > 0) {
      inlineBookObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const ratio = entry.intersectionRatio
            if (ratio >= 0.28) inlineBookInView.add(entry.target)
            else if (ratio <= 0.08) inlineBookInView.delete(entry.target)
          }
          setInlineInViewSmooth(inlineBookInView.size > 0)
        },
        {
          threshold: [0, 0.08, 0.28, 1],
          rootMargin: '0px 0px -10% 0px',
        }
      )
      inlineBookTargets.forEach((el) => inlineBookObserver?.observe(el))
    }

    return () => {
      cancelled = true
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(timeoutId)
      retryTimers.forEach((id) => window.clearTimeout(id))
      window.removeEventListener('pageshow', syncFromHeroRect)
      window.removeEventListener('resize', syncFromHeroRect)
      window.removeEventListener('scroll', syncFromHeroRect)
      if (inlineBookHideTimerRef.current) {
        window.clearTimeout(inlineBookHideTimerRef.current)
      }
      if (heroShowTimerRef.current) {
        window.clearTimeout(heroShowTimerRef.current)
      }
      heroObserver?.disconnect()
      inlineBookObserver?.disconnect()
      mutationObserver?.disconnect()
    }
  }, [pathname])

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

  return (
    <>
      <header className="fixed top-0 w-full bg-cream/95 backdrop-blur-sm border-b border-blue-light/30 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 min-w-0 shrink">
              <div className="relative shrink-0">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-cover ring-2 ring-blue-light/20"
                />
              </div>
              <span className="font-serif text-lg sm:text-xl font-semibold text-primary truncate">
                Wellness Needles
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden xl:flex items-center gap-x-4 2xl:gap-x-6 min-w-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-primary hover:text-secondary transition-colors duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden xl:flex shrink-0">
              {bookExternal ? (
                <a
                  href={bookHref}
                  target={bookTarget}
                  rel={bookRel}
                  className={bookNowClassName}
                >
                  <BookNowLabel />
                </a>
              ) : (
                <Link href={bookHref} className={bookNowClassName}>
                  <BookNowLabel />
                </Link>
              )}
            </div>

            {/* Mobile / tablet menu button */}
            <div className="xl:hidden shrink-0">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-primary hover:text-secondary p-1"
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
                    className="block px-3 py-2.5 text-base font-medium text-primary hover:text-secondary hover:bg-accent/10 rounded-md transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                {bookExternal ? (
                  <a
                    href={bookHref}
                    target={bookTarget}
                    rel={bookRel}
                    className={bookNowMobileClassName}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookNowLabel />
                  </a>
                ) : (
                  <Link
                    href={bookHref}
                    className={bookNowMobileClassName}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BookNowLabel />
                  </Link>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {fabMounted &&
        createPortal(
          <div
            className="sticky-book-fab-root xl:hidden"
            aria-hidden={!showStickyBookNow}
          >
            <div
              className={`sticky-book-fab ${
                showStickyBookNow ? 'sticky-book-fab--visible' : 'sticky-book-fab--hidden'
              }`}
            >
              {bookExternal ? (
                <a
                  href={bookHref}
                  target={bookTarget}
                  rel={bookRel}
                  className={bookNowStickyClassName}
                  tabIndex={showStickyBookNow ? 0 : -1}
                >
                  <BookNowLabel />
                </a>
              ) : (
                <Link
                  href={bookHref}
                  className={bookNowStickyClassName}
                  tabIndex={showStickyBookNow ? 0 : -1}
                >
                  <BookNowLabel />
                </Link>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
