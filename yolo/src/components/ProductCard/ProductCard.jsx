import { useState, memo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { revealElement, unrevealElement } from '../../hooks/useScrollReveal'
import { resolveImg } from '../../services/apiClient'
import './ProductCard.css'

function ProductCard({ product, revealRef, revealDelay }) {
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const internalRef = useRef(null)

  // When no external revealRef is provided, manage the reveal animation internally
  useEffect(() => {
    if (revealRef) return
    const el = internalRef.current
    if (!el) return
    revealElement(el, revealDelay || 0)
    return () => unrevealElement(el)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const wishlisted = isWishlisted(product.id)
  const discount = Math.round((1 - product.discountPrice / product.price) * 100)

  // Merge internal ref with external revealRef callback
  const setRef = (el) => {
    internalRef.current = el
    if (typeof revealRef === 'function') revealRef(el)
  }

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  return (
    <div
      className="yolo-card reveal"
      ref={setRef}
      style={revealDelay ? { transitionDelay: `${revealDelay}ms` } : undefined}
    >
      <Link to={`/products/${product.id}`} className="yolo-card__img-wrap">
        <img
          src={resolveImg(product.image || (product.images && product.images[0]))}
          alt={product.name}
          loading="lazy"
          className="yolo-card__img"
          width="600"
          height="700"
        />
        {product.badge && <span className="yolo-card__badge">{product.badge}</span>}
        <span className="yolo-card__discount">-{discount}%</span>
        <div className="yolo-card__overlay">
          <button
            className={`yolo-card__quick-add${added ? ' added' : ''}`}
            onClick={handleAdd}
          >
            {added ? 'Added ✓' : 'Quick Add'}
          </button>
        </div>
      </Link>

      <div className="yolo-card__body">
        <div className="yolo-card__top">
          <Link to={`/products/${product.id}`} className="yolo-card__name">
            {product.name}
          </Link>
          <button
            className={`yolo-card__wishlist${wishlisted ? ' active' : ''}`}
            onClick={handleWishlist}
            title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg
              viewBox="0 0 24 24"
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="yolo-card__sub">{product.subCategory}</div>
        {product.colors && (
          <div className="yolo-card__colors">
            {product.colors.slice(0, 4).map(c => (
              <span
                key={c}
                className="yolo-card__color-dot"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        )}
        <div className="yolo-card__pricing">
          <span className="yolo-card__price">₹{product.discountPrice}</span>
          <span className="yolo-card__original">₹{product.price}</span>
        </div>
      </div>
    </div>
  )
}

export default memo(ProductCard)

