'use client'

import { Building2, Calendar, Home, Mail, Phone } from 'lucide-react'
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
  glassGreenPanelClassName,
} from '../../features'
import { contactConfig } from '@/lib/contact-config'
import { usePublicContact } from '@/lib/site-overlay'
import { withOverlayCatalog } from '@/lib/overlay-public'
import CalendlyEmbed, { buildCalendlyUrl } from '@/components/CalendlyEmbed'
import BookingForm from '@/components/BookingForm'
import { useBookingFeatures } from '@/hooks/useBookingFeatures'
import {
  getFreshaOpenAttrs,
  isFreshaBookingConfigured,
  resolveCalendlyUrlForService,
} from '@/lib/booking-features'
import {
  homeVisitAddOns,
  homeVisitServices,
  inClinicAddOns,
  inClinicServices,
} from '@/lib/booking-catalog'

const panelClass =
  'bg-white rounded-xl p-3.5 md:p-6 border border-accent/15'

export default function Bookings() {
  const { overlayEnabled, site, phoneHref, phoneText, emailHref, locations } = usePublicContact()
  const catalog = overlayEnabled ? withOverlayCatalog(site) : null
  const { features } = useBookingFeatures()
  const bookingFormEnabled = features.bookingFormEnabled
  const calendlyEnabled = features.calendlyEnabled
  const freshaEnabled = features.freshaEnabled
  const freshaReady = isFreshaBookingConfigured(features)

  const [activeTab, setActiveTab] = useState('in-clinic')
  const [selectedLocation, setSelectedLocation] = useState('celbridge')
  const [selectedService, setSelectedService] = useState('initial-consultation')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const clinicLocations = locations
  const selectedLocationDetails = clinicLocations.find((l) => l.id === selectedLocation)
  const defaultLocationId = clinicLocations[0]?.id ?? 'celbridge'

  const clinicServices = catalog?.inClinicServices ?? inClinicServices
  const visitServices = catalog?.homeVisitServices ?? homeVisitServices
  const clinicAddOns = catalog?.inClinicAddOns ?? inClinicAddOns
  const visitAddOns = catalog?.homeVisitAddOns ?? homeVisitAddOns

  const services = (activeTab === 'in-clinic' ? clinicServices : visitServices).filter(
    (service) =>
      features.treatmentPackagesEnabled || !service.id.includes('package')
  )
  const addOns = activeTab === 'in-clinic' ? clinicAddOns : visitAddOns
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

  useEffect(() => {
    if (!clinicLocations.some((loc) => loc.id === selectedLocation)) {
      setSelectedLocation(defaultLocationId)
    }
  }, [clinicLocations, selectedLocation, defaultLocationId])

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
      {/* Hero Section — hidden below xl by HeroSection default; keep for tablet+ */}
      <HeroSection
        title="Book Your Appointment"
        subtitle="Take the first step towards better health and wellness"
        description="Schedule your consultation with our experienced practitioner and begin your journey to optimal health today."
        backgroundImage="/bookings_treatment_relaxation.jpeg"
        backgroundImageClassName="object-cover object-[50%_15%]"
        backgroundOverlayClassName="bg-gradient-to-b from-black/50 via-primary/32 to-black/50"
        backgroundClass="bg-primary"
        textColor="text-cream"
        showFloatingLeaves={true}
      />

      {/* Booking Form or Pricing Display */}
      <section className="relative z-10 py-4 sm:py-8 md:py-10 lg:py-12 bg-white">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:items-start lg:gap-8">
            <div className="min-w-0 order-1">
              {bookingFormEnabled ? (
                <div>
                  <SectionHeading
                    title="Request an Appointment"
                    credit="Treated by Arkinth Garcia, Naturopath & Acupuncturist."
                    subtitle={
                      <>
                        <span className="block">Choose your service and time.</span>
                        <span className="block">We’ll confirm within 24 hours.</span>
                      </>
                    }
                    titleClassName="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-1.5 sm:mb-2 md:mb-3"
                    creditClassName="mb-2 whitespace-nowrap text-xs tracking-tight text-[var(--text-dark)]/70 sm:text-sm md:mb-3 md:text-base"
                    className="text-center mb-4 sm:mb-8 md:mb-10"
                  />
                  <BookingForm />
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="text-center mb-12">
                    <SectionHeading
                      title="Our services & pricing"
                      subtitle="Professional acupuncture treatments to support your health and wellness journey"
                      titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-2 md:mb-3"
                      className="text-center mb-6"
                    />
                    {!calendlyEnabled && !freshaEnabled && (
                      <div className={`${panelClass} max-w-2xl mx-auto`}>
                        <h3 className="font-semibold text-primary mb-2 flex items-center justify-center">
                          <Phone className="w-5 h-5 mr-2" />
                          Ready to book your appointment?
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-secondary text-base mb-4">
                          Call us directly to schedule your consultation and begin your path to better health
                        </p>
                        <a
                          href={phoneHref}
                          className="bg-primary text-cream px-8 py-3 rounded-full text-lg font-semibold hover:bg-secondary transition-all duration-300 inline-flex items-center justify-center"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call {phoneText}
                        </a>
                      </div>
                    )}

                    {freshaEnabled && (
                      <div className={`${panelClass} max-w-2xl mx-auto mt-6`}>
                        <h3 className="font-semibold text-primary mb-2 text-center text-xl">
                          Book on Fresha
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-secondary text-base mb-4 text-center">
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
                            Fresha is enabled but the booking URL is missing or invalid. Update{' '}
                            <code className="text-xs">contactConfig.fresha.bookingUrl</code> in{' '}
                            <code className="text-xs">src/lib/contact-config.ts</code>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tab Navigation for Pricing */}
                  <div className={`${glassGreenPanelClassName} p-3.5 sm:p-6 md:p-8`}>
                    <div className="relative mb-6 flex border-b border-accent/20">
                      <span
                        aria-hidden
                        className={`booking-service-tab__indicator ${
                          activeTab === 'call-out' ? 'booking-service-tab__indicator--call-out' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleTabChange('in-clinic')}
                        className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-base ${
                          activeTab === 'in-clinic' ? 'booking-service-tab--active' : ''
                        }`}
                      >
                        <Building2 className="h-5 w-5 shrink-0" aria-hidden />
                        In clinic services
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTabChange('call-out')}
                        className={`booking-service-tab inline-flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-3 text-base ${
                          activeTab === 'call-out' ? 'booking-service-tab--active' : ''
                        }`}
                      >
                        <Home className="h-5 w-5 shrink-0" aria-hidden />
                        Home visit services
                      </button>
                    </div>

                    {/* Service first, then location (Fresha / Calendly flow) */}
                    <div className="mb-8">
                      <h3 className="mb-2 text-xl font-bold text-[var(--text-dark)]">Service</h3>
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
                      <h3 className="mb-2 text-xl font-bold text-[var(--text-dark)]">
                        {activeTab === 'call-out'
                          ? 'Nearest clinic / service area'
                          : 'Clinic location'}
                      </h3>
                      <div className="mb-2 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                      <p className="text-base text-secondary mb-4">
                        {activeTab === 'call-out'
                          ? 'Where would you like your home visit? Availability is shared across both clinics — one practitioner runs Celbridge and Carlow.'
                          : 'Choose your clinic. Availability is shared across both clinics — a booking at one location blocks that time at the other.'}
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
                        <p className="text-secondary text-base mb-2">Naturopath & Acupuncturist</p>
                        <p className="text-secondary text-base">
                          Qualified from the College of Naturopathic Medicine, Dublin. Specializing in
                          pain management, mental health conditions, digestive issues, and fertility support.
                        </p>
                      </div>
                    </div>
                  </div>

                  {calendlyEnabled && !freshaEnabled && (
                    <div className={`${panelClass} !p-3.5 sm:!p-5 md:!p-6`}>
                      <div className="text-center mb-5 max-w-xl mx-auto">
                        <h3 className="mb-2 text-xl font-semibold text-[var(--text-dark)] sm:text-2xl">
                          Confirm your booking
                        </h3>
                        <div className="mx-auto mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                        <p className="text-base text-secondary">
                          Pick a time in the calendar below to confirm your appointment.
                          Your selections above are included with the booking.
                        </p>
                      </div>

                      {canOpenScheduler && (
                        <div className="mb-5 rounded-xl border border-accent/15 bg-white p-4 max-w-2xl mx-auto">
                          <p className="font-semibold text-primary mb-2 text-center text-base">
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
                        <div className="rounded-xl border border-dashed border-accent/40 bg-white/60 px-5 py-10 text-center max-w-xl mx-auto">
                          <Calendar
                            className="w-8 h-8 text-primary/50 mx-auto mb-3"
                            aria-hidden
                          />
                          <p className="font-medium text-primary mb-1">
                            Calendar not ready yet
                          </p>
                          <p className="text-base text-secondary">
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

            {/* Quick call/email — below form until desktop; sticky side column from lg */}
            <aside
              className="order-2 mx-auto mt-6 h-fit w-full max-w-xs rounded-xl border border-accent/15 bg-accent/10 p-4 lg:sticky lg:top-24 lg:mx-0 lg:mt-0 lg:max-w-none lg:self-start lg:p-5"
            >
              <h3 className="mb-1 text-lg font-bold leading-snug text-[#1B3B2B]">
                Need help?
              </h3>
              <p className="mb-4 text-base leading-relaxed text-[var(--text-dark)]/70">
                Prefer to call or email — we can help you book.
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <CTAButton
                    href={phoneHref}
                    variant="gold"
                    size="medium"
                    showArrow={false}
                    fullWidth
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden />
                    Call us
                  </CTAButton>
                  <p className="mt-1.5 text-center text-base font-bold text-[var(--text-dark)] md:mt-2">
                    {phoneText}
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
                    href={emailHref}
                    variant="outline"
                    size="medium"
                    showArrow={false}
                    fullWidth
                    className="!rounded-full !px-4 !py-2.5 !text-sm !font-medium gap-1.5 bg-white/80 !shadow-none transition-transform duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden />
                    Send a message
                  </CTAButton>
                  <p className="mt-1.5 text-center text-base text-[var(--text-dark)]/70 md:mt-2">
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
