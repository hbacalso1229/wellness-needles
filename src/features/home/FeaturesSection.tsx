'use client'

import { Heart, Users, Award } from 'lucide-react'
import { DecorativeImageCard } from '../ui/DecorativeImageCard'
import { FeatureCard } from '../ui/FeatureCard'

export function FeaturesSection() {
  return (
    <section className="py-20 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
            Why Choose Wellness Needles?
          </h2>
          <p className="text-lg text-secondary max-w-3xl mx-auto">
            We combine traditional Chinese medicine with modern therapeutic approaches 
            to provide comprehensive healing solutions
          </p>
          
          {/* Clinic Images */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
            
            <DecorativeImageCard
              src="/needles_candles_flowers_decor.jpeg"
              alt="Acupuncture needles with calming decor"
              title="Traditional Elements"
              description="Authentic tools and ambiance"
              gradientFrom="from-accent/5"
              gradientTo="to-gold/5"
              leafColors={{
                topRight: 'text-accent/80/60 group-hover:text-accent',
                bottomLeft: 'text-gold/70 group-hover:text-gold'
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Heart}
            title="Holistic Healing"
            description="Our treatments address the root cause of ailments, promoting complete wellness of mind, body, and spirit through time-tested techniques."
            gradientFrom="from-accent/10"
            gradientTo="to-blue-light/10"
          />
          
          <FeatureCard
            icon={Users}
            title="Expert Practitioner"
            description="Arkinth Garcia, our qualified Naturopath and Acupuncturist, brings deep knowledge and personal experience to provide compassionate, holistic care."
            gradientFrom="from-blue-light/10"
            gradientTo="to-accent/10"
          />
          
          <FeatureCard
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
