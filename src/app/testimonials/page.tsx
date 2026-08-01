'use client'

import {
  CTAButton,
  DecorativeImageCard,
  HeroSection,
  SectionHeading,
  SnapCarousel,
  TestimonialCard,
  snapSlideClassName,
} from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export default function Testimonials() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  const testimonials = [
    {
      name: 'Viera',
      condition: 'Anxiety, sleep & energy',
      date: '4 November 2023',
      rating: 5,
      text: 'I was suffering from anxiety for a long time. I was feeling dizzy, tired, had constant ringing in my ears, couldn\'t sleep in the night. The new symptoms were gradually adding up and worsening over the years. I was desperate and didn\'t know what to do. Then my friend recommended me to try acupuncture. I contacted Ace. We had a conversation about my medical history and my current symptoms. He was very kind and I felt open to him. After only a few treatments I started to feel more energetic. Gradually I became a happier person and my symptoms were improving. Even my friends have noticed my changes. They were saying I am blooming, that I look more "alive".',
    },
    {
      name: 'Viera',
      condition: 'Women\'s health & early menopause',
      date: '4 November 2023',
      rating: 5,
      text: 'I was feeling tired all the time, had a problem sleeping at night, I was getting hot flashes and was very dizzy most of the time. My periods were becoming weaker and less frequent. After visiting a women\'s health clinic, I was told that my body is working very hard to produce periods and that I am entering an early menopause (at the age of 39). I was suggested to start hormonal replacement therapy. I decided to go for acupuncture. I contacted Ace again. After only the second treatment, I woke up in the morning crying, full of emotions and with a heavy period. I am currently continuing the treatment and my periods are becoming stronger and more frequent. I truly recommend Ace. He is very professional, caring and friendly. I can tell him anything, there is no judgment or shame. He really wants to help people and he always gives 100% effort.',
    },
    {
      name: 'Francisca Pereira',
      condition: 'Fertility & anxiety',
      date: '23 November 2023',
      rating: 5,
      text: 'I would like to highly recommend Wellness Needles Clinic. I got acupuncture to help with fertility and anxiety. I found the treatment very effective and relaxing. Ace is very personable and professional.',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
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

      {/* Success Stories with Images */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Treatment Success Stories"
            subtitle="Visual evidence of our patients' healing journeys"
          />
          
          <SnapCarousel
            slideCount={2}
            ariaLabel="Success stories carousel"
            trackClassName="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-12"
          >
            <div className={snapSlideClassName}>
              <DecorativeImageCard
                src="/alopecia_treatment_before_after.jpeg"
                alt="Alopecia treatment before and after results"
                title="Alopecia Treatment Success"
                description="Real results from our specialized alopecia treatment program, showing significant hair regrowth through targeted acupuncture therapy."
                gradientFrom="from-primary/10"
                gradientTo="to-gold/10"
                objectFit="contain"
                leafColors={{
                  topRight: 'text-gold/70',
                  bottomLeft: 'text-accent/70'
                }}
                className="text-center"
              />
            </div>

            <div className={snapSlideClassName}>
              <DecorativeImageCard
                src="/skin_treatment_before_after.jpeg"
                alt="Skin treatment before and after results"
                title="Skin Condition Improvement"
                description="Remarkable skin healing achieved through acupuncture and holistic treatment approaches, demonstrating the power of traditional medicine."
                gradientFrom="from-secondary/10"
                gradientTo="to-light-green/10"
                objectFit="contain"
                leafColors={{
                  topRight: 'text-light-green/70',
                  bottomLeft: 'text-secondary/70'
                }}
                className="text-center"
              />
            </div>
          </SnapCarousel>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 md:py-16 lg:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Success Stories"
            subtitle="What our patients say"
            className="text-center mb-8 md:mb-16"
          />

          <div className="flex flex-col xl:grid xl:grid-cols-[1fr_minmax(16rem,18rem)] xl:gap-8 xl:items-start">
            <div className="min-w-0">
              <SnapCarousel
                slideCount={testimonials.length}
                ariaLabel="Patient stories carousel"
                trackClassName="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-8 lg:grid-cols-3"
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={`${testimonial.name}-${testimonial.condition}-${index}`}
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

            {/* Share CTA — desktop sticky sidebar */}
            <aside
              className="hidden xl:block order-2 w-full rounded-xl border border-accent/15 bg-accent/10 p-5 xl:sticky xl:top-24"
            >
              <h3 className="mb-1 text-base font-semibold text-primary">
                Share your success story
              </h3>
              <p className="mb-4 text-sm text-secondary">
                We&apos;d love to hear how treatment helped you.
              </p>
              <div className="space-y-2.5">
                <CTAButton
                  href="/contact"
                  variant="gold"
                  size="medium"
                  showArrow={false}
                  className="w-full !rounded-full text-sm font-bold gap-2 transition-[transform,box-shadow,filter] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
                >
                  Share your story
                </CTAButton>
                <BookingCtaButton
                  variant="outline"
                  showArrow={false}
                  size="medium"
                  className="w-full !rounded-full text-sm font-medium transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md motion-safe:hover:shadow-primary/20 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97]"
                >
                  Book an appointment
                </BookingCtaButton>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Video Testimonials"
            subtitle="Watch our patients share their healing experiences"
          />

          <SnapCarousel
            slideCount={3}
            ariaLabel="Video testimonials carousel"
            trackClassName="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8"
          >
            {[
              {
                title: 'Pain Relief Success',
                description: 'Watch how acupuncture helped resolve chronic pain issues',
              },
              {
                title: 'Fertility Journey',
                description: 'A couple shares their fertility success story with acupuncture',
              },
              {
                title: 'Stress Management',
                description: 'Learn how acupuncture transformed mental wellness',
              },
            ].map((video) => (
              <div
                key={video.title}
                className={`group ${snapSlideClassName} bg-white rounded-xl p-3.5 md:p-6 text-center border border-accent/15 transition-[transform,border-color] duration-300 motion-safe:md:hover:-translate-y-1 motion-safe:active:-translate-y-0.5 hover:border-primary/25`}
              >
                <div className="bg-primary/10 rounded-lg aspect-video mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 transition-transform duration-300 motion-safe:group-hover:scale-110">
                      <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1" />
                    </div>
                    <p className="text-primary font-medium">Video coming soon</p>
                  </div>
                </div>
                <h3 className="font-semibold text-primary mb-3">{video.title}</h3>
                <p className="text-secondary text-sm">{video.description}</p>
              </div>
            ))}
          </SnapCarousel>
        </div>
      </section>
    </div>
  )
}
