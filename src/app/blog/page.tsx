import { Calendar, User, Leaf, Heart, Brain } from 'lucide-react'
import { HeroSection } from '../../features'
import { BookingSection } from '../../features/home/BookingSection'

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "The Science Behind Acupuncture: What Modern Research Tells Us",
      excerpt: "Explore the latest scientific studies that validate the effectiveness of acupuncture for pain management, stress relief, and overall wellness.",
      author: "Arkinth Garcia",
      date: "March 15, 2025",
      category: "Research",
      readTime: "8 min read",
      image: "research",
      featured: true
    },
    {
      id: 2,
      title: "Seasonal Wellness: Preparing Your Body for Spring with TCM",
      excerpt: "Learn how Traditional Chinese Medicine principles can help you transition smoothly into spring with energy, vitality, and balanced health.",
      author: "Arkinth Garcia",
      date: "March 10, 2025",
      category: "Seasonal Health",
      readTime: "6 min read",
      image: "spring"
    },
    {
      id: 3,
      title: "Understanding Qi: The Foundation of Chinese Medicine",
      excerpt: "Discover what Qi really means in Traditional Chinese Medicine and how understanding this concept can transform your approach to health.",
      author: "Arkinth Garcia",
      date: "March 5, 2025",
      category: "TCM Basics",
      readTime: "7 min read",
      image: "qi"
    },
    {
      id: 4,
      title: "Acupuncture for Mental Health: A Natural Approach to Wellness",
      excerpt: "Explore how acupuncture can support mental health by reducing anxiety, improving mood, and promoting emotional balance naturally.",
      author: "Arkinth Garcia",
      date: "February 28, 2025",
      category: "Mental Health",
      readTime: "9 min read",
      image: "mental"
    },
    {
      id: 5,
      title: "My Journey with Alopecia: How Acupuncture Changed My Life",
      excerpt: "A personal account of overcoming alopecia through acupuncture and how this experience inspired a career in naturopathic medicine.",
      author: "Arkinth Garcia",
      date: "February 22, 2025",
      category: "Personal Story",
      readTime: "5 min read",
      image: "nutrition"
    },
    {
      id: 6,
      title: "Managing Chronic Pain Naturally with Acupuncture",
      excerpt: "Discover how acupuncture offers a safe, effective alternative for managing chronic pain without the side effects of medications.",
      author: "Arkinth Garcia",
      date: "February 18, 2025",
      category: "Pain Management",
      readTime: "8 min read",
      image: "pain"
    }
  ]

  const categories = [
    "All Posts",
    "Research",
    "TCM Basics",
    "Seasonal Health",
    "Mental Health",
    "Personal Story",
    "Pain Management"
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="Wellness Blog"
        subtitle="Insights, tips, and wisdom for your health and wellness journey"
        description="Stay informed about Traditional Chinese Medicine, acupuncture research, seasonal wellness tips, and holistic health practices."
        backgroundClass="bg-earth"
        textColor="text-cream"
        showFloatingLeaves={false}
        hideOnMobile={false}
      />

      {/* Featured Post */}
      <section className="py-8 md:py-10 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-3xl font-bold text-[var(--text-dark)] mb-3 md:mb-4">
              Featured Article
            </h2>
          </div>
          
          {blogPosts.filter(post => post.featured).map(post => (
            <div key={post.id} className="overflow-hidden rounded-lg border border-accent/15 bg-white shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-primary/20 aspect-video lg:aspect-auto flex items-center justify-center">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-primary mx-auto mb-4" />
                    <p className="text-primary font-medium">Featured Image</p>
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  <div className="mb-4">
                    <span className="bg-primary text-cream px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-[var(--text-dark)] lg:text-3xl">
                    {post.title}
                  </h3>
                  <p className="mb-6 text-base leading-relaxed text-[var(--text-dark)]/70">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-secondary">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {post.date}
                      </div>
                    </div>
                    <span className="text-secondary text-sm font-medium">
                      Full article coming soon
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  index === 0
                    ? 'bg-primary text-cream'
                    : 'bg-white text-primary border border-accent/20 hover:bg-accent/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-8 md:py-10 lg:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center md:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-dark)] mb-3 md:mb-4">
              Latest Articles
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-[var(--text-dark)]/70 max-w-3xl mx-auto leading-relaxed">
              Discover insights and wisdom for your wellness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map(post => (
              <article key={post.id} className="card-emboss overflow-hidden rounded-lg border border-accent/15 bg-white shadow-sm">
                <div className="bg-primary/20 aspect-video flex items-center justify-center">
                  <div className="text-center">
                    {post.image === 'spring' && <Leaf className="w-12 h-12 text-primary mx-auto mb-2" />}
                    {post.image === 'qi' && <Heart className="w-12 h-12 text-primary mx-auto mb-2" />}
                    {post.image === 'mental' && <Brain className="w-12 h-12 text-primary mx-auto mb-2" />}
                    {post.image === 'nutrition' && <Leaf className="w-12 h-12 text-primary mx-auto mb-2" />}
                    {post.image === 'pain' && <Heart className="w-12 h-12 text-primary mx-auto mb-2" />}
                    <p className="text-primary text-sm">Article Image</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-3">
                    <span className="bg-accent text-cream px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h3 className="mb-3 text-xl font-semibold text-[var(--text-dark)]">
                    {post.title}
                  </h3>
                  
                  <p className="mb-4 line-clamp-3 text-base leading-relaxed text-[var(--text-dark)]/70">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {post.date}
                      </div>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-accent/20">
                    <span className="text-secondary text-sm font-medium">
                      Full article coming soon
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-8 md:py-10 lg:py-12 bg-secondary text-cream">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6">
            Stay Connected with Wellness
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to our newsletter for the latest articles, wellness tips, and exclusive insights
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-full text-primary bg-white focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button className="rounded-full bg-primary px-6 py-3 font-semibold text-cream transition-colors duration-200 hover:bg-secondary">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-70 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      <BookingSection
        title="Ready to Begin Your Wellness Journey?"
        description="Put these insights into practice with personalized acupuncture treatments"
        ctaLabel="Schedule your consultation"
      />
    </div>
  )
}
