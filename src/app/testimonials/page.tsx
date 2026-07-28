'use client'

import { Star, Quote, Heart, CheckCircle } from 'lucide-react'
import { CTAButton, DecorativeImageCard, HeroSection } from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'

export default function Testimonials() {
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
        backgroundClass="bg-accent"
        textColor="text-cream"
        heightClass="py-20"
        showFloatingLeaves={false}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <DecorativeImageCard
              src="/alopecia_treatment_before_after.jpeg"
              alt="Alopecia treatment before and after results"
              title="Alopecia Treatment Success"
              description="Real results from our specialized alopecia treatment program, showing significant hair regrowth through targeted acupuncture therapy."
              gradientFrom="from-primary/10"
              gradientTo="to-gold/10"
              leafColors={{
                topRight: 'text-gold/70',
                bottomLeft: 'text-accent/70'
              }}
              className="text-center"
            />
            
            <DecorativeImageCard
              src="/skin_treatment_before_after.jpeg"
              alt="Skin treatment before and after results"
              title="Skin Condition Improvement"
              description="Remarkable skin healing achieved through acupuncture and holistic treatment approaches, demonstrating the power of traditional medicine."
              gradientFrom="from-secondary/10"
              gradientTo="to-light-green/10"
              leafColors={{
                topRight: 'text-light-green/70',
                bottomLeft: 'text-secondary/70'
              }}
              className="text-center"
            />
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-cream rounded-lg p-8 shadow-sm relative">
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
                      <CheckCircle className="w-4 h-4 text-accent mr-2" />
                      Treatment: {testimonial.treatment}
                    </div>
                    <div className="flex items-center text-sm text-secondary">
                      <CheckCircle className="w-4 h-4 text-accent mr-2" />
                      Duration: {testimonial.duration}
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-accent/10 rounded-lg p-6 text-center">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video Coming Soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Pain Relief Success</h3>
              <p className="text-secondary text-sm">
                Watch how acupuncture helped resolve chronic pain issues
              </p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-6 text-center">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video Coming Soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Fertility Journey</h3>
              <p className="text-secondary text-sm">
                A couple shares their fertility success story with acupuncture
              </p>
            </div>
            
            <div className="bg-accent/10 rounded-lg p-6 text-center">
              <div className="bg-primary/20 rounded-lg aspect-video mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-0 h-0 border-l-[8px] border-l-cream border-y-[6px] border-y-transparent ml-1"></div>
                  </div>
                  <p className="text-primary font-medium">Video Coming Soon</p>
                </div>
              </div>
              <h3 className="font-semibold text-primary mb-2">Stress Management</h3>
              <p className="text-secondary text-sm">
                Learn how acupuncture transformed mental wellness
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Review Form CTA */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold text-primary mb-6">
            Share Your Success Story
          </h2>
          <p className="text-lg text-secondary mb-8">
            Have you experienced healing through our treatments? We&apos;d love to hear about your journey 
            and how acupuncture has improved your life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CTAButton href="/contact" variant="primary">
              Share Your Story
            </CTAButton>
            <BookingCtaButton variant="secondary" showArrow={false}>
              Start Your Journey
            </BookingCtaButton>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-cream">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Ready to Write Your Success Story?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of patients who have found healing and wellness through acupuncture
          </p>
          <BookingCtaButton variant="gold">
            Book Your First Session
          </BookingCtaButton>
        </div>
      </section>
    </div>
  )
}
