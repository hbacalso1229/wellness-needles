import { Phone, MapPin, Mail } from 'lucide-react'

const celbridgeAddress = "56 The Orchard Oldtown Mill Celbridge Co.Kildare W23 K603"
const carlowAddress = "16 Kennedy St, Graigue, Carlow, R93 H2X8"

export const contactConfig = {
  address: {
    icon: MapPin,
    locations: [
      {
        id: 'celbridge',
        label: 'Celbridge',
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
        id: 'carlow',
        label: 'Carlow',
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
  calendly: {
    // Fallback / packages when a service-specific URL is missing.
    // Create as "Scheduled Booking" so the public URL ends with /scheduled-booking.
    schedulingUrl: 'https://calendly.com/hbacalso1229/scheduled-booking',
    // Initial Consultation — Calendly event duration must be 1 hr 45 min (105), 15-min start increments.
    initialConsultationUrl: 'https://calendly.com/hbacalso1229/initial-consultation',
    // Follow-up — Calendly event duration must be 1 hr 15 min (75), 15-min start increments.
    followUpUrl: 'https://calendly.com/hbacalso1229/follow-up',
    durations: {
      /** Minutes blocked on the calendar for Initial */
      initialMinutes: 105,
      /** Minutes blocked on the calendar for Follow-up */
      followUpMinutes: 75,
      /** Start-time grid (Calendly + legacy preferred-time picker) */
      slotIncrementMinutes: 15,
      initialLabel: '1 hour 45 minutes',
      followUpLabel: '1 hour 15 minutes',
    },
  },
  features: {
    contactFormEnabled: false,
    liveChatEnabled: false,
    mapIntegrationEnabled: true,
    treatmentPackagesEnabled: false,
    calendlyEnabled: true,
    bookingFormEnabled: false,
  }
} as const

export type ContactConfig = typeof contactConfig
