'use client'

import { Calendar, Send, MessageCircle, ChevronDown, Info, type LucideIcon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { HeroSection, SectionHeading, glassGreenBandClassName } from '../../features'
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

const locationBlurbs: Record<string, string> = {
  celbridge: 'A calm, welcoming space designed for your care.',
  carlow: 'Conveniently located with easy access and parking.',
}

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
          <h3 className="font-semibold text-base md:text-lg text-[var(--text-dark)] mb-2 md:mb-3 leading-snug">{title}</h3>
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
        backgroundImage="/contact_consultation.jpeg"
        backgroundImageClassName="object-cover object-center"
        backgroundOverlayClassName="bg-gradient-to-b from-black/45 via-primary/30 to-black/45"
      />

      {/* Contact Information — bookings-style sticky layout */}
      <section className="bg-white py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:grid md:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)] md:items-start md:gap-6 lg:gap-8">
            <div className="order-1 min-w-0 space-y-5 md:space-y-8">
              <div>
                <SectionHeading
                  title="Start Your Journey With Us"
                  subtitle="Whether you have a question or you're ready to begin, we're here to support you."
                  className="mb-6 text-center md:mb-8"
                />

                {contactConfig.features.contactFormEnabled && (
                  <div className={`${interactiveCardClass} mb-6 md:mb-8`}>
                    <h3 className="mb-2 text-lg font-semibold text-[var(--text-dark)] md:text-xl">
                      Send us a message
                    </h3>
                    <div className="mb-4 h-0.5 w-8 rounded-full bg-gold md:mb-6 md:w-10" aria-hidden="true" />

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

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
                  {/* Business hours — left on desktop */}
                  <div>
                    <h3 className="mb-4 text-base font-semibold leading-snug text-[var(--text-dark)] md:text-lg">
                      Business hours
                    </h3>
                    <ul className="space-y-0 lg:hidden">
                      {(
                        [
                          ['Sunday – Friday', 'sunday'],
                          ['Saturday', 'saturday'],
                        ] as const
                      ).map(([label, key]) => (
                        <li
                          key={key}
                          className="flex items-baseline justify-between gap-4 border-b border-accent/15 py-2 last:border-b-0"
                        >
                          <span className="shrink-0 text-[var(--text-dark)]/70">
                            {label}
                          </span>
                          <span className="shrink-0 text-right font-semibold tabular-nums text-[var(--text-dark)]">
                            {contactConfig.businessInfo.hours[key]}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <ul className="hidden space-y-0 lg:block">
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
                          className="flex items-baseline justify-between gap-4 border-b border-accent/15 py-2 last:border-b-0"
                        >
                          <span className="w-28 shrink-0 text-[var(--text-dark)]/70">
                            {label}
                          </span>
                          <span className="shrink-0 text-right font-semibold tabular-nums text-[var(--text-dark)]">
                            {contactConfig.businessInfo.hours[key]}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p
                      role="note"
                      className="mt-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-accent/10 px-3 py-2.5 text-sm font-semibold text-primary shadow-sm"
                    >
                      <Info
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        strokeWidth={2}
                        aria-hidden
                      />
                      <span>{contactConfig.businessInfo.emergencyNote}</span>
                    </p>
                  </div>

                  {/* Phone, email, clinics — right on desktop */}
                  <div className="space-y-3 md:space-y-4">
                    <ContactDetailCard icon={contactConfig.phone.icon} title="Phone">
                      <p className="text-[var(--text-dark)]/70 text-base mb-2">
                        Speak with us directly—we&apos;re here to help.
                      </p>
                      <a
                        href={contactConfig.phone.href}
                        className="block font-semibold text-[var(--text-dark)] hover:text-primary transition-colors"
                      >
                        {contactConfig.phone.displayText}
                      </a>
                    </ContactDetailCard>

                    <ContactDetailCard icon={contactConfig.email.icon} title="Email">
                      <p className="text-[var(--text-dark)]/70 text-base mb-2">
                        Send us a message—we&apos;ll get back to you within 24 hours.
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
                          <p className="text-[var(--text-dark)]/70 text-base mb-2">Visit us in person</p>
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
                          <p className="text-[var(--text-dark)]/70 text-base mt-2">Convenient parking available</p>
                        </>
                      ) : (
                        <>
                          <p className="text-[var(--text-dark)]/70 text-base mb-2">Visit us in person</p>
                          <div className="mb-2 space-y-3 text-[var(--text-dark)]/80">
                            {contactConfig.address.locations.map((location) => (
                              <div key={location.full}>
                                <a
                                  href={location.directionsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block hover:text-primary transition-colors"
                                >
                                  <div>{location.formatted.street}</div>
                                  <div className="font-semibold text-[var(--text-dark)]">
                                    {location.formatted.city}
                                  </div>
                                  <div>
                                    {location.formatted.county} {location.formatted.postcode}
                                  </div>
                                </a>
                              </div>
                            ))}
                          </div>
                          <p className="text-[var(--text-dark)]/70 text-base">Convenient parking available</p>
                        </>
                      )}
                    </ContactDetailCard>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick book — sticky sidebar from tablet up; below content on mobile */}
            <aside
              className="order-2 mx-auto mt-6 h-fit w-full max-w-xs rounded-xl border border-accent/15 bg-accent/10 p-4 md:sticky md:top-24 md:mx-0 md:mt-0 md:max-w-none md:self-start md:p-5"
            >
              <h3 className="mb-1 text-lg font-bold text-primary leading-snug">
                Ready to Begin Your Care Journey?
              </h3>
              <p className="mb-4 text-base leading-relaxed text-[var(--text-dark)]/70">
                Choose a time that suits you—your path to balance starts here.
              </p>
              <div className="space-y-3">
                <BookingCtaButton
                  variant="gold"
                  size="medium"
                  showArrow={false}
                  className="w-full max-w-full"
                >
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  Book Your Consultation
                </BookingCtaButton>
                <p className="px-0.5 text-center text-xs font-semibold leading-snug text-[var(--text-dark)]/60">
                  No payment required • Instant confirmation
                </p>
                {contactConfig.features.liveChatEnabled && (
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent/30 bg-white px-4 py-2.5 text-sm font-medium text-primary shadow-md shadow-primary/10 transition-all duration-200 hover:border-primary hover:shadow-md"
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
      <section className="py-8 md:py-10 lg:py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Your Questions, Answered"
            subtitle="Quick answers to common questions"
          />

          <div className="flex flex-col gap-2.5 md:gap-3">
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
                      <h3 className="font-semibold text-base md:text-lg text-[var(--text-dark)] leading-snug">
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
                        className={`pt-2 md:pt-3 text-base text-[var(--text-dark)]/70 leading-relaxed diagnosis-accordion-body ${
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
        <section
          id="find-us"
          className={`scroll-mt-20 ${glassGreenBandClassName} pb-8 pt-8 md:pb-10 md:pt-12`}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              title="Visit Us in Person"
              subtitle="Two convenient locations to support your care."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-6">
              {contactConfig.address.locations.map((location) => (
                <div
                  key={location.full}
                  className={interactiveCardClass}
                >
                  <h3 className="mb-1.5 font-semibold text-base text-[var(--text-dark)] md:text-lg">
                    {location.label}
                  </h3>
                  {locationBlurbs[location.id] ? (
                    <p className="mb-3 text-sm leading-relaxed text-[var(--text-dark)]/70">
                      {locationBlurbs[location.id]}
                    </p>
                  ) : null}
                  <div className="text-[var(--text-dark)]/80 text-base leading-relaxed mb-4">
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

            <div className="mt-8 flex flex-col items-center gap-3 text-center md:mt-10">
              <p className="text-base font-[450] leading-relaxed text-[#2C3E35]/80">
                Prefer to plan your visit first?
              </p>
              <BookingCtaButton variant="gold" showArrow={false}>
                <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                Book Your Consultation
              </BookingCtaButton>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
