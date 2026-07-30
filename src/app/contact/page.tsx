'use client'

import { Calendar, Clock, Send, MessageCircle, ChevronRight, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { HeroSection, SectionHeading } from '../../features'
import { contactConfig } from '../../lib/contact-config'
import LocationMap from '../../components/LocationMap'
import { BookingCtaButton } from '@/components/BookingCtaButton'

const interactiveCardClass =
  'group bg-white rounded-xl p-6 border border-accent/15 shadow-[0_8px_24px_rgba(45,80,22,0.12),0_2px_8px_rgba(45,80,22,0.08)] transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25 hover:shadow-[0_14px_32px_rgba(45,80,22,0.18),0_4px_12px_rgba(45,80,22,0.1)]'

const faqs = [
  {
    question: 'How should I prepare for my first appointment?',
    answer:
      'Wear comfortable, loose-fitting clothing and arrive 15 minutes early to complete intake forms. Avoid large meals right before treatment.',
  },
  {
    question: 'How many treatments will I need?',
    answer:
      "Treatment plans vary based on your condition and health goals. Most patients see improvements within 3-6 sessions, but we'll discuss a personalized plan during your consultation.",
  },
] as const

function ContactDetailCard({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <div className={interactiveCardClass}>
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-white transition-colors duration-300 group-hover:border-primary/40">
          <Icon
            className="h-5 w-5 text-secondary/70 transition-colors duration-300 group-hover:text-primary"
            strokeWidth={1.75}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg text-primary mb-2">{title}</h3>
          <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
          {children}
        </div>
      </div>
    </div>
  )
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    alert('Thank you for your message! We will get back to you soon.')
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen">
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
          <div
            className={`grid grid-cols-1 gap-12 ${
              contactConfig.features.contactFormEnabled ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
            }`}
          >
            {contactConfig.features.contactFormEnabled && (
              <div>
                <h2 className="font-serif text-3xl font-bold text-primary mb-8">
                  Send us a message
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
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-primary mb-2"
                      >
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

            <div
              className={
                contactConfig.features.contactFormEnabled ? '' : 'max-w-5xl mx-auto w-full'
              }
            >
              <SectionHeading
                title="Get in Touch"
                subtitle="Reach us by phone, email, or visit one of our clinics"
                titleClassName="font-serif text-3xl font-bold text-primary mb-3"
                className="text-center mb-10"
              />

              <div className="flex flex-col lg:grid lg:grid-cols-[1fr_minmax(16rem,18rem)] lg:gap-8 lg:items-start">
                <div className="min-w-0 space-y-4">
                  <ContactDetailCard icon={contactConfig.phone.icon} title="Phone">
                    <a
                      href={contactConfig.phone.href}
                      className="mb-2 block font-semibold text-primary hover:text-secondary transition-colors"
                    >
                      {contactConfig.phone.displayText}
                    </a>
                    <p className="text-secondary text-sm">
                      Call us during business hours for immediate assistance
                    </p>
                  </ContactDetailCard>

                  <ContactDetailCard icon={contactConfig.email.icon} title="Email">
                    <a
                      href={contactConfig.email.href}
                      className="mb-2 block font-semibold text-primary hover:text-secondary transition-colors"
                    >
                      {contactConfig.email.address}
                    </a>
                    <p className="text-secondary text-sm">We respond to emails within 24 hours</p>
                  </ContactDetailCard>

                  <ContactDetailCard icon={contactConfig.address.icon} title="Clinics">
                    {contactConfig.features.mapIntegrationEnabled ? (
                      <>
                        <p className="text-secondary mb-2">
                          <span className="font-semibold text-primary">Celbridge</span>
                          {' and '}
                          <span className="font-semibold text-primary">Carlow</span>
                        </p>
                        <a
                          href="#find-us"
                          className="text-sm font-medium text-accent hover:text-primary transition-colors"
                        >
                          See maps and directions
                        </a>
                        <p className="text-secondary text-sm mt-2">Convenient parking available</p>
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
                                <div className="font-semibold text-primary">
                                  {location.formatted.city}
                                </div>
                                <div>
                                  {location.formatted.county} {location.formatted.postcode}
                                </div>
                              </a>
                            </div>
                          ))}
                        </div>
                        <p className="text-secondary text-sm">Convenient parking available</p>
                      </>
                    )}
                  </ContactDetailCard>

                  <ContactDetailCard icon={Clock} title="Business Hours">
                    <div className="text-secondary space-y-1">
                      <p>
                        Monday - Friday:{' '}
                        <span className="font-semibold text-primary">9:00 AM - 7:00 PM</span>
                      </p>
                      <p>
                        Saturday:{' '}
                        <span className="font-semibold text-primary">10:00 AM - 4:00 PM</span>
                      </p>
                      <p>
                        Sunday: <span className="font-semibold text-primary">Closed</span>
                      </p>
                    </div>
                    <p className="text-secondary text-sm mt-2">
                      {contactConfig.businessInfo.emergencyNote}
                    </p>
                  </ContactDetailCard>
                </div>

                {/* Quick Actions — below details on mobile, sticky sidebar on desktop */}
                <aside className="w-full mt-8 lg:mt-0 p-5 rounded-xl bg-accent/15 shadow-lg shadow-primary/15 border border-accent/20 card-emboss lg:sticky lg:top-24">
                  <h3 className="font-semibold text-base text-primary mb-3">Quick Actions</h3>
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
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions"
            titleClassName="font-serif text-3xl font-bold text-primary mb-3"
          />

          <div className="flex flex-col gap-4 sm:gap-6">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              return (
                <div key={faq.question} className={interactiveCardClass}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 text-left sm:cursor-default"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                    onClick={() =>
                      setOpenFaqIndex((prev) => (prev === index ? null : index))
                    }
                  >
                    <h3 className="font-semibold text-lg text-primary pr-1">{faq.question}</h3>
                    <ChevronRight
                      className={`mt-0.5 h-5 w-5 shrink-0 text-secondary/60 transition-transform duration-300 sm:hidden ${
                        isOpen ? 'rotate-90 text-primary' : ''
                      }`}
                      aria-hidden
                    />
                  </button>

                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className={`${isOpen ? 'mt-3 block' : 'hidden'} sm:mt-3 sm:block`}
                  >
                    <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                    <p className="text-secondary">{faq.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {contactConfig.features.mapIntegrationEnabled && (
        <section id="find-us" className="pt-12 pb-10 bg-secondary/5 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Find Us"
              subtitle="Visit us in Celbridge or Carlow"
              titleClassName="font-serif text-2xl font-bold text-primary mb-3"
              className="text-center mb-8"
            />

            <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-6">
              {contactConfig.address.locations.map((location) => (
                <div
                  key={location.full}
                  className={`snap-start shrink-0 w-[80vw] sm:w-[65vw] md:w-auto ${interactiveCardClass}`}
                >
                  <h3 className="font-semibold text-base text-primary mb-2">{location.label}</h3>
                  <div className="mb-3 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                  <div className="text-secondary text-sm leading-snug mb-4">
                    <div>{location.formatted.street}</div>
                    <div>
                      {location.formatted.city}, {location.formatted.county}{' '}
                      {location.formatted.postcode}
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

            <div
              className="mt-3 flex items-center justify-center gap-1.5 md:hidden"
              aria-hidden="true"
            >
              <span className="text-xs text-secondary/60 tracking-wide">Swipe to explore</span>
              <svg
                className="w-3.5 h-3.5 text-secondary/50"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth={1.8}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
