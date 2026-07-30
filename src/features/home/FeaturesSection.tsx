'use client'

import { Heart, Users, Award } from 'lucide-react'
import { DecorativeImageCard } from '../ui/DecorativeImageCard'
import { FeatureCard } from '../ui/FeatureCard'
import { SectionHeading } from '../ui/SectionHeading'

export function FeaturesSection() {
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          title="Why Choose Wellness Needles?"
          subtitle="We combine traditional Chinese medicine with modern therapeutic approaches to provide comprehensive healing solutions"
          titleClassName="font-serif text-4xl md:text-5xl font-bold text-primary mb-3"
          className="text-center"
        />

        {/* Clinic Images — horizontal scroll carousel on mobile, 3-col grid on desktop */}
        <div className="mt-12 flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          <div className="snap-start shrink-0 w-[78vw] sm:w-[58vw] md:w-auto">
            <DecorativeImageCard
              src="/modern_accupuncture.jpeg"
              alt="Modern acupuncture treatment"
              title="Modern Treatment Room"
              description="State-of-the-art acupuncture facility"
              gradientFrom="from-primary/5"
              gradientTo="to-accent/5"
              leafColors={{
                topRight: 'text-gold/70 group-hover:text-gold',
                bottomLeft: 'text-accent/70 group-hover:text-accent'
              }}
            />
          </div>

          <div className="snap-start shrink-0 w-[78vw] sm:w-[58vw] md:w-auto">
            <DecorativeImageCard
              src="/clinic_decor.jpeg"
              alt="Wellness clinic interior"
              title="Calming Environment"
              description="Peaceful space for healing"
              gradientFrom="from-secondary/5"
              gradientTo="to-light-green/5"
              leafColors={{
                topRight: 'text-secondary/70 group-hover:text-secondary',
                bottomLeft: 'text-light-green/70 group-hover:text-light-green'
              }}
            />
          </div>

          <div className="snap-start shrink-0 w-[78vw] sm:w-[58vw] md:w-auto">
            <DecorativeImageCard
              src="/needles_candles_flowers_decor.jpeg"
              alt="Acupuncture needles with calming decor"
              title="Traditional Elements"
              description="Authentic tools and ambiance"
              gradientFrom="from-accent/5"
              gradientTo="to-gold/5"
              leafColors={{
                topRight: 'text-accent/60 group-hover:text-accent',
                bottomLeft: 'text-gold/70 group-hover:text-gold'
              }}
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
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            flippable
            icon={Heart}
            title="Holistic Healing"
            description="Our treatments address the root cause of ailments, promoting complete wellness of mind, body, and spirit through time-tested techniques."
            gradientFrom="from-accent/10"
            gradientTo="to-blue-light/10"
          />
          
          <FeatureCard
            flippable
            icon={Users}
            title="Expert Practitioner"
            description="Arkinth Garcia, our qualified Naturopath and Acupuncturist, brings deep knowledge and personal experience to provide compassionate, holistic care."
            gradientFrom="from-blue-light/10"
            gradientTo="to-accent/10"
          />
          
          <FeatureCard
            flippable
            icon={Award}
            title="Proven Results"
            description="Patients have experienced relief from chronic conditions and improvements in thier quality of life through our personalised treatments."
            gradientFrom="from-accent/10"
            gradientTo="to-blue-primary/10"
          />
        </div>
      </div>
    </section>
  )
}
