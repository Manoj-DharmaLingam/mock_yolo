import { useEffect, useRef, useCallback, useMemo } from 'react'
import ProductCard from '../ProductCard/ProductCard'
import { revealElement, unrevealElement } from '../../hooks/useScrollReveal'
import './ProductGrid.css'

export default function ProductGrid({ products }) {
  const refs = useRef([])

  useEffect(() => {
    const els = refs.current
    els.forEach((el, i) => {
      if (el) revealElement(el, i * 80)
    })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  }, [products])

  // Memoize revealRef callback factory to prevent re-renders
  const createRevealRef = useCallback((i) => (el) => { refs.current[i] = el }, [])

  // Memoize product IDs for stable keys
  const productCards = useMemo(() => {
    if (!products || products.length === 0) return null
    return products.map((p, i) => (
      <ProductCard
        key={p.id}
        product={p}
        revealRef={createRevealRef(i)}
        revealDelay={0}
      />
    ))
  }, [products, createRevealRef])

  if (!productCards) {
    return <div className="pgrid-empty"><p>No products found.</p></div>
  }

  return (
    <div className="pgrid">
      {productCards}
    </div>
  )
}

