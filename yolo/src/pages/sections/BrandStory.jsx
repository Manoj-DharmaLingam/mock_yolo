import { Link } from 'react-router-dom'
import './BrandStory.css'

export default function BrandStory() {
  return (
    <section className="brand-story section">
      <div className="container">
        <div className="brand-story__inner">
          <div className="brand-story__visual">
            <div className="brand-story__img-main">
              <img
                src="https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&h=750&fit=crop"
                alt="Natural skincare ingredients"
              />
            </div>
            <div className="brand-story__img-accent">
              <img
                src="https://images.unsplash.com/photo-1608831540955-35094d48694a?w=300&h=300&fit=crop"
                alt="Skincare ritual"
              />
            </div>
            <div className="brand-story__stat">
              <div className="brand-story__stat-num">12+</div>
              <div className="brand-story__stat-label">Years of crafting</div>
            </div>
          </div>

          <div className="brand-story__content">
            <div className="section-subtitle">Our Story</div>
            <h2 className="section-title">Where science meets<br /><em style={{ fontStyle: 'italic', color: 'var(--color-dusty-rose)' }}>ancient wisdom</em></h2>
            <div className="divider" />
            <p className="section-description">
              Born from a grandmother's recipe box and a modern lab, The Blossom Inside bridges the gap between Ayurvedic heritage and contemporary skincare science.
            </p>
            <p className="section-description" style={{ marginTop: '1rem' }}>
              Every ingredient is ethically sourced, every formulation is tested, and every product is made with the belief that the best skincare comes from within nature — and within you.
            </p>

            <div className="brand-story__pillars">
              {['Pure Botanicals', 'Zero Parabens', 'Sustainably Sourced', 'Dermatologist Tested'].map(p => (
                <div key={p} className="brand-story__pillar">
                  <span className="brand-story__pillar-icon">✦</span>
                  {p}
                </div>
              ))}
            </div>

            <Link to="/about" className="btn btn-secondary" style={{ marginTop: '2rem' }}>
              Read Our Full Story
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
