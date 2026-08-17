'use client'

import { contactConfig } from '../lib/contact-config'
import { useSiteOverlay } from '@/lib/site-overlay'

interface ContactInfoProps {
  variant?: 'default' | 'compact' | 'inline'
  className?: string
  showAddress?: boolean
  showPhone?: boolean
  showEmail?: boolean
}

export default function ContactInfo({ 
  variant = 'default',
  className = '',
  showAddress = true,
  showPhone = true,
  showEmail = true
}: ContactInfoProps) {
  const { overlayEnabled, site } = useSiteOverlay()
  const phoneHref = overlayEnabled ? site.phone.href : contactConfig.phone.href
  const phoneText = overlayEnabled ? site.phone.displayText : contactConfig.phone.displayText
  const emailHref = overlayEnabled ? site.email.href : contactConfig.email.href
  const emailText = overlayEnabled ? site.email.address : contactConfig.email.address
  const locations = overlayEnabled
    ? site.locations.map((loc) => ({
        id: loc.id,
        label: loc.label,
        full: loc.full,
        directionsUrl: loc.directionsUrl,
        formatted: {
          street: loc.street,
          city: loc.city,
          county: loc.county,
          postcode: loc.postcode,
        },
      }))
    : contactConfig.address.locations
  const baseStyles = variant === 'inline' 
    ? 'flex items-center space-x-6' 
    : 'space-y-3'
  
  const itemStyles = variant === 'compact'
    ? 'flex items-center space-x-2 text-sm'
    : 'flex items-center space-x-3'

  const addressItemStyles = variant === 'compact'
    ? 'flex items-center space-x-2 text-sm'
    : 'flex items-start space-x-3'

  return (
    <div className={`${baseStyles} ${className}`}>
      {showPhone && (
        <div className={itemStyles}>
          <contactConfig.phone.icon className="w-4 h-4 text-current opacity-80" />
          <a 
            href={phoneHref}
            className="hover:opacity-100 transition-opacity"
          >
            {phoneText}
          </a>
        </div>
      )}
      
      {showEmail && (
        <div className={itemStyles}>
          <contactConfig.email.icon className="w-4 h-4 text-current opacity-80" />
          <a 
            href={emailHref}
            className="hover:opacity-100 transition-opacity"
          >
            {emailText}
          </a>
        </div>
      )}
      
      {showAddress && (
        <div className={addressItemStyles}>
          <contactConfig.address.icon className="w-4 h-4 text-current opacity-80 mt-1 flex-shrink-0" />
          {variant === 'inline' || variant === 'compact' ? (
            <div className="text-current opacity-80 space-y-1">
              {locations.map((location) => (
                <a
                  key={location.full}
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-100 transition-opacity"
                >
                  {location.formatted.street}, {location.formatted.city}, {location.formatted.county} {location.formatted.postcode}
                </a>
              ))}
            </div>
          ) : (
            <div className="text-current opacity-80 space-y-3">
              {locations.map((location) => (
                <a
                  key={location.full}
                  href={location.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-100 transition-opacity"
                >
                  <div>{location.formatted.street}</div>
                  <div>{location.formatted.city}</div>
                  <div>{location.formatted.county} {location.formatted.postcode}</div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Export individual contact items for more granular use
export function PhoneContact({ className = '', linkClassName = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <contactConfig.phone.icon className="w-4 h-4" />
      <a 
        href={contactConfig.phone.href}
        className={`hover:opacity-80 transition-opacity ${linkClassName}`}
      >
        {contactConfig.phone.displayText}
      </a>
    </div>
  )
}

export function EmailContact({ className = '', linkClassName = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <contactConfig.email.icon className="w-4 h-4" />
      <a 
        href={contactConfig.email.href}
        className={`hover:opacity-80 transition-opacity ${linkClassName}`}
      >
        {contactConfig.email.address}
      </a>
    </div>
  )
}

export function AddressContact({ className = '', compact = false }) {
  return (
    <div className={`flex items-start space-x-2 ${className}`}>
      <contactConfig.address.icon className="w-4 h-4 mt-1 flex-shrink-0" />
      {compact ? (
        <div className="space-y-1">
          {contactConfig.address.locations.map((location) => (
            <a
              key={location.full}
              href={location.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              {location.formatted.street}, {location.formatted.city}, {location.formatted.county} {location.formatted.postcode}
            </a>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {contactConfig.address.locations.map((location) => (
            <a
              key={location.full}
              href={location.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <div>{location.formatted.street}</div>
              <div>{location.formatted.city}</div>
              <div>{location.formatted.county} {location.formatted.postcode}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
