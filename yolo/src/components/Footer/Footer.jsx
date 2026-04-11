import { useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeNewsletter } from '../../services/api'
import './Footer.css'

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <rect x="2" y="2" width="20" height="20" rx="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
  </svg>
)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)

export default function Footer() {
  const [nlEmail, setNlEmail] = useState('')
  const [nlStatus, setNlStatus] = useState('idle') // idle | loading | success | error

  const handleNewsletter = async (e) => {
    e.preventDefault()
    if (!nlEmail) return
    setNlStatus('loading')
    try {
      await subscribeNewsletter(nlEmail)
      setNlStatus('success')
      setNlEmail('')
    } catch {
      setNlStatus('error')
    }
  }

  return (
    <footer className="yolo-footer">
      {/* Big logo bar */}
      <div className="yolo-footer__logo-bar">
        <span className="yolo-footer__big-logo">YOLO</span>
      </div>

      <div className="container">
        <div className="yolo-footer__grid">
          <div className="yolo-footer__brand">
            <p className="yolo-footer__tagline">Wear Bold. Live Free.</p>
            <p className="yolo-footer__about">
              Premium streetwear tees crafted for those who don't follow trends — they set them.
            </p>
            <div className="yolo-footer__socials">
              <a href="https://www.instagram.com/explore/locations/101759574984680/yolo-fashion-factory/" className="yolo-footer__social" aria-label="Instagram" target="_blank"><InstagramIcon /></a>
              <a href="https://x.com/yolo_factory" className="yolo-footer__social" aria-label="Twitter" target='_blank'><TwitterIcon /></a>
              <a href="#" className="yolo-footer__social" aria-label="YouTube"><YoutubeIcon /></a>
            </div>
          </div>

          <div>
            <div className="yolo-footer__heading">Shop</div>
            <div className="yolo-footer__links">
              <Link to="/products?category=graphic-tees" className="yolo-footer__link">Graphic Tees</Link>
              <Link to="/products?category=oversized" className="yolo-footer__link">Oversized</Link>
              <Link to="/products?category=limited-drops" className="yolo-footer__link">Limited Drops</Link>
              <Link to="/products?category=hoodies" className="yolo-footer__link">Hoodies</Link>
              <Link to="/products" className="yolo-footer__link">All Products</Link>
            </div>
          </div>

          <div>
            <div className="yolo-footer__heading">Offers</div>
            <div className="yolo-footer__links">
              <Link to="/offers?type=best-seller" className="yolo-footer__link">Best Sellers</Link>
              <Link to="/offers?type=buy-1-get-1" className="yolo-footer__link">Buy 1 Get 1</Link>
            </div>
          </div>

          <div>
            <div className="yolo-footer__heading">Help</div>
            <div className="yolo-footer__links">
              <a href="#" className="yolo-footer__link">Size Guide</a>
              <a href="#" className="yolo-footer__link">Shipping Policy</a>
              <a href="#" className="yolo-footer__link">Returns</a>
              <a href="#" className="yolo-footer__link">Track Order</a>
              <Link to="/contact" className="yolo-footer__link">Contact Us</Link>
            </div>
          </div>

          <div>
            <div className="yolo-footer__heading">Stay Ahead</div>
            <p className="yolo-footer__nl-text">Get early drop access and exclusive deals.</p>
            {nlStatus === 'success' ? (
              <p style={{ color: '#4ade80', fontSize: '0.875rem', display:'flex', alignItems:'center', gap:'0.3rem' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>You're in! Check your inbox.</p>
            ) : (
              <form className="yolo-footer__nl-form" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  className="yolo-footer__nl-input"
                  placeholder="your@email.com"
                  value={nlEmail}
                  onChange={e => setNlEmail(e.target.value)}
                  required
                />
                <button className="yolo-footer__nl-btn" disabled={nlStatus === 'loading'}>
                  {nlStatus === 'loading' ? '…' : 'Go'}
                </button>
              </form>
            )}
            {nlStatus === 'error' && (
              <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Something went wrong. Try again.
              </p>
            )}
          </div>
        </div>

        <div className="yolo-footer__bottom">
          <span>© 2026 YOLO. All rights reserved.</span>
          <div className="yolo-footer__certs">
            <span>100% Cotton</span>
            <span>Made in India</span>
            <span>Fast Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
