import Link from 'next/link'
import Image from 'next/image'
import { Leaf } from 'lucide-react'
import { contactConfig } from '../lib/contact-config'
import ContactInfo from './ContactInfo'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-primary text-cream">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Leaf
          className="absolute right-4 top-8 h-6 w-6 md:h-8 md:w-8 text-cream/25 rotate-[28deg]"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute right-20 top-24 h-4 w-4 text-cream/20 -rotate-12 hidden sm:block"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute right-10 bottom-20 h-6 w-6 md:h-8 md:w-8 text-cream/25 rotate-[40deg]"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute left-8 bottom-12 h-4 w-4 text-cream/20 -rotate-45"
          strokeWidth={1.5}
        />
        <Leaf
          className="absolute left-[42%] top-12 h-4 w-4 text-cream/20 rotate-[15deg] hidden md:block"
          strokeWidth={1.5}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2.5 md:mb-4">
              <Image
                src="/logo_wellness.jpeg"
                alt="Wellness Needles Logo"
                width={36}
                height={36}
                className="size-8 md:size-10 rounded-full object-cover ring-2 ring-cream/30"
              />
              <span className="font-serif text-lg md:text-xl font-semibold">
                {contactConfig.businessInfo.name}
              </span>
            </div>
            <p className="text-sm md:text-base text-cream/80 mb-3 md:mb-6 max-w-md leading-snug">
              {contactConfig.businessInfo.tagline} {contactConfig.businessInfo.description}
            </p>
            <div className="flex">
              <a
                href={contactConfig.socialMedia.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cream/80 hover:text-cream transition-colors inline-flex items-center gap-2"
                aria-label="Follow us on Facebook"
              >
                <span className="text-sm">Follow us</span>
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 shrink-0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill="#1877F2"
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-4">Quick Links</h3>
            <ul className="space-y-0.5 md:space-y-1">
              <li>
                <Link href="/about" className="inline-block py-1.5 md:py-2 text-sm md:text-base text-cream/80 hover:text-cream transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/acupuncture" className="inline-block py-1.5 md:py-2 text-sm md:text-base text-cream/80 hover:text-cream transition-colors">
                  Why Acupuncture
                </Link>
              </li>
              <li>
                <Link href="/chinese-medicine" className="inline-block py-1.5 md:py-2 text-sm md:text-base text-cream/80 hover:text-cream transition-colors">
                  Chinese Medicine
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="inline-block py-1.5 md:py-2 text-sm md:text-base text-cream/80 hover:text-cream transition-colors">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-base md:text-lg mb-2 md:mb-4">Contact Info</h3>
            <ContactInfo variant="compact" className="text-cream/80" />
          </div>
        </div>

        <div className="border-t border-cream/20 mt-5 pt-4 md:mt-8 md:pt-8 text-center text-xs md:text-sm text-cream/60">
          <p className="leading-snug">
            &copy; {new Date().getFullYear()} Wellness Needles. All rights reserved.
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline mt-1 sm:mt-0">Privacy Policy | Terms of Service</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
