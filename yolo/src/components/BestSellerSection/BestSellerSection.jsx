import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBestSellers } from '../../services/api'
import { revealElement, unrevealElement } from '../../hooks/useScrollReveal'
import ProductCard from '../ProductCard/ProductCard'
import './BestSellerSection.css'

export default function BestSellerSection() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const headerRef = useRef(null)
  const cardRefs = useRef([])

  useEffect(() => {
    getBestSellers().then(data => {
      setProducts(data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const el = headerRef.current
    if (el) revealElement(el)
    return () => { if (el) unrevealElement(el) }
  }, [])

  useEffect(() => {
    if (!products.length) return
    const els = cardRefs.current
    els.forEach((el, i) => { if (el) revealElement(el, i * 90) })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  }, [products])

  // Hide section if no best sellers and loading done
  if (!loading && products.length === 0) return null

  return (
    <section className="bs-section section">
      <div className="container">
        <div className="bs-section__header reveal" ref={headerRef}>
          <div>
            <div className="section-subtitle">Fan Favourites</div>
            <h2 className="section-title">Best Sellers</h2>
            <div className="divider" />
          </div>
          <Link to="/products" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>

        <div className="bs-section__grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="yolo-card-skeleton" />
              ))
            : products.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  revealRef={el => { cardRefs.current[i] = el }}
                  revealDelay={0}
                />
              ))
          }
        </div>
      </div>
    </section>
  )
}