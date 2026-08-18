import { contactConfig } from '@/lib/contact-config'

export type BookingCatalogService = {
  id: string
  name: string
  duration: string
  price: string
  originalPrice?: string
  description: string
  savings?: string
}

export type BookingCatalogAddOn = {
  id: string
  name: string
  price: string
  originalPrice?: string
  description: string
}

const { initialLabel, followUpLabel } = contactConfig.calendly.durations

/** In-clinic. Must stay below home-visit prices for the same service. */
export const IN_CLINIC_PRICES = {
  initial: '€75',
  followUp: '€60',
  package5: '€270',
  package10: '€520',
  cupping: '€20',
} as const

/** Home visit. Must stay above in-clinic prices for the same service. */
export const HOME_VISIT_PRICES = {
  initial: '€120',
  followUp: '€90',
  package5: '€350',
  package10: '€690',
  cupping: '€25',
} as const

export const IN_CLINIC_ORIGINAL_PRICES = {
  initial: '€150',
  followUp: '€120',
} as const

export const HOME_VISIT_ORIGINAL_PRICES = {
  initial: '€250',
  followUp: '€180',
} as const

export const inClinicServices: BookingCatalogService[] = [
  {
    id: 'initial-consultation',
    name: 'Initial Consultation & First Treatment',
    duration: initialLabel,
    price: IN_CLINIC_PRICES.initial,
    originalPrice: IN_CLINIC_ORIGINAL_PRICES.initial,
    description:
      'Comprehensive health assessment with personalized treatment plan and first acupuncture session',
  },
  {
    id: 'follow-up',
    name: 'Follow-up Sessions',
    duration: followUpLabel,
    price: IN_CLINIC_PRICES.followUp,
    originalPrice: IN_CLINIC_ORIGINAL_PRICES.followUp,
    description: 'Tailored acupuncture treatment based on your progress and ongoing needs',
  },
  {
    id: 'package-5',
    name: 'Treatment Package (5 sessions)',
    duration: 'Multiple visits',
    price: IN_CLINIC_PRICES.package5,
    description: 'Save €30 with our 5-session package (Valid for 6 months – non-transferable)',
    savings: 'Save €30',
  },
  {
    id: 'package-10',
    name: 'Treatment Package (10 sessions)',
    duration: 'Multiple visits',
    price: IN_CLINIC_PRICES.package10,
    description: 'Save €80 with our 10-session package (Valid for 6 months – non-transferable)',
    savings: 'Save €80',
  },
]

export const homeVisitServices: BookingCatalogService[] = [
  {
    id: 'home-initial-consultation',
    name: 'Initial Consultation & First Treatment',
    duration: initialLabel,
    price: HOME_VISIT_PRICES.initial,
    originalPrice: HOME_VISIT_ORIGINAL_PRICES.initial,
    description:
      'Comprehensive health assessment with personalized treatment plan and first acupuncture session at your home',
  },
  {
    id: 'home-follow-up',
    name: 'Follow-up Sessions',
    duration: followUpLabel,
    price: HOME_VISIT_PRICES.followUp,
    originalPrice: HOME_VISIT_ORIGINAL_PRICES.followUp,
    description: 'Tailored acupuncture treatment in the comfort of your home',
  },
  {
    id: 'home-package-5',
    name: 'Treatment Package (5 sessions)',
    duration: 'Multiple visits',
    price: HOME_VISIT_PRICES.package5,
    description: 'Save €25 with our 5-session home visit package (Valid for 6 months)',
    savings: 'Save €25',
  },
  {
    id: 'home-package-10',
    name: 'Treatment Package (10 sessions)',
    duration: 'Multiple visits',
    price: HOME_VISIT_PRICES.package10,
    description: 'Save €60 with our 10-session home visit package (Valid for 6 months)',
    savings: 'Save €60',
  },
]

export const inClinicAddOns: BookingCatalogAddOn[] = [
  {
    id: 'cupping',
    name: 'Cupping Therapy',
    price: IN_CLINIC_PRICES.cupping,
    description: 'Therapeutic cupping treatment as an add-on to your acupuncture session',
  },
  {
    id: 'moxibustion',
    name: 'Moxibustion',
    price: 'Free (if required)',
    description:
      'Traditional warming therapy using dried mugwort to stimulate acupuncture points',
  },
]

export const homeVisitAddOns: BookingCatalogAddOn[] = [
  {
    id: 'home-cupping',
    name: 'Cupping Therapy',
    price: HOME_VISIT_PRICES.cupping,
    description: 'Therapeutic cupping treatment as an add-on to your home acupuncture session',
  },
  {
    id: 'moxibustion',
    name: 'Moxibustion',
    price: 'Free (if required)',
    description:
      'Traditional warming therapy using dried mugwort to stimulate acupuncture points',
  },
]
