import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getMyOrders, cancelOrder, updateOrderAddress, getAddresses } from '../services/api'
import { useUserAuth } from '../context/UserAuthContext'
import { resolveImg } from '../services/apiClient'
import { PackageIcon, BanknoteIcon, SmartphoneIcon, PencilIcon, XIcon, CheckIcon, MapPinIcon, TagIcon } from '../components/Icons/Icons'
import './MyOrders.css'

const STATUS_STEPS = ['pending', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered']
const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function StatusBadge({ status }) {
  return (
    <span className={`mo-badge mo-badge--${status}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

function StatusTracker({ status }) {
  if (status === 'cancelled') {
    return <div className="mo-tracker mo-tracker--cancelled"><XIcon width={14} height={14} /> Order Cancelled</div>
  }
  const currentIdx = STATUS_STEPS.indexOf(status)
  return (
    <div className="mo-tracker">
      {STATUS_STEPS.map((s, i) => (
        <div
          key={s}
          className={`mo-tracker__step ${i <= currentIdx ? 'done' : ''} ${i === currentIdx ? 'current' : ''}`}
        >
          <div className="mo-tracker__dot" />
          <div className="mo-tracker__label">{STATUS_LABELS[s]}</div>
          {i < STATUS_STEPS.length - 1 && <div className="mo-tracker__line" />}
        </div>
      ))}
    </div>
  )
}

function AddressEditor({ order, token, savedAddresses, onSaved, onClose }) {
  const [mode, setMode] = useState('pick') // pick | manual
  const [manual, setManual] = useState(order.shipping_address || '')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const save = async (address) => {
    if (!address.trim()) { setErr('Address cannot be empty.'); return }
    setSaving(true)
    setErr('')
    try {
      await updateOrderAddress(order.id, address.trim(), token)
      onSaved(address.trim())
    } catch (e) {
      setErr(e.message || 'Failed to update address.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mo-addr-editor">
      <div className="mo-addr-editor__title">Update Delivery Address</div>
      <div className="mo-addr-editor__note">Only available before the order is packed.</div>

      {savedAddresses.length > 0 && (
        <>
          <div className="mo-addr-editor__tabs">
            <button className={`mo-addr-tab ${mode === 'pick' ? 'active' : ''}`} onClick={() => setMode('pick')}>Saved Addresses</button>
            <button className={`mo-addr-tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>Enter Manually</button>
          </div>

          {mode === 'pick' && (
            <div className="mo-addr-cards">
              {savedAddresses.map(addr => (
                <button
                  key={addr.id}
                  className="mo-addr-saved-card"
                  disabled={saving}
                  onClick={() => {
                    const full = [addr.address_line, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
                    save(full)
                  }}
                >
                  <div className="mo-addr-saved-card__top">
                    <span className="mo-addr-saved-card__label">{addr.label}</span>
                    {addr.is_default && <span className="mo-addr-saved-card__def">Default</span>}
                  </div>
                  <div className="mo-addr-saved-card__name">{addr.name}</div>
                  <div className="mo-addr-saved-card__text">
                    {[addr.address_line, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {(mode === 'manual' || savedAddresses.length === 0) && (
        <div className="mo-addr-manual">
          <textarea
            className="mo-addr-textarea"
            value={manual}
            onChange={e => setManual(e.target.value)}
            rows={3}
            placeholder="Enter full delivery address, city, state, pincode"
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => save(manual)}
            disabled={saving}
          >
            {saving ? 'Updating…' : 'Save Address'}
          </button>
        </div>
      )}

      {err && <div className="mo-addr-err">{err}</div>}
      {saving && <div className="mo-addr-saving">Updating…</div>}

      <button className="mo-addr-editor__close" onClick={onClose}>Cancel</button>
    </div>
  )
}

export default function MyOrders() {
  const { token, isLoggedIn } = useUserAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [editingAddrFor, setEditingAddrFor] = useState(null) // order id
  const [savedAddresses, setSavedAddresses] = useState([])

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login?next=/my-orders'); return }
    getMyOrders(token)
      .then(data => { setOrders(data || []); if (data?.length) setExpandedId(data[0].id) })
      .catch(e => setError(e.message || 'Failed to load orders'))
      .finally(() => setLoading(false))
    getAddresses(token).then(a => setSavedAddresses(a || [])).catch(() => {})
  }, [isLoggedIn, token, navigate])

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This cannot be undone.')) return
    setCancelling(orderId)
    try {
      await cancelOrder(orderId, token)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
      setEditingAddrFor(null)
    } catch (e) {
      alert(e.message || 'Failed to cancel order. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const handleAddressSaved = (orderId, newAddress) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, shipping_address: newAddress } : o))
    setEditingAddrFor(null)
  }

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id)

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return iso }
  }

  if (loading) return (
    <div className="my-orders-page">
      <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="yolo-spinner" />
      </div>
    </div>
  )

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="mo-header">
          <div className="section-subtitle">Account</div>
          <h1 className="mo-title">My Orders</h1>
          <div className="divider" />
        </div>

        {error && <div className="mo-error">{error}</div>}

        {!error && orders.length === 0 && (
          <div className="mo-empty">
            <div className="mo-empty__icon"><PackageIcon width={56} height={56} style={{opacity:0.25}} /></div>
            <h2 className="mo-empty__title">No orders yet</h2>
            <p className="mo-empty__sub">Start shopping and your orders will appear here.</p>
            <Link to="/products" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Shop Now</Link>
          </div>
        )}

        <div className="mo-list">
          {orders.map(order => {
            const isExpanded = expandedId === order.id
            const canCancel = order.status === 'pending' || order.status === 'paid'
            const canEditAddr = order.status === 'pending' || order.status === 'paid'
            const isEditingAddr = editingAddrFor === order.id

            return (
              <div key={order.id} className={`mo-card ${isExpanded ? 'expanded' : ''}`}>
                {/* Header — always visible, click to expand */}
                <div className="mo-card__head" onClick={() => toggleExpand(order.id)}>
                  <div className="mo-card__meta">
                    <div className="mo-card__id">Order #{order.user_order_number || order.id}</div>
                    <div className="mo-card__date">{formatDate(order.created_at)}</div>
                  </div>
                  <div className="mo-card__right">
                    <StatusBadge status={order.status} />
                    <div className="mo-card__total">₹{order.total_price}</div>
                    <div className="mo-card__items-count">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </div>
                    <div className={`mo-card__chevron ${isExpanded ? 'open' : ''}`}>▾</div>
                  </div>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="mo-card__body">
                    <StatusTracker status={order.status} />

                    {/* Items list */}
                    <div className="mo-items">
                      {(order.items || []).map(item => (
                        <div key={item.id} className="mo-item">
                          {item.product_image ? (
                            <img
                              src={resolveImg(item.product_image)}
                              alt={item.product_name}
                              className="mo-item__img"
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="mo-item__img-ph"><TagIcon width={24} height={24} style={{opacity:0.4}} /></div>
                          )}
                          <div className="mo-item__info">
                            <div className="mo-item__name">{item.product_name}</div>
                            <div className="mo-item__meta">
                              {item.selected_size && <span>Size: {item.selected_size}</span>}
                              {item.selected_size && item.selected_color && <span className="mo-item__sep">•</span>}
                              {item.selected_color && <span>Color: {item.selected_color}</span>}
                              {(item.selected_size || item.selected_color) && <span className="mo-item__sep">•</span>}
                              <span>Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="mo-item__price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping address block */}
                    <div className="mo-shipping-block">
                      <div className="mo-shipping-block__row">
                        <div className="mo-shipping-block__info">
                          <span className="mo-shipping-block__label"><MapPinIcon width={13} height={13} style={{verticalAlign:'middle',marginRight:'0.3rem'}} />Delivery address</span>
                          <span className="mo-shipping-block__addr">{order.shipping_address}</span>
                        </div>
                        {canEditAddr && !isEditingAddr && (
                          <button
                            className="mo-edit-addr-btn"
                            onClick={e => { e.stopPropagation(); setEditingAddrFor(order.id) }}
                          >
                            <PencilIcon width={13} height={13} /> Change
                          </button>
                        )}
                      </div>

                      {isEditingAddr && (
                        <AddressEditor
                          order={order}
                          token={token}
                          savedAddresses={savedAddresses}
                          onSaved={(addr) => handleAddressSaved(order.id, addr)}
                          onClose={() => setEditingAddrFor(null)}
                        />
                      )}
                    </div>

                    {/* Footer actions */}
                    <div className="mo-card__footer">
                      <span className="mo-card__pm">
                        {order.payment_method === 'cod'
                          ? <><BanknoteIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.3rem'}} />Cash on Delivery</>
                          : <><SmartphoneIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.3rem'}} />UPI</>}
                      </span>
                      <div className="mo-card__actions">
                        {canCancel && (
                          <button
                            className="mo-cancel-btn"
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelling === order.id}
                          >
                            {cancelling === order.id ? 'Cancelling…' : <><XIcon width={13} height={13} style={{verticalAlign:'middle',marginRight:'0.25rem'}} />Cancel Order</>}
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <span className="mo-cancelled-note">This order was cancelled.</span>
                        )}
                        {order.status === 'delivered' && (
                          <span className="mo-delivered-note"><CheckIcon width={13} height={13} style={{verticalAlign:'middle',marginRight:'0.25rem'}} />Delivered</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
