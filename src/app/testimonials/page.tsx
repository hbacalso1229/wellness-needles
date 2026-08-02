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
import { BadgeCheck, HeartHandshake } from 'lucide-react'

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
      <section className="bg-cream py-8 md:py-14">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <h2 className="font-serif text-lg font-bold text-primary md:text-2xl">
            Ready to start your care?
          </h2>
          <p className="mt-1.5 text-xs leading-snug text-secondary md:mt-2 md:text-base md:leading-relaxed">
            Book a session with our licensed practitioner, or share how treatment helped you.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:mx-auto sm:mt-6 sm:max-w-xs sm:gap-2.5">
            <BookingCtaButton
              variant="gold"
              showArrow={false}
              size="medium"
              className="w-full !rounded-full !px-4 !py-2 !text-xs !font-bold gap-1.5 !shadow-none transition-[transform,filter] duration-200 ease-out md:!py-2.5 md:!text-sm motion-safe:hover:-translate-y-0.5 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
            >
              Book an appointment
            </BookingCtaButton>
            <CTAButton
              href="/contact"
              variant="outline"
              size="medium"
              showArrow={false}
              className="w-full !rounded-full !px-4 !py-2 !text-xs !font-medium gap-1.5 bg-cream/80 !shadow-none transition-transform duration-200 ease-out md:!py-2.5 md:!text-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
            >
              Share your story
            </CTAButton>
          </div>
        </div>
      </section>
    </div>
  )
}
