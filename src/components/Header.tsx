'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/acupuncture', label: 'Why Acupuncture' },
    { href: '/testimonials', label: 'Testimonials' },
    { href: '/chinese-medicine', label: 'Chinese Medicine' },
    // { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/bookings', label: 'Bookings' },
  ]

  return (
    <header className="fixed top-0 w-full bg-cream/95 backdrop-blur-sm border-b border-blue-light/30 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative">
              <Image
                src="/logo_wellness.jpeg"
                alt="Wellness Needles Logo"
                width={40}
                height={40}
                className="rounded-full object-cover ring-2 ring-blue-light/20"
              />
            </div>
            <span className="font-serif text-xl font-semibold text-primary">
              Wellness Needles
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-primary hover:text-secondary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex">
            <Link
              href="/bookings"
              className="bg-gradient-to-r from-primary to-blue-primary text-cream px-6 py-2 rounded-full text-sm font-medium hover:from-secondary hover:to-blue-primary/90 transition-all duration-200 shadow-sm"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:text-secondary"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div id="mobile-navigation" className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-cream border-t border-blue-light/30">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-primary hover:text-secondary hover:bg-blue-subtle/50 rounded-md transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/bookings"
                className="block px-3 py-2 mt-4 bg-gradient-to-r from-primary to-blue-primary text-cream text-center rounded-full font-medium hover:from-secondary hover:to-blue-primary/90 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Now
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
