import { useEffect, useRef } from 'react'
import { useCart } from '../../context/CartContext'
import { revealElement, unrevealElement } from '../../hooks/useScrollReveal'
import './TrustFeatures.css'

const ShirtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a1 1 0 001 1h10a1 1 0 001-1V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
  </svg>
)
const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
  </svg>
)
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export default function TrustFeatures() {
  const refs = useRef([])
  const { shippingSettings } = useCart()
  const threshold = shippingSettings?.free_shipping_threshold || 1499

  const features = [
    { Icon: ShirtIcon,   name: 'Premium Cotton',  desc: '200–260 GSM. Pre-shrunk. Soft on first wear.' },
    { Icon: TruckIcon,   name: 'Free Shipping',   desc: `Pan-India free delivery on orders above ₹${threshold}.` },
    { Icon: RefreshIcon, name: 'Easy Returns',    desc: '10-day no-questions-asked returns.' },
    { Icon: LockIcon,    name: 'Secure Checkout', desc: '100% encrypted. All major payment modes.' },
  ]

  useEffect(() => {
    const els = refs.current
    els.forEach((el, i) => { if (el) revealElement(el, i * 100) })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  }, [])

  return (
    <div className="yolo-trust">
      <div className="container">
        <div className="yolo-trust__grid">
          {features.map(({ Icon, name, desc }, i) => (
            <div
              key={name}
              className="yolo-trust__item reveal"
              ref={el => { refs.current[i] = el }}
            >
              <div className="yolo-trust__icon"><Icon /></div>
              <div>
                <div className="yolo-trust__name">{name}</div>
                <div className="yolo-trust__desc">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

