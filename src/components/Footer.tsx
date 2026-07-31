import Link from 'next/link'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { contactConfig } from '../lib/contact-config'
import ContactInfo from './ContactInfo'

export default function Footer() {
  return (
    <footer
      data-hide-sticky-book
      className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-primary/20 text-cream pb-[calc(5rem+env(safe-area-inset-bottom,0px))] xl:pb-0"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Leaf
          className="absolute right-4 top-10 h-8 w-8 text-cream/40 rotate-[28deg]"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute right-20 top-24 h-4 w-4 text-cream/40 -rotate-12 hidden sm:block"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute right-10 bottom-24 h-8 w-8 text-cream/50 rotate-[40deg]"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute left-8 bottom-14 h-4 w-4 text-cream/40 -rotate-45"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute left-[42%] top-12 h-4 w-4 text-cream/40 rotate-[15deg] hidden md:block"
          strokeWidth={1.5}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative">
                <Image
                  src="/logo_wellness.jpeg"
                  alt="Wellness Needles Logo"
                  width={40}
                  height={40}
                  className="rounded-full object-cover ring-2 ring-blue-light/30"
                />
              </div>
              <span className="font-serif text-xl font-semibold">
                {contactConfig.businessInfo.name}
              </span>
            </div>
            <p className="text-cream/80 mb-6 max-w-md">
              {contactConfig.businessInfo.tagline} {contactConfig.businessInfo.description}
            </p>
            <div className="flex space-x-4">
              <a 
                href={contactConfig.socialMedia.facebook.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-cream/80 hover:text-cream transition-colors flex items-center space-x-2"
                aria-label="Visit our Facebook page"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm">{contactConfig.socialMedia.facebook.displayName}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-1">
              <li>
                <Link href="/about" className="inline-block py-2 text-cream/80 hover:text-cream transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/acupuncture" className="inline-block py-2 text-cream/80 hover:text-cream transition-colors">
                  Why Acupuncture
                </Link>
              </li>
              <li>
                <Link href="/chinese-medicine" className="inline-block py-2 text-cream/80 hover:text-cream transition-colors">
                  Chinese Medicine
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="inline-block py-2 text-cream/80 hover:text-cream transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ContactInfo className="text-cream/80" />
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-cream/60">
          <p>&copy; {new Date().getFullYear()} Wellness Needles. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}
