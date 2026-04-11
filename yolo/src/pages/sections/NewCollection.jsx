import { Link } from 'react-router-dom'
import './NewCollection.css'

export default function NewCollection() {
  return (
    <section className="new-col section">
      <div className="container">
        <div className="new-col__inner">
          <div className="new-col__content">
            <div className="section-subtitle">Just Arrived</div>
            <h2 className="section-title">The Saffron<br />Luxury Line</h2>
            <div className="divider" />
            <p className="section-description">
              Our most prestige collection yet. Pure saffron sourced from the valleys of Kashmir, cold-pressed and blended with rare botanicals for a transformative skincare experience.
            </p>
            <ul className="new-col__features">
              <li>✦ 24-karat saffron extract</li>
              <li>✦ Reduces dark spots by 70% in 4 weeks</li>
              <li>✦ Suitable for all skin types</li>
            </ul>
            <div className="new-col__cta">
              <Link to="/products" className="btn btn-primary btn-lg">Explore Collection</Link>
              <span className="new-col__price-tag">Starting ₹899</span>
            </div>
          </div>

          <div className="new-col__visual">
            <div className="new-col__bg-shape" />
            <div className="new-col__img-wrap">
              <img
                src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=700&fit=crop"
                alt="Saffron Luxury collection"
                loading="lazy"
              />
            </div>
            <div className="new-col__label">
              <div className="new-col__label-text">New Collection</div>
              <div className="new-col__label-sub">Spring / Summer 2025</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
