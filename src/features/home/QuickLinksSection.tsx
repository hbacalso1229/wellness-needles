'use client'

import { Leaf, Heart, Users, Calendar } from 'lucide-react'
import { ServiceCard } from '../ui/ServiceCard'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'

export function QuickLinksSection() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  return (
    <section className="py-20 bg-gradient-to-br from-accent/5 via-blue-subtle/30 to-accent/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
            Explore Our Services
          </h2>
          <p className="text-lg text-secondary">
            Discover the comprehensive range of treatments and information we offer
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ServiceCard
            href="/acupuncture"
            icon={Leaf}
            title="Why Acupuncture"
            description="Learn about the benefits and science behind acupuncture"
            borderColor="border-blue-light/30 group-hover:border-blue-light group-hover:shadow-blue-light/10"
          />
          
          <ServiceCard
            href="/chinese-medicine"
            icon={Heart}
            title="Chinese Medicine"
            description="Explore traditional Chinese medicine principles"
            borderColor="border-accent/20 group-hover:border-accent"
          />
          
          <ServiceCard
            href="/testimonials"
            icon={Users}
            title="Testimonials"
            description="Read success stories from our patients"
            borderColor="border-blue-primary/30 group-hover:border-blue-primary group-hover:shadow-blue-primary/10"
          />
          
          <ServiceCard
            href={bookHref}
            external={isExternal}
            target={target}
            rel={rel}
            icon={Calendar}
            title="Book Now"
            description="Schedule your appointment today"
            variant="primary"
          />
        </div>
      </div>
    </section>
  )
}
