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
        backgroundImage="/treatment_in_progress_bed.jpeg"
        backgroundClass="bg-primary"
        textColor="text-cream"
        heightClass="py-20"
        showFloatingLeaves={true}
      />

      {/* Booking Form or Pricing Display */}
      <section className="py-20 bg-cream">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_minmax(16rem,18rem)] lg:gap-8 lg:items-start">
            <div className="min-w-0 order-1 lg:order-1">
              {bookingFormEnabled ? (
                <BookingForm />
              ) : (
                <div className="space-y-12">
                  <div className="text-center mb-12">
                    <h2 className="font-serif text-3xl font-bold text-primary mb-4">
                      Our Services & Pricing
                    </h2>
                    <p className="text-lg text-secondary mb-6">
                      Professional acupuncture treatments to support your health and wellness journey
                    </p>
                    {!calendlyEnabled && !freshaEnabled && (
                      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 max-w-2xl mx-auto">
                        <h3 className="font-semibold text-primary mb-3 flex items-center justify-center">
                          <Phone className="w-5 h-5 mr-2" />
                          Ready to book your appointment?
                        </h3>
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
                      <div className="bg-accent/5 border border-accent/20 rounded-xl p-6 max-w-2xl mx-auto mt-6">
                        <h3 className="font-semibold text-primary mb-3 text-center text-xl">
                          Book on Fresha
                        </h3>
                        <p className="text-secondary text-sm mb-4 text-center">
                          Review services below, then continue to Fresha to choose a time.
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
                  <div className="bg-accent/5 rounded-lg p-8">
                    <div className="flex border-b border-accent/20 mb-6">
                      <button
                        type="button"
                        onClick={() => handleTabChange('in-clinic')}
                        className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                          activeTab === 'in-clinic'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-secondary hover:text-primary'
                        }`}
                      >
                        In Clinic Services
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('call-out')}
                        className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                          activeTab === 'call-out'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-secondary hover:text-primary'
                        }`}
                      >
                        Home Visit Services
                      </button>
                    </div>

                    {/* Service first, then location (Fresha / Calendly flow) */}
                    <div className="mb-8">
                      <h3 className="font-serif text-xl font-bold text-primary mb-4">
                        Service
                      </h3>
                      <ServiceSelectionCards
                        services={services}
                        selectedId={selectedService}
                        onSelect={setSelectedService}
                        name="pricing-service"
                        largePrice
                      />
                    </div>

                    <div className="mb-8">
                      <h3 className="font-serif text-xl font-bold text-primary mb-2">
                        {activeTab === 'call-out' ? 'Nearest Clinic / Service Area' : 'Clinic Location'}
                      </h3>
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
                    <div className="mt-8 p-6 bg-primary/5 border-2 border-primary rounded-lg">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full mx-auto mb-4 overflow-hidden border-2 border-primary/20">
                          <Image
                            src="/Arkinth_clinic_founder.jpeg"
                            alt="Arkinth Garcia - Naturopath & Acupuncturist"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-semibold text-xl text-primary mb-2">Arkinth Garcia</h3>
                        <p className="text-secondary text-sm mb-2">Naturopath & Acupuncturist</p>
                        <p className="text-secondary text-sm">
                          Qualified from the College of Naturopathic Medicine, Dublin. Specializing in
                          pain management, mental health conditions, digestive issues, and fertility support.
                        </p>
                      </div>
                    </div>
                  </div>

                  {calendlyEnabled && !freshaEnabled && (
                    <div className="bg-accent/5 border border-accent/20 rounded-xl p-5 sm:p-6">
                      <div className="text-center mb-5 max-w-xl mx-auto">
                        <h3 className="font-serif text-xl sm:text-2xl font-semibold text-primary mb-2">
                          Schedule a booking
                        </h3>
                        <p className="text-sm text-secondary">
                          Pick a time — your selections above are included with the booking.
                        </p>
                      </div>

                      {canOpenScheduler && (
                        <div className="mb-5 rounded-xl border border-accent/25 bg-cream p-4 max-w-2xl mx-auto">
                          <p className="font-semibold text-primary mb-3 text-center text-sm sm:text-base">
                            Your booking summary
                          </p>
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

            {/* Contact CTA — below form on mobile, sticky sidebar on desktop */}
            <aside className="order-2 lg:order-2 w-full mt-6 lg:mt-0 lg:sticky lg:top-24 p-5 rounded-xl bg-accent/15 shadow-lg shadow-primary/15 border border-accent/20 card-emboss">
              <h3 className="font-semibold text-base text-primary mb-2">
                Ready to Schedule?
              </h3>
              <p className="text-sm text-secondary mb-4">
                Prefer to call or message us instead.
              </p>
              <div className="space-y-2.5">
                <CTAButton
                  href={contactConfig.phone.href}
                  variant="gold"
                  size="medium"
                  showArrow={false}
                  className="w-full !rounded-full !px-3 text-xs sm:text-sm font-bold gap-1.5 !whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden />
                  {contactConfig.phone.displayText}
                </CTAButton>
                <CTAButton
                  href={contactConfig.email.href}
                  variant="outline"
                  size="medium"
                  showArrow={false}
                  className="w-full !rounded-full text-sm font-medium gap-2"
                >
                  <Mail className="w-4 h-4 shrink-0" aria-hidden />
                  Send message
                </CTAButton>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
