/** Seeded Google reviews — already approved. Newest first. */

export type DefaultReview = {
  id: string
  name: string
  condition: string
  reviewedAt: string
  rating: number
  source: string
  emphasis: string
  excerpt: string
  body: string
}

export const DEFAULT_REVIEWS: DefaultReview[] = [
  {
    id: 'rev-luiza-barbi',
    name: 'Luiza Barbi',
    condition: 'Pain relief',
    reviewedAt: '2026-08-10',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'for the first time in weeks, pain-free',
    excerpt: 'for the first time in weeks, pain-free',
    body: 'I had a wonderful experience with Arkinth. I went for acupuncture after being in pain for about a month, and I was genuinely amazed by how much better I felt after my first session. I left feeling great and, for the first time in weeks, pain-free! Arkinth was very professional, attentive and welcoming. He took the time to listen and made me feel comfortable throughout the whole treatment. I\'m really happy with my experience and already looking forward to my next session. I would definitely recommend him!',
  },
  {
    id: 'rev-maria-bray',
    name: 'Maria Bray',
    condition: 'Gastritis & energy',
    reviewedAt: '2026-08-04',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'from daily pain and discomfort with gastritis to no symptoms at all',
    excerpt: 'from daily pain and discomfort with gastritis to no symptoms at all',
    body: 'Going to Arkinth for acupuncture has made a huge impact on my health, going from daily pain and discomfort with gastritis to no symptoms at all and an increase in energy levels and an overall feeling of being less stressed and a calmness in myself. Arkinth is excellent, very knowledgeable and has such kindness and understanding. I cannot recommend him enough, if your looking to try acupuncture or wanting to improve your health this is the place to go.',
  },
  {
    id: 'rev-aidan-murphy',
    name: 'Aidan Murphy',
    condition: 'Sleep & energy',
    reviewedAt: '2026-07-31',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'sleeping better and noticeably more energy',
    excerpt: 'sleeping better and noticeably more energy',
    body: "I have been to wellness needles twice and already I've seen the benefits of diet and lifestyle changes that were recommended - sleeping better and noticeably more energy...highly recommended..",
  },
  {
    id: 'rev-christine-tuohy',
    name: 'Christine Tuohy',
    condition: 'Energy & wellbeing',
    reviewedAt: '2026-07-28',
    rating: 5,
    source: 'Verified Google review',
    emphasis: "I honestly couldn't recommend him highly enough",
    excerpt: "I honestly couldn't recommend him highly enough",
    body: "I've had 6 treatments with Arkinth at Wellness Needles over the past few months, and I honestly couldn't recommend him highly enough. From my very first appointment, he made me feel completely at ease. He took the time to listen, understand my needs, and tailor each treatment to support me. Every session has been a calm and relaxing experience. I've noticed a real improvement in my energy levels, and I always leave feeling refreshed, balanced, and well cared for. His professionalism, knowledge, and genuine kindness really stand out, and the clinic has such a welcoming and peaceful atmosphere. If you're considering acupuncture, I would highly recommend Arkinth at Wellness Needles. It has been such a positive experience for me, and I'm very grateful for the care, support, and expertise he has provided over the past few months.",
  },
  {
    id: 'rev-pavlo-nikulin',
    name: 'Pavlo Nikulin',
    condition: 'Lower back pain',
    reviewedAt: '2026-07-22',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'it took only 2 sessions for Arkinth to deal with it',
    excerpt: 'it took only 2 sessions for Arkinth to deal with it',
    body: "I've had a very bad lower back pain and it took only 2 sessions for Arkinth to deal with it. I canot recommend him enough. Considering attitude, knowledge and willingness to help - absolutely amazing!",
  },
  {
    id: 'rev-claire-maguire',
    name: 'Claire Maguire',
    condition: 'Digestive symptoms & aches',
    reviewedAt: '2026-07-18',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'Within one session I noticed symptoms affecting my tummy going away',
    excerpt: 'Within one session I noticed symptoms affecting my tummy going away',
    body: 'Within one session I noticed symptoms affecting my tummy going away. Other aches and pains (thinking it was peri menopause) have disappeared completely. It took 5-6 sessions and I can only say it was a miracle. Arkinth says its simple. Open the meridians and the body heals itself. So after 12 long years of doing acupuncture, energy healing, yoga, meditation and not shifting the discomfort in the body, I find Arkinth and he knows exactly what to do. It was like he had the key to open the door and the energy flows to the exact places where I needed to heal. The body has intelligence far beyond our understanding. My GP is officially deleted from my phone and I am taking my entire family to see Arkinth for up keep.',
  },
  {
    id: 'rev-jen-bren',
    name: 'Jen Bren',
    condition: 'Healing & wellbeing',
    reviewedAt: '2026-05-16',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'it was on another level',
    excerpt: 'it was on another level',
    body: 'I have had acupuncture many times before and found it good. HOWEVER I had a treatment with Arkinth and it was on another level. Arkinth is genuinely interested in helping you heal, it was an excellent treatment and extremely relaxing. I would recommend this treatment to anyone that is interested in healing the body and improving their quality of life. Thank you so much. Jen :)',
  },
  {
    id: 'rev-sue-hopkins',
    name: 'Sue Hopkins',
    condition: 'First session experience',
    reviewedAt: '2026-04-19',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'I found Arkinth exceptional',
    excerpt: 'I found Arkinth exceptional',
    body: 'Had my first session with Arkinth yesterday and i was so impressed; he is a such a highly skilled therapist; so genuine; with extensive knowledege and understanding you just know he really cares about his clients and there well being. I have went to a few different acupunturists over the years and I found Arkinth exceptional; his service is so unique and specialised I would highly reccommend his service',
  },
  {
    id: 'rev-andrew-murphy',
    name: 'Andrew Murphy',
    condition: 'Shoulder pain, anxiety & depression',
    reviewedAt: '2023-12-30',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'I am now pain free thanks to Arkinth',
    excerpt: 'I am now pain free thanks to Arkinth',
    body: 'I have seen Arkinth for various issues. I had a reoccurring shoulder pain which was troubling me for years. After a few sessions with Arkinth the pain was almost gone. It allowed me to do the exercises suggested by the physio without having to take pain killers. I still regularly attend physio for the problem but I am now pain free thanks to Arkinth. I have also seen Arkinth for anxiety and depression. Getting through this involved life style changes as well as diet changes. Arkinth helped me with both. Very professional and passionate about helping people.',
  },
  {
    id: 'rev-francisca-pereira',
    name: 'Francisca Pereira',
    condition: 'Fertility & anxiety',
    reviewedAt: '2023-11-23',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'I found the treatment very effective and relaxing',
    excerpt: 'I found the treatment very effective and relaxing',
    body: 'I would like to highly recommend Wellness Needles Clinic. I got acupuncture to help with fertility and anxiety. I found the treatment very effective and relaxing. Arkinth is very personable and professional.',
  },
  {
    id: 'rev-viera',
    name: 'Viera',
    condition: 'Anxiety, sleep & energy',
    reviewedAt: '2023-11-04',
    rating: 5,
    source: 'Verified Google review',
    emphasis: 'I am blooming, that I look more "alive"',
    excerpt: 'I am blooming, that I look more "alive"',
    body: 'I was suffering from anxiety for a long time. I was feeling dizzy, tired, had constant ringing in my ears, couldn\'t sleep in the night. The new symptoms were gradually adding up and worsening over the years. I was desperate and didn\'t know what to do. Then my friend recommended me to try acupuncture. I contacted Arkinth. We had a conversation about my medical history and my current symptoms. He was very kind and I felt open to him. After only a few treatments I started to feel more energetic. Gradually I became a happier person and my symptoms were improving. Even my friends have noticed my changes. They were saying I am blooming, that I look more "alive".',
  },
]
