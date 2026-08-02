'use client'

import {
  BeforeAfterSlider,
  CTAButton,
  HeroSection,
  SectionHeading,
  SnapCarousel,
  TestimonialCard,
  snapSlideClassName,
} from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { BadgeCheck, Calendar, HeartHandshake, Star } from 'lucide-react'

export default function Testimonials() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  // Unique patient names only (max 3) — one Viera + Francisca
  const testimonials = [
    {
      name: 'Viera',
      condition: 'Anxiety, sleep & energy',
      date: '4 November 2023',
      rating: 5,
      text: 'I was suffering from anxiety for a long time. I was feeling dizzy, tired, had constant ringing in my ears, couldn\'t sleep in the night. The new symptoms were gradually adding up and worsening over the years. I was desperate and didn\'t know what to do. Then my friend recommended me to try acupuncture. I contacted Arkinth. We had a conversation about my medical history and my current symptoms. He was very kind and I felt open to him. After only a few treatments I started to feel more energetic. Gradually I became a happier person and my symptoms were improving. Even my friends have noticed my changes. They were saying I am blooming, that I look more "alive".',
    },
    {
      name: 'Francisca Pereira',
      condition: 'Fertility & anxiety',
      date: '23 November 2023',
      rating: 5,
      text: 'I would like to highly recommend Wellness Needles Clinic. I got acupuncture to help with fertility and anxiety. I found the treatment very effective and relaxing. Arkinth is very personable and professional.',
    },
  ]

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Patient Testimonials"
        subtitle="Real stories from people who chose acupuncture with Wellness Needles"
        description="Hear from patients in their own words — shared with consent — about how treatment supported their health and wellbeing."
        backgroundImage="/modern_accupuncture.jpeg"
        backgroundClass="bg-primary"
        textColor="text-cream"
        showFloatingLeaves={true}
        ctaWrapperClassName="xl:hidden"
        ctaButtons={[
          {
            text: 'Book your first session',
            href: bookHref,
            variant: 'gold',
            external: isExternal,
            target,
            rel,
          },
        ]}
      />

      {/* Real Patient Results */}
      <section className="bg-cream py-8 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Real Patient Results"
            subtitle="Personalized treatment outcomes — clear before and after comparisons"
            className="mb-4 text-center md:mb-8"
            titleClassName="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-primary mb-1.5 md:mb-3"
          />

          <div className="mb-5 flex flex-col items-center gap-1 text-xs text-secondary sm:mb-8 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-5 sm:gap-y-1.5 sm:text-sm md:mb-10">
            <p className="inline-flex items-center gap-1.5">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" aria-hidden />
              Licensed &amp; certified practitioner
            </p>
            <p className="inline-flex items-center gap-1.5">
              <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" aria-hidden />
              Stories &amp; photos shared with consent
            </p>
          </div>

          <div className="mx-auto max-w-lg">
            <BeforeAfterSlider
              beforeSrc="/results/alopecia-before.png"
              afterSrc="/results/alopecia-after.png"
              beforeRotate="-42deg"
              afterRotate="32deg"
              className="max-w-[17rem] sm:max-w-sm md:max-w-lg"
              title="Alopecia treatment progress"
              description="Hair regrowth after a personalized acupuncture care plan — compare before and after."
              altBefore="Scalp before alopecia treatment showing a bald patch"
              altAfter="Scalp after alopecia treatment showing hair regrowth"
            />
          </div>
        </div>
      </section>

      {/* What patients say */}
      <section className="bg-secondary/5 py-8 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="What patients say"
            subtitle="Honest feedback from people in our care"
            className="mb-6 text-center md:mb-12"
            titleClassName="font-serif text-xl sm:text-3xl md:text-4xl font-bold text-primary mb-1.5 md:mb-3"
          />

          <SnapCarousel
            slideCount={testimonials.length}
            ariaLabel="Patient stories carousel"
            trackClassName="flex gap-2.5 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-8 md:overflow-visible md:pb-0 md:px-0 lg:max-w-4xl lg:mx-auto"
          >
            {testimonials.map((testimonial) => (
              <div
                key={`${testimonial.name}-${testimonial.condition}`}
                className={snapSlideClassName}
              >
                <TestimonialCard
                  name={testimonial.name}
                  condition={testimonial.condition}
                  date={testimonial.date}
                  rating={testimonial.rating}
                  text={testimonial.text}
                />
              </div>
            ))}
          </SnapCarousel>
        </div>
      </section>

      {/* CTA band — Book primary, Share secondary */}
      <section className="bg-cream py-16 md:py-24">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-bold leading-snug text-primary md:text-3xl">
            Start feeling better today
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-dark)]/65 md:mt-4 md:text-base">
            Book your appointment in under a minute — we&apos;ll confirm everything for you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:mx-auto sm:mt-10 sm:max-w-sm sm:gap-3.5">
            <BookingCtaButton
              variant="gold"
              showArrow={false}
              size="large"
              className="w-full !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-5 !py-3 !text-sm !font-bold whitespace-nowrap shadow-md shadow-primary/25 gap-2 transition-[transform,box-shadow,filter] duration-200 ease-out md:!px-6 md:!py-3.5 md:!text-base motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] hover:!from-[#f0d45c] hover:!to-[#c9a52f]"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" aria-hidden />
              <span className="whitespace-nowrap">Book your appointment</span>
            </BookingCtaButton>
            <CTAButton
              href="/contact"
              variant="outline"
              size="medium"
              showArrow={false}
              className="w-full !rounded-full !border-primary/35 !px-4 !py-2.5 !text-xs !font-medium !text-primary/70 !shadow-none !bg-transparent transition-[transform,color,border-color] duration-200 ease-out hover:!border-primary/55 hover:!bg-transparent hover:!text-primary/90 md:!py-3 md:!text-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
            >
              Share your story
            </CTAButton>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[var(--text-dark)]/60 md:mt-8">
            <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-hidden />
            <span>Trusted by 200+ patients</span>
          </p>
        </div>
      </section>
    </div>
  )
}
