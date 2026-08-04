'use client'

import { Phone, Mail, Calendar } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  CTAButton,
  OptionalAddOns,
  ClinicLocationCards,
  ServiceSelectionCards,
  HeroSection,
  TravelPolicyNotice,
  SectionHeading,
} from '../../features'
import { contactConfig } from '@/lib/contact-config'
import CalendlyEmbed, { buildCalendlyUrl } from '@/components/CalendlyEmbed'
import BookingForm from '@/components/BookingForm'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getFreshaOpenAttrs,
  isFreshaBookingConfigured,
  resolveCalendlyUrlForService,
} from '@/lib/booking-features'

type BookingService = {
  id: string
  name: string
  duration: string
  price: string
  description: string
  savings?: string
}

const panelClass =
  'bg-white rounded-xl p-3.5 md:p-6 border border-accent/15'

export default function Bookings() {
  const { features } = useBookingFeatures()
  const bookingFormEnabled = features.bookingFormEnabled
  const calendlyEnabled = features.calendlyEnabled
  const freshaEnabled = features.freshaEnabled
  const freshaReady = isFreshaBookingConfigured(features)
  const { initialLabel, followUpLabel } = contactConfig.calendly.durations

  const [activeTab, setActiveTab] = useState('in-clinic')
  const [selectedLocation, setSelectedLocation] = useState('celbridge')
  const [selectedService, setSelectedService] = useState('initial-consultation')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const clinicLocations = contactConfig.address.locations
  const selectedLocationDetails = clinicLocations.find((l) => l.id === selectedLocation)

  const inClinicServices: BookingService[] = [
    {
      id: 'initial-consultation',
      name: 'Initial Consultation & First Treatment',
      duration: initialLabel,
      price: '€75',
      description: 'Comprehensive health assessment with personalized treatment plan and first acupuncture session'
    },
    {
      id: 'follow-up',
      name: 'Follow-up Sessions',
      duration: followUpLabel,
      price: '€60',
      description: 'Tailored acupuncture treatment based on your progress and ongoing needs'
    },
    {
      id: 'package-5',
      name: 'Treatment Package (5 sessions)',
      duration: 'Multiple visits',
      price: '€270',
      description: 'Save €30 with our 5-session package (Valid for 6 months – non-transferable)',
      savings: 'Save €30'
    },
    {
      id: 'package-10',
      name: 'Treatment Package (10 sessions)',
      duration: 'Multiple visits',
      price: '€520',
      description: 'Save €80 with our 10-session package (Valid for 6 months – non-transferable)',
      savings: 'Save €80'
    }
  ]

  const homeVisitServices: BookingService[] = [
    {
      id: 'home-initial-consultation',
      name: 'Initial Consultation & First Treatment',
      duration: initialLabel,
      price: '€90',
      description: 'Comprehensive health assessment with personalized treatment plan and first acupuncture session at your home'
    },
    {
      id: 'home-follow-up',
      name: 'Follow-up Sessions',
      duration: followUpLabel,
      price: '€75',
      description: 'Tailored acupuncture treatment in the comfort of your home'
    },
    {
      id: 'home-package-5',
      name: 'Treatment Package (5 sessions)',
      duration: 'Multiple visits',
      price: '€350',
      description: 'Save €25 with our 5-session home visit package (Valid for 6 months)',
      savings: 'Save €25'
    },
    {
      id: 'home-package-10',
      name: 'Treatment Package (10 sessions)',
      duration: 'Multiple visits',
      price: '€690',
      description: 'Save €60 with our 10-session home visit package (Valid for 6 months)',
      savings: 'Save €60'
    }
  ]

  const inClinicAddOns = [
    {
      id: 'cupping',
      name: 'Cupping Therapy',
      price: '€20',
      description: 'Therapeutic cupping treatment as an add-on to your acupuncture session'
    },
    {
      id: 'moxibustion',
      name: 'Moxibustion',
      price: 'Free (if required)',
      description: 'Traditional warming therapy using dried mugwort to stimulate acupuncture points'
    }
  ]

  const homeVisitAddOns = [
    {
      id: 'home-cupping',
      name: 'Cupping Therapy',
      price: '€25',
      description: 'Therapeutic cupping treatment as an add-on to your home acupuncture session'
    },
    {
      id: 'moxibustion',
      name: 'Moxibustion',
      price: 'Free (if required)',
      description: 'Traditional warming therapy using dried mugwort to stimulate acupuncture points'
    }
  ]

  const services = (activeTab === 'in-clinic' ? inClinicServices : homeVisitServices).filter(
    (service) =>
      features.treatmentPackagesEnabled || !service.id.includes('package')
  )
  const addOns = activeTab === 'in-clinic' ? inClinicAddOns : homeVisitAddOns
  const selectedServiceDetails = services.find((s) => s.id === selectedService)
  const selectedAddOnLabels = selectedAddOns
    .map((id) => addOns.find((a) => a.id === id)?.name)
    .filter((name): name is string => Boolean(name))
  const canOpenScheduler = Boolean(selectedLocation && selectedService)

  useEffect(() => {
    if (!features.treatmentPackagesEnabled && selectedService.includes('package')) {
      setSelectedService(
        activeTab === 'call-out' ? 'home-initial-consultation' : 'initial-consultation'
      )
    }
  }, [features.treatmentPackagesEnabled, selectedService, activeTab])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSelectedService(
      tab === 'call-out' ? 'home-initial-consultation' : 'initial-consultation'
    )
    setSelectedAddOns([])
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Book Your Appointment"
        subtitle="Take the first step towards better health and wellness"
        description="Schedule your consultation with our experienced practitioner and begin your journey to optimal health today."
        backgroundImage="/hero_wellness_acupuncture.jpeg"
        backgroundClass="bg-primary"
        textColor="text-cream"
        showFloatingLeaves={true}
      />

      {/* Booking Form or Pricing Display */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:gap-8">
            <div className="min-w-0 order-1">
              {bookingFormEnabled ? (
                <div>
                  <SectionHeading
                    title="Request an appointment"
                    subtitle="Share your preferred service and time — we will confirm by email or phone."
                    titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3"
                    className="text-center mb-10"
                  />
                  <BookingForm />
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="text-center mb-12">
                    <SectionHeading
                      title="Our services & pricing"
                      subtitle="Professional acupuncture treatments to support your health and wellness journey"
                      titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-3"
                      className="text-center mb-6"
                    />
                    {!calendlyEnabled && !freshaEnabled && (
                      <div className={`${panelClass} max-w-2xl mx-auto`}>
                        <h3 className="font-semibold text-primary mb-2 flex items-center justify-center">
                          <Phone className="w-5 h-5 mr-2" />
                          Ready to book your appointment?
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-secondary text-sm mb-4">
                          Call us directly to schedule your consultation and begin your path to better health
                        </p>
                        <a
                          href={contactConfig.phone.href}
                          className="bg-primary text-cream px-8 py-3 rounded-full text-lg font-semibold hover:bg-secondary transition-all duration-300 inline-flex items-center justify-center"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call {contactConfig.phone.displayText}
                        </a>
                      </div>
                    )}

                    {freshaEnabled && (
                      <div className={`${panelClass} max-w-2xl mx-auto mt-6`}>
                        <h3 className="font-semibold text-primary mb-2 text-center text-xl">
                          Book on Fresha
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-secondary text-sm mb-4 text-center">
                          Review services below, then continue to Fresha to pick a time and
                          confirm your booking.
                        </p>
                        {freshaReady ? (
                          <div className="flex justify-center">
                            <a
                              href={features.freshaBookingUrl.trim()}
                              {...getFreshaOpenAttrs()}
                              className="bg-primary text-cream px-8 py-3 rounded-full text-lg font-semibold hover:bg-secondary transition-all duration-300 inline-flex items-center justify-center"
                            >
                              Continue to Fresha
                            </a>
                          </div>
                        ) : (
                          <p className="text-center text-sm text-red-700" role="alert">
                            Fresha is enabled but the booking URL is missing or invalid. Set it in{' '}
                            <a href="/admin" className="font-medium underline">
                              Admin
                            </a>
                            .
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tab Navigation for Pricing */}
                  <div className={`${panelClass} !p-3.5 sm:!p-6 md:!p-8`}>
                    <div className="flex border-b border-accent/20 mb-6">
                      <button
                        type="button"
                        onClick={() => handleTabChange('in-clinic')}
                        className={`booking-service-tab px-4 sm:px-6 py-3 text-sm sm:text-base ${
                          activeTab === 'in-clinic' ? 'booking-service-tab--active' : ''
                        }`}
                      >
                        In clinic services
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('call-out')}
                        className={`booking-service-tab px-4 sm:px-6 py-3 text-sm sm:text-base ${
                          activeTab === 'call-out' ? 'booking-service-tab--active' : ''
                        }`}
                      >
                        Home visit services
                      </button>
                    </div>

                    {/* Service first, then location (Fresha / Calendly flow) */}
                    <div className="mb-8">
                      <h3 className="font-serif text-xl font-bold text-[var(--text-dark)] mb-2">Service</h3>
                      <div className="mb-4 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                      <ServiceSelectionCards
                        services={services}
                        selectedId={selectedService}
                        onSelect={setSelectedService}
                        name="pricing-service"
                        largePrice
                      />
                    </div>

                    <div className="mb-8">
                      <h3 className="font-serif text-xl font-bold text-[var(--text-dark)] mb-2">
                        {activeTab === 'call-out'
                          ? 'Nearest clinic / service area'
                          : 'Clinic location'}
                      </h3>
                      <div className="mb-2 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                      <p className="text-sm text-secondary mb-4">
                        {activeTab === 'call-out'
                          ? 'Choose which clinic area this home visit is noted under. Availability is shared across both clinics — one practitioner runs Celbridge and Carlow.'
                          : 'Select which clinic you will attend. Availability is shared across both clinics — a booking at one location blocks that time at the other.'}
                      </p>
                      <ClinicLocationCards
                        locations={clinicLocations}
                        selectedId={selectedLocation}
                        onSelect={setSelectedLocation}
                        name="pricing-location"
                      />
                    </div>

                    {activeTab === 'call-out' && (
                      <TravelPolicyNotice className="mb-8" />
                    )}

                    <OptionalAddOns
                      addOns={addOns}
                      selectedIds={selectedAddOns}
                      onToggle={handleAddOnToggle}
                    />

                    {/* Practitioner Information */}
                    <div className={`mt-8 ${panelClass}`}>
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border border-accent/25">
                          <Image
                            src="/Arkinth_clinic_founder.jpeg"
                            alt="Arkinth Garcia - Naturopath & Acupuncturist"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-xl text-[var(--text-dark)] mb-2">Arkinth Garcia</h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-secondary text-sm mb-2">Naturopath & Acupuncturist</p>
                        <p className="text-secondary text-sm">
                          Qualified from the College of Naturopathic Medicine, Dublin. Specializing in
                          pain management, mental health conditions, digestive issues, and fertility support.
                        </p>
                      </div>
                    </div>
                  </div>

                  {calendlyEnabled && !freshaEnabled && (
                    <div className={`${panelClass} !p-3.5 sm:!p-5 md:!p-6`}>
                      <div className="text-center mb-5 max-w-xl mx-auto">
                        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[var(--text-dark)] mb-2">
                          Confirm your booking
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-sm text-secondary">
                          Pick a time in the calendar below to confirm your appointment.
                          Your selections above are included with the booking.
                        </p>
                      </div>

                      {canOpenScheduler && (
                        <div className="mb-5 rounded-xl border border-accent/15 bg-cream p-4 max-w-2xl mx-auto">
                          <p className="font-semibold text-primary mb-2 text-center text-sm sm:text-base">
                            Your booking summary
                          </p>
                          <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wide text-secondary/80 mb-0.5">
                                Visit type
                              </dt>
                              <dd className="font-medium text-primary">
                                {activeTab === 'call-out' ? 'Home Visit' : 'In Clinic'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wide text-secondary/80 mb-0.5">
                                Service / package
                              </dt>
                              <dd className="font-medium text-primary">
                                {selectedServiceDetails?.name ?? 'Not selected'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wide text-secondary/80 mb-0.5">
                                Location
                              </dt>
                              <dd className="font-medium text-primary">
                                {selectedLocationDetails
                                  ? `${selectedLocationDetails.label} — ${selectedLocationDetails.formatted.street}`
                                  : 'Not selected'}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium uppercase tracking-wide text-secondary/80 mb-0.5">
                                Add-ons
                              </dt>
                              <dd className="font-medium text-primary">
                                {selectedAddOnLabels.length > 0
                                  ? selectedAddOnLabels.join(', ')
                                  : 'None'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      )}

                      {!canOpenScheduler ? (
                        <div className="rounded-xl border border-dashed border-accent/40 bg-cream/60 px-5 py-10 text-center max-w-xl mx-auto">
                          <Calendar
                            className="w-8 h-8 text-primary/50 mx-auto mb-3"
                            aria-hidden
                          />
                          <p className="font-medium text-primary mb-1">
                            Calendar not ready yet
                          </p>
                          <p className="text-sm text-secondary">
                            Select a service and location above to open the calendar.
                          </p>
                        </div>
                      ) : (
                        <CalendlyEmbed
                          url={buildCalendlyUrl(
                            resolveCalendlyUrlForService(features, selectedService),
                            {
                              bookingSource: activeTab === 'call-out' ? 'home-visit' : 'in-clinic',
                              locationId: selectedLocation,
                              locationLabel: selectedLocationDetails
                                ? `${selectedLocationDetails.label} — ${selectedLocationDetails.full}`
                                : undefined,
                              serviceId: selectedService,
                              serviceLabel: selectedServiceDetails?.name,
                              addOnIds: selectedAddOns,
                              addOnLabels: selectedAddOnLabels,
                            }
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick call/email — below form on mobile; sticky side column on tablet+ */}
            <aside
              className="order-2 mx-auto mt-6 w-full max-w-xs rounded-xl border border-accent/15 bg-accent/10 p-3 md:sticky md:top-24 md:mx-0 md:mt-0 md:max-w-none md:self-start md:p-4 lg:p-5"
            >
              <h3 className="mb-0.5 text-base font-semibold text-primary md:mb-1 md:text-lg">
                Need help?
              </h3>
              <p className="mb-3 text-sm leading-relaxed text-[var(--text-dark)]/70 md:mb-4 md:text-base">
                Prefer to call or email — we can help you book.
              </p>
              <div className="flex flex-col gap-2 md:gap-2.5">
                <div>
                  <CTAButton
                    href={contactConfig.phone.href}
                    variant="gold"
                    size="medium"
                    showArrow={false}
                    className="w-full !rounded-full !px-4 !py-2.5 !text-sm !font-semibold gap-1.5 transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    Call Now
                  </CTAButton>
                  <p className="mt-1.5 text-center text-sm text-[var(--text-dark)]/70 md:mt-2">
                    {contactConfig.phone.displayText}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 md:gap-3" aria-hidden="true">
                  <div className="h-px flex-1 bg-accent/25" />
                  <span className="text-[10px] font-medium uppercase tracking-wide text-secondary md:text-xs">
                    Or
                  </span>
                  <div className="h-px flex-1 bg-accent/25" />
                </div>

                <div>
                  <CTAButton
                    href={contactConfig.email.href}
                    variant="outline"
                    size="medium"
                    showArrow={false}
                    className="w-full !rounded-full !px-4 !py-2.5 !text-sm !font-medium gap-1.5 bg-cream/80 !shadow-none transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    Send a message
                  </CTAButton>
                  <p className="mt-1.5 text-center text-sm text-[var(--text-dark)]/70 md:mt-2">
                    We reply within 24 hours
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
