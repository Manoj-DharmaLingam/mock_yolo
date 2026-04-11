import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getComboOffers } from '../../services/api'
import { useWishlist } from '../../context/WishlistContext'
import { revealElement, unrevealElement } from '../../hooks/useScrollReveal'
import './ComboOffersSection.css'

export default function ComboOffersSection() {
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const cardRefs = useRef([])
  const { toggleWishlist, isWishlisted } = useWishlist()

  useEffect(() => {
    getComboOffers()
      .then(data => setCombos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Failed to load combo offers:', err)
        setCombos([])
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!combos.length) return
    const els = cardRefs.current
    els.forEach((el, i) => { if (el) revealElement(el, i * 90) })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  }, [combos])

  const handleWishlist = (e, combo) => {
    e.preventDefault()
    e.stopPropagation()
    // Create a wishlist-friendly combo object
    const comboItem = {
      id: combo.id,
      name: combo.name,
      image: combo.image_urls?.[0] || '',
      price: combo.original_price,
      discountPrice: combo.combo_price,
      badge: combo.badge_text || 'COMBO',
      pick_count: combo.pick_count,
    }
    toggleWishlist(comboItem, 'combo')
  }

  if (loading) return null
  if (combos.length === 0) return null

  return (
    <section className="combo-section section">
      <div className="container">
        <div className="combo-section__header">
          <div>
            <div className="section-subtitle">Special Deals</div>
            <h2 className="section-title">Combo Offers</h2>
            <div className="divider" />
          </div>
          <Link to="/combo-offers" className="btn btn-secondary btn-sm">
            View All
          </Link>
        </div>

        <div className="combo-section__grid">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="yolo-card-skeleton" />
              ))
            : combos.slice(0, 4).map((combo, i) => {
                const discount = combo.original_price > combo.combo_price
                  ? Math.round((1 - combo.combo_price / combo.original_price) * 100)
                  : 0
                const wishlisted = isWishlisted(combo.id, 'combo')

                return (
                  <div
                    key={combo.id}
                    className="yolo-card reveal"
                    ref={el => { cardRefs.current[i] = el }}
                  >
                    <Link to={`/combo-offers/${combo.id}`} className="yolo-card__img-wrap">
                      {combo.image_urls?.[0] ? (
                        <img
                          src={combo.image_urls[0]}
                          alt={combo.name}
                          loading="lazy"
                          className="yolo-card__img"
                        />
                      ) : (
                        <div className="yolo-card__placeholder">
                          <span className="yolo-card__placeholder-text">No Image</span>
                        </div>
                      )}
                      <span className="yolo-card__badge">{combo.badge_text || 'COMBO'}</span>
                      {discount > 0 && <span className="yolo-card__discount">-{discount}%</span>}
                      <div className="yolo-card__overlay">
                        <span className="yolo-card__quick-add">Quick Add</span>
                      </div>
                    </Link>

                    <div className="yolo-card__body">
                      <div className="yolo-card__top">
                        <Link to={`/combo-offers/${combo.id}`} className="yolo-card__name">
                          {combo.name}
                        </Link>
                        <button
                          className={`yolo-card__wishlist${wishlisted ? ' active' : ''}`}
                          onClick={(e) => handleWishlist(e, combo)}
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
                      <div className="yolo-card__sub">PICK ANY {combo.pick_count}</div>
                      {combo.colors?.length > 0 && (
                        <div className="yolo-card__colors">
                          {combo.colors.slice(0, 4).map(c => (
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
                        <span className="yolo-card__price">₹{combo.combo_price}</span>
                        {combo.original_price > combo.combo_price && (
                          <span className="yolo-card__original">₹{combo.original_price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>
      </div>
    </section>
  )
}
