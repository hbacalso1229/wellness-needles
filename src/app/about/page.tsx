'use client'

import { Heart, Award, Target, Clock, Shield } from 'lucide-react'
import Image from 'next/image'
import { PulsingLeaf, CTAButton, FeatureCard, HeroSection } from '../../features'

export default function About() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="About Wellness Needles"
        subtitle="Dedicated to bringing you the finest in traditional Chinese medicine and acupuncture therapy"
        description="Our practice combines ancient healing wisdom with modern understanding to provide comprehensive wellness solutions tailored to your unique needs."
        
        
        heightClass="py-20"
        showFloatingLeaves={false}
      />

      {/* Our Story Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl font-bold text-primary mb-6">
                About Arkinth Garcia
              </h2>
              <div className="space-y-4 text-secondary">
                <p>
                  My name is Arkinth Garcia, and I am a qualified Naturopath and Acupuncturist. 
                  I completed my training at the College of Naturopathic Medicine in Dublin, where 
                  I first studied Biomedicine to gain a strong foundation in anatomy, physiology, 
                  and pathology before specializing in acupuncture and naturopathy.
                </p>
                <p>
                  My journey into this field began with my own personal health challenge. I struggled 
                  with alopecia, and after trying many approaches without success, it was acupuncture 
                  that finally brought real healing and balance to my body. This powerful experience 
                  inspired me to dedicate my career to understanding how and why acupuncture works, 
                  and more importantly, how it can transform the lives of others.
                </p>
                <p>
                  Today, I combine my knowledge of acupuncture and naturopathic medicine to help people 
                  restore balance, improve their wellbeing, and address the root causes of their health 
                  concerns. My approach is holistic, compassionate, and tailored to each person&apos;s unique 
                  needs—whether you are looking for relief from a specific condition, support for stress 
                  and fatigue, or guidance on lifestyle changes that promote long-term health.
                </p>
                <p>
                  If you are ready to take the next step towards better health and balance, I would be 
                  honored to support you on your journey. I treat pain management, mental health conditions, 
                  digestive issues, fertility, and more.
                </p>
              </div>
            </div>
            <div className="bg-accent/5 rounded-lg p-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary rounded-full p-3">
                    <Target className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Mission</h3>
                    <p className="text-secondary">To restore balance and promote healing through authentic traditional Chinese medicine</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-secondary rounded-full p-3">
                    <Heart className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Vision</h3>
                    <p className="text-secondary">A community where holistic wellness is accessible to all who seek healing</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-accent rounded-full p-3">
                    <Shield className="w-6 h-6 text-cream" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary">Our Values</h3>
                    <p className="text-secondary">Authenticity, compassion, and dedication to the highest standards of care</p>
                  </div>
                </div>
                {/* Treatment in Progress Image */}
                <div className="mt-6">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl blur-sm"></div>
                    <div className="relative h-64 rounded-xl overflow-visible shadow-xl bg-cream/50 p-2">
                      <div className="relative h-full rounded-lg overflow-hidden">
                        <Image
                          src="/looking_after_patient.jpeg"
                          alt="Caring for patient during treatment"
                          fill
                          className="object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="absolute inset-0 rounded-xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300"></div>
                      {/* Floating leaf decorations */}
                      <div className="absolute -top-1 -right-1 z-20">
                        <PulsingLeaf 
                          size="small"
                          color="text-primary/60 group-hover:text-primary"
                          rotation={12}
                        />
                      </div>
                      <div className="absolute -bottom-1 -left-1 z-20">
                        <PulsingLeaf 
                          size="small"
                          color="text-accent/60 group-hover:text-accent"
                          rotation={-45}
                          animationDelay="0.7s"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Practitioner Section */}
      <section className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Your Practitioner
            </h2>
            <p className="text-lg text-secondary max-w-3xl mx-auto">
              Qualified Naturopath and Acupuncturist dedicated to your holistic wellness journey
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="bg-cream rounded-xl p-8 text-center shadow-lg relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-gold/10 to-accent/10 rounded-full -translate-x-10 -translate-y-10"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full translate-x-16 translate-y-16"></div>
              
              <div className="relative z-10">
                <div className="relative group mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-accent/20 rounded-full blur-md"></div>
                  <div className="w-32 h-32 bg-accent rounded-full mx-auto overflow-hidden relative border-4 border-cream shadow-xl">
                    <Image
                      src="/Arkinth_clinic_founder.jpeg"
                      alt="Arkinth Garcia - Naturopath & Acupuncturist"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-gold/30 animate-pulse"></div>
                  {/* Floating leaf decorations */}
                  <div className="absolute -top-2 -right-2 z-20">
                    <PulsingLeaf color="text-gold/60" rotation={45} />
                  </div>
                  <div className="absolute -bottom-2 -left-2 z-20">
                    <PulsingLeaf 
                      size="small"
                      color="text-accent/60"
                      rotation={-12}
                      animationDelay="1s"
                    />
                  </div>
                </div>
                
                <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                  Arkinth Garcia
                </h3>
                <p className="text-secondary text-sm mb-4">Naturopath & Acupuncturist</p>
                <p className="text-secondary text-sm mb-4">
                  Qualified from the College of Naturopathic Medicine, Dublin
                </p>
                <p className="text-secondary text-sm">
                  Specializing in pain management, mental health conditions, digestive issues, 
                  fertility support, and holistic wellness through acupuncture and naturopathic medicine.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Why Choose Wellness Needles?
            </h2>
            <p className="text-lg text-secondary">
              Committed to providing the highest quality care with authentic traditional practices and personal experience
            </p>
          </div>          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Award}
              title="Certified Expert"
              description="Arkinth Garcia is licensed and certified in acupuncture and naturopathic medicine from Dublin's prestigious College of Naturopathic Medicine"
              gradientFrom="from-accent/10"
              gradientTo="to-accent/10"
            />
            
            <FeatureCard
              icon={Clock}
              title="Flexible Scheduling"
              description="We offer convenient appointment times to fit your busy lifestyle and schedule"
              gradientFrom="from-accent/10"
              gradientTo="to-accent/10"
            />
            
            <FeatureCard
              icon={Heart}
              title="Personal Experience"
              description="Having experienced the healing power of acupuncture firsthand, Arkinth brings both professional expertise and personal understanding to your care"
              gradientFrom="from-accent/10"
              gradientTo="to-accent/10"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-cream relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/treatment_in_progress_2.jpeg"
            alt="Professional acupuncture treatment"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-primary/80"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Ready to Experience Our Care?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Take the first step towards better health with experienced, compassionate care
          </p>
          <CTAButton href="/bookings" variant="gold">
            Schedule Your Consultation
          </CTAButton>
        </div>
      </section>
    </div>
  )
}
