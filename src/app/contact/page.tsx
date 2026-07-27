'use client'

import { Clock, Send, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { CTAButton, HeroSection } from '../../features'
import { contactConfig } from '../../lib/contact-config'

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
                        <option value="appointment">Book an Appointment</option>
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
                    Send Message
                  </button>
                </form>
              </div>
            )}

            {/* Contact Information */}
            <div className={contactConfig.features.contactFormEnabled ? '' : 'max-w-2xl mx-auto'}>
              <h2 className="font-serif text-3xl font-bold text-primary mb-8">
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
                    <h3 className="font-semibold text-lg text-primary mb-2">Location</h3>
                    <div className="text-secondary mb-2">
                      <div>{contactConfig.address.formatted.street}</div>
                      <div>{contactConfig.address.formatted.city}</div>
                      <div>{contactConfig.address.formatted.county} {contactConfig.address.formatted.postcode}</div>
                    </div>
                    <p className="text-secondary text-sm">
                      Convenient parking available
                    </p>
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
              
              {/* Quick Actions */}
              <div className="mt-12 p-6 bg-accent/10 rounded-lg">
                <h3 className="font-semibold text-lg text-primary mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <CTAButton 
                    href="/bookings" 
                    variant="gold"
                    showArrow={false}
                    className="w-full"
                  >
                    Book an Appointment
                  </CTAButton>
                  <button 
                    disabled={!contactConfig.features.liveChatEnabled}
                    className={`block w-full border-2 px-4 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      contactConfig.features.liveChatEnabled 
                        ? 'border-primary text-primary hover:bg-primary hover:text-cream'
                        : 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-50'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5 inline mr-2" />
                    {contactConfig.features.liveChatEnabled ? 'Start Live Chat' : 'Live Chat (Coming Soon)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Only show if enabled */}
      {contactConfig.features.mapIntegrationEnabled && (
        <section className="py-20 bg-secondary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold text-primary mb-4">
                Find Us
              </h2>
              <p className="text-lg text-secondary">
                Located in the heart of the wellness district
              </p>
            </div>
            
            <div className="bg-accent/20 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center">
                <contactConfig.address.icon className="w-16 h-16 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg text-primary mb-2">
                  Interactive Map
                </h3>
                <p className="text-secondary">
                  Map integration coming soon
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

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
          
          <div className="space-y-6">
            <div className="bg-accent/5 rounded-lg p-6">
              <h3 className="font-semibold text-lg text-primary mb-3">
                How should I prepare for my first appointment?
              </h3>
              <p className="text-secondary">
                Wear comfortable, loose-fitting clothing and arrive 15 minutes early 
                to complete intake forms. Avoid large meals right before treatment.
              </p>
            </div>
            
       
            
            <div className="bg-accent/5 rounded-lg p-6">
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
        </div>
      </section>
    </div>
  )
}
