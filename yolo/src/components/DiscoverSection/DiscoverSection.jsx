import './DiscoverSection.css'

const posts = [
  {
    id: 1,
    tag: 'Skincare Tips',
    date: 'March 2, 2025',
    title: 'The Ayurvedic Morning Ritual for Radiant Skin',
    excerpt: 'Discover how ancient Ayurvedic practices can transform your morning skincare routine into a mindful self-care ritual.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=375&fit=crop',
  },
  {
    id: 2,
    tag: 'Ingredients',
    date: 'Feb 18, 2025',
    title: 'Why We Use Only Wild-Harvested Botanicals',
    excerpt: 'Our commitment to wild-harvested ingredients ensures the highest potency and the least environmental impact.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=375&fit=crop',
  },
  {
    id: 3,
    tag: 'Coming Soon',
    date: 'April 2025',
    title: 'Introducing Our New Sun Care Collection',
    excerpt: 'A complete sun protection range crafted with mineral filters, antioxidants and hydrating botanicals. Coming this summer.',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&h=375&fit=crop',
  },
]

export default function DiscoverSection() {
  return (
    <section className="discover section">
      <div className="container">
        <div className="discover__header">
          <div className="section-subtitle">Stories & Updates</div>
          <h2 className="section-title">Discover & Learn</h2>
          <div className="divider divider--center" />
          <p className="section-description" style={{ margin: '0 auto' }}>
            Skincare wisdom, ingredient stories and what's coming next.
          </p>
        </div>

        <div className="discover__grid">
          {posts.map(post => (
            <article key={post.id} className="discover-card">
              <div className="discover-card__image">
                <img src={post.image} alt={post.title} loading="lazy" />
                <span className="discover-card__tag">{post.tag}</span>
              </div>
              <div className="discover-card__body">
                <div className="discover-card__date">{post.date}</div>
                <h3 className="discover-card__title">{post.title}</h3>
                <p className="discover-card__excerpt">{post.excerpt}</p>
                <a href="#" className="discover-card__link">Read More →</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
