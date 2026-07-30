'use client'

import { Calendar, Clock, Send, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { HeroSection } from '../../features'
import { contactConfig } from '../../lib/contact-config'
import LocationMap from '../../components/LocationMap'
import { BookingCtaButton } from '@/components/BookingCtaButton'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Here you would handle the form submission
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Contact Us"
        subtitle="We're here to answer your questions and help you start your wellness journey"
        description="Reach out to us for appointments, questions about our treatments, or to learn more about how acupuncture can benefit your health."
        backgroundImage="/clinic_decor.jpeg"
  
        heightClass="py-20"
      />

      {/* Contact Information */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 gap-12 ${contactConfig.features.contactFormEnabled ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
            {/* Contact Form - Only show if enabled */}
            {contactConfig.features.contactFormEnabled && (
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-8">
                  Send Us a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-primary mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Your full name"
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
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-primary mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-primary mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="appointment">Book an appointment</option>
                        <option value="general">General Inquiry</option>
                        <option value="treatment">Treatment Questions</option>
                        <option value="insurance">Insurance & Pricing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-primary mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-accent/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary text-cream px-6 py-4 rounded-lg font-semibold hover:bg-secondary transition-colors duration-200 flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send message
                  </button>
                </form>
              </div>
            )}

            {/* Contact Information */}
            <div
              className={
                contactConfig.features.contactFormEnabled
                  ? ''
                  : 'max-w-5xl mx-auto w-full'
              }
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                {/* Title + details: centered as a block on mobile, left on desktop */}
                <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none">
                  <h2 className="font-serif text-3xl font-bold text-primary mb-8 text-left">
                    Get in Touch
                  </h2>

                  <div className="space-y-8">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary rounded-full p-3 flex-shrink-0">
                        <contactConfig.phone.icon className="w-6 h-6 text-cream" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-primary mb-2">Phone</h3>
                        <a
                          href={contactConfig.phone.href}
                          className="text-secondary mb-2 block hover:text-primary transition-colors"
                        >
                          {contactConfig.phone.displayText}
                        </a>
                        <p className="text-secondary text-sm">
                          Call us during business hours for immediate assistance
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary rounded-full p-3 flex-shrink-0">
                        <contactConfig.email.icon className="w-6 h-6 text-cream" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-primary mb-2">Email</h3>
                        <a
                          href={contactConfig.email.href}
                          className="text-secondary mb-2 block hover:text-primary transition-colors"
                        >
                          {contactConfig.email.address}
                        </a>
                        <p className="text-secondary text-sm">
                          We respond to emails within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary rounded-full p-3 flex-shrink-0">
                        <contactConfig.address.icon className="w-6 h-6 text-cream" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-primary mb-2">Clinics</h3>
                        {contactConfig.features.mapIntegrationEnabled ? (
                          <>
                            <p className="text-secondary mb-2">Celbridge and Carlow</p>
                            <a
                              href="#find-us"
                              className="text-sm font-medium text-accent hover:text-primary transition-colors"
                            >
                              See maps and directions
                            </a>
                            <p className="text-secondary text-sm mt-2">
                              Convenient parking available
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-secondary mb-2 space-y-3">
                              {contactConfig.address.locations.map((location) => (
                                <div key={location.full}>
                                  <a
                                    href={location.directionsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block hover:text-primary transition-colors"
                                  >
                                    <div>{location.formatted.street}</div>
                                    <div>{location.formatted.city}</div>
                                    <div>
                                      {location.formatted.county} {location.formatted.postcode}
                                    </div>
                                  </a>
                                </div>
                              ))}
                            </div>
                            <p className="text-secondary text-sm">
                              Convenient parking available
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-primary rounded-full p-3 flex-shrink-0">
                        <Clock className="w-6 h-6 text-cream" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-primary mb-2">Business Hours</h3>
                        <div className="text-secondary space-y-1">
                          {contactConfig.businessInfo.hoursDisplay.map((hours, index) => (
                            <p key={index}>{hours}</p>
                          ))}
                        </div>
                        <p className="text-secondary text-sm mt-2">
                          {contactConfig.businessInfo.emergencyNote}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions: hidden on mobile, visible on desktop */}
                <aside className="hidden lg:block w-full max-w-xs mx-auto lg:mx-0 lg:ml-auto p-5 rounded-xl bg-accent/15 shadow-lg shadow-primary/15 border border-accent/20 card-emboss lg:sticky lg:top-24">
                  <h3 className="font-semibold text-base text-primary mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2.5">
                    <BookingCtaButton
                      variant="gold"
                      size="medium"
                      showArrow={false}
                      className="w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary text-sm font-bold shadow-md shadow-primary/25 gap-2 card-emboss hover:!from-[#f0d45c] hover:!to-[#c9a52f]"
                    >
                      <Calendar className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                      Book an appointment
                    </BookingCtaButton>
                    <button
                      type="button"
                      disabled={!contactConfig.features.liveChatEnabled}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 card-emboss shadow-md shadow-primary/10 ${
                        contactConfig.features.liveChatEnabled
                          ? 'bg-cream text-primary border border-accent/30 hover:border-primary hover:shadow-md'
                          : 'bg-cream text-gray-400 border border-gray-200 cursor-not-allowed opacity-80'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden />
                      {contactConfig.features.liveChatEnabled
                        ? 'Start live chat'
                        : 'Live chat (coming soon)'}
                    </button>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-secondary">
              Quick answers to common questions
            </p>
          </div>

          {/* Mobile: horizontal scroll carousel | sm+: stacked */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-col sm:overflow-visible sm:pb-0 sm:gap-6">
            <div className="snap-start shrink-0 w-[80vw] sm:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-3">
                How should I prepare for my first appointment?
              </h3>
              <p className="text-secondary">
                Wear comfortable, loose-fitting clothing and arrive 15 minutes early
                to complete intake forms. Avoid large meals right before treatment.
              </p>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-auto bg-accent/5 rounded-lg p-6 card-emboss">
              <h3 className="font-semibold text-lg text-primary mb-3">
                How many treatments will I need?
              </h3>
              <p className="text-secondary">
                Treatment plans vary based on your condition and health goals.
                Most patients see improvements within 3-6 sessions, but we&apos;ll
                discuss a personalized plan during your consultation.
              </p>
            </div>
          </div>

          {/* Swipe hint — mobile only */}
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden" aria-hidden="true">
            <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
            <svg className="w-3.5 h-3.5 text-secondary/50" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* Map Section - Only show if enabled */}
      {contactConfig.features.mapIntegrationEnabled && (
        <section id="find-us" className="pt-12 pb-6 bg-secondary/5 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="font-serif text-2xl font-bold text-primary mb-2">
                Find Us
              </h2>
              <p className="text-base text-secondary">
                Visit us in Celbridge or Carlow
              </p>
            </div>

            {/* Mobile: horizontal scroll carousel | md: 2-col */}
            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-6">
              {contactConfig.address.locations.map((location) => (
                <div key={location.full} className="snap-start shrink-0 w-[80vw] sm:w-[65vw] md:w-auto">
                  <div className="mb-3">
                    <h3 className="font-semibold text-base text-primary mb-1">
                      {location.label}
                    </h3>
                    <div className="text-secondary text-sm leading-snug">
                      <div>{location.formatted.street}</div>
                      <div>
                        {location.formatted.city}, {location.formatted.county}{' '}
                        {location.formatted.postcode}
                      </div>
                    </div>
                  </div>
                  <LocationMap
                    query={location.mapQuery}
                    title={`Map of ${location.full}`}
                    directionsUrl={location.directionsUrl}
                  />
                </div>
              ))}
            </div>

            {/* Swipe hint — mobile only */}
            <div className="mt-3 flex items-center justify-center gap-1.5 md:hidden" aria-hidden="true">
              <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
              <svg className="w-3.5 h-3.5 text-secondary/50" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
