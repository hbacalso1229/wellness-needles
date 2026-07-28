'use client'

import { Calendar, Clock, User, CheckCircle, Phone, Mail } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { CTAButton } from '../../features'
import { contactConfig } from '@/lib/contact-config'

export default function Bookings() {
  // TODO: Set to true when booking form is ready to go live
  const BOOKING_FORM_ENABLED = false
  
  const [activeTab, setActiveTab] = useState('in-clinic')
  const [selectedService, setSelectedService] = useState('')
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState('')
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
    emergencyContact: '',
    emergencyPhone: ''
  })

  const inClinicServices = [
    {
      id: 'initial-consultation',
      name: 'Initial Consultation & First Treatment',
      duration: '60–75 minutes',
      price: '€75',
      description: 'Comprehensive health assessment with personalized treatment plan and first acupuncture session'
    },
    {
      id: 'follow-up',
      name: 'Follow-up Sessions',
      duration: '45–60 minutes',
      price: '€60',
      description: 'Tailored acupuncture treatment based on your progress and ongoing needs'
    }
  ]

  const homeVisitServices = [
    {
      id: 'home-initial-consultation',
      name: 'Initial Consultation & First Treatment',
      duration: '60–75 minutes',
      price: '€90',
      description: 'Comprehensive health assessment with personalized treatment plan and first acupuncture session at your home'
    },
    {
      id: 'home-follow-up',
      name: 'Follow-up Sessions',
      duration: '45–60 minutes',
      price: '€75',
      description: 'Tailored acupuncture treatment in the comfort of your home'
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

  const services = activeTab === 'in-clinic' ? inClinicServices : homeVisitServices
  const addOns = activeTab === 'in-clinic' ? inClinicAddOns : homeVisitAddOns

  const timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM', '6:00 PM'
  ]

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setSelectedService('')
    setSelectedAddOns([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAddOnToggle = (addOnId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) 
        ? prev.filter(id => id !== addOnId)
        : [...prev, addOnId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Booking submitted:', {
      serviceType: activeTab,
      service: selectedService,
      addOns: selectedAddOns,
      practitioner: 'arkinth-garcia',
      date: selectedDate,
      time: selectedTime,
      ...formData
    })
    alert('Thank you! Your appointment request has been submitted. We will contact you within 24 hours to confirm your booking.')
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
          {BOOKING_FORM_ENABLED ? (
            // Full Booking Form (hidden when disabled)
            <form onSubmit={handleSubmit} className="space-y-12">
            {/* Service Selection */}
            <div className="bg-accent/5 rounded-lg p-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3" />
                Step 1: Choose Your Service
              </h2>
              
              {/* Tab Navigation */}
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
                  In Clinic
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
                  Call Out (Home Visits)
                </button>
              </div>

              {/* Tab Content */}
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
                      name="service"
                      value={service.id}
                      checked={selectedService === service.id}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-primary">{service.name}</h3>
                      <div className="text-right">
                        <span className="text-gold font-bold">{service.price}</span>
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

              {/* Add-ons Section */}
              <div className="mt-8">
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
            </div>

            {/* Practitioner Selection */}
            <div className="bg-accent/5 rounded-lg p-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6 flex items-center">
                <User className="w-6 h-6 mr-3" />
                Step 2: Your Practitioner
              </h2>
              
              <div className="bg-primary/5 border-2 border-primary rounded-lg p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 text-cream" />
                  </div>
                  <h3 className="font-semibold text-xl text-primary mb-2">Arkinth Garcia</h3>
                  <p className="text-secondary text-sm mb-2">Naturopath & Acupuncturist</p>
                  <p className="text-secondary text-sm">
                    Qualified from the College of Naturopathic Medicine, Dublin. Specializing in 
                    pain management, mental health conditions, digestive issues, and fertility support.
                  </p>
                </div>
                <input
                  type="hidden"
                  name="practitioner"
                  value="arkinth-garcia"
                />
              </div>
            </div>

            {/* Date & Time Selection */}
            <div className="bg-accent/5 rounded-lg p-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6 flex items-center">
                <Calendar className="w-6 h-6 mr-3" />
                Step 3: Select Date & Time
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-primary mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-primary mb-2">
                    Preferred Time
                  </label>
                  <select
                    id="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    required
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-accent/5 rounded-lg p-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6 flex items-center">
                <User className="w-6 h-6 mr-3" />
                Step 4: Personal Information
              </h2>
              
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
                    required
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                    required
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                    required
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
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
                    required
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-primary mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div className="bg-accent/5 rounded-lg p-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-6">
                Health Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="chiefComplaint" className="block text-sm font-medium text-primary mb-2">
                    What brings you in today? (Main concern or condition) *
                  </label>
                  <textarea
                    id="chiefComplaint"
                    name="chiefComplaint"
                    value={formData.chiefComplaint}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    placeholder="Please describe your symptoms or reason for seeking treatment..."
                  />
                </div>
                
                <div>
                  <label htmlFor="previousTreatment" className="block text-sm font-medium text-primary mb-2">
                    Have you had acupuncture before?
                  </label>
                  <textarea
                    id="previousTreatment"
                    name="previousTreatment"
                    value={formData.previousTreatment}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    placeholder="Please describe any previous acupuncture or alternative treatments..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="medications" className="block text-sm font-medium text-primary mb-2">
                      Current Medications
                    </label>
                    <textarea
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder="List all medications, supplements, and dosages..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-primary mb-2">
                      Allergies
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder="List any known allergies or sensitivities..."
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-primary mb-2">
                      Emergency Contact Name
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyPhone" className="block text-sm font-medium text-primary mb-2">
                      Emergency Contact Phone
                    </label>
                    <input
                      type="tel"
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-primary text-cream px-12 py-4 rounded-full text-lg font-semibold hover:bg-secondary transition-colors duration-200"
              >
                Submit Appointment Request
              </button>
              <p className="text-sm text-secondary mt-4">
                We will contact you within 24 hours to confirm your appointment
              </p>
            </div>
          </form>
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

                {/* Services Pricing Display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 border-2 border-accent/20 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-primary">{service.name}</h3>
                        <div className="text-right">
                          <span className="text-gold font-bold text-lg">{service.price}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-secondary mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </div>
                      <p className="text-sm text-secondary">{service.description}</p>
                    </div>
                  ))}
                </div>

                {/* Add-ons Pricing Display */}
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary mb-4">
                    Optional Add-ons
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {addOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className="p-4 border-2 border-accent/20 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-primary">{addOn.name}</h4>
                          <span className="text-gold font-bold">+{addOn.price}</span>
                        </div>
                        <p className="text-sm text-secondary">{addOn.description}</p>
                      </div>
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
                    <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                      <User className="w-8 h-8 text-cream" />
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
            </div>
          )}
        </div>
      </section>

      {/* Contact Alternative */}
      <section className={`py-20 ${BOOKING_FORM_ENABLED ? 'bg-secondary/10' : 'bg-primary/5'}`}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-primary mb-6">
            {BOOKING_FORM_ENABLED ? 'Prefer to Book by Phone?' : 'Ready to Schedule Your Appointment?'}
          </h2>
          <p className="text-lg text-secondary mb-8">
            {BOOKING_FORM_ENABLED 
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
