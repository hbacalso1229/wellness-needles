'use client'

import {
  BeforeAfterSlider,
  ClinicalMetricCard,
  HeroSection,
  SectionHeading,
  SnapCarousel,
  TestimonialCard,
  reviewSlideClassName,
  snapSlideWideClassName,
  snapTrackGridLgClassName,
  snapTrackHorizontalClassName,
  glassGreenBandClassName,
} from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'
import { BookingSection } from '../../features/home/BookingSection'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { BadgeCheck, Calendar, HeartHandshake, Star, ArrowRight } from 'lucide-react'

export default function Testimonials() {
  const { href: bookHref, isExternal, target, rel } = useBookingCtaHref()

  const testimonials = [
    {
      name: 'Maria Bray',
      condition: 'Gastritis & energy',
      date: '4 August 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'from daily pain and discomfort with gastritis to no symptoms at all',
      text: 'Going to Arkinth for acupuncture has made a huge impact on my health, going from daily pain and discomfort with gastritis to no symptoms at all and an increase in energy levels and an overall feeling of being less stressed and a calmness in myself. Arkinth is excellent, very knowledgeable and has such kindness and understanding. I cannot recommend him enough, if your looking to try acupuncture or wanting to improve your health this is the place to go.',
    },
    {
      name: 'Aidan Murphy',
      condition: 'Sleep & energy',
      date: '31 July 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'sleeping better and noticeably more energy',
      text: "I have been to wellness needles twice and already I've seen the benefits of diet and lifestyle changes that were recommended - sleeping better and noticeably more energy...highly recommended..",
    },
    {
      name: 'Christine Tuohy',
      condition: 'Energy & wellbeing',
      date: '28 July 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: "I honestly couldn't recommend him highly enough",
      text: "I've had 6 treatments with Arkinth at Wellness Needles over the past few months, and I honestly couldn't recommend him highly enough. From my very first appointment, he made me feel completely at ease. He took the time to listen, understand my needs, and tailor each treatment to support me. Every session has been a calm and relaxing experience. I've noticed a real improvement in my energy levels, and I always leave feeling refreshed, balanced, and well cared for. His professionalism, knowledge, and genuine kindness really stand out, and the clinic has such a welcoming and peaceful atmosphere. If you're considering acupuncture, I would highly recommend Arkinth at Wellness Needles. It has been such a positive experience for me, and I'm very grateful for the care, support, and expertise he has provided over the past few months.",
    },
    {
      name: 'Pavlo Nikulin',
      condition: 'Lower back pain',
      date: '22 July 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'it took only 2 sessions for Arkinth to deal with it',
      text: "I've had a very bad lower back pain and it took only 2 sessions for Arkinth to deal with it. I canot recommend him enough. Considering attitude, knowledge and willingness to help - absolutely amazing!",
    },
    {
      name: 'Claire Maguire',
      condition: 'Digestive symptoms & aches',
      date: '18 July 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'Within one session I noticed symptoms affecting my tummy going away',
      text: 'Within one session I noticed symptoms affecting my tummy going away. Other aches and pains (thinking it was peri menopause) have disappeared completely. It took 5-6 sessions and I can only say it was a miracle. Arkinth says its simple. Open the meridians and the body heals itself. So after 12 long years of doing acupuncture, energy healing, yoga, meditation and not shifting the discomfort in the body, I find Arkinth and he knows exactly what to do. It was like he had the key to open the door and the energy flows to the exact places where I needed to heal. The body has intelligence far beyond our understanding. My GP is officially deleted from my phone and I am taking my entire family to see Arkinth for up keep.',
    },
    {
      name: 'Jen Bren',
      condition: 'Healing & wellbeing',
      date: '16 May 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'it was on another level',
      text: 'I have had acupuncture many times before and found it good. HOWEVER I had a treatment with Arkinth and it was on another level. Arkinth is genuinely interested in helping you heal, it was an excellent treatment and extremely relaxing. I would recommend this treatment to anyone that is interested in healing the body and improving their quality of life. Thank you so much. Jen :)',
    },
    {
      name: 'Sue Hopkins',
      condition: 'First session experience',
      date: '19 April 2026',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'I found Arkinth exceptional',
      text: 'Had my first session with Arkinth yesterday and i was so impressed; he is a such a highly skilled therapist; so genuine; with extensive knowledege and understanding you just know he really cares about his clients and there well being. I have went to a few different acupunturists over the years and I found Arkinth exceptional; his service is so unique and specialised I would highly reccommend his service',
    },
    {
      name: 'Andrew Murphy',
      condition: 'Shoulder pain, anxiety & depression',
      date: '30 December 2023',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'I am now pain free thanks to Arkinth',
      text: 'I have seen Arkinth for various issues. I had a reoccurring shoulder pain which was troubling me for years. After a few sessions with Arkinth the pain was almost gone. It allowed me to do the exercises suggested by the physio without having to take pain killers. I still regularly attend physio for the problem but I am now pain free thanks to Arkinth. I have also seen Arkinth for anxiety and depression. Getting through this involved life style changes as well as diet changes. Arkinth helped me with both. Very professional and passionate about helping people.',
    },
    {
      name: 'Francisca Pereira',
      condition: 'Fertility & anxiety',
      date: '23 November 2023',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'I found the treatment very effective and relaxing',
      text: 'I would like to highly recommend Wellness Needles Clinic. I got acupuncture to help with fertility and anxiety. I found the treatment very effective and relaxing. Arkinth is very personable and professional.',
    },
    {
      name: 'Viera',
      condition: 'Anxiety, sleep & energy',
      date: '4 November 2023',
      rating: 5,
      source: 'Verified Google review',
      emphasis: 'I am blooming, that I look more "alive"',
      text: 'I was suffering from anxiety for a long time. I was feeling dizzy, tired, had constant ringing in my ears, couldn\'t sleep in the night. The new symptoms were gradually adding up and worsening over the years. I was desperate and didn\'t know what to do. Then my friend recommended me to try acupuncture. I contacted Arkinth. We had a conversation about my medical history and my current symptoms. He was very kind and I felt open to him. After only a few treatments I started to feel more energetic. Gradually I became a happier person and my symptoms were improving. Even my friends have noticed my changes. They were saying I am blooming, that I look more "alive".',
    },
  ]

  const reviewCount = testimonials.length
  const ratingAverage =
    reviewCount === 0
      ? 0
      : testimonials.reduce((sum, t) => sum + t.rating, 0) / reviewCount
  const ratingAverageLabel = ratingAverage.toFixed(1)

  const photoResultCases = [
    {
      beforeSrc: '/results/alopecia-before.png',
      afterSrc: '/results/alopecia-after.png',
      beforeRotate: '-42deg',
      afterRotate: '32deg',
      imageFit: 'cover' as const,
      title: 'Hair Loss',
      highlight: 'From thinning to fuller hair in 12 weeks',
      proofPoints: ['Clinically documented improvement', 'Shared with patient consent'],
      altBefore: 'Scalp before alopecia treatment showing a bald patch',
      altAfter: 'Scalp after alopecia treatment showing hair regrowth',
    },
    {
      beforeSrc: '/results/eczema-before.png',
      afterSrc: '/results/eczema-after.png',
      imageFit: 'cover' as const,
      title: 'Eczema',
      highlight: 'Clearer skin, reduced inflammation',
      proofPoints: ['Clear improvement throughout treatment', 'Shared with patient consent'],
      altBefore:
        'Back and legs before eczema treatment showing widespread redness and inflammation',
      altAfter:
        'Back and legs after eczema treatment with reduced redness and clearer skin',
    },
  ]

  const resultSlideCount = photoResultCases.length + 1
  const resultCardClass = `patient-card group/card ${snapSlideWideClassName} rounded-xl border border-[#1B3B2B]/10 bg-white shadow-[0_6px_20px_rgba(27,59,43,0.06)] transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform motion-safe:hover:-translate-y-1.5 hover:border-primary/30 motion-safe:hover:shadow-[0_14px_32px_rgba(27,59,43,0.12)]`
  return (
    <div className="min-h-screen">
      <HeroSection
        title="Real Results. Real Patients."
        subtitle="In their own words — verified reviews from people treated at Wellness Needles."
        backgroundImage="/testimonials_patient_treatment.jpeg"
        backgroundImageClassName="object-cover object-center"
        backgroundOverlayClassName="bg-gradient-to-b from-black/60 via-primary/40 to-black/60"
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
      >
        <div className="mx-auto mt-3 flex max-w-2xl flex-col items-center gap-3 sm:mt-4 sm:gap-4">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-cream/95 sm:text-base">
            <span className="inline-flex items-center gap-0.5" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 fill-gold text-gold" />
              ))}
            </span>
            <span>5-star verified Google reviews</span>
          </div>
          <ul className="flex flex-wrap justify-center gap-2">
            {['Back pain', 'Stress & anxiety', 'Sleep issues', 'Digestion'].map((category) => (
              <li
                key={category}
                className="rounded-full border border-cream/35 bg-cream/10 px-3 py-1 text-xs font-semibold tracking-wide text-cream/95 sm:text-sm"
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </HeroSection>

      {/* Mobile page intro — hero is xl-only; header Book is the fold CTA */}
      <section className="bg-white px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4 xl:hidden">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-2xl font-bold leading-tight text-[var(--text-dark)] sm:text-4xl">
            Real Results. Real Patients.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-base leading-relaxed text-[var(--text-dark)]/70 sm:mt-2.5 sm:text-lg">
            In their own words — verified reviews from people treated at Wellness Needles.
          </p>
          <div className="mx-auto mt-3 flex justify-center sm:mt-3.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-white px-3.5 py-1.5">
              <span className="text-sm font-bold text-primary">5.0</span>
              <span className="inline-flex items-center gap-0.5" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </span>
              <span className="text-sm text-[var(--text-dark)]/70">Google Reviews</span>
            </span>
          </div>
        </div>
      </section>

      {/* Real Patient Results — light canvas to match site header */}
      <section className="scroll-mt-24 bg-white pb-5 pt-3 sm:pb-8 sm:pt-4 md:py-10 lg:py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Real Results. Real Lives Changed."
            subtitle="Personalised care designed to restore balance—and deliver results you can see and feel."
            className="mb-4 text-center md:mb-5"
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-1.5 md:mb-3"
            subtitleClassName="text-base sm:text-lg md:text-xl text-[var(--text-dark)]/70 max-w-3xl mx-auto leading-relaxed"
            leafClassName="h-3.5 w-3.5 shrink-0 text-[#1B3B2B] md:h-4 md:w-4"
          />

          <div className="mb-4 flex flex-col items-center gap-2 sm:mb-5 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-2 md:mb-6">
            {[
              {
                icon: BadgeCheck,
                label: 'Licensed & certified practitioner',
                iconClass: 'h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4',
              },
              {
                icon: HeartHandshake,
                label: 'Shared with consent',
                iconClass: 'h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4',
              },
              {
                icon: Star,
                label: 'Trusted by 200+ patients',
                iconClass: 'h-3.5 w-3.5 shrink-0 fill-primary/20 text-primary sm:h-4 sm:w-4',
              },
            ].map(({ icon: Icon, label, iconClass }) => (
              <p
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1.5 text-[13px] tracking-[0.3px] text-primary"
              >
                <Icon className={iconClass} aria-hidden />
                {label}
              </p>
            ))}
          </div>

          <SnapCarousel
            slideCount={resultSlideCount}
            ariaLabel="Patient results before and after"
            hideDotsFrom="lg"
            showArrows
            showArrowsFrom="until-lg"
            trackClassName={snapTrackGridLgClassName}
          >
            {photoResultCases.map((result) => (
              <div key={result.title} className={resultCardClass}>
                <BeforeAfterSlider
                  beforeSrc={result.beforeSrc}
                  afterSrc={result.afterSrc}
                  beforeRotate={result.beforeRotate}
                  afterRotate={result.afterRotate}
                  imageFit={result.imageFit}
                  aspectClassName="aspect-[4/3]"
                  title={result.title}
                  highlight={result.highlight}
                  proofPoints={result.proofPoints}
                  altBefore={result.altBefore}
                  altAfter={result.altAfter}
                />
              </div>
            ))}

            <article className={resultCardClass} aria-labelledby="lab-result-title">
              <ClinicalMetricCard
                title="Sperm Concentration"
                headingId="lab-result-title"
                beforeValue={3.2}
                afterValue={27.21}
                unit="M/ml"
                healthyMin={15}
                scaleMax={40}
                increaseLabel="+750%"
                highlight="From below range to healthy concentration"
                proofPoints={['Within clinical range', 'Medically verified']}
              />
            </article>
          </SnapCarousel>

          <p className="mt-5 text-center text-sm tracking-[0.2px] text-[#1B3B2B]/65 md:mt-6">
            Clinically observed results · Individual results may vary
          </p>

          <div className="mt-4 flex flex-col items-center gap-2.5 sm:mt-5">
            <p className="mb-1 text-center text-base font-[450] leading-relaxed text-[#2C3E35]/80">
              Your story can be the next one we celebrate.
            </p>
            <BookingCtaButton variant="gold" showArrow={false} size="large">
              <Calendar className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              <span className="whitespace-nowrap">Book Your Consultation</span>
            </BookingCtaButton>
            <p className="text-base text-[#1B3B2B]/65">Get a personalised plan</p>
            <a
              href="#patient-stories"
              className="group inline-flex items-center gap-1 text-sm font-medium text-[#1B3B2B]/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-[#1B3B2B] hover:underline"
            >
              View more results
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                aria-hidden
              />
            </a>
          </div>
        </div>
      </section>

      {/* What patients say — glass green proof band */}
      <section
        id="patient-stories"
        className={`scroll-mt-24 ${glassGreenBandClassName} pt-8 pb-4 md:pt-10 md:pb-5 lg:pt-12 lg:pb-6`}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Real Stories. Real Healing."
            subtitle="Experiences from patients who've truly felt the difference."
            className="mb-4 text-center md:mb-5"
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-1.5 md:mb-3"
          />

          <div className="mb-5 flex flex-col items-center gap-1 text-center text-base text-secondary/80 md:mb-6">
            <p className="inline-flex items-center gap-1.5">
              <span className="inline-flex" aria-hidden>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </span>
              <span className="font-medium text-[var(--text-dark)]">
                {ratingAverageLabel}/5 average
              </span>
            </p>
            <p>
              from {reviewCount} verified patient{' '}
              {reviewCount === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          <SnapCarousel
            slideCount={testimonials.length}
            ariaLabel="Patient stories carousel"
            hideDotsFrom="never"
            showArrows
            className="mx-auto max-w-7xl"
            trackClassName={snapTrackHorizontalClassName}
          >
            {testimonials.map((testimonial) => (
              <div
                key={`${testimonial.name}-${testimonial.condition}`}
                className={`${reviewSlideClassName} flex`}
              >
                <TestimonialCard
                  name={testimonial.name}
                  condition={testimonial.condition}
                  date={testimonial.date}
                  rating={testimonial.rating}
                  text={testimonial.text}
                  emphasis={testimonial.emphasis}
                  source={testimonial.source}
                  className="w-full"
                />
              </div>
            ))}
          </SnapCarousel>
        </div>
      </section>

      <BookingSection
        title="Ready to Feel This Difference for Yourself?"
        description=""
        ctaLabel="Begin Your Care Journey"
      >
        <a
          href="/contact/"
          className="group mt-3 inline-flex items-center gap-1 text-sm font-medium text-cream/70 underline-offset-4 transition-colors duration-300 ease-out hover:text-cream hover:underline sm:mt-3.5"
        >
          Share Your Experience
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
            aria-hidden
          />
        </a>
        <p className="mt-5 flex items-center justify-center gap-1.5 text-base text-cream/60 md:mt-6">
          <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-hidden />
          <span>Trusted by 200+ patients</span>
        </p>
      </BookingSection>
    </div>
  )
}
