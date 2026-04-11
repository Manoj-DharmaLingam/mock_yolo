import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { resolveImg } from '../services/apiClient'
import { ShoppingCartIcon, LockIcon, XIcon } from '../components/Icons/Icons'
import './Cart.css'

export default function Cart() {
  const { items, combos, count, subtotal, shipping, total, removeFromCart, setQty, removeComboFromCart, setComboQty, shippingSettings } = useCart()

  const isEmpty = items.length === 0 && combos.length === 0

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-page__header">
          <div className="section-subtitle">Your Selection</div>
          <h1 className="cart-page__title">Shopping Cart</h1>
          <div className="divider" />
        </div>

        {isEmpty ? (
          <div className="cart-page__empty">
            <div className="cart-page__empty-icon"><ShoppingCartIcon width={56} height={56} style={{opacity:0.3}} /></div>
            <h3>Your cart is empty</h3>
            <p>Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary btn-lg" style={{ marginTop: '1.5rem' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-page__layout">
            <div className="cart-page__items">
              {/* Combo Items - styled like regular items */}
              {combos.map(combo => (
                <div key={combo._comboKey} className="cart-item cart-item--combo">
                  <div className="cart-item__img">
                    {combo.image_url ? (
                      <img src={resolveImg(combo.image_url)} alt={combo.combo_name} loading="lazy" />
                    ) : (
                      <div className="cart-item__img-placeholder">🎁</div>
                    )}
                  </div>
                  <div className="cart-item__info">
                    <div className="cart-item__name">{combo.combo_name}</div>
                    <div className="cart-item__cat">
                      {combo.items.map((item, idx) => (
                        <span key={idx}>
                          {idx > 0 && ' · '}
                          {[item.selected_size, item.selected_color].filter(Boolean).join(' ')}
                        </span>
                      ))}
                    </div>
                    <div className="cart-item__price">₹{combo.combo_price}</div>
                  </div>
                  <div className="cart-item__controls">
                    <div className="cart-item__qty">
                      <button onClick={() => setComboQty(combo._comboKey, (combo.qty || 1) - 1)}>−</button>
                      <span>{combo.qty || 1}</span>
                      <button onClick={() => setComboQty(combo._comboKey, (combo.qty || 1) + 1)}>+</button>
                    </div>
                    <div className="cart-item__subtotal">₹{combo.combo_price * (combo.qty || 1)}</div>
                    <button 
                      className="cart-item__remove" 
                      onClick={() => removeComboFromCart(combo._comboKey)} 
                      aria-label="Remove Combo"
                    >
                      <XIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Regular Items */}
              {items.map(item => (
                <div key={item._key} className="cart-item">
                  <Link to={`/products/${item.id}`}>
                    <div className="cart-item__img">
                      <img src={resolveImg(item.image)} alt={item.name} loading="lazy" />
                    </div>
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/products/${item.id}`}>
                      <div className="cart-item__name">{item.name}</div>
                    </Link>
                    <div className="cart-item__cat">
                      {[item.selectedSize, item.subCategory].filter(Boolean).join(' · ')}
                    </div>
                    {item.selectedColor && (
                      <span
                        className="cart-item__color-dot"
                        style={{ background: item.selectedColor, display: 'inline-block', width: 12, height: 12, borderRadius: '50%', marginTop: 4 }}
                      />
                    )}
                    <div className="cart-item__price">₹{item.discountPrice || item.price}</div>
                  </div>
                  <div className="cart-item__controls">
                    <div className="cart-item__qty">
                      <button onClick={() => setQty(item._key, item.qty - 1)}>−</button>
                      <span>{item.qty}</span>
                      <button onClick={() => setQty(item._key, item.qty + 1)}>+</button>
                    </div>
                    <div className="cart-item__subtotal">₹{(item.discountPrice || item.price) * item.qty}</div>
                    <button className="cart-item__remove" onClick={() => removeFromCart(item._key)} aria-label="Remove"><XIcon width={16} height={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-page__summary">
              <div className="cart-summary">
                <div className="cart-summary__title">Order Summary</div>

                <div className="cart-summary__row">
                  <span>Subtotal ({count} items)</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="cart-summary__row">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'cart-summary__free' : ''}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="cart-summary__note">
                    Add ₹{shippingSettings.free_shipping_threshold - subtotal} more for free shipping
                  </div>
                )}
                <div className="cart-summary__divider" />
                <div className="cart-summary__total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>

                <Link to="/checkout" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1.5rem', textAlign: 'center' }}>
                  Proceed to Checkout
                </Link>
                <Link
                  to="/products"
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginTop: '0.75rem', textAlign: 'center' }}
                >
                  Continue Shopping
                </Link>

                <div className="cart-summary__secure"><LockIcon width={14} height={14} style={{verticalAlign:'middle', marginRight:'0.35rem'}} /> Secure &amp; Encrypted Checkout</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
