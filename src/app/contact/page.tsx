'use client'

import { Calendar, Send, MessageCircle, ChevronDown, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { HeroSection, SectionHeading } from '../../features'
import { contactConfig } from '../../lib/contact-config'
import LocationMap from '../../components/LocationMap'
import { BookingCtaButton } from '@/components/BookingCtaButton'

const interactiveCardClass =
  'group bg-white rounded-xl p-3.5 md:p-6 border border-accent/15 transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25'

const faqCardClass =
  'group bg-white rounded-xl p-3.5 md:p-6 border border-accent/15 transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25 active:border-primary/25'

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
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-white transition-colors duration-300 group-hover:border-primary/40">
          <Icon
            className="h-4 w-4 md:h-5 md:w-5 text-secondary/70 transition-colors duration-300 group-hover:text-primary"
            strokeWidth={1.75}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base md:text-lg text-primary mb-2 md:mb-3 leading-snug">{title}</h3>
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
  const [openFaqIndexes, setOpenFaqIndexes] = useState<Set<number>>(() => new Set())

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
        backgroundImage="/hero_wellness_acupuncture.jpeg"
      />

      {/* Contact Information — bookings-style sticky layout */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(14rem,16rem)] md:items-start md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] lg:gap-8">
            <div className="min-w-0 order-1 space-y-6 md:space-y-10">
              <div>
                <SectionHeading
                  title="Get in touch"
                  subtitle="Reach us by phone, email, or visit one of our clinics"
                />

                {contactConfig.features.contactFormEnabled && (
                  <div className={`${interactiveCardClass} mb-6 md:mb-8`}>
                    <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                      Send us a message
                    </h3>
                    <div className="mb-4 md:mb-6 h-0.5 w-8 md:w-10 rounded-full bg-gold" aria-hidden="true" />

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-primary mb-2"
                          >
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
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-primary mb-2"
                          >
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-sm font-medium text-primary mb-2"
                          >
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
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-primary mb-2"
                        >
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
                  {/* Business hours — left on desktop */}
                  <div>
                    <h3 className="font-serif text-xl md:text-2xl font-semibold text-primary mb-2">
                      Business hours
                    </h3>
                    <div className="mb-6 h-0.5 w-10 rounded-full bg-gold" aria-hidden="true" />
                    <ul className="space-y-0 lg:hidden">
                      {(
                        [
                          ['Sunday - Friday', 'sunday'],
                          ['Saturday', 'saturday'],
                        ] as const
                      ).map(([label, key]) => (
                        <li
                          key={key}
                          className="flex items-baseline gap-3 py-2.5 border-b border-accent/15 last:border-b-0"
                        >
                          <span className="text-secondary shrink-0 min-w-[7.5rem]">{label}</span>
                          <span
                            className="flex-1 border-b border-dotted border-accent/30 translate-y-[-0.35em]"
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-[var(--text-dark)] shrink-0 text-right">
                            {contactConfig.businessInfo.hours[key]}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <ul className="hidden lg:block space-y-0">
                      {(
                        [
                          ['Monday', 'monday'],
                          ['Tuesday', 'tuesday'],
                          ['Wednesday', 'wednesday'],
                          ['Thursday', 'thursday'],
                          ['Friday', 'friday'],
                          ['Saturday', 'saturday'],
                          ['Sunday', 'sunday'],
                        ] as const
                      ).map(([label, key]) => (
                        <li
                          key={key}
                          className="flex items-baseline gap-3 py-2.5 border-b border-accent/15 last:border-b-0"
                        >
                          <span className="text-secondary shrink-0 w-28">{label}</span>
                          <span
                            className="flex-1 border-b border-dotted border-accent/30 translate-y-[-0.35em]"
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-[var(--text-dark)] shrink-0 text-right">
                            {contactConfig.businessInfo.hours[key]}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-secondary text-sm mt-4">
                      {contactConfig.businessInfo.emergencyNote}
                    </p>
                  </div>

                  {/* Phone, email, clinics — right on desktop */}
                  <div className="space-y-4">
                    <ContactDetailCard icon={contactConfig.phone.icon} title="Phone">
                      <p className="text-secondary text-sm mb-2">
                        Call us during business hours for immediate assistance
                      </p>
                      <a
                        href={contactConfig.phone.href}
                        className="block font-semibold text-[var(--text-dark)] hover:text-primary transition-colors"
                      >
                        {contactConfig.phone.displayText}
                      </a>
                    </ContactDetailCard>

                    <ContactDetailCard icon={contactConfig.email.icon} title="Email">
                      <p className="text-secondary text-sm mb-2">
                        We respond to emails within 24 hours
                      </p>
                      <a
                        href={contactConfig.email.href}
                        className="block font-semibold text-[var(--text-dark)] hover:text-primary transition-colors"
                      >
                        {contactConfig.email.address}
                      </a>
                    </ContactDetailCard>

                    <ContactDetailCard icon={contactConfig.address.icon} title="Clinics">
                      {contactConfig.features.mapIntegrationEnabled ? (
                        <>
                          <p className="text-secondary text-sm mb-2">Find us</p>
                          <p className="mb-2 text-[var(--text-dark)]">
                            <span className="font-semibold">Celbridge</span>
                            {' and '}
                            <span className="font-semibold">Carlow</span>
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
                          <p className="text-secondary text-sm mb-2">Find us</p>
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
                  </div>
                </div>
              </div>
            </div>

            {/* Quick book — sticky sidebar from tablet up; below content on mobile */}
            <aside
              className="order-2 mx-auto mt-6 w-full max-w-xs rounded-xl border border-accent/15 bg-accent/10 p-4 md:sticky md:top-24 md:mx-0 md:mt-0 md:max-w-none md:self-start md:p-5"
            >
              <h3 className="mb-1 text-lg font-bold text-primary leading-snug">
                Ready to book your appointment?
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-[var(--text-dark)]/70">
                Choose a time that works for you — it only takes a minute.
              </p>
              <div className="space-y-2.5">
                <BookingCtaButton
                  variant="gold"
                  size="medium"
                  showArrow={false}
                  className="w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-4 !py-2.5 !text-sm !font-bold whitespace-nowrap shadow-md shadow-primary/25 gap-2 transition-[transform,box-shadow,filter] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] hover:!from-[#f0d45c] hover:!to-[#c9a52f]"
                >
                  <Calendar className="w-4 h-4 shrink-0 text-primary" aria-hidden />
                  <span className="whitespace-nowrap">Book your appointment</span>
                </BookingCtaButton>
                <p className="text-center text-xs text-[var(--text-dark)]/60">
                  No payment required • Instant confirmation
                </p>
                {contactConfig.features.liveChatEnabled && (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-cream px-4 py-2.5 text-sm font-medium text-primary shadow-md shadow-primary/10 transition-all duration-200 hover:border-primary hover:shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" aria-hidden />
                    Start live chat
                  </button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Frequently Asked Questions"
            subtitle="Quick answers to common questions"
          />

          <div className="flex flex-col gap-2.5 md:gap-6">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndexes.has(index)
              return (
                <button
                  key={faq.question}
                  type="button"
                  className={`${faqCardClass} w-full text-left cursor-pointer`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  onClick={() =>
                    setOpenFaqIndexes((prev) => {
                      const next = new Set(prev)
                      if (next.has(index)) next.delete(index)
                      else next.add(index)
                      return next
                    })
                  }
                >
                  <div className="flex items-center gap-2.5 md:gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base md:text-lg text-primary leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`diagnosis-accordion-chevron h-4 w-4 md:h-5 md:w-5 shrink-0 text-secondary/50 ${
                        isOpen ? 'rotate-180 text-primary' : ''
                      }`}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </div>
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className={`diagnosis-accordion-panel grid ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pt-2 md:pt-3 text-sm md:text-base text-secondary leading-snug diagnosis-accordion-body ${
                          isOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {contactConfig.features.mapIntegrationEnabled && (
        <section id="find-us" className="pt-8 pb-8 md:pt-12 md:pb-10 bg-secondary/5 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Find Us"
              subtitle="Visit us in Celbridge or Carlow"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-6">
              {contactConfig.address.locations.map((location) => (
                <div
                  key={location.full}
                  className={interactiveCardClass}
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
          </div>
        </section>
      )}
    </div>
  )
}
