'use client'

import { useEffect, useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Calendar, CheckCircle, Info, MapPin, User } from 'lucide-react'
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

type BookingService = {
  id: string
  name: string
  duration: string
  price: string
  description: string
  savings?: string
}

const STEPS: BookingStepperStep[] = [
  { id: 'service', title: 'Service' },
  { id: 'location', title: 'Location' },
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

/** Mobile-only validation copy (desktop keeps toast). */
function FieldInlineError({
  id,
  message,
  always = false,
}: {
  id?: string
  message?: string
  /** Show on all breakpoints (e.g. DOB picker reject). */
  always?: boolean
}) {
  if (!message) return null
  return (
    <p
      id={id}
      className={`mt-2 text-sm text-red-600 max-w-full break-words ${always ? '' : 'md:hidden'}`}
      role="alert"
    >
      {message}
    </p>
  )
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
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
  'booking-service',
  'booking-location',
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

/** Live format for Irish numbers: `086 054 3085` or `+353 86 054 3085`. */
function formatIrishPhoneInput(raw: string): string {
  const startsWithPlus = raw.trimStart().startsWith('+')
  const digits = raw.replace(/\D/g, '')

  // International: +353 / 353 / 00353 → +353 XX XXX XXXX
  const isIntl =
    startsWithPlus || digits.startsWith('353') || digits.startsWith('00353')

  if (isIntl) {
    let local = digits
    if (local.startsWith('00353')) local = local.slice(5)
    else if (local.startsWith('353')) local = local.slice(3)
    // Drop trunk 0 if user typed +353 0…
    if (local.startsWith('0')) local = local.slice(1)
    local = local.slice(0, 9)

    const groups = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 9)].filter(
      (g) => g.length > 0
    )
    return groups.length > 0 ? `+353 ${groups.join(' ')}` : '+353'
  }

  // National: 0XX XXX XXXX (max 10 digits)
  const national = digits.slice(0, 10)
  const groups = [
    national.slice(0, 3),
    national.slice(3, 6),
    national.slice(6, 10),
  ].filter((g) => g.length > 0)
  return groups.join(' ')
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
  })
  const [hCaptchaToken, setHCaptchaToken] = useState('')
  const [hCaptchaReady, setHCaptchaReady] = useState(false)
  const [hCaptchaError, setHCaptchaError] = useState('')
  const hCaptchaRef = useRef<HCaptcha>(null)

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

  const showSecurityCheck = isBookingEmailConfigured(features)
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

  const showErrorToast = (message: string | string[]) => {
    setToast({ message, variant: 'error' })
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
    // Desktop: toast summary. Mobile: inline messages only.
    if (!isMobileViewport()) {
      showErrorToast(error.messages)
    }
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
      name === 'phone' ? formatIrishPhoneInput(e.target.value) : e.target.value

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
    if (step === 0 && !selectedService) {
      return {
        messages: ['Please select a service to continue.'],
        fields: ['service'],
      }
    }
    if (step === 1 && !selectedLocation) {
      return {
        messages: ['Please select a location to continue.'],
        fields: ['location'],
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
        messages.push('Please enter your phone number.')
      } else if (!isValidIrishPhone(formData.phone)) {
        fields.push('phone')
        messages.push(
          'Please enter a valid Irish phone number (e.g. 086 054 3085 or +353 86 054 3085).'
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

    let confirmationEmailQueued = false

    if (features.bookingEmailEnabled) {
      // Re-read so Admin saves / env fallback are always current at submit time
      const latestFeatures = readBookingFeatures()
      if (!isBookingEmailConfigured(latestFeatures)) {
        showErrorToast(
          latestFeatures.bookingEmailAccessKey &&
            !isValidWeb3FormsAccessKey(latestFeatures.bookingEmailAccessKey)
            ? 'Web3Forms access key must be a valid UUID. Check .env.local or Admin → Booking email setup, then restart the dev server.'
            : 'Booking email is enabled but not configured. Add the Web3Forms access key in Admin (dev) or set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY.'
        )
        return
      }

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
          showErrorToast(
            result.message ||
              'Could not send the booking email. Please try again or call the clinic.'
          )
          setHCaptchaToken('')
          setHCaptchaError('')
          hCaptchaRef.current?.resetCaptcha()
          return
        }
        // Clinic email sent; patient Autoresponder fires when enabled in Web3Forms (Pro).
        confirmationEmailQueued = true
      } finally {
        setIsSubmitting(false)
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
        nextDisabled={
          (currentStep === 0 && !selectedService) ||
          (currentStep === 1 && !selectedLocation) ||
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
            <p className="text-secondary text-sm flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary shrink-0" />
              <span className="xl:hidden">
                Choose a location and select your service.
              </span>
              <span className="hidden xl:inline">
                Choose In Clinic or Home Visit, then select a service.
              </span>
            </p>
            <p className="text-xs text-secondary">
              Treated by Arkinth Garcia, Naturopath &amp; Acupuncturist.
            </p>

            <div className="flex border-b border-accent/20">
              <button
                type="button"
                onClick={() => handleTabChange('in-clinic')}
                className={`booking-service-tab px-4 sm:px-6 py-3 text-sm sm:text-base ${
                  activeTab === 'in-clinic' ? 'booking-service-tab--active' : ''
                }`}
              >
                In Clinic
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('call-out')}
                className={`booking-service-tab px-4 sm:px-6 py-3 text-sm sm:text-base ${
                  activeTab === 'call-out' ? 'booking-service-tab--active' : ''
                }`}
              >
                <span className="sm:hidden">Home Visits</span>
                <span className="hidden sm:inline">Call Out (Home Visits)</span>
              </button>
            </div>

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

            {activeTab === 'call-out' && <TravelPolicyNotice />}

            <OptionalAddOns
              addOns={addOns}
              selectedIds={selectedAddOns}
              onToggle={handleAddOnToggle}
            />
          </div>
        )}

        {currentStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-secondary flex items-start">
              <MapPin className="w-5 h-5 mr-2 text-primary shrink-0 mt-0.5" />
              {activeTab === 'call-out'
                ? 'Choose which clinic area this home visit is booked under.'
                : 'Select which clinic you will attend.'}
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
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-secondary flex items-start">
              <Calendar className="w-5 h-5 mr-2 text-primary shrink-0 mt-0.5" />
              <span>
                Pick your preferred date and a time range.
                <br />
                <span className="font-medium text-[var(--primary-green)]">
                  This is a request only — we will confirm within 24 hours.
                </span>
              </span>
            </p>

            <div className="min-w-0 w-full max-w-full">
              <label htmlFor="booking-date" className="block text-sm font-medium text-primary mb-2">
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
                    fieldErrorMessage('date') ? 'booking-date-error' : undefined
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
              <FieldInlineError
                id="booking-date-error"
                message={fieldErrorMessage('date')}
                always
              />
            </div>

            <div className="min-w-0 w-full">
              <p
                id="booking-time-label"
                className="block text-sm font-medium text-primary mb-1"
              >
                Preferred Time Range <RequiredMark />
              </p>
              <p className="text-sm text-secondary mb-3">
                Select the time range that works best for you.
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

            <div className="flex items-start gap-2 rounded-xl bg-accent/10 px-4 py-3 text-sm text-secondary">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" aria-hidden />
              <p>
                We will confirm your preferred date and time within 24 hours via email or
                phone.
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div className="min-w-0">
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
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
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
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
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
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
                  <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                    Phone Number <RequiredMark />
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="086 054 3085 or +353 86 054 3085"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={hasFieldError('phone')}
                    aria-describedby={
                      fieldErrorMessage('phone') ? 'phone-error' : undefined
                    }
                    className={hasFieldError('phone') ? fieldErrorClassName : inputClassName}
                  />
                  <FieldInlineError id="phone-error" message={fieldErrorMessage('phone')} />
                </div>
                <div className="md:col-span-2 min-w-0 w-full max-w-full">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-primary mb-2">
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
                    always
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-secondary text-center">
              Submitting sends an appointment request. We will contact you within 24 hours to confirm.
            </p>

            {showSecurityCheck && currentStep === 3 && (
              <div id="booking-security-check" className="w-full min-w-0 space-y-2">
                <div
                  className={`booking-hcaptcha-host flex justify-center w-full rounded-lg p-1 transition-colors ${
                    hCaptchaError
                      ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-cream'
                      : ''
                  }`}
                >
                  {!hCaptchaReady && (
                    <div
                      className="h-[78px] w-full max-w-[303px] rounded-md bg-accent/10 animate-pulse"
                      aria-hidden="true"
                    />
                  )}
                  <div
                    className={`inline-block max-w-full overflow-x-auto ${
                      hCaptchaReady ? '' : 'sr-only'
                    }`}
                  >
                    <div className="min-h-[78px] min-w-[303px]">
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
