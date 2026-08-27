'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Building2, Calendar, ChevronDown, ClipboardList, Home, Leaf, Lightbulb, Lock, MapPin, User, type LucideIcon } from 'lucide-react'
import { PhoneFlagIcon } from '@/features/ui/PhoneFlagIcon'
import { contactConfig } from '@/lib/contact-config'
import {
  DEFAULT_PHONE_COUNTRY_ID,
  PHONE_COUNTRIES,
  getPhoneCountry,
} from '@/lib/phone-countries'
import {
  formatLocalPhoneInput,
  inferPhoneCountry,
  isValidBookingPhone,
  shouldShowIrishMobileInvalidModal,
  subscriberDigits,
  toE164,
} from '@/lib/irish-phone'
import BookingStepper, { type BookingStepperStep } from '@/components/BookingStepper'
import { BookingPhoneInvalidModal } from '@/components/BookingPhoneInvalidModal'
import Toast from '@/components/Toast'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import { isBookingEmailConfigured, readBookingFeatures, bookingFeaturesFromOverlay, isValidWeb3FormsAccessKey, getTurnstileSiteKey, isTurnstileCaptchaEnabled, fetchRuntimeCaptchaProvider } from '@/lib/booking-features'
import { sendPatientThankYouEmail } from '@/lib/send-patient-thank-you'
import { sendBookingRequestEmail, sendTurnstileBookingRequest } from '@/lib/send-booking-email'
import { saveBookingThankYouSummary } from '@/lib/booking-thank-you'
import { persistBookingRequest } from '@/lib/booking-persist'
import { saveBookingSubmitOutcome } from '@/lib/booking-submit-outcome'
import { useSiteOverlay, publicLocationsOrBaked } from '@/lib/site-overlay'
import { overlayCatalogOrNull } from '@/lib/overlay-public'
import {
  joinPersonName,
  normalizeNameParts,
  splitFullName,
} from '@/lib/person-name'
import { emailCheckMessage, emailTypoSuggestion, checkEmailLocal } from '../../shared/email-check'
import {
  OptionalAddOns,
  ClinicLocationCards,
  ServiceSelectionCards,
  TravelPolicyNotice,
  BookingDatePicker,
  TimeRangeCards,
  formatTimeRangeLabel,
  isPastTimeRange,
  isClosedBookingDate,
  nextOpenBookingDate,
  defaultPreferredDate,
  defaultPreferredTime,
  visibleTimeRanges,
} from '@/features'
import {
  homeVisitAddOns,
  homeVisitServices,
  inClinicAddOns,
  inClinicServices,
} from '@/lib/booking-catalog'

/** Web3Forms free-plan hCaptcha sitekey (enable hCaptcha in the Web3Forms dashboard). */
const WEB3FORMS_HCAPTCHA_SITEKEY = '50b2fe65-b00b-4b9e-ad62-3ba471098be2'

/** hCaptcha refuses localhost and renders a broken warning inside the iframe. */
function isLocalDevHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1'
}

/** Live site only — staging (`*.vercel.app`) and local keep the country picker. */
function isProductionSiteHost(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'www.wellnessneedles.ie' || host === 'wellnessneedles.ie'
}

function skipRemoteEmailCheck(): boolean {
  return isLocalDevHost() || process.env.NEXT_PUBLIC_E2E === 'true'
}

function localEmailError(value: string): string | null {
  if (!value.trim()) return 'Please enter your email address.'
  const result = checkEmailLocal(value)
  if (result.ok || result.reason === 'typo') return null
  return emailCheckMessage(result)
}

async function lookupEmailDeliverability(email: string): Promise<string | null> {
  if (skipRemoteEmailCheck()) return null
  try {
    const response = await fetch('/api/booking-email-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      ok?: boolean
      reason?: 'format' | 'typo' | 'mx'
      suggestion?: string
    }
    if (data.ok || data.reason === 'typo') return null
    if (data.reason === 'format' || data.reason === 'mx') {
      return emailCheckMessage({ reason: data.reason, suggestion: data.suggestion })
    }
    return null
  } catch {
    return null
  }
}

const STEPS: BookingStepperStep[] = [
  { id: 'location', title: 'Location' },
  { id: 'service', title: 'Service' },
  { id: 'schedule', title: 'Date & Time' },
  { id: 'details', title: 'Your details' },
]

function BookingStepIntro({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon
  title?: string
  subtitle: string
}) {
  const ampIndex = title?.indexOf('&') ?? -1
  const titleNode =
    !title || ampIndex === -1 ? (
      title
    ) : (
      <>
        {title.slice(0, ampIndex)}
        <span className="font-sans font-bold">&</span>
        {title.slice(ampIndex + 1)}
      </>
    )

  return (
    <div className="text-center">
      <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 sm:mb-3">
        <Icon className="h-5 w-5 text-primary" aria-hidden strokeWidth={1.75} />
      </span>
      {titleNode ? (
        <p className="whitespace-nowrap font-sans text-sm font-semibold text-[var(--text-dark)] sm:text-lg">
          {titleNode}
        </p>
      ) : null}
      <p className={`text-sm font-medium text-[var(--text-dark)] ${titleNode ? 'mt-1' : ''}`}>
        {subtitle}
      </p>
    </div>
  )
}

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

function EmailTypoSuggestion({
  suggestion,
  onApply,
}: {
  suggestion: string
  onApply: (value: string) => void
}) {
  return (
    <div id="email-suggestion" className="mt-2 space-y-2" role="status">
      <p className="flex items-start gap-2 text-sm text-[var(--text-dark)]">
        <Lightbulb
          className="mt-0.5 h-4 w-4 shrink-0 text-gold"
          strokeWidth={2}
          aria-hidden
        />
        <span>
          Did you mean{' '}
          <button
            type="button"
            className="font-medium text-accent underline decoration-accent/50 underline-offset-2 hover:text-primary"
            onClick={() => onApply(suggestion)}
          >
            {suggestion}
          </button>
          ?
        </span>
      </p>
      <button
        type="button"
        onClick={() => onApply(suggestion)}
        className="inline-flex rounded-lg border border-accent/40 bg-white px-3 py-1.5 text-sm font-medium text-[var(--text-dark)] hover:border-accent hover:bg-accent/5"
      >
        Use suggested email
      </button>
    </div>
  )
}

type FieldErrorKey =
  | 'service'
  | 'location'
  | 'date'
  | 'time'
  | 'fullName'
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
  fullName: 'fullName',
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  phone: 'phone',
  dateOfBirth: 'dateOfBirth',
}

/** Tailwind `md` breakpoint — desktop First/Last Name fields. */
const MD_MIN_WIDTH_QUERY = '(min-width: 768px)'

function isMdViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MD_MIN_WIDTH_QUERY).matches
}

function isFullNameFieldShowing(): boolean {
  return typeof window !== 'undefined' && !isMdViewport()
}

/** First control to focus when entering each booking step. */
const STEP_ENTRY_FOCUS_IDS = [
  'booking-location',
  'booking-service',
  'booking-date',
  'firstName',
] as const

function focusFirstInvalidField(fields: FieldErrorKey[]) {
  const first = fields[0]
  const remapNameToFullName =
    (first === 'firstName' || first === 'lastName' || first === 'fullName') &&
    isFullNameFieldShowing()
  const id = remapNameToFullName ? 'fullName' : FIELD_FOCUS_IDS[first]
  if (!id) return
  requestAnimationFrame(() => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: true })
    }
  })
}


export default function BookingForm() {
  const { features } = useBookingFeatures()
  const { overlayEnabled, hours, site } = useSiteOverlay()
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailCheckBusy, setEmailCheckBusy] = useState(false)
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
  const [fullNameInput, setFullNameInput] = useState('')
  const [phoneCountryId, setPhoneCountryId] = useState(DEFAULT_PHONE_COUNTRY_ID)
  const [hCaptchaToken, setHCaptchaToken] = useState('')
  const [hCaptchaReady, setHCaptchaReady] = useState(false)
  const [hCaptchaError, setHCaptchaError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileError, setTurnstileError] = useState('')
  const [isLocalHost, setIsLocalHost] = useState(false)
  /** null until mount so we only put one name field set in the DOM (avoids autofill doubling). */
  const [splitNameFields, setSplitNameFields] = useState<boolean | null>(null)
  const [productionHostLocked, setProductionHostLocked] = useState(false)
  const [irishPhoneModalOpen, setIrishPhoneModalOpen] = useState(false)
  const hCaptchaRef = useRef<HCaptcha>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)
  const inClinicTabRef = useRef<HTMLButtonElement>(null)
  const homeVisitTabRef = useRef<HTMLButtonElement>(null)
  const turnstileSiteKey = getTurnstileSiteKey()
  const buildTimeTurnstile = isTurnstileCaptchaEnabled()
  const [useTurnstile, setUseTurnstile] = useState(false)
  const [captchaModeReady, setCaptchaModeReady] = useState(!buildTimeTurnstile)

  useEffect(() => {
    setIsLocalHost(isLocalDevHost())
    if (isProductionSiteHost()) {
      setProductionHostLocked(true)
    }
  }, [])

  /** Hide country picker on production host, or when E2E bakes the Ireland lock. */
  const lockCountryPicker =
    productionHostLocked || features.strictIrishPhoneEnabled
  const clinicCountryId = overlayEnabled
    ? inferPhoneCountry(site.phone).id
    : DEFAULT_PHONE_COUNTRY_ID

  useEffect(() => {
    if (!lockCountryPicker) return
    setPhoneCountryId(clinicCountryId)
  }, [lockCountryPicker, clinicCountryId])

  useEffect(() => {
    if (!buildTimeTurnstile) return
    let cancelled = false
    fetchRuntimeCaptchaProvider().then((provider) => {
      if (cancelled) return
      const next = provider !== 'hcaptcha' && Boolean(getTurnstileSiteKey())
      setUseTurnstile(next)
      setCaptchaModeReady(true)
      if (next) {
        setHCaptchaToken('')
        setHCaptchaError('')
      } else {
        setTurnstileToken('')
        setTurnstileError('')
      }
    })
    return () => {
      cancelled = true
    }
  }, [buildTimeTurnstile])

  useEffect(() => {
    const mq = window.matchMedia(MD_MIN_WIDTH_QUERY)
    const syncNameLayout = () => {
      const isMd = mq.matches
      setSplitNameFields(isMd)
      if (!isMd) {
        setFullNameInput(joinPersonName(formData.firstName, formData.lastName))
      }
    }
    syncNameLayout()
    mq.addEventListener('change', syncNameLayout)
    return () => mq.removeEventListener('change', syncNameLayout)
  }, [formData.firstName, formData.lastName])

  // Snap closed weekdays to the next open day.
  useEffect(() => {
    if (!isClosedBookingDate(selectedDate, hours)) return
    const openDate = nextOpenBookingDate(selectedDate, hours)
    setSelectedDate(openDate)
    setSelectedTime(defaultPreferredTime(openDate, hours))
    setToast({
      message: hours
        ? 'That day is closed. Please choose an open day.'
        : 'We are closed on Saturdays. Please choose Sunday–Friday.',
      variant: 'error',
    })
  }, [selectedDate, hours])

  useEffect(() => {
    const ranges = visibleTimeRanges(selectedDate, hours)
    if (ranges.length === 0) return
    if (!ranges.some((range) => range.id === selectedTime)) {
      setSelectedTime(defaultPreferredTime(selectedDate, hours))
    }
  }, [selectedDate, hours, selectedTime])

  const showSecurityCheck = isBookingEmailConfigured(features) && !isLocalHost
  const showLocalSecurityNotice = isBookingEmailConfigured(features) && isLocalHost
  const clinicLocations = overlayEnabled
    ? publicLocationsOrBaked(site.locations)
    : contactConfig.address.locations
  const selectedLocationDetails = clinicLocations.find((l) => l.id === selectedLocation)
  const defaultLocationId = clinicLocations[0]?.id ?? 'celbridge'
  const locationIds = clinicLocations.map((loc) => loc.id).join('|')
  const phoneCountry = getPhoneCountry(phoneCountryId)
  /** 08x mobile rule when Ireland is selected — independent of the country-lock flag. */
  const enforceIrishMobile = phoneCountry.id === 'IE'

  useEffect(() => {
    if (!clinicLocations.some((loc) => loc.id === selectedLocation)) {
      setSelectedLocation(defaultLocationId)
    }
  }, [locationIds, selectedLocation, defaultLocationId, clinicLocations])

  const resetHCaptcha = () => {
    setHCaptchaToken('')
    setHCaptchaReady(false)
    setHCaptchaError('')
    hCaptchaRef.current?.resetCaptcha()
  }

  const resetTurnstile = () => {
    setTurnstileToken('')
    setTurnstileError('')
    turnstileRef.current?.reset()
  }

  const catalog = overlayEnabled ? overlayCatalogOrNull(site) : null
  const clinicServices = catalog?.inClinicServices ?? inClinicServices
  const visitServices = catalog?.homeVisitServices ?? homeVisitServices
  const clinicAddOns = catalog?.inClinicAddOns ?? inClinicAddOns
  const visitAddOns = catalog?.homeVisitAddOns ?? homeVisitAddOns
  const showInClinic = catalog ? catalog.inClinicEnabled : true
  const showHomeVisit = catalog ? catalog.homeVisitEnabled : true
  const clinicList = catalog
    ? clinicServices
    : clinicServices.filter(
        (service) => features.treatmentPackagesEnabled || !service.id.includes('package')
      )
  const visitList = catalog
    ? visitServices
    : visitServices.filter(
        (service) => features.treatmentPackagesEnabled || !service.id.includes('package')
      )
  const services = activeTab === 'in-clinic' ? clinicList : visitList
  const addOns = activeTab === 'in-clinic' ? clinicAddOns : visitAddOns
  const serviceIds = services.map((row) => row.id).join('|')
  const addOnIds = addOns.map((row) => row.id).join('|')

  useEffect(() => {
    if (activeTab === 'in-clinic' && !showInClinic && showHomeVisit) {
      setActiveTab('call-out')
      setSelectedAddOns([])
    } else if (activeTab === 'call-out' && !showHomeVisit && showInClinic) {
      setActiveTab('in-clinic')
      setSelectedAddOns([])
    }
  }, [activeTab, showInClinic, showHomeVisit])

  useEffect(() => {
    if (!serviceIds) return
    const allowed = serviceIds.split('|')
    if (allowed.includes(selectedService)) return
    setSelectedService(allowed[0])
  }, [serviceIds, selectedService])

  useEffect(() => {
    const allowed = new Set(addOnIds.split('|').filter(Boolean))
    setSelectedAddOns((prev) => {
      const next = prev.filter((id) => allowed.has(id))
      return next.length === prev.length ? prev : next
    })
  }, [addOnIds])

  const hasFieldError = (key: FieldErrorKey) => fieldErrors.has(key)
  const fieldErrorMessage = (key: FieldErrorKey) => fieldErrorMessages[key]
  const emailSuggestion = emailTypoSuggestion(formData.email)

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

  const applyEmailSuggestion = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, email: suggestion }))
    clearFieldError('email')
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
    if (
      error.fields.includes('phone') &&
      shouldShowIrishMobileInvalidModal(formData.phone, phoneCountry, {
        strictIrishMobile: enforceIrishMobile,
        requireComplete: true,
      })
    ) {
      setIrishPhoneModalOpen(true)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    const list = tab === 'call-out' ? visitList : clinicList
    setSelectedService(list[0]?.id ?? '')
    setSelectedAddOns([])
    clearFieldError('service')
  }

  const handleVisitTypeKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isMdViewport()) return
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const nextTab = activeTab === 'in-clinic' ? 'call-out' : 'in-clinic'
    if (nextTab === 'in-clinic' && !showInClinic) return
    if (nextTab === 'call-out' && !showHomeVisit) return
    handleTabChange(nextTab)
    const nextButton = nextTab === 'in-clinic' ? inClinicTabRef.current : homeVisitTabRef.current
    nextButton?.focus()
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const name = e.target.name
    const value =
      name === 'phone' ? toE164(e.target.value, phoneCountry) : e.target.value

    setFormData({
      ...formData,
      [name]: value,
    })
    if (name === 'firstName' || name === 'lastName') {
      setFullNameInput(
        joinPersonName(
          name === 'firstName' ? value : formData.firstName,
          name === 'lastName' ? value : formData.lastName
        )
      )
      clearFieldError('firstName')
      clearFieldError('lastName')
      clearFieldError('fullName')
    } else if (name === 'email' || name === 'phone') {
      clearFieldError(name)
    }
  }

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setFullNameInput(next)
    const { firstName, lastName } = splitFullName(next)
    setFormData({
      ...formData,
      firstName,
      lastName,
    })
    clearFieldError('fullName')
    clearFieldError('firstName')
    clearFieldError('lastName')
  }

  const commitNormalizedName = (firstName: string, lastName: string) => {
    const parts = normalizeNameParts(firstName, lastName)
    setFormData((prev) => ({
      ...prev,
      firstName: parts.firstName,
      lastName: parts.lastName,
    }))
    setFullNameInput(joinPersonName(parts.firstName, parts.lastName))
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
      } else if (isClosedBookingDate(selectedDate, hours)) {
        fields.push('date')
        messages.push('We are closed on Saturdays. Please choose Sunday–Friday.')
      }
      if (!selectedTime) {
        fields.push('time')
        messages.push('Please choose a preferred time range.')
      } else if (selectedDate && isPastTimeRange(selectedDate, selectedTime, hours)) {
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

      if (splitNameFields === false) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          fields.push('fullName')
          messages.push('Please enter your first and last name.')
        }
      } else {
        if (!formData.firstName.trim()) {
          fields.push('firstName')
          messages.push('Please enter your first name.')
        }
        if (!formData.lastName.trim()) {
          fields.push('lastName')
          messages.push('Please enter your last name.')
        }
      }
      if (!formData.email.trim()) {
        fields.push('email')
        messages.push('Please enter your email address.')
      } else {
        const emailError = localEmailError(formData.email)
        if (emailError) {
          fields.push('email')
          messages.push(emailError)
        }
      }
      if (!formData.phone.trim()) {
        fields.push('phone')
        messages.push('Please enter your phone number.')
      } else if (
        !isValidBookingPhone(formData.phone, phoneCountry, {
          strictIrishMobile: enforceIrishMobile,
        })
      ) {
        fields.push('phone')
        messages.push(
          phoneCountry.id === 'IE'
            ? 'Please enter a valid Irish mobile number (e.g. 86 054 3085).'
            : `Please enter a valid ${phoneCountry.name} phone number.`
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

  const handleNext = async () => {
    // Belt-and-braces: never advance with a closed day still selected.
    if (currentStep === 2 && isClosedBookingDate(selectedDate, hours)) {
      const openDate = nextOpenBookingDate(selectedDate, hours)
      setSelectedDate(openDate)
      setSelectedTime(defaultPreferredTime(openDate, hours))
      reportValidationErrors({
        fields: ['date'],
        messages: [
          hours
            ? 'That day is closed. Please choose an open day.'
            : 'We are closed on Saturdays. Please choose Sunday–Friday.',
        ],
      })
      return
    }
    const error = validateStep(currentStep)
    if (error) {
      reportValidationErrors(error)
      return
    }
    if (currentStep === 3) {
      setEmailCheckBusy(true)
      try {
        const remote = await lookupEmailDeliverability(formData.email)
        if (remote) {
          reportValidationErrors({ fields: ['email'], messages: [remote] })
          return
        }
      } finally {
        setEmailCheckBusy(false)
      }
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
    setSelectedLocation(defaultLocationId)
    setSelectedService('initial-consultation')
    setSelectedAddOns([])
    setSelectedDate(defaultPreferredDate(hours))
    setSelectedTime(defaultPreferredTime(defaultPreferredDate(hours), hours))
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      message: '',
    })
    setFullNameInput('')
    setPhoneCountryId(DEFAULT_PHONE_COUNTRY_ID)
    resetHCaptcha()
    resetTurnstile()
  }

  const handleSubmit = async () => {
    const error = validateStep(3)
    if (error) {
      reportValidationErrors(error)
      return
    }
    setEmailCheckBusy(true)
    try {
      const remote = await lookupEmailDeliverability(formData.email)
      if (remote) {
        reportValidationErrors({ fields: ['email'], messages: [remote] })
        return
      }
    } finally {
      setEmailCheckBusy(false)
    }

    const selectedServiceDetails = services.find((s) => s.id === selectedService)
    const selectedAddOnLabels = selectedAddOns
      .map((id) => addOns.find((a) => a.id === id)?.name)
      .filter((name): name is string => Boolean(name))
    const { firstName, lastName } = normalizeNameParts(
      formData.firstName,
      formData.lastName
    )

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
        const range = visibleTimeRanges(selectedDate, hours).find(
          (item) => item.id === selectedTime
        )
        return range ? formatTimeRangeLabel(range) : selectedTime
      })(),
      ...formData,
      firstName,
      lastName,
      smsOptIn: overlayEnabled && site.features.smsEnabled ? smsOptIn : undefined,
    }

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

    const goToUnableToProcess = (
      technicalDetail: string,
      outcome: 'failed' | 'unknown' = 'failed'
    ) => {
      console.error('[booking submit]', technicalDetail)
      saveBookingSubmitOutcome(outcome)
      setToast(null)
      const unableUrl = new URL(
        '/bookings/unable-to-process/',
        window.location.origin
      ).href
      window.location.replace(unableUrl)
    }

    let patientConfirmationEmailQueued = false

    if (features.bookingEmailEnabled) {
      // Re-read so env fallback is always current at submit time
      const latestFeatures = overlayEnabled
        ? bookingFeaturesFromOverlay(site, readBookingFeatures())
        : readBookingFeatures()
      const mailFeatures = {
        ...latestFeatures,
        bookingEmailTo:
          overlayEnabled && site.email.address.trim()
            ? site.email.address.trim()
            : latestFeatures.bookingEmailTo,
      }
      if (!isBookingEmailConfigured(latestFeatures)) {
        goToUnableToProcess(
          latestFeatures.bookingEmailAccessKey &&
            !isValidWeb3FormsAccessKey(latestFeatures.bookingEmailAccessKey)
            ? 'Web3Forms access key must be a valid UUID. Check NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY and rebuild.'
            : 'Booking email is enabled but not configured. Set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY for this environment.'
        )
        return
      }

      // Captcha / live email: skip on localhost. Staging uses hCaptcha + Web3Forms.
      // Production Turnstile: Function siteverify, then browser posts to Web3Forms
      // (same clinic send as hCaptcha; avoids Web3Forms blocking Cloudflare IPs).
      if (isLocalDevHost()) {
        console.warn(
          '[booking submit] Skipping live booking email on localhost. Thank-you still opens for UI testing.'
        )
      } else {
        if (!captchaModeReady) {
          setTurnstileError('Please wait for the security check to finish, then send your request.')
          document.getElementById('booking-security-check')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          return
        }
        const useTurnstileWidget = useTurnstile
        if (useTurnstileWidget && !turnstileToken.trim()) {
          setTurnstileError('Please wait for the security check to finish, then send your request.')
          document.getElementById('booking-security-check')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          return
        }
        if (!useTurnstileWidget && !hCaptchaToken.trim()) {
          setHCaptchaError('Please complete the security check to send your request.')
          document.getElementById('booking-security-check')?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
          return
        }

        setHCaptchaError('')
        setTurnstileError('')

        setIsSubmitting(true)
        try {
          let result
          if (useTurnstileWidget) {
            const verified = await sendTurnstileBookingRequest(turnstileToken)
            result = verified.ok
              ? await sendBookingRequestEmail(payload, mailFeatures, undefined, {
                  skipHCaptcha: true,
                })
              : verified
          } else {
            result = await sendBookingRequestEmail(
              payload,
              mailFeatures,
              hCaptchaToken
            )
          }
          if (!result.ok) {
            setHCaptchaToken('')
            setTurnstileToken('')
            setHCaptchaError('')
            setTurnstileError('')
            hCaptchaRef.current?.resetCaptcha()
            turnstileRef.current?.reset()
            goToUnableToProcess(
              result.message ||
                'Could not send the booking email. Please try again or call the clinic.',
              result.reason === 'outcome-unknown' ? 'unknown' : 'failed'
            )
            return
          }
          // Clinic email sent (Web3Forms). Patient thank-you via Resend when available
          // (Cloudflare production). Staging/local skip Resend without blocking thank-you.
          // Overlay off: do not call /api/bff — production booking path stays Turnstile + Web3Forms.
          if (overlayEnabled) {
            void persistBookingRequest({
              firstName: payload.firstName,
              lastName: payload.lastName,
              email: payload.email,
              phone: payload.phone,
              serviceType: payload.serviceType,
              locationLabel: payload.locationLabel,
              serviceLabel: payload.serviceLabel,
              date: payload.date,
              time: payload.time,
              smsOptIn: site.features.smsEnabled && smsOptIn,
            })
          }
          const patientEmail = payload.email.trim()
          if (patientEmail) {
            try {
              const patientResult = await sendPatientThankYouEmail({
                firstName: payload.firstName,
                lastName: payload.lastName,
                email: patientEmail,
                serviceLabel: payload.serviceLabel,
                locationLabel: payload.locationLabel,
                date: payload.date,
                time: payload.time,
                serviceType: payload.serviceType,
                message: payload.message?.trim() || undefined,
              })
              patientConfirmationEmailQueued = patientResult.ok
            } catch (error) {
              console.error('[booking submit] patient thank-you failed', error)
            }
          }
        } finally {
          setIsSubmitting(false)
        }
      }
    }

    saveBookingThankYouSummary({
      firstName: payload.firstName,
      lastName: payload.lastName,
      // Only claim "email on its way" when Resend actually accepted the send.
      email: patientConfirmationEmailQueued ? payload.email : undefined,
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
      <BookingPhoneInvalidModal
        open={irishPhoneModalOpen}
        enteredNumber={
          formData.phone.trim()
            ? `${phoneCountry.dial} ${formatLocalPhoneInput(formData.phone, phoneCountry)}`.trim()
            : undefined
        }
        onClose={() => setIrishPhoneModalOpen(false)}
        onTryAnother={() => {
          setIrishPhoneModalOpen(false)
          requestAnimationFrame(() => {
            document.getElementById('phone')?.focus({ preventScroll: true })
          })
        }}
      />

      <div inert={irishPhoneModalOpen ? true : undefined}>
      <BookingStepper
        steps={STEPS}
        currentStep={currentStep}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting || emailCheckBusy}
        submitLabel="Request appointment"
        nextDisabled={
          emailCheckBusy ||
          (currentStep === 0 && !selectedLocation) ||
          (currentStep === 1 && !selectedService) ||
          (currentStep === 2 &&
            (!selectedDate ||
              isClosedBookingDate(selectedDate, hours) ||
              !selectedTime ||
              isPastTimeRange(selectedDate, selectedTime, hours)))
        }
        stepFocusId={
          currentStep === 3
            ? isMdViewport()
              ? 'firstName'
              : 'fullName'
            : STEP_ENTRY_FOCUS_IDS[currentStep]
        }
      >
        {currentStep === 0 && (
          <div className="space-y-6">
            <BookingStepIntro
              icon={MapPin}
              subtitle="Step 1 of 4 – takes ~2 minutes"
            />

            <div className="space-y-3">
              <p className="text-center text-base font-semibold text-[var(--text-dark)]">
                Where would you like your appointment?
              </p>

              <div
                className="relative flex border-b border-accent/20"
                role="tablist"
                aria-label="Visit type"
                onKeyDown={handleVisitTypeKeyDown}
              >
                <span
                  aria-hidden
                  className={`booking-service-tab__indicator ${
                    activeTab === 'call-out' ? 'booking-service-tab__indicator--call-out' : ''
                  }`}
                />
                {showInClinic ? (
                <button
                  ref={inClinicTabRef}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'in-clinic'}
                  tabIndex={activeTab === 'in-clinic' ? 0 : -1}
                  onClick={() => handleTabChange('in-clinic')}
                  className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base ${
                    activeTab === 'in-clinic' ? 'booking-service-tab--active' : ''
                  }`}
                >
                  <Building2 className="h-5 w-5 shrink-0" aria-hidden />
                  In Clinic
                </button>
                ) : null}
                {showHomeVisit ? (
                <button
                  ref={homeVisitTabRef}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'call-out'}
                  tabIndex={activeTab === 'call-out' ? 0 : -1}
                  onClick={() => handleTabChange('call-out')}
                  className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-sm sm:text-base ${
                    activeTab === 'call-out' ? 'booking-service-tab--active' : ''
                  }`}
                >
                  <Home className="h-5 w-5 shrink-0" aria-hidden />
                  Home Visit
                </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <p className="flex items-start text-base text-secondary">
                <MapPin className="mr-2 mt-0.5 h-5 w-5 shrink-0 text-primary" />
                {activeTab === 'call-out'
                  ? 'Where would you like your home visit?'
                  : 'Choose your clinic'}
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
            <BookingStepIntro
              icon={Leaf}
              subtitle="Step 2 of 4 – takes ~2 minutes"
            />

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
            <BookingStepIntro
              icon={Calendar}
              subtitle="Step 3 of 4 – takes ~1 minute"
            />

            <div className="min-w-0 w-full max-w-full">
              <label htmlFor="booking-date" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                Preferred Date <RequiredMark />
              </label>
              <div className="booking-date-field booking-date-field--picker relative">
                <BookingDatePicker
                  id="booking-date"
                  value={selectedDate}
                  min={defaultPreferredDate(hours)}
                  hours={hours}
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
                    if (selectedTime && isPastTimeRange(nextDate, selectedTime, hours)) {
                      setSelectedTime(defaultPreferredTime(nextDate, hours))
                      clearFieldError('time')
                    }
                  }}
                />
              </div>
              <p id="booking-date-hint" className="mt-1.5 text-xs text-secondary">
                Next available starts from{' '}
                {new Date(`${defaultPreferredDate(hours)}T12:00:00`).toLocaleDateString('en-IE', {
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
                className="mb-1 block text-sm font-medium text-[var(--text-dark)]"
              >
                Preferred time <RequiredMark />
              </p>
              <p className="mb-3 text-sm text-[var(--text-dark)]/70">
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
                  hours={hours}
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
            <BookingStepIntro
              icon={ClipboardList}
              title="Almost there — confirm your details"
              subtitle="Step 4 of 4"
            />

            <div>
              <h3 className="mb-4 flex items-center font-serif text-xl font-bold text-[var(--text-dark)]">
                <User className="mr-2 h-5 w-5 shrink-0 text-primary" aria-hidden strokeWidth={1.75} />
                Contact details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                {splitNameFields === false ? (
                <div className="min-w-0">
                  <label htmlFor="fullName" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Full Name <RequiredMark />
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={fullNameInput}
                    onChange={handleFullNameChange}
                    onBlur={(e) => {
                      const parts = splitFullName(e.currentTarget.value)
                      commitNormalizedName(parts.firstName, parts.lastName)
                    }}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    aria-invalid={hasFieldError('fullName')}
                    aria-describedby={
                      fieldErrorMessage('fullName') ? 'fullName-error' : undefined
                    }
                    className={hasFieldError('fullName') ? fieldErrorClassName : inputClassName}
                  />
                  <FieldInlineError
                    id="fullName-error"
                    message={fieldErrorMessage('fullName')}
                  />
                </div>
                ) : null}
                {splitNameFields === true ? (
                <>
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
                      onBlur={(e) =>
                        commitNormalizedName(e.currentTarget.value, formData.lastName)
                      }
                      autoComplete="given-name"
                      placeholder="Enter your first name"
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
                      onBlur={(e) =>
                        commitNormalizedName(formData.firstName, e.currentTarget.value)
                      }
                      autoComplete="family-name"
                      placeholder="Enter your last name"
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
                </>
                ) : null}
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
                    onBlur={(e) => {
                      const value = e.currentTarget.value
                      void (async () => {
                        const local = localEmailError(value)
                        if (local) {
                          reportValidationErrors({ fields: ['email'], messages: [local] })
                          return
                        }
                        if (emailTypoSuggestion(value)) return
                        const remote = await lookupEmailDeliverability(value)
                        if (remote) {
                          reportValidationErrors({ fields: ['email'], messages: [remote] })
                        }
                      })()
                    }}
                    placeholder="Enter your email address"
                    aria-invalid={hasFieldError('email')}
                    aria-describedby={
                      [
                        fieldErrorMessage('email') ? 'email-error' : '',
                        emailSuggestion ? 'email-suggestion' : '',
                      ]
                        .filter(Boolean)
                        .join(' ') || undefined
                    }
                    className={hasFieldError('email') ? fieldErrorClassName : inputClassName}
                  />
                  {emailSuggestion ? (
                    <EmailTypoSuggestion
                      suggestion={emailSuggestion}
                      onApply={applyEmailSuggestion}
                    />
                  ) : null}
                  <FieldInlineError id="email-error" message={fieldErrorMessage('email')} />
                </div>
                <div className="min-w-0">
                  <label htmlFor="phone" className="block text-sm font-medium text-[var(--text-dark)] mb-2">
                    Phone Number <RequiredMark />
                  </label>
                  <div
                    className={
                      hasFieldError('phone')
                        ? 'flex w-full min-w-0 max-w-full box-border items-stretch overflow-hidden rounded-lg border-2 border-red-500 bg-red-50/40 focus-within:ring-2 focus-within:ring-red-400'
                        : 'flex w-full min-w-0 max-w-full box-border items-stretch overflow-hidden rounded-lg border border-accent/30 bg-white focus-within:border-transparent focus-within:ring-2 focus-within:ring-accent'
                    }
                  >
                    <div className="relative flex shrink-0 items-center border-r border-accent/30 bg-white">
                      <div
                        className={`pointer-events-none flex items-center gap-2 py-3 pl-3 ${
                          lockCountryPicker ? 'pr-3' : 'pr-7'
                        }`}
                      >
                        <PhoneFlagIcon countryId={phoneCountry.id} />
                        <span className="whitespace-nowrap text-sm font-medium text-[var(--text-dark)]">
                          {phoneCountry.dial}
                        </span>
                      </div>
                      {lockCountryPicker ? (
                        <span className="sr-only">
                          {phoneCountry.name} country code {phoneCountry.dial}, locked
                        </span>
                      ) : (
                        <>
                          <ChevronDown
                            className="pointer-events-none absolute right-1.5 h-3.5 w-3.5 text-[var(--text-dark)]/50"
                            aria-hidden
                            strokeWidth={2.25}
                          />
                          <select
                            id="phone-country"
                            name="phoneCountry"
                            value={phoneCountry.id}
                            aria-label="Country code"
                            disabled={irishPhoneModalOpen}
                            onChange={(e) => {
                              const nextCountry = getPhoneCountry(e.target.value)
                              const local = subscriberDigits(formData.phone, phoneCountry)
                              setPhoneCountryId(nextCountry.id)
                              setFormData((prev) => ({
                                ...prev,
                                phone: toE164(local, nextCountry),
                              }))
                              clearFieldError('phone')
                            }}
                            className="absolute inset-0 cursor-pointer opacity-0"
                          >
                            {PHONE_COUNTRIES.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.name} ({country.dial})
                              </option>
                            ))}
                          </select>
                        </>
                      )}
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formatLocalPhoneInput(formData.phone, phoneCountry)}
                      onChange={handleChange}
                      placeholder={phoneCountry.placeholder}
                      inputMode={enforceIrishMobile ? 'numeric' : 'tel'}
                      autoComplete={enforceIrishMobile ? 'tel-national' : 'tel'}
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
              <h3 className="mb-4 flex items-center font-serif text-xl font-bold text-[var(--text-dark)]">
                <Calendar className="mr-2 h-5 w-5 shrink-0 text-primary" aria-hidden strokeWidth={1.75} />
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
                    Message{' '}
                    <span className="font-normal text-[var(--text-dark)]/55">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Anything we should know before your visit?"
                    className={`${inputClassName} min-h-[6.5rem] resize-y`}
                  />
                </div>
                {overlayEnabled && site.features.smsEnabled ? (
                  <div className="min-w-0 w-full max-w-full">
                    <p className="block text-sm font-medium text-[var(--text-dark)] mb-1">
                      Appointment reminders
                    </p>
                    <p className="mb-3 text-sm text-[var(--text-dark)]/55">
                      We&apos;ll still email you either way.
                    </p>
                    <label className="flex items-start gap-2 text-sm text-[var(--text-dark)]">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                      />
                      <span>
                        <span className="font-medium">Text me appointment updates</span>
                        <span className="mt-0.5 block text-[var(--text-dark)]/55">
                          Confirmation, a reminder the day before, and important changes or
                          cancellations.
                        </span>
                      </span>
                    </label>
                  </div>
                ) : null}
              </div>
            </div>

            <p className="flex w-full items-center justify-center gap-3 text-center text-sm text-[var(--text-dark)]/70">
              <span
                className="hidden h-[1px] min-w-[2.5rem] flex-1 bg-[#8a8a8a] md:block"
                aria-hidden
              />
              <span className="inline-flex items-center justify-center gap-1.5 md:max-w-[70%] md:shrink-0">
                <Lock className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden strokeWidth={1.75} />
                Your information is secure and private.
              </span>
              <span
                className="hidden h-[1px] min-w-[2.5rem] flex-1 bg-[#8a8a8a] md:block"
                aria-hidden
              />
            </p>

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
                {!captchaModeReady ? (
                  <div
                    className="mx-auto h-[65px] w-full max-w-[300px] rounded-md bg-accent/10 animate-pulse"
                    aria-hidden="true"
                  />
                ) : useTurnstile ? (
                  <>
                    <div
                      className={`flex justify-center rounded-lg p-1 transition-colors ${
                        turnstileError
                          ? 'ring-2 ring-red-400 ring-offset-2 ring-offset-cream'
                          : ''
                      }`}
                    >
                      <Turnstile
                        ref={turnstileRef}
                        siteKey={turnstileSiteKey}
                        options={{ size: 'flexible', theme: 'light' }}
                        onSuccess={(token) => {
                          setTurnstileToken(token)
                          setTurnstileError('')
                        }}
                        onExpire={() => {
                          setTurnstileToken('')
                          setTurnstileError('Security check expired. Please wait a moment and try again.')
                        }}
                        onError={() => {
                          setTurnstileToken('')
                          setTurnstileError('Security check failed to load. Please try again.')
                        }}
                      />
                    </div>
                    {turnstileError ? (
                      <p className="text-center text-sm text-red-700" role="alert">
                        {turnstileError}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </BookingStepper>
      </div>
    </>
  )
}
