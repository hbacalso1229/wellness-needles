import { Phone, MapPin, Mail } from 'lucide-react'

const celbridgeAddress = "56 The Orchard Oldtown Mill Celbridge Co.Kildare W23 K603"
const carlowAddress = "16 Kennedy St, Graigue, Carlow, R93 H2X8"

export const contactConfig = {
  address: {
    icon: MapPin,
    locations: [
      {
        full: celbridgeAddress,
        formatted: {
          street: "56 The Orchard Oldtown Mill",
          city: "Celbridge",
          county: "Co.Kildare",
          postcode: "W23 K603"
        },
        mapQuery: celbridgeAddress,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(celbridgeAddress)}`
      },
      {
        full: carlowAddress,
        formatted: {
          street: "16 Kennedy St",
          city: "Graigue",
          county: "Carlow",
          postcode: "R93 H2X8"
        },
        mapQuery: carlowAddress,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(carlowAddress)}`
      }
    ]
  },
  phone: {
    number: "0860543085",
    formatted: "086 054 3085",
    displayText: "+353 86 054 3085",
    href: "tel:+353860543085",
    icon: Phone
  },
  email: {
    address: "info@wellnessneedles.ie",
    href: "mailto:info@wellnessneedles.ie", 
    icon: Mail
  },
  socialMedia: {
    facebook: {
      url: "https://www.facebook.com/WellnessNeedles",
      displayName: "Facebook"
    }
  },
  businessInfo: {
    name: "Wellness Needles",
    tagline: "Experience the ancient healing art of acupuncture with modern wellness practices.",
    description: "Our treatments combine traditional Chinese medicine with contemporary therapeutic approaches for holistic healing and well-being.",
    hours: {
      monday: "9:00 AM - 7:00 PM",
      tuesday: "9:00 AM - 7:00 PM", 
      wednesday: "9:00 AM - 7:00 PM",
      thursday: "9:00 AM - 7:00 PM",
      friday: "9:00 AM - 7:00 PM",
      saturday: "10:00 AM - 4:00 PM",
      sunday: "Closed"
    },
    hoursDisplay: [
      "Monday - Friday: 9:00 AM - 7:00 PM",
      "Saturday: 10:00 AM - 4:00 PM", 
      "Sunday: Closed"
    ],
    emergencyNote: "Emergency appointments available by request"
  },
  features: {
    contactFormEnabled: false,
    liveChatEnabled: false,
    mapIntegrationEnabled: true,
    treatmentPackagesEnabled: false
  }
} as const

export type ContactConfig = typeof contactConfig
