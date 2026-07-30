'use client'

import { Star, Quote, Heart, CheckCircle } from 'lucide-react'
import { CTAButton, DecorativeImageCard, HeroSection } from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export default function Testimonials() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  const testimonials = [
    {
      name: "Sarah Mitchell",
      condition: "Chronic Back Pain",
      rating: 5,
      text: "After years of chronic back pain, I was skeptical about acupuncture. But after just three sessions at Wellness Needles, I felt significant relief. The team is incredibly knowledgeable and caring. I can now enjoy activities I thought I&apos;d never do again.",
      treatment: "Back Pain Management",
      duration: "6 sessions over 3 months"
    },
    {
      name: "David Chen",
      condition: "Stress & Anxiety",
      rating: 5,
      text: "The stress from my job was overwhelming until I discovered acupuncture at Wellness Needles. The treatments help me feel centered and calm. I sleep better and handle work pressure much more effectively now.",
      treatment: "Stress Relief & Mental Wellness",
      duration: "Weekly sessions for 2 months"
    },
    {
      name: "Maria Rodriguez",
      condition: "Fertility Support",
      rating: 5,
      text: "We had been trying to conceive for over two years. After starting acupuncture treatments, I became pregnant within four months. The practitioners were supportive throughout the entire journey.",
      treatment: "Fertility Enhancement",
      duration: "Bi-weekly sessions for 6 months"
    },
    {
      name: "James Thompson",
      condition: "Migraines",
      rating: 5,
      text: "I suffered from debilitating migraines for years. Since starting acupuncture, the frequency and intensity have dramatically decreased. I finally have my life back and couldn&apos;t be more grateful.",
      treatment: "Migraine Prevention",
      duration: "Weekly sessions for 4 months"
    },
    {
      name: "Linda Wang",
      condition: "Digestive Issues",
      rating: 5,
      text: "My IBS symptoms were affecting my daily life. The holistic approach at Wellness Needles, combining acupuncture with dietary guidance, has transformed my digestive health completely.",
      treatment: "Digestive Health",
      duration: "Bi-weekly sessions for 3 months"
    },
    {
      name: "Robert Kim",
      condition: "Arthritis",
      rating: 5,
      text: "As a retired carpenter, arthritis in my hands was making simple tasks impossible. Acupuncture has restored much of my mobility and reduced the pain significantly. I can even work on small projects again.",
      treatment: "Arthritis Management",
      duration: "Weekly sessions for 8 weeks"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Patient Testimonials"
        subtitle="Stories inspired by the kinds of healing journeys acupuncture can support"
        description="Explore illustrative examples of how traditional Chinese medicine may help improve quality of life. Real patient reviews will be shared here with consent."
        backgroundImage="/modern_accupuncture.jpeg"
        backgroundClass="bg-primary"
        textColor="text-cream"
        heightClass="py-20"
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
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Treatment Success Stories
            </h2>
            <p className="text-lg text-secondary">
              Visual evidence of our patients&apos; healing journeys
            </p>
          </div>
          
          {/* Mobile: horizontal scroll carousel | md: 2-col */}
          <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-12">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
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

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto">
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

      {/* Testimonials Grid */}
      <section className="py-20 bg-accent/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Success Stories
            </h2>
            <p className="text-lg text-secondary">
              Illustrative examples of common treatment journeys
            </p>
            <p className="mt-4 max-w-3xl mx-auto text-sm text-secondary bg-cream/80 border border-accent/20 rounded-lg px-4 py-3">
              These stories are illustrative examples for educational purposes and are not attributed
              to verified patients. Genuine reviews will be published here once consent is obtained.
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_minmax(16rem,18rem)] lg:gap-8 lg:items-start">
            <div className="min-w-0">
              {/* Mobile: horizontal scroll carousel | md: 2-col */}
              <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 md:gap-8">
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-cream rounded-lg p-8 shadow-sm relative card-emboss">
                    <Quote className="absolute top-6 right-6 w-8 h-8 text-accent/30" />
                    
                    {/* Rating */}
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-gold fill-current" />
                      ))}
                    </div>
                    
                    {/* Testimonial Text */}
                    <p className="text-secondary mb-6 italic">
                      &quot;{testimonial.text}&quot;
                    </p>
                    
                    {/* Patient Info */}
                    <div className="border-t border-accent/20 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-primary">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-secondary">
                            {testimonial.condition}
                          </p>
                        </div>
                        <Heart className="w-6 h-6 text-accent" />
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-secondary">
                          <CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" />
                          Treatment: {testimonial.treatment}
                        </div>
                        <div className="flex items-center text-sm text-secondary">
                          <CheckCircle className="w-4 h-4 text-accent mr-2 shrink-0" />
                          Duration: {testimonial.duration}
                        </div>
                      </div>
                    </div>
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

            {/* Share CTA — below stories on mobile, sticky sidebar on desktop */}
            <aside className="w-full mt-8 lg:mt-0 p-5 rounded-xl bg-accent/15 shadow-lg shadow-primary/15 border border-accent/20 card-emboss lg:sticky lg:top-24">
              <h3 className="font-semibold text-base text-primary mb-2">
                Share Your Success Story
              </h3>
              <p className="text-sm text-secondary mb-4">
                Experienced healing through our treatments? We&apos;d love to hear your journey.
              </p>
              <div className="space-y-2.5">
                <CTAButton
                  href="/contact"
                  variant="gold"
                  size="medium"
                  showArrow={false}
                  className="w-full !rounded-full text-sm font-bold gap-2"
                >
                  Share your story
                </CTAButton>
                <BookingCtaButton
                  variant="outline"
                  showArrow={false}
                  size="medium"
                  className="w-full !rounded-full text-sm font-medium"
                >
                  Start your journey
                </BookingCtaButton>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Video Testimonials Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Video Testimonials
            </h2>
            <p className="text-lg text-secondary">
              Watch our patients share their healing experiences
            </p>
          </div>
          
          {/* Mobile: horizontal scroll carousel | md: 2-col | lg: 3-col */}
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3 md:gap-8">
            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/10 rounded-lg p-6 text-center card-emboss">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video coming soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Pain Relief Success</h3>
              <p className="text-secondary text-sm">
                Watch how acupuncture helped resolve chronic pain issues
              </p>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/10 rounded-lg p-6 text-center card-emboss">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video coming soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Fertility Journey</h3>
              <p className="text-secondary text-sm">
                A couple shares their fertility success story with acupuncture
              </p>
            </div>

            <div className="snap-start shrink-0 w-[80vw] sm:w-[55vw] md:w-auto bg-accent/10 rounded-lg p-6 text-center card-emboss">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video coming soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Stress Management</h3>
              <p className="text-secondary text-sm">
                Learn how acupuncture transformed mental wellness
              </p>
            </div>
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
    </div>
  )
}
