import { Calendar, User, Leaf, Heart, Brain } from 'lucide-react'
import { BookingCtaButton } from '@/components/BookingCtaButton'

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
      <section className="py-20 bg-earth text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6">
              Wellness Blog
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Insights, tips, and wisdom for your health and wellness journey
            </p>
            <p className="text-lg opacity-80">
              Stay informed about Traditional Chinese Medicine, acupuncture research, 
              seasonal wellness tips, and holistic health practices.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-primary mb-4">
              Featured Article
            </h2>
          </div>
          
          {blogPosts.filter(post => post.featured).map(post => (
            <div key={post.id} className="bg-accent/5 rounded-lg overflow-hidden shadow-sm">
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
                  <h3 className="font-serif text-2xl lg:text-3xl font-bold text-primary mb-4">
                    {post.title}
                  </h3>
                  <p className="text-secondary mb-6">
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
      <section className="py-12 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  index === 0
                    ? 'bg-primary text-cream'
                    : 'bg-cream text-primary border border-accent/20 hover:bg-accent/10'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold text-primary mb-4">
              Latest Articles
            </h2>
            <p className="text-lg text-secondary">
              Discover insights and wisdom for your wellness journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.filter(post => !post.featured).map(post => (
              <article key={post.id} className="bg-accent/5 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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
                  
                  <h3 className="font-serif text-xl font-semibold text-primary mb-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-secondary text-sm mb-4 line-clamp-3">
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
      <section className="py-20 bg-secondary text-cream">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-6">
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
                className="flex-1 px-4 py-3 rounded-full text-primary bg-cream focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button className="bg-gold text-primary px-6 py-3 rounded-full font-semibold hover:bg-gold/90 transition-colors duration-200">
                Subscribe
              </button>
            </div>
            <p className="text-sm opacity-70 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-cream">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-4xl font-bold mb-6">
            Ready to Begin Your Wellness Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Put these insights into practice with personalized acupuncture treatments
          </p>
          <BookingCtaButton variant="gold">
            Schedule Your Consultation
          </BookingCtaButton>
        </div>
      </section>
    </div>
  )
}
