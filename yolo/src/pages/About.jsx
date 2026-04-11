import { Link } from 'react-router-dom'
import './About.css'

const IconShirt = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
  </svg>
)

const IconPalette = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
)

const IconLeaf = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
)

const IconTruck = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)

const hero = {
  subtitle: 'Our Story',
  titleLine1: 'Wear your vibe,',
  titleLine2: 'own your style.',
  lead: "Yolo Tees was born from a passion for self-expression. We believe a great t-shirt is more than fabric — it's a statement, a mood, and a story you carry with you every day.",
  image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&h=560&fit=crop',
  imageAlt: 'Our t-shirt collection',
}

const mission = {
  subtitle: 'Our Mission',
  title: 'Quality tees that never compromise',
  paragraphs: [
    "We believe every t-shirt should feel as good as it looks. From the softness of the fabric to the sharpness of the print, we obsess over every detail so you don't have to.",
    "Each design is crafted by our in-house artists, printed with premium inks, and stitched with precision. We stand behind every tee we make — because you deserve nothing less.",
  ],
}

const stats = [
  { num: '80K+',  label: 'Happy Customers' },
  { num: '200+',  label: 'Unique Designs'  },
  { num: '100%',  label: 'Premium Cotton'  },
  { num: '5★',    label: 'Avg. Rating'     },
]

const values = [
  { Icon: IconShirt,   title: 'Premium Quality', desc: 'We source only the finest 100% cotton fabrics for lasting comfort and durability.' },
  { Icon: IconPalette, title: 'Bold Designs',     desc: 'Every print is crafted by talented artists to make you stand out from the crowd.'   },
  { Icon: IconLeaf,    title: 'Sustainable',      desc: 'Eco-friendly inks and responsible manufacturing — style without the guilt.'          },
  { Icon: IconTruck,   title: 'Fast Delivery',    desc: 'From our press to your doorstep in no time. Fresh tees, delivered fast.'             },
]

const team = [
  { name: 'Arjun Mehta', role: 'Founder & Creative Director', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
  { name: 'Sneha Patel',  role: 'Head of Design',             image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face' },
  { name: 'Rohan Das',    role: 'Head of Production',         image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop&crop=face' },
]

const cta = {
  titleLine1: 'Ready to find your',
  titleLine2: 'perfect tee?',
  buttonText: 'Shop Our Collection',
  buttonLink: '/products',
}

export default function About() {
  return (
    <div className="about-page">
      {/* Hero */}
      <div className="about-page__hero">
        <div className="container">
          <div className="about-page__hero-inner">
            <div>
              <div className="section-subtitle">{hero.subtitle}</div>
              <h1 className="about-page__title">
                {hero.titleLine1}<br />
                <em>{hero.titleLine2}</em>
              </h1>
              <p className="about-page__lead">{hero.lead}</p>
            </div>
            <div className="about-page__hero-img">
              <img src={hero.image} alt={hero.imageAlt} />
            </div>
          </div>
        </div>
      </div>

      {/* Mission */}
      <section className="about-page__mission section">
        <div className="container">
          <div className="about-page__mission-grid">
            <div>
              <div className="section-subtitle">{mission.subtitle}</div>
              <h2 className="section-title">{mission.title}</h2>
              <div className="divider" />
              {mission.paragraphs.map((p, i) => (
                <p key={i} className="section-description" style={i > 0 ? { marginTop: '1rem' } : {}}>
                  {p}
                </p>
              ))}
            </div>
            <div className="about-page__stats">
              {stats.map(s => (
                <div key={s.label} className="about-stat">
                  <div className="about-stat__num">{s.num}</div>
                  <div className="about-stat__label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-page__values section" style={{ background: '#0a0a0a' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-subtitle" style={{ color: '#c9a84c' }}>What We Stand For</div>
            <h2 className="section-title" style={{ color: '#ffffff' }}>Our Values</h2>
            <div className="divider divider--center" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)', width: '80px', margin: '0.75rem auto 0' }} />
          </div>
          <div className="about-page__values-grid">
            {values.map(({ Icon, title, desc }) => (
              <div key={title} className="about-value">
                <div className="about-value__icon"><Icon /></div>
                <h3 className="about-value__title">{title}</h3>
                <p className="about-value__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-page__team section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="section-subtitle">The People Behind the Brand</div>
            <h2 className="section-title">Meet Our Team</h2>
            <div className="divider divider--center" />
          </div>
          <div className="about-page__team-grid">
            {team.map(person => (
              <div key={person.name} className="team-card">
                <div className="team-card__img">
                  <img src={person.image} alt={person.name} />
                </div>
                <h3 className="team-card__name">{person.name}</h3>
                <div className="team-card__role">{person.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-page__cta section">
        <div className="container">
          <div className="about-page__cta-inner">
            <h2 className="about-page__cta-title">
              {cta.titleLine1}<br />{cta.titleLine2}
            </h2>
            <Link to={cta.buttonLink} className="btn btn-primary btn-lg">
              {cta.buttonText}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
