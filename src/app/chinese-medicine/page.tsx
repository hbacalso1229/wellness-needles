import { Leaf, Heart, Brain, Target, Zap, Circle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { BookingCtaButton } from '@/components/BookingCtaButton'

export default function ChineseMedicine() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-light-green text-cream relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/needles_candles_flowers_decor.jpeg"
            alt="Traditional Chinese medicine setting with needles, candles, and flowers"
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-light-green/75"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Traditional Chinese Medicine
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Ancient wisdom meets modern wellness in our holistic approach to health
            </p>
            <p className="text-lg opacity-80">
              Discover the profound principles that have guided healing for over 3,000 years, 
              offering a complete system of medicine that treats the whole person.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              The Philosophy of TCM
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Traditional Chinese Medicine is based on the understanding that health 
              comes from balance and harmony within the body and with nature
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Core Principles
              </h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary rounded-full p-2 flex-shrink-0">
                    <Circle className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Qi (Life Energy)</h4>
                    <p className="text-secondary">
                      The fundamental life force that flows through all living things. 
                      Health depends on the smooth and balanced flow of Qi throughout the body.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary rounded-full p-2 flex-shrink-0">
                    <Target className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Yin and Yang</h4>
                    <p className="text-secondary">
                      Complementary forces that must be in balance for optimal health. 
                      Disease occurs when these forces become imbalanced.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-accent rounded-full p-2 flex-shrink-0">
                    <Leaf className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Five Elements</h4>
                    <p className="text-secondary">
                      Wood, Fire, Earth, Metal, and Water represent different organ systems 
                      and their interconnected relationships in the body.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-light-green rounded-full p-2 flex-shrink-0">
                    <Zap className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-2">Meridian System</h4>
                    <p className="text-secondary">
                      Energy pathways that connect different parts of the body, 
                      allowing Qi to flow and nourish organs and tissues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-accent/5 rounded-lg p-8">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Holistic Approach
              </h3>
              <div className="space-y-4 text-secondary">
                <p>
                  Unlike Western medicine which often focuses on treating symptoms, 
                  Traditional Chinese Medicine views the body as an interconnected whole, 
                  seeking to identify and address the root causes of illness.
                </p>
                <p>
                  TCM practitioners consider not just physical symptoms, but also 
                  emotional, mental, and spiritual aspects of health, recognizing 
                  that true healing requires balance in all areas of life.
                </p>
                <p>
                  This comprehensive approach often leads to lasting healing rather 
                  than temporary relief, as it works to restore the body&apos;s natural 
                  ability to heal and maintain health.
                </p>
              </div>
              {/* Treatment Scene Image */}
              <div className="mt-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-light-green/10 to-gold/10 rounded-2xl blur-md"></div>
                  <div className="relative h-64 rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-cream to-light-green/5 p-3">
                    <div className="relative h-full rounded-xl overflow-hidden bg-white/50">
                      <Image
                        src="/accupuncture_cupping_therapy.jpeg"
                        alt="Acupuncture and cupping therapy session"
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute inset-0 rounded-2xl border border-light-green/30 group-hover:border-light-green/50 transition-all duration-300"></div>
                  </div>
                  {/* Traditional decorative elements */}
                  <div className="absolute -top-2 -right-2 text-light-green/70 animate-pulse">
                    <Leaf className="w-4 h-4 transform rotate-45" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 text-gold/70 animate-pulse" style={{ animationDelay: '1s' }}>
                    <Leaf className="w-3 h-3 transform -rotate-12" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatment Methods */}
      <section className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              TCM Treatment Methods
            </h2>
            <p className="text-lg text-secondary">
              We offer a comprehensive range of traditional Chinese medicine therapies
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-cream rounded-lg p-6 text-center shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                Acupuncture
              </h3>
              <p className="text-secondary mb-4">
                Fine needles inserted at specific points to regulate Qi flow and 
                promote healing throughout the body.
              </p>
              <Link href="/acupuncture" className="text-accent hover:text-primary font-medium">
                Learn More →
              </Link>
            </div>
            
            <div className="bg-cream rounded-lg p-6 text-center shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                Cupping Therapy
              </h3>
              <p className="text-secondary mb-4">
                Gentle suction therapy that improves circulation, reduces inflammation, 
                and releases muscle tension.
              </p>
              <span className="text-accent font-medium">Pain Relief</span>
            </div>
            
            <div className="bg-cream rounded-lg p-6 text-center shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                Moxibustion
              </h3>
              <p className="text-secondary mb-4">
                Therapeutic heat therapy using mugwort herb to warm acupuncture 
                points and strengthen Yang energy.
              </p>
              <span className="text-accent font-medium">Energy Building</span>
            </div>
            
            <div className="bg-cream rounded-lg p-6 text-center shadow-sm">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Circle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-primary mb-4">
                Gua Sha
              </h3>
              <p className="text-secondary mb-4">
                Gentle scraping technique that promotes circulation, reduces 
                inflammation, and supports detoxification.
              </p>
              <span className="text-accent font-medium">Circulation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Diagnosis Methods */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              TCM Diagnostic Methods
            </h2>
            <p className="text-lg text-secondary">
              Traditional Chinese Medicine uses unique diagnostic techniques to understand your health
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-accent/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-primary mb-3">Pulse Diagnosis</h3>
                <p className="text-secondary">
                  Practitioners feel the pulse at multiple positions to assess the quality, 
                  strength, and rhythm, revealing information about organ function and energy flow.
                </p>
              </div>
              
              <div className="bg-accent/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-primary mb-3">Tongue Examination</h3>
                <p className="text-secondary">
                  The color, coating, texture, and shape of the tongue provide insights 
                  into internal organ systems and overall constitutional health.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-accent/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-primary mb-3">Observation</h3>
                <p className="text-secondary">
                  Visual assessment of complexion, eyes, body build, movement, and overall 
                  vitality to understand constitutional strengths and imbalances.
                </p>
              </div>
              
              <div className="bg-accent/5 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-primary mb-3">Questioning & Listening</h3>
                <p className="text-secondary">
                  Detailed inquiry about symptoms, lifestyle, emotions, and listening to 
                  voice quality and breathing patterns to complete the diagnostic picture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration with Modern Medicine */}
      <section className="py-20 bg-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Integrative Approach
            </h2>
            <p className="text-lg text-secondary">
              Combining the best of traditional wisdom with modern medical understanding
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Complementary Care
              </h3>
              <div className="space-y-4 text-secondary">
                <p>
                  Traditional Chinese Medicine works beautifully alongside conventional 
                  medical treatments, often enhancing their effectiveness while reducing 
                  side effects and supporting overall well-being.
                </p>
                <p>
                  I collaborate with your healthcare team to ensure coordinated care 
                  that addresses all aspects of your health journey, from acute conditions 
                  to long-term wellness maintenance.
                </p>
                <p>
                  Many patients find that TCM helps them achieve better results from 
                  conventional treatments while providing additional tools for managing 
                  stress, pain, and other health challenges.
                </p>
              </div>
            </div>
            
            <div className="bg-cream rounded-lg p-8">
              <h3 className="font-serif text-2xl font-semibold text-primary mb-6">
                Evidence-Based Practice
              </h3>
              <div className="space-y-4 text-secondary">
                <p>
                  While respecting traditional knowledge, we stay current with modern 
                  research on TCM practices, ensuring our treatments meet both traditional 
                  standards and contemporary safety protocols.
                </p>
                <p>
                  We use sterile, single-use needles, maintain the highest hygiene standards, 
                  and continuously update our knowledge through ongoing education and 
                  professional development.
                </p>
                <div className="pt-4">
                  <Link
                    href="/about"
                    className="text-accent hover:text-primary font-medium inline-flex items-center"
                  >
                    Meet Our Practitioner <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-cream">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Experience Traditional Chinese Medicine
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Discover how this ancient healing system can support your journey to optimal health
          </p>
          <BookingCtaButton variant="gold">
            Begin Your Healing Journey
          </BookingCtaButton>
        </div>
      </section>
    </div>
  )
}
