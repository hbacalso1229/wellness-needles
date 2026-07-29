'use client'

import { Clock, CheckCircle, Phone, Mail, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { CTAButton } from '../../features'
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
      price: 'Free if required',
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
      price: 'Free if required',
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
      <section className="py-20 bg-accent text-cream relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/treatment_in_progress_bed.jpeg"
            alt="Peaceful acupuncture treatment environment"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-accent/75"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Book Your Appointment
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Take the first step towards better health and wellness
            </p>
            <p className="text-lg opacity-80">
              Schedule your consultation with our experienced practitioner and 
              begin your journey to optimal health today.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form or Pricing Display */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {bookingFormEnabled ? (
            <BookingForm />
          ) : (
            // Pricing Display Only (when booking form is disabled)
            <div className="space-y-12">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl font-bold text-primary mb-4">
                  Our Services & Pricing
                </h2>
                <p className="text-lg text-secondary mb-6">
                  Professional acupuncture treatments to support your health and wellness journey
                </p>
                {!calendlyEnabled && !freshaEnabled && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                    <h3 className="font-semibold text-primary mb-3 flex items-center justify-center">
                      <Phone className="w-5 h-5 mr-2" />
                      Ready to Book Your Appointment?
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
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto mt-6">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedService === service.id
                            ? 'border-primary bg-primary/5'
                            : 'border-accent/20 hover:border-accent/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pricing-service"
                          value={service.id}
                          checked={selectedService === service.id}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-primary">{service.name}</h3>
                          <div className="text-right">
                            <span className="text-gold font-bold text-lg">{service.price}</span>
                            {service.savings && (
                              <div className="text-green-600 text-sm font-medium">{service.savings}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-secondary mb-2">
                          <Clock className="w-4 h-4 mr-1" />
                          {service.duration}
                        </div>
                        <p className="text-sm text-secondary">{service.description}</p>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-serif text-xl font-bold text-primary mb-2 flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    {activeTab === 'call-out' ? 'Nearest Clinic / Service Area' : 'Clinic Location'}
                  </h3>
                  <p className="text-sm text-secondary mb-4">
                    {activeTab === 'call-out'
                      ? 'Choose which clinic area this home visit is booked under — it is tagged on your Calendly booking.'
                      : 'Select which clinic you will attend — it is tagged on your Calendly booking.'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clinicLocations.map((location) => (
                      <label
                        key={location.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedLocation === location.id
                            ? 'border-primary bg-primary/5'
                            : 'border-accent/20 hover:border-accent/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="pricing-location"
                          value={location.id}
                          checked={selectedLocation === location.id}
                          onChange={(e) => setSelectedLocation(e.target.value)}
                          className="sr-only"
                        />
                        <h4 className="font-semibold text-primary mb-1">{location.label}</h4>
                        <p className="text-sm text-secondary">
                          {location.formatted.street}
                        </p>
                        <p className="text-sm text-secondary">
                          {location.formatted.city}, {location.formatted.county}{' '}
                          {location.formatted.postcode}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Add-ons Pricing Display */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-4">
                    Optional Add-ons
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {addOns.map((addOn) => (
                      <label
                        key={addOn.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedAddOns.includes(addOn.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-accent/20 hover:border-accent/40'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(addOn.id)}
                          onChange={() => handleAddOnToggle(addOn.id)}
                          className="sr-only"
                        />
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-primary">{addOn.name}</h4>
                          <span className="text-gold font-bold">+{addOn.price}</span>
                        </div>
                        <p className="text-sm text-secondary">{addOn.description}</p>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-secondary mt-2">
                    * Add-ons can only be booked in combination with an acupuncture session
                  </p>
                </div>

                {/* Travel Policy for Home Visits */}
                {activeTab === 'call-out' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Travel Policy:</h4>
                    <div className="text-sm text-secondary space-y-1">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Within 10 km included
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        Beyond 10 km: +€0.50/km or flat €15 travel fee
                      </div>
                    </div>
                  </div>
                )}

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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
                  <h3 className="font-semibold text-primary mb-2 text-center text-xl">
                    Schedule a Booking
                  </h3>
                  <div className="mb-4 rounded-lg border border-blue-200 bg-white/70 p-4 text-sm text-secondary max-w-xl mx-auto">
                    <p className="font-semibold text-primary mb-2 text-center">
                      Details sent with this booking
                    </p>
                    <ul className="space-y-1">
                      <li>
                        <span className="font-medium text-primary">Visit type:</span>{' '}
                        {activeTab === 'call-out' ? 'Home Visit' : 'In Clinic'}
                      </li>
                      <li>
                        <span className="font-medium text-primary">Service / package:</span>{' '}
                        {selectedServiceDetails?.name ?? 'Not selected'}
                      </li>
                      <li>
                        <span className="font-medium text-primary">Location:</span>{' '}
                        {selectedLocationDetails
                          ? `${selectedLocationDetails.label} — ${selectedLocationDetails.formatted.street}`
                          : 'Not selected'}
                      </li>
                      <li>
                        <span className="font-medium text-primary">Add-ons:</span>{' '}
                        {selectedAddOnLabels.length > 0
                          ? selectedAddOnLabels.join(', ')
                          : 'None'}
                      </li>
                    </ul>
                  </div>

                  {!canOpenScheduler ? (
                    <p className="text-center text-sm text-secondary mb-4">
                      Select a service/package and a location above to load the scheduling
                      calendar. Those choices are prefilled into the Calendly booking.
                    </p>
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
                  <div className="mt-6 text-center">
                    <p className="text-secondary text-sm mb-3">Prefer to call?</p>
                    <a
                      href={contactConfig.phone.href}
                      className="inline-flex items-center justify-center text-primary font-semibold hover:text-secondary transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Call {contactConfig.phone.displayText}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Alternative */}
      <section className={`py-20 ${bookingFormEnabled ? 'bg-secondary/10' : 'bg-primary/5'}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-6">
            {bookingFormEnabled ? 'Prefer to Book by Phone?' : 'Ready to Schedule Your Appointment?'}
          </h2>
          <p className="text-lg text-secondary mb-8">
            {bookingFormEnabled 
              ? 'Call us directly to speak with our friendly staff and schedule your appointment'
              : 'Contact us today to book your consultation and take the first step towards better health'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={contactConfig.phone.href}
              className="bg-gold text-primary px-8 py-4 rounded-full text-lg font-semibold hover:bg-gold/90 transition-all duration-300 inline-flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call {contactConfig.phone.displayText}
            </a>
            <CTAButton 
              href="/contact" 
              variant="secondary"
              showArrow={false}
              className="inline-flex items-center justify-center text-primary"
            >
              <Mail className="w-5 h-5 mr-2" />
              Send Message
            </CTAButton>
          </div>
        </div>
      </section>
    </div>
  )
}
