import { Link } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { getCategories } from '../../services/api'
import { get, resolveImg } from '../../services/apiClient'
import './HeroSection.css'

const FALLBACK_ITEMS = ['WEAR BOLD', 'LIVE FREE', 'NEW DROP', 'GRAPHIC TEES', 'OVERSIZED', 'LIMITED DROPS']

export default function HeroSection() {
  const [slides, setSlides] = useState([])
  const [slidesLoaded, setSlidesLoaded] = useState(false)
  const [current, setCurrent] = useState(0)
  const [tickerItems, setTickerItems] = useState(FALLBACK_ITEMS)
  const intervalRef = useRef(null)

  // Fetch slides from backend
  useEffect(() => {
    get('/api/hero-slides')
      .then(data => { setSlides(Array.isArray(data) ? data : []); setSlidesLoaded(true) })
      .catch(() => { setSlidesLoaded(true) })
  }, [])

  // Fetch category names for ticker
  useEffect(() => {
    getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          const names = cats.map(c => c.label.toUpperCase())
          setTickerItems(names.length >= 3 ? names : [...names, ...FALLBACK_ITEMS])
        }
      })
      .catch(() => {})
  }, [])

  const activeSlides = slides
  const total = activeSlides.length

  const goNext = useCallback(() => setCurrent(c => (c + 1) % total), [total])
  const goPrev = () => setCurrent(c => (c - 1 + total) % total)

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (total <= 1) return
    intervalRef.current = setInterval(goNext, 5000)
    return () => clearInterval(intervalRef.current)
  }, [total, goNext])

  const pause = () => clearInterval(intervalRef.current)
  const resume = () => {
    if (total <= 1) return
    intervalRef.current = setInterval(goNext, 5000)
  }

  const loopItems = [...tickerItems, ...tickerItems]

  // Show a minimal hero placeholder while loading or if no slides
  if (!slidesLoaded) {
    return (
      <section className="yolo-hero yolo-hero--loading">
        <div className="container yolo-hero__content">
          <div className="yolo-hero__left">
            <span className="yolo-hero__label">New Drop — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <h1 className="yolo-hero__title">WEAR BOLD. LIVE FREE.</h1>
            <div className="yolo-hero__btns">
              <Link to="/products" className="btn btn-accent btn-lg">Shop Now</Link>
              <Link to="/offers?type=best-seller" className="btn btn-ghost btn-lg">Best Sellers</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (total === 0) {
    return (
      <section className="yolo-hero yolo-hero--no-slide">
        <div className="container yolo-hero__content">
          <div className="yolo-hero__left">
            <span className="yolo-hero__label">New Drop — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
            <h1 className="yolo-hero__title">WEAR BOLD. LIVE FREE.</h1>
            <p className="yolo-hero__desc">Premium streetwear. Graphic drops. Built for those who don&apos;t ask for permission.</p>
            <div className="yolo-hero__btns">
              <Link to="/products" className="btn btn-accent btn-lg">Shop Now</Link>
              <Link to="/offers?type=best-seller" className="btn btn-ghost btn-lg">Best Sellers</Link>
            </div>
          </div>
        </div>
        {/* Ticker even without slides */}
        <div className="yolo-hero__ticker" aria-hidden="true">
          <div className="yolo-hero__ticker-track">
            {loopItems.map((item, i) => (
              <span key={i} className="yolo-hero__ticker-item">{item}</span>
            ))}
          </div>
        </div>
      </section>
    )
  }

  const slide = activeSlides[current]

  return (
    <section
      className="yolo-hero"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      {/* Slides */}
      <div className="yolo-hero__slides">
        {activeSlides.map((s, idx) => (
          <div
            key={s.id}
            className={`yolo-hero__slide ${idx === current ? 'yolo-hero__slide--active' : ''}`}
            aria-hidden={idx !== current}
          >
            <div className="yolo-hero__bg">
              <img src={resolveImg(s.image_url)} alt={s.title} loading={idx === 0 ? "eager" : "lazy"} />
              <div className="yolo-hero__overlay" />
            </div>
          </div>
        ))}
      </div>

      {/* Content — tied to current slide */}
      <div className="container yolo-hero__content">
        <div className="yolo-hero__left">
          <span className="yolo-hero__label">New Drop — {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
          <h1 className="yolo-hero__title" key={current}>
            {slide.title.split('\n').map((line, i) => (
              <span key={i}>{line}{i < slide.title.split('\n').length - 1 && <br />}</span>
            ))}
          </h1>
          {slide.subtitle && (
            <p className="yolo-hero__desc" key={`sub-${current}`}>
              {slide.subtitle.split('\n').map((line, i) => (
                <span key={i}>{line}{i < slide.subtitle.split('\n').length - 1 && <br />}</span>
              ))}
            </p>
          )}
          <div className="yolo-hero__btns">
            <Link to={slide.button_link || '/products'} className="btn btn-accent btn-lg">
              {slide.button_text || 'Shop Now'}
            </Link>
            <Link to="/offers?type=best-seller" className="btn btn-ghost btn-lg">Best Sellers</Link>
          </div>
        </div>
      </div>

      {/* Prev / Next arrows — only if multiple slides */}
      {total > 1 && (
        <>
          <button className="yolo-hero__arrow yolo-hero__arrow--prev" onClick={goPrev} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="yolo-hero__arrow yolo-hero__arrow--next" onClick={goNext} aria-label="Next slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="yolo-hero__dots">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              className={`yolo-hero__dot ${idx === current ? 'yolo-hero__dot--active' : ''}`}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Ticker */}
      <div className="yolo-hero__ticker">
        <div className="yolo-hero__ticker-track">
          {loopItems.map((t, i) => (
            <span key={i}>{t} <span className="yolo-ticker-dot">✦</span></span>
          ))}
        </div>
      </div>
    </section>
  )
}
