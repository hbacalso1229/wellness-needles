'use client'

import {
  BeforeAfterSlider,
  HeroSection,
  SectionHeading,
  SnapCarousel,
  TestimonialCard,
  reviewSlideClassName,
  snapSlideWideClassName,
  snapTrackGridLgClassName,
  snapTrackHorizontalClassName,
} from '../../features'
import { BookingCtaButton } from '@/components/BookingCtaButton'
import { useBookingCtaHref } from '@/hooks/useBookingCtaHref'
import { BadgeCheck, Calendar, HeartHandshake, Star } from 'lucide-react'

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

  const resultCases = [
    {
      beforeSrc: '/results/alopecia-before.png',
      afterSrc: '/results/alopecia-after.png',
      beforeRotate: '-42deg',
      afterRotate: '32deg',
      imageFit: 'cover' as const,
      title: 'Hair loss',
      highlight: 'Visible hair regrowth',
      description: 'Observed after tailored acupuncture plan',
      altBefore: 'Scalp before alopecia treatment showing a bald patch',
      altAfter: 'Scalp after alopecia treatment showing hair regrowth',
    },
    {
      beforeSrc: '/results/eczema-before.png',
      afterSrc: '/results/eczema-after.png',
      imageFit: 'contain' as const,
      title: 'Eczema',
      highlight: 'Reduced redness and inflammation',
      description: 'Clinically guided treatment results',
      altBefore:
        'Back and legs before eczema treatment showing widespread redness and inflammation',
      altAfter:
        'Back and legs after eczema treatment with reduced redness and clearer skin',
    },
    {
      beforeSrc: '/results/sperm-concentration-before.png',
      afterSrc: '/results/sperm-concentration-after.png',
      imageFit: 'contain' as const,
      title: 'Sperm concentration',
      highlight: 'Normalized sperm count',
      description: 'Increased from 3.2 to 27.21 M/ml',
      altBefore:
        'Semen analysis before treatment: sperm concentration 3.2 million per ml, below normal',
      altAfter:
        'Semen analysis after treatment: sperm concentration 27.21 million per ml, within normal range',
    },
  ]

  return (
    <div className="min-h-screen">
      <HeroSection
        title="Patient Testimonials"
        subtitle="Real stories from people who chose acupuncture with Wellness Needles"
        description="Hear from patients in their own words — shared with consent — about how treatment supported their health and wellbeing."
        backgroundImage="/testimonials_patient_treatment.jpeg"
        backgroundImageClassName="object-cover object-center"
        backgroundOverlayClassName="bg-gradient-to-b from-black/50 via-primary/32 to-black/50"
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
      <section className="scroll-mt-24 bg-cream py-10 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="Real Patient Results"
            subtitle="Personalized treatment outcomes — clear before and after comparisons"
            className="mb-6 text-center md:mb-10"
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-1.5 md:mb-3"
          />

          <div className="mb-8 flex flex-col items-center gap-2 text-sm tracking-[0.2px] text-secondary/80 sm:mb-12 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:gap-y-1.5 md:mb-14">
            <p className="inline-flex items-center gap-2.5">
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-secondary/80 sm:h-4 sm:w-4" aria-hidden />
              Licensed &amp; certified practitioner
            </p>
            <span className="hidden text-secondary/40 sm:inline" aria-hidden>
              •
            </span>
            <p className="inline-flex items-center gap-2.5">
              <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-secondary/80 sm:h-4 sm:w-4" aria-hidden />
              Stories &amp; photos shared with consent
            </p>
          </div>

          <SnapCarousel
            slideCount={resultCases.length}
            ariaLabel="Patient results before and after"
            hideDotsFrom="lg"
            showArrows
            showArrowsFrom="until-lg"
            trackClassName={snapTrackGridLgClassName}
          >
            {resultCases.map((result) => (
              <div
                key={result.title}
                className={`group/card ${snapSlideWideClassName} rounded-xl border border-black/5 bg-white p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]`}
              >
                <BeforeAfterSlider
                  beforeSrc={result.beforeSrc}
                  afterSrc={result.afterSrc}
                  beforeRotate={result.beforeRotate}
                  afterRotate={result.afterRotate}
                  imageFit={result.imageFit}
                  aspectClassName="aspect-[4/3]"
                  title={result.title}
                  highlight={result.highlight}
                  description={result.description}
                  altBefore={result.altBefore}
                  altAfter={result.altAfter}
                />
              </div>
            ))}
          </SnapCarousel>

          <p className="mt-10 text-center text-sm tracking-[0.2px] text-secondary/70 md:mt-12">
            Clinically observed results · Individual results may vary
          </p>
        </div>
      </section>

      {/* What patients say */}
      <section className="scroll-mt-24 bg-secondary/5 py-8 md:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <SectionHeading
            title="What patients say"
            subtitle="Honest feedback from people in our care"
            className="mb-6 text-center md:mb-8"
            titleClassName="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-1.5 md:mb-3"
          />

          <div className="mb-8 flex flex-col items-center gap-1 text-center text-sm text-secondary/80 md:mb-10">
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

      {/* CTA band — Book primary, Share subtle text */}
      <section className="bg-cream py-16 pb-24 md:py-24">
        <div className="mx-auto max-w-lg px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-bold leading-snug text-[var(--text-dark)] md:text-3xl">
            Ready to experience results like these?
          </h2>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:gap-3.5">
            <BookingCtaButton
              variant="gold"
              showArrow={false}
              size="large"
              className="w-full max-w-sm !rounded-full !bg-gradient-to-b !from-[#e8c84a] !to-gold text-primary !px-5 !py-3 !text-sm !font-bold whitespace-nowrap shadow-md shadow-primary/25 gap-2 transition-[transform,box-shadow,filter] duration-200 ease-out md:!px-6 md:!py-3.5 md:!text-base motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg motion-safe:hover:shadow-gold/40 motion-safe:hover:brightness-105 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.97] hover:!from-[#f0d45c] hover:!to-[#c9a52f]"
            >
              <Calendar className="h-4 w-4 shrink-0 text-primary md:h-5 md:w-5" aria-hidden />
              <span className="whitespace-nowrap">Book your appointment</span>
            </BookingCtaButton>
            <a
              href="/contact/"
              className="text-sm font-medium text-primary/65 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              Share your story
            </a>
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-[var(--text-dark)]/60 md:mt-8">
            <Star className="h-3.5 w-3.5 shrink-0 fill-gold text-gold" aria-hidden />
            <span>Trusted by 200+ patients</span>
          </p>
        </div>
      </section>
    </div>
  )
}
