import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProductById, getRelatedProducts, productCategories, getProductReviews, submitReview } from '../services/api'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useUserAuth } from '../context/UserAuthContext'
import ProductCard from '../components/ProductCard/ProductCard'
import './ProductDetails.css'
import { CheckIcon, XIcon } from '../components/Icons/Icons'

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

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct]       = useState(null)
  const [related, setRelated]       = useState([])
  const [activeImg, setActiveImg]   = useState(0)
  const [selectedSize, setSelectedSize]   = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [qty, setQty]       = useState(1)
  const [added, setAdded]   = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  // Reviews state
  const [reviews, setReviews] = useState([])
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const { addToCart, shippingSettings } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { token, isLoggedIn, user } = useUserAuth()

  useEffect(() => {
    setProduct(null)
    setRelated([])
    setAdded(false)
    setQty(1)
    setActiveTab('description')
    setReviews([])
    getProductById(id).then(p => {
      if (!p) return
      setProduct(p)
      setActiveImg(0)
      setSelectedSize(p.sizes?.[2] || p.sizes?.[0] || null)
      setSelectedColor(p.colors?.[0] || null)
      getRelatedProducts(id, p.category).then(setRelated)
    })
    getProductReviews(id).then(setReviews)
  }, [id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewRating) { setReviewError('Please select a star rating.'); return }
    if (!reviewText.trim()) { setReviewError('Please write a review.'); return }
    setReviewSubmitting(true)
    setReviewError('')
    try {
      const newReview = await submitReview(id, { rating: reviewRating, description: reviewText.trim() }, token)
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

  if (!product) return <div className="yolo-pd-loading"><div className="yolo-spinner" /></div>

  const discount = Math.round((1 - product.discountPrice / product.price) * 100)
  const allImages = product.images?.length ? product.images : [product.image]
  const catLabel = productCategories.find(c => c.key === product.category)?.label || product.category
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = () => {
    addToCart(product, { qty, size: selectedSize, color: selectedColor })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleWishlist = () => toggleWishlist(product)

  return (
    <div className="yolo-pd">
      <div className="container">
        <nav className="yolo-breadcrumb" style={{ padding: '1.5rem 0 0' }}>
          <Link to="/">Home</Link><span>/</span>
          <Link to={`/products?category=${product.category}`}>{catLabel}</Link>
          <span>/</span><span>{product.name}</span>
        </nav>

        <div className="yolo-pd__main">
          {/* Gallery */}
          <div className="yolo-pd__gallery">
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
            <div className="yolo-pd__main-img">
              <img src={allImages[activeImg]} alt={product.name} loading="eager" />
              {product.badge && <span className="yolo-pd__badge">{product.badge}</span>}
            </div>
          </div>

          {/* Info */}
          <div className="yolo-pd__info">
            <div className="yolo-pd__category">{catLabel} / {product.subCategory}</div>
            <h1 className="yolo-pd__name">{product.name}</h1>

            <div className="yolo-pd__meta">
              <div className="yolo-pd__stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <span key={i} style={{ color: i <= Math.round(product.rating) ? '#e8ff00' : '#333' }}>
                    <StarFull />
                  </span>
                ))}
              </div>
              <span className="yolo-pd__rating">{product.rating}</span>
              <span className="yolo-pd__reviews">({product.reviews} reviews)</span>
            </div>

            <div className="yolo-pd__pricing">
              <span className="yolo-pd__price">₹{product.discountPrice}</span>
              <span className="yolo-pd__original">₹{product.price}</span>
              <span className="yolo-pd__discount">-{discount}%</span>
            </div>

            {/* Always show regular size/color selectors */}
            <>
              {/* Colors */}
              {product.colors && (
                <div className="yolo-pd__option-group">
                  <div className="yolo-pd__option-label">Color</div>
                  <div className="yolo-pd__color-row">
                    {product.colors.map(c => (
                      <button
                        key={c}
                        className={`yolo-pd__color-btn${selectedColor === c ? ' active' : ''}`}
                        style={{ background: c, borderColor: selectedColor === c ? '#e8ff00' : 'transparent' }}
                        onClick={() => setSelectedColor(c)}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product.sizes && (
                <div className="yolo-pd__option-group">
                  <div className="yolo-pd__option-label">Size</div>
                  <div className="yolo-pd__size-row">
                    {product.sizes.map(sz => (
                      <button
                        key={sz}
                        className={`yolo-pd__size-btn${selectedSize === sz ? ' active' : ''}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                  <button className="yolo-pd__size-guide" onClick={() => setShowSizeGuide(true)}>Size Guide →</button>
                </div>
              )}
            </>

            <div className="yolo-pd__material">
              <span>Material:</span> <strong>{product.material}</strong>
            </div>
            <div className="yolo-pd__material">
              <span>Fit:</span> <strong>{product.fit}</strong>
            </div>

            <div className="yolo-pd__actions">
              {/* Show quantity selector for all products */}
              <div className="yolo-pd__qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>+</button>
              </div>
              <button
                className={`btn btn-primary yolo-pd__add${added ? ' added' : ''}`}
                onClick={handleAddToCart}
              >
                {added ? <><CheckIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.25rem'}} />Added</> : 'Add to Cart'}
              </button>
              <button
                className={`btn btn-secondary yolo-pd__wishlist-btn${wishlisted ? ' active' : ''}`}
                onClick={handleWishlist}
                title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlisted ? '♥' : '♡'}
              </button>
            </div>

            <div className="yolo-pd__tags">
              {product.tags?.map(t => <span key={t} className="yolo-pd__tag">{t}</span>)}
            </div>
          </div>
        </div>

        {/* Tabs */}
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
          {activeTab === 'description' && <p>{product.description}</p>}
          {activeTab === 'material' && <p>{product.material} — Machine wash cold. Do not bleach. Tumble dry low.</p>}
          {activeTab === 'shipping' && <p>Free shipping on orders above ₹{shippingSettings?.free_shipping_threshold || 1499}. Delivery in 3–5 business days. 10-day easy returns — no questions asked.</p>}
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
                    placeholder="Share your experience with this product…"
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
                  <p className="yolo-pd__review-empty">No reviews yet. Be the first to review this product!</p>
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

        {/* Related */}
        {related.length > 0 && (
          <div className="yolo-pd__related">
            <div className="section-subtitle">More like this</div>
            <h2 className="yolo-pd__related-title">YOU MIGHT ALSO LIKE</h2>
            <div className="divider" />
            <div className="yolo-pd__related-grid">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div className="yolo-pd__sg-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="yolo-pd__sg-modal" onClick={e => e.stopPropagation()}>
            <button className="yolo-pd__sg-close" onClick={() => setShowSizeGuide(false)} aria-label="Close"><XIcon width={18} height={18} /></button>
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

