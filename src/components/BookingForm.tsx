'use client'

import { useEffect, useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Building2, Calendar, CheckCircle, Home, Info, MapPin, User } from 'lucide-react'
import { contactConfig } from '@/lib/contact-config'
import BookingStepper, { type BookingStepperStep } from '@/components/BookingStepper'
import Toast from '@/components/Toast'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import { isBookingEmailConfigured, readBookingFeatures, isValidWeb3FormsAccessKey } from '@/lib/booking-features'
import { sendBookingRequestEmail } from '@/lib/send-booking-email'
import { saveBookingThankYouSummary } from '@/lib/booking-thank-you'
import {
  OptionalAddOns,
  ClinicLocationCards,
  ServiceSelectionCards,
  TravelPolicyNotice,
  BookingDatePicker,
  TimeRangeCards,
  findTimeRange,
  formatTimeRangeLabel,
  isPastTimeRange,
  isClosedBookingDate,
  nextOpenBookingDate,
  defaultPreferredDate,
  defaultPreferredTime,
} from '@/features'

/** Web3Forms free-plan hCaptcha sitekey (enable hCaptcha in the Web3Forms dashboard). */
const WEB3FORMS_HCAPTCHA_SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'

/** hCaptcha refuses localhost and renders a broken warning inside the iframe. */
function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

type BookingService = {
  id: string
  name: string
  duration: string
  price: string
  description: string
  savings?: string
}

const STEPS: BookingStepperStep[] = [
  { id: 'location', title: 'Location' },
  { id: 'service', title: 'Service' },
  { id: 'schedule', title: 'Date & Time' },
  { id: 'details', title: 'Your details' },
]

function todayDateInputValue(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** YYYY-MM-DD string compare — native mobile pickers often ignore `max`. */
function isFutureDateInputValue(dateStr: string): boolean {
  return Boolean(dateStr) && dateStr > todayDateInputValue()
}

const inClinicServices: BookingService[] = [
  {
    id: 'initial-consultation',
    name: 'Initial Consultation & First Treatment',
    duration: contactConfig.calendly.durations.initialLabel,
    price: '€75',
    description:
      'Comprehensive health assessment with personalized treatment plan and first acupuncture session',
  },
  {
    id: 'follow-up',
    name: 'Follow-up Sessions',
    duration: contactConfig.calendly.durations.followUpLabel,
    price: '€60',
    description: 'Tailored acupuncture treatment based on your progress and ongoing needs',
  },
  {
    id: 'package-5',
    name: 'Treatment Package (5 sessions)',
    duration: 'Multiple visits',
    price: '€270',
    description: 'Save €30 with our 5-session package (Valid for 6 months – non-transferable)',
    savings: 'Save €30',
  },
  {
    id: 'package-10',
    name: 'Treatment Package (10 sessions)',
    duration: 'Multiple visits',
    price: '€520',
    description: 'Save €80 with our 10-session package (Valid for 6 months – non-transferable)',
    savings: 'Save €80',
  },
]

const homeVisitServices: BookingService[] = [
  {
    id: 'home-initial-consultation',
    name: 'Initial Consultation & First Treatment',
    duration: contactConfig.calendly.durations.initialLabel,
    price: '€90',
    description:
      'Comprehensive health assessment with personalized treatment plan and first acupuncture session at your home',
  },
  {
    id: 'home-follow-up',
    name: 'Follow-up Sessions',
    duration: contactConfig.calendly.durations.followUpLabel,
    price: '€75',
    description: 'Tailored acupuncture treatment in the comfort of your home',
  },
  {
    id: 'home-package-5',
    name: 'Treatment Package (5 sessions)',
    duration: 'Multiple visits',
    price: '€350',
    description: 'Save €25 with our 5-session home visit package (Valid for 6 months)',
    savings: 'Save €25',
  },
  {
    id: 'home-package-10',
    name: 'Treatment Package (10 sessions)',
    duration: 'Multiple visits',
    price: '€690',
    description: 'Save €60 with our 10-session home visit package (Valid for 6 months)',
    savings: 'Save €60',
  },
]

const inClinicAddOns = [
  {
    id: 'cupping',
    name: 'Cupping Therapy',
    price: '€20',
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

const homeVisitAddOns = [
  {
    id: 'home-cupping',
    name: 'Cupping Therapy',
    price: '€25',
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

const inputClassName =
  'w-full min-w-0 max-w-full box-border px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white'

const fieldErrorClassName =
  'w-full min-w-0 max-w-full box-border px-4 py-3 border-2 border-red-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-red-50/40'

function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden="true">
      *
    </span>
  )
}

/** Inline field validation copy (all breakpoints). */
function FieldInlineError({
  id,
  message,
}: {
  id?: string
  message?: string
}) {
  if (!message) return null
  return (
    <p
      id={id}
      className="mt-2 max-w-full break-words text-sm text-red-600"
      role="alert"
    >
      {message}
    </p>
  )
}

type FieldErrorKey =
  | 'service'
  | 'location'
  | 'date'
  | 'time'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'dateOfBirth'

const FIELD_FOCUS_IDS: Partial<Record<FieldErrorKey, string>> = {
  service: 'booking-service',
  location: 'booking-location',
  date: 'booking-date',
  time: 'booking-time',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  dateOfBirth: 'dateOfBirth',
}

/** First control to focus when entering each booking step. */
const STEP_ENTRY_FOCUS_IDS = [
  'booking-location',
  'booking-service',
  'booking-date',
  'firstName',
] as const

function focusFirstInvalidField(fields: FieldErrorKey[]) {
  const id = FIELD_FOCUS_IDS[fields[0]]
  if (!id) return
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: true })
    }
  })
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/** Accepts IE national (0…) or international (+353 / 00353), with optional spaces/dashes. */
function isValidIrishPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-().]/g, '')

  // +353XXXXXXXXX or 00353XXXXXXXXX (9 digits after country code)
  if (/^(?:\+353|00353)\d{9}$/.test(cleaned)) return true
  // National: 0 + 9 digits (mobiles 08x… and landlines)
  if (/^0\d{9}$/.test(cleaned)) return true

  return false
}

/**
 * Strip to Irish subscriber digits (9 digits, no trunk 0 / country code).
 * Always strip country code when the value is international (`+…` / `00353…`)
 * or a long pasted `353…` — otherwise short stored values like `+353 86`
 * round-trip as `35386` and corrupt the local input on backspace.
 */
function irishSubscriberDigits(raw: string): string {
  const hasPlus = raw.trimStart().startsWith('+')
  let digits = raw.replace(/\D/g, '')

  if (digits.startsWith('00353')) {
    digits = digits.slice(5)
  } else if (digits.startsWith('353') && (hasPlus || digits.length > 9)) {
    digits = digits.slice(3)
  }

  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}

/** Live format for the local input beside +353: `86 054 3085`. */
function formatIrishLocalPhoneInput(raw: string): string {
  const local = irishSubscriberDigits(raw)
  const groups = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(
    (g) => g.length > 0
  )
  return groups.join(' ')
}

/** Compose stored/submit value: `+353 86 054 3085` (empty if no digits). */
function toIrishE164(raw: string): string {
  const local = irishSubscriberDigits(raw)
  if (!local) return ''
  const groups = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(
    (g) => g.length > 0
  )
  return `+353 ${groups.join(' ')}`
}

/** Local digits for the visible input from stored `+353…` / national value. */
function irishLocalFromStored(stored: string): string {
  return formatIrishLocalPhoneInput(stored)
}

function IrishFlagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 9 6"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="3" height="6" fill="#169B62" />
      <rect x="3" width="3" height="6" fill="#FFFFFF" />
      <rect x="6" width="3" height="6" fill="#FF883E" />
    </svg>
  )
}

export default function BookingForm() {
  const { features } = useBookingFeatures()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{
    message: string | string[]
    variant: 'success' | 'error'
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Set<FieldErrorKey>>(new Set())
  const [fieldErrorMessages, setFieldErrorMessages] = useState<
    Partial<Record<FieldErrorKey, string>>
  >({})
  const [activeTab, setActiveTab] = useState('in-clinic')
  const [selectedLocation, setSelectedLocation] = useState('celbridge')
  const [selectedService, setSelectedService] = useState('initial-consultation')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(defaultPreferredDate)
  const [selectedTime, setSelectedTime] = useState(() =>
    defaultPreferredTime(defaultPreferredDate())
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    message: '',
  })
  const [hCaptchaToken, setHCaptchaToken] = useState('')
  const [hCaptchaReady, setHCaptchaReady] = useState(false)
  const [hCaptchaError, setHCaptchaError] = useState('')
  const [isLocalHost, setIsLocalHost] = useState(false)
  const hCaptchaRef = useRef<HCaptcha>(null)

  useEffect(() => {
    setIsLocalHost(isLocalDevHost())
  }, [])

  // Never keep a Saturday in state (clinic closed) — snap to the next open day.
  useEffect(() => {
    if (!isClosedBookingDate(selectedDate)) return
    const openDate = nextOpenBookingDate(selectedDate)
    setSelectedDate(openDate)
    setSelectedTime(defaultPreferredTime(openDate))
    setToast({
      message: 'We are closed on Saturdays. Please choose Sunday–Friday.',
      variant: 'error',
    })
  }, [selectedDate])

  const showSecurityCheck = isBookingEmailConfigured(features) && !isLocalHost
  const showLocalSecurityNotice = isBookingEmailConfigured(features) && isLocalHost
  const clinicLocations = contactConfig.address.locations
  const selectedLocationDetails = clinicLocations.find((l) => l.id === selectedLocation)

  const resetHCaptcha = () => {
    setHCaptchaToken('')
    setHCaptchaReady(false)
    setHCaptchaError('')
    hCaptchaRef.current?.resetCaptcha()
  }

  const services = (activeTab === 'in-clinic' ? inClinicServices : homeVisitServices).filter(
    (service) =>
      features.treatmentPackagesEnabled || !service.id.includes('package')
  )
  const addOns = activeTab === 'in-clinic' ? inClinicAddOns : homeVisitAddOns

  const hasFieldError = (key: FieldErrorKey) => fieldErrors.has(key)
  const fieldErrorMessage = (key: FieldErrorKey) => fieldErrorMessages[key]

  const clearFieldError = (key: FieldErrorKey) => {
    setFieldErrors((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
    setFieldErrorMessages((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const clearAllFieldErrors = () => {
    setFieldErrors(new Set())
    setFieldErrorMessages({})
  }

  const reportValidationErrors = (error: {
    messages: string[]
    fields: FieldErrorKey[]
  }) => {
    setFieldErrors(new Set(error.fields))
    const byField: Partial<Record<FieldErrorKey, string>> = {}
    error.fields.forEach((field, index) => {
      byField[field] = error.messages[index]
    })
    setFieldErrorMessages(byField)
    focusFirstInvalidField(error.fields)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSelectedService(
      tab === 'call-out' ? 'home-initial-consultation' : 'initial-consultation'
    )
    setSelectedAddOns([])
    clearFieldError('service')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name
    const value =
      name === 'phone' ? toIrishE164(e.target.value) : e.target.value

    setFormData({
      ...formData,
      [name]: value,
    })
    if (
      name === 'firstName' ||
      name === 'lastName' ||
      name === 'email' ||
      name === 'phone'
    ) {
      clearFieldError(name)
    }
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    )
  }

  const validateStep = (
    step: number
  ): { messages: string[]; fields: FieldErrorKey[] } | null => {
    if (step === 0 && !selectedLocation) {
      return {
        messages: ['Please select a location to continue.'],
        fields: ['location'],
      }
    }
    if (step === 1 && !selectedService) {
      return {
        messages: ['Please select a service to continue.'],
        fields: ['service'],
      }
    }
    if (step === 2) {
      const fields: FieldErrorKey[] = []
      const messages: string[] = []
      if (!selectedDate) {
        fields.push('date')
        messages.push('Please choose a preferred date.')
      } else if (isClosedBookingDate(selectedDate)) {
        fields.push('date')
        messages.push('We are closed on Saturdays. Please choose Sunday–Friday.')
      }
      if (!selectedTime) {
        fields.push('time')
        messages.push('Please choose a preferred time range.')
      } else if (selectedDate && isPastTimeRange(selectedDate, selectedTime)) {
        fields.push('time')
        messages.push('That time range has already passed. Please choose a later range.')
      }
      if (fields.length > 0) {
        return { messages, fields }
      }
    }
    if (step === 3) {
      const fields: FieldErrorKey[] = []
      const messages: string[] = []

      if (!formData.firstName.trim()) {
        fields.push('firstName')
        messages.push('Please enter your first name.')
      }
      if (!formData.lastName.trim()) {
        fields.push('lastName')
        messages.push('Please enter your last name.')
      }
      if (!formData.email.trim()) {
        fields.push('email')
        messages.push('Please enter your email address.')
      } else if (!isValidEmail(formData.email)) {
        fields.push('email')
        messages.push('Please enter a valid email address.')
      }
      if (!formData.phone.trim()) {
        fields.push('phone')
        messages.push('Please enter your mobile number.')
      } else if (!isValidIrishPhone(formData.phone)) {
        fields.push('phone')
        messages.push(
          'Please enter a valid Irish mobile number (e.g. 86 054 3085).'
        )
      }
      if (!formData.dateOfBirth.trim()) {
        fields.push('dateOfBirth')
        messages.push('Please enter your date of birth.')
      } else if (isFutureDateInputValue(formData.dateOfBirth)) {
        fields.push('dateOfBirth')
        messages.push('Date of birth cannot be in the future.')
      }

      if (fields.length > 0) {
        return { messages, fields }
      }
    }
    return null
  }

  const handleNext = () => {
    // Belt-and-braces: never advance with a closed day still selected.
    if (currentStep === 2 && isClosedBookingDate(selectedDate)) {
      const openDate = nextOpenBookingDate(selectedDate)
      setSelectedDate(openDate)
      setSelectedTime(defaultPreferredTime(openDate))
      reportValidationErrors({
        fields: ['date'],
        messages: ['We are closed on Saturdays. Please choose Sunday–Friday.'],
      })
      return
    }
    const error = validateStep(currentStep)
    if (error) {
      reportValidationErrors(error)
      return
    }
    clearAllFieldErrors()
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    clearAllFieldErrors()
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const resetForm = () => {
    setCurrentStep(0)
    clearAllFieldErrors()
    setActiveTab('in-clinic')
    setSelectedLocation('celbridge')
    setSelectedService('initial-consultation')
    setSelectedAddOns([])
    setSelectedDate(defaultPreferredDate())
    setSelectedTime(defaultPreferredTime(defaultPreferredDate()))
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      message: '',
    })
    resetHCaptcha()
  }

  const handleSubmit = async () => {
    const error = validateStep(3)
    if (error) {
      reportValidationErrors(error)
      return
    }

    const selectedServiceDetails = services.find((s) => s.id === selectedService)
    const selectedAddOnLabels = selectedAddOns
      .map((id) => addOns.find((a) => a.id === id)?.name)
      .filter((name): name is string => Boolean(name))

    const payload = {
      serviceType: activeTab === 'call-out' ? 'Home Visit' : 'In Clinic',
      location: selectedLocation,
      locationLabel: selectedLocationDetails
        ? `${selectedLocationDetails.label} — ${selectedLocationDetails.full}`
        : undefined,
      service: selectedService,
      serviceLabel: selectedServiceDetails?.name,
      addOns: selectedAddOns,
      addOnLabels: selectedAddOnLabels,
      practitioner: 'arkinth-garcia',
      date: selectedDate,
      time: (() => {
        const range = findTimeRange(selectedTime)
        return range ? formatTimeRangeLabel(range) : selectedTime
      })(),
      ...formData,
    }

    clearAllFieldErrors()
    console.log('Booking submitted:', payload)

    // E2E-only: force apologetic page without live Web3Forms / captcha.
    if (
      process.env.NEXT_PUBLIC_E2E === 'true' &&
      typeof window !== 'undefined' &&
      sessionStorage.getItem('e2eForceBookingSubmitFail') === '1'
    ) {
      sessionStorage.removeItem('e2eForceBookingSubmitFail')
      const unableUrl = new URL(
        '/bookings/unable-to-process/',
        window.location.origin
      ).href
      window.location.replace(unableUrl)
      return
    }

    const goToUnableToProcess = (technicalDetail: string) => {
      console.error('[booking submit]', technicalDetail)
      setToast(null)
      const unableUrl = new URL(
        '/bookings/unable-to-process/',
        window.location.origin
      ).href
      window.location.replace(unableUrl)
    }

    let confirmationEmailQueued = false

    if (features.bookingEmailEnabled) {
      // Re-read so Admin saves / env fallback are always current at submit time
      const latestFeatures = readBookingFeatures()
      if (!isBookingEmailConfigured(latestFeatures)) {
        goToUnableToProcess(
          latestFeatures.bookingEmailAccessKey &&
            !isValidWeb3FormsAccessKey(latestFeatures.bookingEmailAccessKey)
            ? 'Web3Forms access key must be a valid UUID. Check .env.local or Admin → Booking email setup, then restart the dev server.'
            : 'Booking email is enabled but not configured. Add the Web3Forms access key in Admin (dev) or set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.'
        )
        return
      }

      // hCaptcha / Web3Forms refuse localhost — skip live email send in local dev.
      if (isLocalDevHost()) {
        console.warn(
          '[booking submit] Skipping Web3Forms on localhost (hCaptcha unavailable). Thank-you still opens for UI testing.'
        )
      } else {
        if (!hCaptchaToken.trim()) {
          setHCaptchaError('Please complete the security check to send your request.')
          document.getElementById('booking-security-check')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          return
        }

        setHCaptchaError('')

        setIsSubmitting(true)
        try {
          const result = await sendBookingRequestEmail(
            payload,
            latestFeatures,
            hCaptchaToken
          )
          if (!result.ok) {
            setHCaptchaToken('')
            setHCaptchaError('')
            hCaptchaRef.current?.resetCaptcha()
            goToUnableToProcess(
              result.message ||
                'Could not send the booking email. Please try again or call the clinic.'
            )
            return
          }
          // Clinic email sent; patient Autoresponder fires when enabled in Web3Forms (Pro).
          confirmationEmailQueued = true
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    saveBookingThankYouSummary({
      firstName: payload.firstName,
      email: confirmationEmailQueued ? payload.email : undefined,
      serviceLabel: payload.serviceLabel,
      locationLabel: payload.locationLabel,
      date: payload.date,
      time: payload.time,
      serviceType: payload.serviceType,
      message: payload.message?.trim() || undefined,
    })
    resetForm()
    setToast(null)
    // Hard navigate so thank-you is a full page load on mobile/tablet/desktop
    // (static export + trailingSlash). Absolute URL avoids base-path surprises.
    const thankYouUrl = new URL('/bookings/thank-you/', window.location.origin).href
    window.location.replace(thankYouUrl)
  }

  return (
    <>
      <Toast
        message={toast?.message ?? ''}
        visible={Boolean(toast)}
        variant={toast?.variant ?? 'success'}
        durationMs={Array.isArray(toast?.message) && toast.message.length > 1 ? 8000 : 5000}
        onClose={() => setToast(null)}
      />

      <BookingStepper
        steps={STEPS}
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        submitLabel="Request appointment"
        nextDisabled={
          (currentStep === 0 && !selectedLocation) ||
          (currentStep === 1 && !selectedService) ||
          (currentStep === 2 &&
            (!selectedDate ||
              isClosedBookingDate(selectedDate) ||
              !selectedTime ||
              isPastTimeRange(selectedDate, selectedTime)))
        }
        stepFocusId={STEP_ENTRY_FOCUS_IDS[currentStep]}
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <p className="flex items-center text-base text-secondary">
              <CheckCircle className="mr-2 h-5 w-5 shrink-0 text-primary" />
              Choose how you&apos;d like to be treated
            </p>

            <div className="relative flex border-b border-accent/20">
              <span
                aria-hidden
                className={`booking-service-tab__indicator ${
                  activeTab === 'call-out' ? 'booking-service-tab__indicator--call-out' : ''
                }`}
              />
              <button
                type="button"
                onClick={() => handleTabChange('in-clinic')}
                className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base ${
                  activeTab === 'in-clinic' ? 'booking-service-tab--active' : ''
                }`}
              >
                <Building2 className="h-5 w-5 shrink-0" aria-hidden />
                In Clinic
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('call-out')}
                className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base ${
                  activeTab === 'call-out' ? 'booking-service-tab--active' : ''
                }`}
              >
                <Home className="h-5 w-5 shrink-0" aria-hidden />
                <span className="sm:hidden">Home Visits</span>
                <span className="hidden sm:inline">Call Out (Home Visits)</span>
              </button>
            </div>

            <div className="space-y-4">
              <p className="flex items-start text-base text-secondary">
                <MapPin className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {activeTab === 'call-out'
                  ? 'Choose which clinic area this home visit is booked under.'
                  : 'Choose your preferred clinic'}
              </p>
              <div
                id="booking-location"
                tabIndex={-1}
                className={`rounded-lg p-1 outline-none ring-2 ${
                  hasFieldError('location') ? 'ring-red-400' : 'ring-transparent'
                }`}
              >
                <ClinicLocationCards
                  locations={clinicLocations}
                  selectedId={selectedLocation}
                  onSelect={(id) => {
                    setSelectedLocation(id)
                    clearFieldError('location')
                  }}
                  name="location"
                  hasError={hasFieldError('location')}
                />
              </div>
              <FieldInlineError message={fieldErrorMessage('location')} />
            </div>

            {activeTab === 'call-out' && <TravelPolicyNotice />}
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-6">
            <p className="flex items-center text-base text-secondary">
              <CheckCircle className="mr-2 h-5 w-5 shrink-0 text-primary" />
              Choose the treatment that fits you best
            </p>

            <div
              id="booking-service"
              tabIndex={-1}
              className={`rounded-lg p-1 outline-none ring-2 ${
                hasFieldError('service') ? 'ring-red-400' : 'ring-transparent'
              }`}
            >
              <ServiceSelectionCards
                services={services}
                selectedId={selectedService}
                onSelect={(id) => {
                  setSelectedService(id)
                  clearFieldError('service')
                }}
                name="service"
                hasError={hasFieldError('service')}
              />
            </div>
            <FieldInlineError message={fieldErrorMessage('service')} />

            <OptionalAddOns
              addOns={addOns}
              selectedIds={selectedAddOns}
              onToggle={handleAddOnToggle}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <p className="flex items-start text-base text-secondary">
              <Calendar className="mt-0.5 mr-2 h-5 w-5 shrink-0 text-primary" />
              Pick your preferred date and a time range.
            </p>

            <div className="min-w-0 w-full max-w-full">
              <label htmlFor="booking-date" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                Preferred Date <RequiredMark />
              </label>
              <div className="booking-date-field booking-date-field--picker relative">
                <BookingDatePicker
                  id="booking-date"
                  value={selectedDate}
                  min={defaultPreferredDate()}
                  hasError={hasFieldError('date')}
                  aria-invalid={hasFieldError('date')}
                  aria-describedby={
                    [
                      'booking-date-hint',
                      fieldErrorMessage('date') ? 'booking-date-error' : null,
                    ]
                      .filter(Boolean)
                      .join(' ') || undefined
                  }
                  onChange={(nextDate) => {
                    setSelectedDate(nextDate)
                    clearFieldError('date')
                    if (selectedTime && isPastTimeRange(nextDate, selectedTime)) {
                      setSelectedTime(defaultPreferredTime(nextDate))
                      clearFieldError('time')
                    }
                  }}
                />
              </div>
              <p id="booking-date-hint" className="mt-1.5 text-xs text-secondary">
                Next available starts from{' '}
                {new Date(`${defaultPreferredDate()}T12:00:00`).toLocaleDateString('en-IE', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
              <FieldInlineError
                id="booking-date-error"
                message={fieldErrorMessage('date')}
              />
            </div>

            <div className="min-w-0 w-full">
              <p
                id="booking-time-label"
                className="block text-sm font-medium text-[var(--text-dark)] mb-1"
              >
                Preferred Time Range <RequiredMark />
              </p>
              <p className="text-sm text-secondary mb-3">
                Pick a time that works best for you.
              </p>
              <div
                id="booking-time"
                tabIndex={-1}
                role="group"
                aria-labelledby="booking-time-label"
                aria-invalid={hasFieldError('time')}
                aria-describedby={
                  fieldErrorMessage('time') ? 'booking-time-error' : undefined
                }
                className={`outline-none ${
                  hasFieldError('time') ? 'ring-2 ring-red-400 rounded-lg p-1' : ''
                }`}
              >
                <TimeRangeCards
                  selectedId={selectedTime}
                  dateStr={selectedDate}
                  hasError={hasFieldError('time')}
                  onSelect={(id) => {
                    setSelectedTime(id)
                    clearFieldError('time')
                  }}
                />
              </div>
              <FieldInlineError
                id="booking-time-error"
                message={fieldErrorMessage('time')}
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 flex items-center text-xl font-bold text-[var(--text-dark)]">
                <User className="w-5 h-5 mr-2" />
                Contact details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <label htmlFor="firstName" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    First Name <RequiredMark />
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('firstName')}
                    aria-describedby={
                      fieldErrorMessage('firstName') ? 'firstName-error' : undefined
                    }
                    className={hasFieldError('firstName') ? fieldErrorClassName : inputClassName}
                  />
                  <FieldInlineError
                    id="firstName-error"
                    message={fieldErrorMessage('firstName')}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="lastName" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Last Name <RequiredMark />
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('lastName')}
                    aria-describedby={
                      fieldErrorMessage('lastName') ? 'lastName-error' : undefined
                    }
                    className={hasFieldError('lastName') ? fieldErrorClassName : inputClassName}
                  />
                  <FieldInlineError
                    id="lastName-error"
                    message={fieldErrorMessage('lastName')}
                  />
                </div>
                <div className="min-w-0">
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Email Address <RequiredMark />
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('email')}
                    aria-describedby={
                      fieldErrorMessage('email') ? 'email-error' : undefined
                    }
                    className={hasFieldError('email') ? fieldErrorClassName : inputClassName}
                  />
                  <FieldInlineError id="email-error" message={fieldErrorMessage('email')} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Mobile Number <RequiredMark />
                  </label>
                  <div
                    className={
                      hasFieldError('phone')
                        ? 'flex w-full min-w-0 max-w-full box-border items-stretch overflow-hidden rounded-lg border-2 border-red-500 bg-red-50/40 focus-within:ring-2 focus-within:ring-red-400'
                        : 'flex w-full min-w-0 max-w-full box-border items-stretch overflow-hidden rounded-lg border border-accent/30 bg-white focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent'
                    }
                  >
                    <div
                      className="flex shrink-0 items-center gap-2 border-r border-accent/30 px-3 py-3"
                      aria-hidden="true"
                    >
                      <IrishFlagIcon className="h-4 w-6 shrink-0 rounded-[1px] shadow-sm ring-1 ring-black/10" />
                      <span className="whitespace-nowrap text-sm font-medium text-[var(--text-dark)]">
                        +353
                      </span>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={irishLocalFromStored(formData.phone)}
                      onChange={handleChange}
                      placeholder="86 054 3085"
                      inputMode="tel"
                      autoComplete="tel"
                      aria-invalid={hasFieldError('phone')}
                      aria-describedby={
                        fieldErrorMessage('phone') ? 'phone-error' : undefined
                      }
                      className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-[var(--text-dark)] outline-none focus:ring-0"
                    />
                  </div>
                  <FieldInlineError id="phone-error" message={fieldErrorMessage('phone')} />
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-xl font-bold text-[var(--text-dark)]">
                Additional info
              </h3>
              <div className="grid grid-cols-1 gap-6 min-w-0">
                <div className="min-w-0 w-full max-w-full">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Date of Birth <RequiredMark />
                  </label>
                  <div className="booking-date-field booking-date-field--picker relative">
                    <BookingDatePicker
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      min="1920-01-01"
                      max={todayDateInputValue()}
                      disableClosedDays={false}
                      initialView="max"
                      placeholder="Select date of birth"
                      dialogLabel="Choose date of birth"
                      footerNote="Future dates are not available"
                      hasError={hasFieldError('dateOfBirth')}
                      aria-invalid={hasFieldError('dateOfBirth')}
                      aria-describedby={
                        hasFieldError('dateOfBirth') ? 'dateOfBirth-error' : undefined
                      }
                      onChange={(nextDate) => {
                        if (isFutureDateInputValue(nextDate)) {
                          setFormData((prev) => ({ ...prev, dateOfBirth: '' }))
                          setFieldErrors((prev) => new Set(prev).add('dateOfBirth'))
                          setFieldErrorMessages((prev) => ({
                            ...prev,
                            dateOfBirth: 'Date of birth cannot be in the future.',
                          }))
                          return
                        }
                        setFormData((prev) => ({ ...prev, dateOfBirth: nextDate }))
                        clearFieldError('dateOfBirth')
                      }}
                    />
                  </div>
                  <FieldInlineError
                    id="dateOfBirth-error"
                    message={fieldErrorMessage('dateOfBirth')}
                  />
                </div>
                <div className="min-w-0 w-full max-w-full">
                  <label htmlFor="message" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Anything we should know before your visit? (optional)"
                    className={`${inputClassName} min-h-[6.5rem] resize-y`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-primary/15 bg-accent/10 px-4 py-3 text-sm font-semibold text-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p>
                Submitting sends an appointment request. We will contact you within 24 hours
                to confirm.
              </p>
            </div>

            {showLocalSecurityNotice && currentStep === 3 && (
              <p
                id="booking-security-check"
                className="text-center text-xs text-[var(--text-dark)]/45"
                role="status"
              >
                Security check skipped on localhost — it appears on the live site.
              </p>
            )}

            {showSecurityCheck && currentStep === 3 && (
              <div id="booking-security-check" className="w-full min-w-0 space-y-2">
                <div
                  className={`booking-hcaptcha-host w-full min-w-0 rounded-lg p-1 transition-colors ${
                    hCaptchaError
                      ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-cream'
                      : ''
                  }`}
                >
                  {!hCaptchaReady && (
                    <div
                      className="mx-auto h-[78px] w-full max-w-[303px] rounded-md bg-accent/10 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`booking-hcaptcha-scale ${
                      hCaptchaReady ? '' : 'sr-only'
                    }`}
                  >
                    <div className="booking-hcaptcha-frame">
                      <HCaptcha
                        ref={hCaptchaRef}
                        sitekey={WEB3FORMS_HCAPTCHA_SITEKEY}
                        size="normal"
                        reCaptchaCompat={false}
                        onLoad={() => setHCaptchaReady(true)}
                        onVerify={(token) => {
                          setHCaptchaToken(token)
                          setHCaptchaError('')
                        }}
                        onExpire={() => {
                          setHCaptchaToken('')
                          setHCaptchaError('Security check expired. Please verify again.')
                        }}
                        onError={() => {
                          setHCaptchaToken('')
                          setHCaptchaReady(true)
                          setHCaptchaError('Security check failed to load. Please try again.')
                        }}
                      />
                    </div>
                  </div>
                </div>
                {hCaptchaError ? (
                  <p className="text-center text-sm text-red-700" role="alert">
                    {hCaptchaError}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </BookingStepper>
    </>
  )
}
