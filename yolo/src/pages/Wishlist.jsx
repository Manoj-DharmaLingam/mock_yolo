import { Link } from 'react-router-dom'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import ProductCard from '../components/ProductCard/ProductCard'
import './Wishlist.css'

// Heart icon for combo cards
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

// Combo card component for wishlist
function ComboCard({ combo, onRemove }) {
  const discount = combo.price > combo.discountPrice
    ? Math.round((1 - combo.discountPrice / combo.price) * 100)
    : 0

  return (
    <div className="yolo-card">
      <Link to={`/combo-offers/${combo.id}`} className="yolo-card__img-wrap">
        {combo.image ? (
          <img
            src={combo.image}
            alt={combo.name}
            loading="lazy"
            className="yolo-card__img"
          />
        ) : (
          <div className="yolo-card__placeholder">
            <span className="yolo-card__placeholder-text">No Image</span>
          </div>
        )}
        <span className="yolo-card__badge">{combo.badge || 'COMBO'}</span>
        {discount > 0 && <span className="yolo-card__discount">-{discount}%</span>}
        <div className="yolo-card__overlay">
          <span className="yolo-card__quick-add">View Combo</span>
        </div>
      </Link>

      <div className="yolo-card__body">
        <div className="yolo-card__top">
          <Link to={`/combo-offers/${combo.id}`} className="yolo-card__name">
            {combo.name}
          </Link>
          <button 
            className="yolo-card__wishlist active"
            onClick={() => onRemove(combo.id, 'combo')}
            aria-label="Remove from wishlist"
          >
            <HeartIcon filled={true} />
          </button>
        </div>
        {combo.pick_count && (
          <div className="yolo-card__sub">PICK ANY {combo.pick_count}</div>
        )}
        <div className="yolo-card__pricing">
          <span className="yolo-card__price">₹{combo.discountPrice || combo.price}</span>
          {combo.price > combo.discountPrice && (
            <span className="yolo-card__original">₹{combo.price}</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Wishlist() {
  const { items, products, combos, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-page__header">
          <div className="section-subtitle">Saved Items</div>
          <h1 className="wishlist-page__title">My Wishlist</h1>
          <div className="divider" />
          <p className="wishlist-page__count">{items.length} item{items.length !== 1 ? 's' : ''} saved</p>
          {items.length > 0 && (
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.5rem' }}
              onClick={clearWishlist}
            >
              Clear All
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="wishlist-page__empty">
            <div>💝</div>
            <h3>Your wishlist is empty</h3>
            <p>Save your favourite products to come back later.</p>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <>
            {/* Products section */}
            {products.length > 0 && (
              <div className="wishlist-page__section">
                {combos.length > 0 && <h2 className="wishlist-page__section-title">Products</h2>}
                <div className="wishlist-page__grid">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            )}

            {/* Combos section */}
            {combos.length > 0 && (
              <div className="wishlist-page__section">
                {products.length > 0 && <h2 className="wishlist-page__section-title">Combo Offers</h2>}
                <div className="wishlist-page__grid">
                  {combos.map(c => (
                    <ComboCard key={c.id} combo={c} onRemove={removeFromWishlist} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

