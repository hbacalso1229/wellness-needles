'use client'

import { useRef, useState } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Calendar, CheckCircle, MapPin, User } from 'lucide-react'
import { contactConfig } from '@/lib/contact-config'
import BookingStepper, { type BookingStepperStep } from '@/components/BookingStepper'
import Toast from '@/components/Toast'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import { isBookingEmailConfigured, readBookingFeatures } from '@/lib/booking-features'
import { sendBookingRequestEmail } from '@/lib/send-booking-email'
import { OptionalAddOns, ClinicLocationCards, ServiceSelectionCards, TravelPolicyNotice } from '@/features'

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

const TIME_SLOTS = [
  '9:00 AM',
  '9:15 AM',
  '9:30 AM',
  '9:45 AM',
  '10:00 AM',
  '10:15 AM',
  '10:30 AM',
  '10:45 AM',
  '11:00 AM',
  '11:15 AM',
  '11:30 AM',
  '11:45 AM',
  '2:00 PM',
  '2:15 PM',
  '2:30 PM',
  '2:45 PM',
  '3:00 PM',
  '3:15 PM',
  '3:30 PM',
  '3:45 PM',
  '4:00 PM',
  '4:15 PM',
  '4:30 PM',
  '4:45 PM',
  '5:00 PM',
  '5:15 PM',
  '5:30 PM',
  '5:45 PM',
  '6:00 PM',
]

function parseSlotToMinutes(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return -1
  let hours = Number(match[1])
  const minutes = Number(match[2])
  const period = match[3].toUpperCase()
  if (period === 'AM' && hours === 12) hours = 0
  if (period === 'PM' && hours !== 12) hours += 12
  return hours * 60 + minutes
}

function todayDateInputValue(): string {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function isPastTimeSlot(dateStr: string, slot: string): boolean {
  if (!dateStr || dateStr !== todayDateInputValue()) return false
  const now = new Date()
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return parseSlotToMinutes(slot) <= nowMinutes
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

const dateInputClassName = `${inputClassName} booking-date-input`
const dateInputErrorClassName = `${fieldErrorClassName} booking-date-input`

type FieldErrorKey =
  | 'service'
  | 'location'
  | 'date'
  | 'time'
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'chiefComplaint'

const FIELD_FOCUS_IDS: Partial<Record<FieldErrorKey, string>> = {
  service: 'booking-service',
  location: 'booking-location',
  date: 'booking-date',
  time: 'booking-time',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  chiefComplaint: 'chiefComplaint',
}

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

export default function BookingForm() {
  const { features } = useBookingFeatures()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{
    message: string | string[]
    variant: 'success' | 'error'
  } | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Set<FieldErrorKey>>(new Set())
  const [activeTab, setActiveTab] = useState('in-clinic')
  const [selectedLocation, setSelectedLocation] = useState('celbridge')
  const [selectedService, setSelectedService] = useState('initial-consultation')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState(todayDateInputValue)
  const [selectedTime, setSelectedTime] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    chiefComplaint: '',
    previousTreatment: '',
    medications: '',
    allergies: '',
  })
  const [hCaptchaToken, setHCaptchaToken] = useState('')
  const [hCaptchaStatus, setHCaptchaStatus] = useState<'idle' | 'verified' | 'error'>('idle')
  const [hCaptchaMessage, setHCaptchaMessage] = useState('')
  const [hCaptchaHighlight, setHCaptchaHighlight] = useState(false)
  const [hCaptchaReady, setHCaptchaReady] = useState(false)
  const hCaptchaRef = useRef<HCaptcha>(null)

  const showSecurityCheck = isBookingEmailConfigured(features)
  const clinicLocations = contactConfig.address.locations
  const selectedLocationDetails = clinicLocations.find((l) => l.id === selectedLocation)

  const resetHCaptcha = () => {
    setHCaptchaToken('')
    setHCaptchaStatus('idle')
    setHCaptchaMessage('')
    setHCaptchaHighlight(false)
    hCaptchaRef.current?.resetCaptcha()
  }

  const services = (activeTab === 'in-clinic' ? inClinicServices : homeVisitServices).filter(
    (service) =>
      features.treatmentPackagesEnabled || !service.id.includes('package')
  )
  const addOns = activeTab === 'in-clinic' ? inClinicAddOns : homeVisitAddOns

  const hasFieldError = (key: FieldErrorKey) => fieldErrors.has(key)

  const clearFieldError = (key: FieldErrorKey) => {
    setFieldErrors((prev) => {
      if (!prev.has(key)) return prev
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }

  const showErrorToast = (message: string | string[]) => {
    setToast({ message, variant: 'error' })
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
    const name = e.target.name as FieldErrorKey
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    if (
      name === 'firstName' ||
      name === 'lastName' ||
      name === 'email' ||
      name === 'phone' ||
      name === 'chiefComplaint'
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
      }
      if (!selectedTime) {
        fields.push('time')
        messages.push('Please choose a preferred time.')
      } else if (selectedDate && isPastTimeSlot(selectedDate, selectedTime)) {
        fields.push('time')
        messages.push('That time has already passed. Please choose a later time.')
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
      if (!formData.chiefComplaint.trim()) {
        fields.push('chiefComplaint')
        messages.push('Please describe what brings you in today.')
      }

      if (fields.length > 0) {
        return { messages, fields }
      }
    }
    return null
  }

  const handleNext = () => {
    const error = validateStep(currentStep)
    if (error) {
      setFieldErrors(new Set(error.fields))
      showErrorToast(error.messages)
      focusFirstInvalidField(error.fields)
      return
    }
    setFieldErrors(new Set())
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const handleBack = () => {
    setFieldErrors(new Set())
    setCurrentStep((s) => Math.max(s - 1, 0))
  }

  const resetForm = () => {
    setCurrentStep(0)
    setFieldErrors(new Set())
    setActiveTab('in-clinic')
    setSelectedLocation('celbridge')
    setSelectedService('initial-consultation')
    setSelectedAddOns([])
    setSelectedDate(todayDateInputValue())
    setSelectedTime('')
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      chiefComplaint: '',
      previousTreatment: '',
      medications: '',
      allergies: '',
    })
    resetHCaptcha()
  }

  const handleSubmit = async () => {
    const error = validateStep(3)
    if (error) {
      setFieldErrors(new Set(error.fields))
      showErrorToast(error.messages)
      focusFirstInvalidField(error.fields)
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
      time: selectedTime,
      ...formData,
    }

    setFieldErrors(new Set())
    console.log('Booking submitted:', payload)

    if (features.bookingEmailEnabled) {
      // Re-read so Admin saves / env fallback are always current at submit time
      const latestFeatures = readBookingFeatures()
      if (!isBookingEmailConfigured(latestFeatures)) {
        showErrorToast(
          'Booking email is enabled but not configured. Add the Web3Forms access key in Admin and click Save email settings.'
        )
        return
      }

      if (!hCaptchaToken.trim()) {
        setHCaptchaHighlight(true)
        setHCaptchaStatus('error')
        setHCaptchaMessage('Please complete the security check to send your request.')
        showErrorToast('Please complete the security check to send your request.')
        document.getElementById('booking-security-check')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
        document.getElementById('booking-security-check')?.focus()
        return
      }

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
          resetHCaptcha()
          return
        }
      } finally {
        setIsSubmitting(false)
      }
    }

    resetForm()
    setToast({
      message:
        'Thank you! Your appointment request has been submitted. We will contact you within 24 hours to confirm your booking.',
      variant: 'success',
    })
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
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <p className="text-secondary text-sm flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary shrink-0" />
              Choose In Clinic or Home Visit, then select a service.
            </p>
            <p className="text-xs text-secondary">
              Treated by Arkinth Garcia, Naturopath &amp; Acupuncturist.
            </p>

            <div className="flex border-b border-accent/20">
              <button
                type="button"
                onClick={() => handleTabChange('in-clinic')}
                className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === 'in-clinic'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                In Clinic
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('call-out')}
                className={`px-4 sm:px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === 'call-out'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                <span className="sm:hidden">Home Visits</span>
                <span className="hidden sm:inline">Call Out (Home Visits)</span>
              </button>
            </div>

            <div
              id="booking-service"
              tabIndex={-1}
              className={`rounded-lg outline-none ${
                hasFieldError('service') ? 'ring-2 ring-red-400 p-1' : ''
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

            {activeTab === 'call-out' && <TravelPolicyNotice />}
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
              className={`rounded-lg outline-none ${
                hasFieldError('location') ? 'ring-2 ring-red-400 p-1' : ''
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
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <p className="text-sm text-secondary flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary shrink-0" />
              Pick your preferred date and time. We will confirm within 24 hours.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="min-w-0 w-full overflow-hidden">
                <label htmlFor="booking-date" className="block text-sm font-medium text-primary mb-2">
                  Preferred Date *
                </label>
                <input
                  type="date"
                  id="booking-date"
                  value={selectedDate}
                  onChange={(e) => {
                    const nextDate = e.target.value
                    setSelectedDate(nextDate)
                    clearFieldError('date')
                    if (selectedTime && isPastTimeSlot(nextDate, selectedTime)) {
                      setSelectedTime('')
                      clearFieldError('time')
                    }
                  }}
                  min={todayDateInputValue()}
                  aria-invalid={hasFieldError('date')}
                  className={
                    hasFieldError('date') ? dateInputErrorClassName : dateInputClassName
                  }
                />
              </div>
              <div className="min-w-0 w-full">
                <p
                  id="booking-time-label"
                  className="block text-sm font-medium text-primary mb-2"
                >
                  Preferred Time *
                </p>
                <div
                  id="booking-time"
                  tabIndex={-1}
                  role="group"
                  aria-labelledby="booking-time-label"
                  aria-invalid={hasFieldError('time')}
                  className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 outline-none ${
                    hasFieldError('time') ? 'ring-2 ring-red-400 rounded-lg p-1' : ''
                  }`}
                >
                  {TIME_SLOTS.map((slot) => {
                    const past = isPastTimeSlot(selectedDate, slot)
                    const selected = selectedTime === slot
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={past}
                        onClick={() => {
                          setSelectedTime(slot)
                          clearFieldError('time')
                        }}
                        className={`px-1.5 py-2 rounded-lg text-[11px] sm:text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${
                          selected
                            ? 'bg-primary text-cream'
                            : past
                              ? 'bg-accent/10 text-secondary/40 cursor-not-allowed'
                              : 'bg-white border border-accent/30 text-primary hover:border-primary'
                        }`}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <OptionalAddOns
              addOns={addOns}
              selectedIds={selectedAddOns}
              onToggle={handleAddOnToggle}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div>
              <h3 className="font-serif text-xl font-bold text-primary mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('firstName')}
                    className={hasFieldError('firstName') ? fieldErrorClassName : inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('lastName')}
                    className={hasFieldError('lastName') ? fieldErrorClassName : inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={hasFieldError('email')}
                    className={hasFieldError('email') ? fieldErrorClassName : inputClassName}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                    Phone Number *
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
                    className={hasFieldError('phone') ? fieldErrorClassName : inputClassName}
                  />
                </div>
                <div className="md:col-span-2 min-w-0 w-full overflow-hidden">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-primary mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={dateInputClassName}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-primary mb-4">Health Information</h3>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="chiefComplaint"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    What brings you in today? (Main concern or condition) *
                  </label>
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleChange}
                    rows={3}
                    aria-invalid={hasFieldError('chiefComplaint')}
                    className={`${hasFieldError('chiefComplaint') ? fieldErrorClassName : inputClassName} resize-none`}
                    placeholder="Please describe your symptoms or reason for seeking treatment..."
                  />
                </div>
                <div>
                  <label
                    htmlFor="previousTreatment"
                    className="block text-sm font-medium text-primary mb-2"
                  >
                    Have you had acupuncture before?
                  </label>
                  <textarea
                    id="previousTreatment"
                    name="previousTreatment"
                    value={formData.previousTreatment}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputClassName} resize-none`}
                    placeholder="Please describe any previous acupuncture or alternative treatments..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="medications"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Current Medications
                    </label>
                    <textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClassName} resize-none`}
                      placeholder="List all medications, supplements, and dosages..."
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="allergies"
                      className="block text-sm font-medium text-primary mb-2"
                    >
                      Allergies
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      rows={3}
                      className={`${inputClassName} resize-none`}
                      placeholder="List any known allergies or sensitivities..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-secondary text-center">
              We will contact you within 24 hours to confirm your appointment.
            </p>

            {showSecurityCheck && currentStep === 3 && (
              <div
                id="booking-security-check"
                tabIndex={-1}
                className={`rounded-xl border bg-white p-5 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] outline-none transition-colors ${
                  hCaptchaHighlight
                    ? 'border-red-400'
                    : 'border-accent/15'
                }`}
              >
                <h3 className="font-semibold text-primary mb-2">Quick security check</h3>
                <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                <p className="text-sm text-secondary mb-4">
                  Confirm you&apos;re human before we send your appointment request.
                </p>

                <div className="booking-hcaptcha-host w-full min-w-0">
                  {!hCaptchaReady && (
                    <div
                      className="mb-0 h-[78px] w-full max-w-[303px] rounded-md bg-accent/10 animate-pulse"
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
                          setHCaptchaStatus('verified')
                          setHCaptchaMessage('Verified — you can submit your request')
                          setHCaptchaHighlight(false)
                        }}
                        onExpire={() => {
                          setHCaptchaToken('')
                          setHCaptchaStatus('error')
                          setHCaptchaMessage('Security check expired. Please verify again.')
                        }}
                        onError={() => {
                          setHCaptchaToken('')
                          setHCaptchaStatus('error')
                          setHCaptchaMessage('Security check failed to load. Please try again.')
                          setHCaptchaReady(true)
                        }}
                      />
                    </div>
                  </div>
                </div>

                <p
                  className={`mt-3 text-sm ${
                    hCaptchaStatus === 'verified'
                      ? 'text-primary'
                      : hCaptchaStatus === 'error'
                        ? 'text-red-700'
                        : 'text-secondary/70'
                  }`}
                  aria-live="polite"
                >
                  {hCaptchaMessage || 'Complete the check above to continue.'}
                </p>
              </div>
            )}
          </div>
        )}
      </BookingStepper>
    </>
  )
}
