import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useUserAuth } from '../context/UserAuthContext'
import { useWishlist } from '../context/WishlistContext'
import { getComboOffers, getComboOffer, getComboReviews, submitComboReview } from '../services/api'
import { revealElement, unrevealElement } from '../hooks/useScrollReveal'
import { XIcon, CheckIcon } from '../components/Icons/Icons'
import '../components/ProductCard/ProductCard.css'
import './ProductDetails.css'
import './ComboOffers.css'

const StarFull = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
)

const StarInteractive = ({ value, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    style={{
      background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
      color: value <= selected ? '#e8ff00' : '#555', fontSize: '1.6rem', lineHeight: 1,
    }}
    aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
  >
    <svg width={22} height={22} viewBox="0 0 24 24" fill={value <= selected ? '#e8ff00' : 'none'} stroke={value <= selected ? '#e8ff00' : '#555'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  </button>
)

const CheckIconSmall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

// Heart icon for wishlist
const HeartIcon = ({ filled }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill={filled ? "#ff4757" : "none"} 
    stroke={filled ? "#ff4757" : "currentColor"} 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export default function ComboOffers() {
  const { comboId } = useParams()
  const navigate = useNavigate()
  const { addComboToCart, shippingSettings } = useCart()
  const { token, isLoggedIn } = useUserAuth()
  const { toggleWishlist, isWishlisted } = useWishlist()

  const [combos, setCombos] = useState([])
  const [selectedCombo, setSelectedCombo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)

  // Selections: array of { color, size } for each pick
  const [selections, setSelections] = useState([])
  const [added, setAdded] = useState(false)
  
  // Tabs and Size Guide (matching ProductDetails)
  const [activeTab, setActiveTab] = useState('description')
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  
  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const headerRef = useRef(null)
  const cardRefs = useRef([])

  // Handle wishlist toggle for combo
  const handleWishlist = (e, combo) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id: combo.id,
      name: combo.name,
      image: combo.image_urls?.[0] || '',
      price: combo.original_price,
      discountPrice: combo.combo_price,
      badge: combo.badge_text || 'COMBO',
      pick_count: combo.pick_count
    }, 'combo')
  }

  useEffect(() => {
    async function loadCombos() {
      setLoading(true)
      setError('')
      setReviews([])
      try {
        if (comboId) {
          const combo = await getComboOffer(comboId)
          if (combo) {
            setSelectedCombo(combo)
            setCombos([combo])
            initializeSelections(combo)
            // Load reviews for this combo
            getComboReviews(comboId).then(setReviews).catch(() => setReviews([]))
          } else {
            setError('Combo offer not found.')
          }
        } else {
          const data = await getComboOffers()
          setCombos(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        console.error('Failed to load combo offers:', err)
        setError(err?.message || 'Failed to load combo offers.')
      } finally {
        setLoading(false)
      }
    }
    loadCombos()
  }, [comboId])

  // Reveal animations
  useEffect(() => {
    const el = headerRef.current
    if (el) revealElement(el)
    return () => { if (el) unrevealElement(el) }
  }, [])

  useEffect(() => {
    if (!combos.length || comboId) return
    const els = cardRefs.current
    els.forEach((el, i) => { if (el) revealElement(el, i * 90) })
    return () => els.forEach(el => { if (el) unrevealElement(el) })
  }, [combos, comboId])

  const initializeSelections = (combo) => {
    if (!combo) return
    
    if (combo.is_couple_offer) {
      // For couple offers: first item is men's, second is women's
      setSelections([
        {
          color: combo.men_colors?.[0] || '',
          size: combo.men_sizes?.[2] || combo.men_sizes?.[0] || '',
        },
        {
          color: combo.women_colors?.[0] || '',
          size: combo.women_sizes?.[2] || combo.women_sizes?.[0] || '',
        }
      ])
    } else {
      // Standard combo
      const initialSelections = Array.from({ length: combo.pick_count }, () => ({
        color: combo.colors?.[0] || '',
        size: combo.sizes?.[2] || combo.sizes?.[0] || '',
      }))
      setSelections(initialSelections)
    }
  }

  const handleSelectCombo = (combo) => {
    setSelectedCombo(combo)
    initializeSelections(combo)
    navigate(`/combo-offers/${combo.id}`)
  }

  const handleSelectionChange = (index, field, value) => {
    setSelections((prev) => {
      const newSelections = [...prev]
      newSelections[index] = { ...newSelections[index], [field]: value }
      return newSelections
    })
  }

  const isComplete = useMemo(() => {
    if (!selectedCombo) return false
    
    if (selectedCombo.is_couple_offer) {
      // Couple offer: need exactly 2 selections (men + women)
      return selections.length === 2 && 
             selections.every((s) => s.color && s.size)
    }
    
    return selections.length === selectedCombo.pick_count && 
           selections.every((s) => s.color && s.size)
  }, [selections, selectedCombo])

  const handleAddToCart = () => {
    if (!isComplete || !selectedCombo) return

    addComboToCart({
      combo_offer_id: selectedCombo.id,
      combo_name: selectedCombo.name,
      combo_price: selectedCombo.combo_price,
      original_price: selectedCombo.original_price,
      badge_text: selectedCombo.badge_text,
      pick_count: selectedCombo.is_couple_offer ? 2 : selectedCombo.pick_count,
      is_couple_offer: selectedCombo.is_couple_offer || false,
      image_url: selectedCombo.image_urls?.[0] || null,
      items: selections.map((sel, idx) => ({
        item_index: idx + 1,
        item_type: selectedCombo.is_couple_offer ? (idx === 0 ? 'men' : 'women') : null,
        selected_color: sel.color,
        selected_size: sel.size,
      })),
    })

    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewRating) { setReviewError('Please select a star rating.'); return }
    if (!reviewText.trim()) { setReviewError('Please write a review.'); return }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      const newReview = await submitComboReview(comboId, { rating: reviewRating, description: reviewText.trim() }, token)
      setReviews(prev => {
        const filtered = prev.filter(r => r.user_id !== newReview.user_id)
        return [newReview, ...filtered]
      })
      setReviewSuccess(true)
      setReviewRating(0)
      setReviewText('')
      setTimeout(() => setReviewSuccess(false), 3000)
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review.')
    } finally {
      setReviewSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <section className="combo-page section">
        <div className="container">
          <div className="combo-page__loading">
            <div className="yolo-spinner" />
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className="combo-page section">
        <div className="container">
          <div className="combo-page__header">
            <div>
              <div className="section-subtitle">Special Deals</div>
              <h2 className="section-title">Combo Offer</h2>
              <div className="divider" />
            </div>
          </div>
          <div className="combo-page__empty">
            <h3>Oops!</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Empty state
  if (combos.length === 0) {
    return (
      <section className="combo-page section">
        <div className="container">
          <div className="combo-page__header">
            <div>
              <div className="section-subtitle">Special Deals</div>
              <h2 className="section-title">Combo Offers</h2>
              <div className="divider" />
            </div>
          </div>
          <div className="combo-page__empty">
            <h3>No Combo Offers</h3>
            <p>Check back later for amazing combo deals!</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Combo List View (no specific combo selected)
  if (!comboId) {
    return (
      <section className="combo-page section">
        <div className="container">
          <div className="combo-page__header">
            <div>
              <div className="section-subtitle">Special Deals</div>
              <h2 className="section-title">Combo Offers</h2>
              <div className="divider" />
            </div>
          </div>

          <div className="combo-page__grid">
            {combos.map((combo, i) => {
              const discount = combo.original_price > combo.combo_price
                ? Math.round((1 - combo.combo_price / combo.original_price) * 100)
                : 0

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
                    <span className={`yolo-card__badge${combo.is_couple_offer ? ' yolo-card__badge--couple' : ''}`}>
                      {combo.badge_text || (combo.is_couple_offer ? 'COUPLE' : 'COMBO')}
                    </span>
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
                        className={`yolo-card__wishlist${isWishlisted(combo.id, 'combo') ? ' active' : ''}`}
                        onClick={(e) => handleWishlist(e, combo)}
                        aria-label={isWishlisted(combo.id, 'combo') ? 'Remove from wishlist' : 'Add to wishlist'}
                      >
                        <HeartIcon filled={isWishlisted(combo.id, 'combo')} />
                      </button>
                    </div>
                    <div className="yolo-card__sub">
                      {combo.is_couple_offer ? 'COUPLE COMBO' : `PICK ANY ${combo.pick_count}`}
                    </div>
                    {!combo.is_couple_offer && combo.colors?.length > 0 && (
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
                    {combo.is_couple_offer && (
                      <div className="yolo-card__colors">
                        {combo.men_colors?.slice(0, 2).map(c => (
                          <span
                            key={`m-${c}`}
                            className="yolo-card__color-dot"
                            style={{ background: c }}
                            title={`Men: ${c}`}
                          />
                        ))}
                        {combo.women_colors?.slice(0, 2).map(c => (
                          <span
                            key={`w-${c}`}
                            className="yolo-card__color-dot"
                            style={{ background: c }}
                            title={`Women: ${c}`}
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
            })}
          </div>
        </div>
      </section>
    )
  }

  // Combo Detail View (single combo selected)
  const combo = selectedCombo
  
  // Safety check - if we have a comboId but no selectedCombo yet, show loading
  if (!combo) {
    return (
      <section className="combo-page section">
        <div className="container">
          <div className="combo-page__loading">
            <div className="yolo-spinner" />
          </div>
        </div>
      </section>
    )
  }
  
  const allImages = combo.image_urls?.length ? combo.image_urls : []
  const hasImages = allImages.length > 0
  const discount = combo.original_price > combo.combo_price
    ? Math.round((1 - combo.combo_price / combo.original_price) * 100)
    : 0

  return (
    <div className="yolo-pd">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="yolo-breadcrumb" style={{ padding: '1.5rem 0 0' }}>
          <Link to="/">Home</Link><span>/</span>
          <Link to="/combo-offers">Combo Offers</Link>
          <span>/</span><span>{combo.name}</span>
        </nav>

        <div className="yolo-pd__main">
          {/* Gallery */}
          <div className="yolo-pd__gallery">
            {hasImages && (
              <div className="yolo-pd__thumbs">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    className={`yolo-pd__thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
            <div className="yolo-pd__main-img">
              {hasImages ? (
                <img src={allImages[activeImg]} alt={combo.name} loading="eager" />
              ) : (
                <div className="yolo-combo__no-img">No Image Available</div>
              )}
              <span className="yolo-pd__badge">{combo.badge_text || `PICK ${combo.pick_count}`}</span>
            </div>
          </div>

          {/* Info */}
          <div className="yolo-pd__info">
            <div className="yolo-pd__category">COMBO OFFER / {combo.badge_text || `PICK ANY ${combo.pick_count}`}</div>
            <h1 className="yolo-pd__name">{combo.name}</h1>

            <div className="yolo-pd__pricing">
              <span className="yolo-pd__price">₹{combo.combo_price}</span>
              {combo.original_price > combo.combo_price && (
                <>
                  <span className="yolo-pd__original">₹{combo.original_price}</span>
                  <span className="yolo-pd__discount">-{discount}%</span>
                </>
              )}
            </div>

            {/* Item Selectors */}
            <div className="yolo-combo__items">
              <div className="yolo-combo__items-title">
                {combo.is_couple_offer 
                  ? 'Select Your Couple Combo' 
                  : `Select Your ${combo.pick_count} Items`}
              </div>

              {combo.is_couple_offer ? (
                <>
                  {/* Men's Shirt Selection */}
                  <div className="yolo-combo__item-box">
                    <div className="yolo-combo__item-header">
                      <span className="yolo-combo__item-num">👔 Men's Shirt</span>
                      {selections[0]?.color && selections[0]?.size && (
                        <span className="yolo-combo__item-selected">
                          <CheckIconSmall /> {selections[0].color} · {selections[0].size}
                        </span>
                      )}
                    </div>

                    {/* Men's Colors */}
                    {combo.men_colors?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Color</div>
                        <div className="yolo-pd__color-row">
                          {combo.men_colors.map((c) => (
                            <button
                              key={c}
                              className={`yolo-pd__color-btn${selections[0]?.color === c ? ' active' : ''}`}
                              style={{ background: c, borderColor: selections[0]?.color === c ? '#e8ff00' : 'transparent' }}
                              onClick={() => handleSelectionChange(0, 'color', c)}
                              aria-label={`Color ${c}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Men's Sizes */}
                    {combo.men_sizes?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Size</div>
                        <div className="yolo-pd__size-row">
                          {combo.men_sizes.map((sz) => (
                            <button
                              key={sz}
                              className={`yolo-pd__size-btn${selections[0]?.size === sz ? ' active' : ''}`}
                              onClick={() => handleSelectionChange(0, 'size', sz)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                        <button className="yolo-pd__size-guide" onClick={() => setShowSizeGuide(true)}>Size Guide →</button>
                      </div>
                    )}
                  </div>

                  {/* Women's Shirt Selection */}
                  <div className="yolo-combo__item-box">
                    <div className="yolo-combo__item-header">
                      <span className="yolo-combo__item-num">👗 Women's Shirt</span>
                      {selections[1]?.color && selections[1]?.size && (
                        <span className="yolo-combo__item-selected">
                          <CheckIconSmall /> {selections[1].color} · {selections[1].size}
                        </span>
                      )}
                    </div>

                    {/* Women's Colors */}
                    {combo.women_colors?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Color</div>
                        <div className="yolo-pd__color-row">
                          {combo.women_colors.map((c) => (
                            <button
                              key={c}
                              className={`yolo-pd__color-btn${selections[1]?.color === c ? ' active' : ''}`}
                              style={{ background: c, borderColor: selections[1]?.color === c ? '#e8ff00' : 'transparent' }}
                              onClick={() => handleSelectionChange(1, 'color', c)}
                              aria-label={`Color ${c}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Women's Sizes */}
                    {combo.women_sizes?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Size</div>
                        <div className="yolo-pd__size-row">
                          {combo.women_sizes.map((sz) => (
                            <button
                              key={sz}
                              className={`yolo-pd__size-btn${selections[1]?.size === sz ? ' active' : ''}`}
                              onClick={() => handleSelectionChange(1, 'size', sz)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                        <button className="yolo-pd__size-guide" onClick={() => setShowSizeGuide(true)}>Size Guide →</button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Standard combo items */
                selections.map((sel, index) => (
                  <div key={index} className="yolo-combo__item-box">
                    <div className="yolo-combo__item-header">
                      <span className="yolo-combo__item-num">Item {index + 1}</span>
                      {sel.color && sel.size && (
                        <span className="yolo-combo__item-selected">
                          <CheckIconSmall /> {sel.color} · {sel.size}
                        </span>
                      )}
                    </div>

                    {/* Colors */}
                    {combo.colors?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Color</div>
                        <div className="yolo-pd__color-row">
                          {combo.colors.map((c) => (
                            <button
                              key={c}
                              className={`yolo-pd__color-btn${sel.color === c ? ' active' : ''}`}
                              style={{ background: c, borderColor: sel.color === c ? '#e8ff00' : 'transparent' }}
                              onClick={() => handleSelectionChange(index, 'color', c)}
                              aria-label={`Color ${c}`}
                              title={c}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {combo.sizes?.length > 0 && (
                      <div className="yolo-pd__option-group">
                        <div className="yolo-pd__option-label">Size</div>
                        <div className="yolo-pd__size-row">
                          {combo.sizes.map((sz) => (
                            <button
                              key={sz}
                              className={`yolo-pd__size-btn${sel.size === sz ? ' active' : ''}`}
                              onClick={() => handleSelectionChange(index, 'size', sz)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                        <button className="yolo-pd__size-guide" onClick={() => setShowSizeGuide(true)}>Size Guide →</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {combo.material && (
              <div className="yolo-pd__material">
                <span>Material:</span> <strong>{combo.material}</strong>
              </div>
            )}
            {combo.fit && (
              <div className="yolo-pd__material">
                <span>Fit:</span> <strong>{combo.fit}</strong>
              </div>
            )}

            {/* Actions */}
            <div className="yolo-pd__actions">
              <button
                className={`btn btn-primary yolo-pd__add${added ? ' added' : ''}`}
                onClick={handleAddToCart}
                disabled={!isComplete}
                style={{ flex: 1 }}
              >
                {added ? (
                  <><CheckIconSmall /> Added to Cart</>
                ) : isComplete ? (
                  'Add Combo to Cart'
                ) : (
                  `Select all ${combo.pick_count} items`
                )}
              </button>
            </div>

            {/* Savings callout */}
            {combo.original_price > combo.combo_price && (
              <div className="yolo-combo__savings-box">
                <span>You save ₹{combo.original_price - combo.combo_price} with this combo!</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - matching ProductDetails */}
        <div className="yolo-pd__tabs">
          {['description', 'material', 'shipping', 'reviews'].map(tab => (
            <button
              key={tab}
              className={`yolo-pd__tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'description' ? 'Description'
                : tab === 'material' ? 'Material & Care'
                : tab === 'shipping' ? 'Shipping & Returns'
                : `Reviews (${reviews.length})`}
            </button>
          ))}
        </div>
        <div className="yolo-pd__tab-content">
          {activeTab === 'description' && (
            <p>{combo.description || 'Get the best value with this combo offer. Pick your favorite colors and sizes from our premium collection.'}</p>
          )}
          {activeTab === 'material' && (
            <p>{combo.material || 'Premium Cotton'} — Machine wash cold. Do not bleach. Tumble dry low.</p>
          )}
          {activeTab === 'shipping' && (
            <p>Free shipping on orders above ₹{shippingSettings?.free_shipping_threshold || 1499}. Delivery in 3–5 business days. 10-day easy returns — no questions asked.</p>
          )}
          {activeTab === 'reviews' && (
            <div className="yolo-pd__reviews">
              {/* Submit review form */}
              {isLoggedIn ? (
                <form className="yolo-pd__review-form" onSubmit={handleSubmitReview}>
                  <h4 className="yolo-pd__review-form-title">Write a Review</h4>
                  <div className="yolo-pd__star-selector">
                    {[1, 2, 3, 4, 5].map(v => (
                      <StarInteractive key={v} value={v} selected={reviewRating} onSelect={setReviewRating} />
                    ))}
                    <span className="yolo-pd__star-label">{reviewRating ? `${reviewRating} star${reviewRating > 1 ? 's' : ''}` : 'Select rating'}</span>
                  </div>
                  <textarea
                    className="yolo-pd__review-textarea"
                    placeholder="Share your experience with this combo…"
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                  {reviewError && <div className="yolo-pd__review-error">{reviewError}</div>}
                  {reviewSuccess && <div className="yolo-pd__review-success"><CheckIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.25rem'}} />Review submitted! Thank you.</div>}
                  <button type="submit" className="btn btn-primary" disabled={reviewSubmitting}>
                    {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="yolo-pd__review-login-prompt">
                  <Link to="/login" className="btn btn-secondary btn-sm">Sign in</Link>
                  <span> to write a review</span>
                </div>
              )}

              {/* Existing reviews */}
              <div className="yolo-pd__review-list">
                {reviews.length === 0 ? (
                  <p className="yolo-pd__review-empty">No reviews yet. Be the first to review this combo!</p>
                ) : reviews.map(r => (
                  <div key={r.id} className="yolo-pd__review-item">
                    <div className="yolo-pd__review-header">
                      <div className="yolo-pd__review-stars">
                        {[1, 2, 3, 4, 5].map(i => (
                          <span key={i} style={{ color: i <= r.rating ? '#e8ff00' : '#333' }}>
                            <StarFull />
                          </span>
                        ))}
                      </div>
                      <span className="yolo-pd__review-author">{r.user_name}</span>
                      <span className="yolo-pd__review-date">
                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="yolo-pd__review-text">{r.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="yolo-pd__sg-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="yolo-pd__sg-modal" onClick={e => e.stopPropagation()}>
            <button className="yolo-pd__sg-close" onClick={() => setShowSizeGuide(false)} aria-label="Close">
              <XIcon width={18} height={18} />
            </button>
            <h3 className="yolo-pd__sg-title">Size Guide</h3>
            <div className="divider" />
            <table className="yolo-pd__sg-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (in)</th>
                  <th>Length (in)</th>
                  <th>Shoulder (in)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>34–36</td><td>26</td><td>16</td></tr>
                <tr><td>S</td><td>36–38</td><td>27</td><td>17</td></tr>
                <tr><td>M</td><td>38–40</td><td>28</td><td>18</td></tr>
                <tr><td>L</td><td>40–42</td><td>29</td><td>19</td></tr>
                <tr><td>XL</td><td>42–44</td><td>30</td><td>20</td></tr>
                <tr><td>XXL</td><td>44–46</td><td>31</td><td>21</td></tr>
              </tbody>
            </table>
            <p className="yolo-pd__sg-note">
              All measurements are in inches. For best fit, measure your chest at the fullest point and refer to the chart above.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
