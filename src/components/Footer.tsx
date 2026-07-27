import Link from 'next/link'
import Image from 'next/image'
import { contactConfig } from '../lib/contact-config'
import ContactInfo from './ContactInfo'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-primary via-primary to-blue-primary/20 text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-cream/80 hover:text-cream transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/acupuncture" className="text-cream/80 hover:text-cream transition-colors">
                  Why Acupuncture
                </Link>
              </li>
              <li>
                <Link href="/chinese-medicine" className="text-cream/80 hover:text-cream transition-colors">
                  Chinese Medicine
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-cream/80 hover:text-cream transition-colors">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-cream/80 hover:text-cream transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
            <ContactInfo className="text-cream/80" />
            <div className="mt-6">
              <Link
                href="/bookings"
                className="bg-gradient-to-r from-gold to-blue-light text-primary px-6 py-2 rounded-full text-sm font-medium hover:from-gold/90 hover:to-blue-light/90 transition-all duration-200 inline-block shadow-sm"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/20 mt-8 pt-8 text-center text-cream/60">
          <p>&copy; 2025 Wellness Needles. All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}
