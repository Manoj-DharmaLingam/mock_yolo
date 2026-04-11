import React, { useEffect, useState, useCallback } from 'react'
import { getAdminOrders, updateOrderStatus } from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import './Orders.css'

const ALL_STATUSES = ['pending', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_BADGE = {
  pending:          'badge-pending',
  paid:             'badge-paid',
  packed:           'badge-info',
  shipped:          'badge-shipped',
  out_for_delivery: 'badge-warning',
  delivered:        'badge-delivered',
  cancelled:        'badge-cancelled',
}

const PAYMENT_BADGE = {
  paid:      'badge-paid',
  pending:   'badge-pending',
  failed:    'badge-cancelled',
  cancelled: 'badge-cancelled',
}

const STATUS_LABEL = {
  pending: 'Pending', paid: 'Paid', packed: 'Packed',
  shipped: 'Shipped', out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered', cancelled: 'Cancelled',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [msg, setMsg] = useState({ text: '', type: 'success' })
  const [expanded, setExpanded] = useState({})
  const [search, setSearch] = useState('')
  const { showLoading, hideLoading } = useLoading()

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 3500)
  }

  const load = useCallback(() => {
    setLoading(true)
    getAdminOrders(filter || undefined)
      .then((r) => setOrders(r.data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  const handleStatus = async (id, status) => {
    setUpdatingId(id)
    showLoading('Updating order status...')
    try {
      await updateOrderStatus(id, status)
      setOrders((os) => os.map((o) => o.id === id ? { ...o, status, payment_status: _derivePayment(status) } : o))
      flash(`Order #${id} → ${STATUS_LABEL[status] || status}`)
    } catch {
      flash('Status update failed. Please try again.', 'error')
    } finally {
      setUpdatingId(null)
      hideLoading()
    }
  }

  const _derivePayment = (status) => {
    if (['paid', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(status)) return 'paid'
    if (status === 'cancelled') return 'cancelled'
    return 'pending'
  }

  const toggleExpand = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }))

  const filtered = orders.filter(o => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      String(o.id).includes(q) ||
      (o.customer_name || '').toLowerCase().includes(q) ||
      (o.customer_email || '').toLowerCase().includes(q) ||
      (o.customer_phone || '').includes(q) ||
      (o.shipping_address || '').toLowerCase().includes(q)
    )
  })

  const totalRevenue = orders
    .filter(o => ['paid', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(o.status))
    .reduce((s, o) => s + (o.total_price || 0), 0)

  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="orders-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">
            {orders.length} orders&nbsp;·&nbsp;
            {pendingCount} pending&nbsp;·&nbsp;
            Revenue: ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          className="form-control"
          style={{ maxWidth: 340 }}
          type="text"
          placeholder="Search by Order#, Name, Phone, Email, Address…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Status filter */}
      <div className="orders-page__filters">
        <button className={`btn btn-sm ${!filter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('')}>All</button>
        {ALL_STATUSES.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(s)}
          >{STATUS_LABEL[s]}</button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          No orders found{filter ? ` with status "${STATUS_LABEL[filter]}"` : ''}{search ? ` matching "${search}"` : ''}.
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="admin-table orders-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}></th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Pay Status</th>
                  <th>Order Status</th>
                  <th>Date</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
              {filtered.map((o) => (
                <React.Fragment key={o.id}>
                  <tr className={expanded[o.id] ? 'orders-row--expanded' : ''}>
                    <td>
                      <button
                        className="orders-expand-btn"
                        onClick={() => toggleExpand(o.id)}
                        title={expanded[o.id] ? 'Collapse' : 'View items'}
                      >{expanded[o.id] ? '▲' : '▼'}</button>
                    </td>
                    <td><strong>#{o.id}</strong></td>
                    <td>
                      <div className="orders-customer">
                        <div className="orders-customer__name">{o.customer_name || '—'}</div>
                        <div className="orders-customer__email">{o.customer_email || ''}</div>
                      </div>
                    </td>
                    <td className="orders-phone">{o.customer_phone || '—'}</td>
                    <td className="orders-address" title={o.shipping_address || ''}>
                      {o.shipping_address
                        ? o.shipping_address.length > 40
                          ? o.shipping_address.slice(0, 40) + '…'
                          : o.shipping_address
                        : '—'}
                    </td>
                    <td>
                      <span className="orders-items-count">
                        {o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td><strong>₹{(o.total_price || 0).toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span className="orders-payment-method">
                        {(o.payment_method || 'cod').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${PAYMENT_BADGE[o.payment_status] || 'badge-pending'}`}>
                        {o.payment_status || 'pending'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] || ''}`}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td className="orders-date">
                      {new Date(o.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td>
                      <select
                        className="form-control orders-page__status-select"
                        value={o.status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleStatus(o.id, e.target.value)}
                      >
                        {ALL_STATUSES.map(s => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded[o.id] && (
                    <tr className="orders-detail-row">
                      <td colSpan={12}>
                        <div className="orders-detail">
                          <div className="orders-detail__section">
                            <div className="orders-detail__label">Shipping Address</div>
                            <div className="orders-detail__value">{o.shipping_address || '—'}</div>
                          </div>
                          <div className="orders-detail__section">
                            <div className="orders-detail__label">Payment Reference</div>
                            <div className="orders-detail__value orders-detail__mono">{o.payment_reference || '—'}</div>
                          </div>
                          <div className="orders-detail__section orders-detail__items">
                            <div className="orders-detail__label">Ordered Items</div>
                            {(o.items || []).length === 0 ? (
                              <div style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>No items</div>
                            ) : (
                              <>
                                {/* Group items by combo */}
                                {(() => {
                                  const comboGroups = {}
                                  const regularItems = []
                                  
                                  o.items.forEach(item => {
                                    if (item.combo_offer_id && item.combo_item_index !== null && item.combo_item_index !== undefined) {
                                      const key = `${item.combo_offer_id}-${item.combo_item_index}`
                                      if (!comboGroups[key]) {
                                        comboGroups[key] = {
                                          comboName: item.combo_offer_name || `Combo #${item.combo_offer_id}`,
                                          isCoupleOffer: item.is_couple_offer || false,
                                          comboItemIndex: item.combo_item_index,
                                          items: []
                                        }
                                      }
                                      comboGroups[key].items.push(item)
                                    } else {
                                      regularItems.push(item)
                                    }
                                  })
                                  
                                  return (
                                    <>
                                      {/* Combo bundles */}
                                      {Object.entries(comboGroups).map(([key, group]) => (
                                        <div key={key} className="combo-bundle">
                                          <div className="combo-bundle-header">
                                            <span className="combo-badge">
                                              {group.isCoupleOffer ? (
                                                <>
                                                  💕 {group.comboName} - {group.comboItemIndex === 0 ? '👔 Men\'s Shirt' : '👗 Women\'s Shirt'}
                                                </>
                                              ) : (
                                                <>🎁 {group.comboName}</>
                                              )}
                                            </span>
                                          </div>
                                          <table className="orders-items-table">
                                            <thead>
                                              <tr>
                                                <th>Image</th>
                                                <th>Product</th>
                                                <th>Color</th>
                                                <th>Size</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {group.items.map(item => (
                                                <tr key={item.id}>
                                                  <td>
                                                    {item.product_image ? (
                                                      <img src={item.product_image} alt="" className="order-item-img" />
                                                    ) : (
                                                      <div className="order-item-no-img">No img</div>
                                                    )}
                                                  </td>
                                                  <td>{item.product_name}</td>
                                                  <td>
                                                    {item.selected_color && (
                                                      <span className="variant-chip">{item.selected_color}</span>
                                                    )}
                                                  </td>
                                                  <td>
                                                    {item.selected_size && (
                                                      <span className="variant-chip">{item.selected_size}</span>
                                                    )}
                                                  </td>
                                                  <td>{item.quantity}</td>
                                                  <td>₹{item.price.toLocaleString('en-IN')}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      ))}
                                      
                                      {/* Regular items */}
                                      {regularItems.length > 0 && (
                                        <table className="orders-items-table">
                                          <thead>
                                            <tr>
                                              <th>Image</th>
                                              <th>Product</th>
                                              <th>Color</th>
                                              <th>Size</th>
                                              <th>Qty</th>
                                              <th>Offer</th>
                                              <th>Unit Price</th>
                                              <th>Subtotal</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {regularItems.map(item => (
                                              <tr key={item.id}>
                                                <td>
                                                  {item.product_image ? (
                                                    <img src={item.product_image} alt="" className="order-item-img" />
                                                  ) : (
                                                    <div className="order-item-no-img">No img</div>
                                                  )}
                                                </td>
                                                <td>{item.product_name}</td>
                                                <td>
                                                  {item.selected_color && (
                                                    <span className="variant-chip">{item.selected_color}</span>
                                                  )}
                                                </td>
                                                <td>
                                                  {item.selected_size && (
                                                    <span className="variant-chip">{item.selected_size}</span>
                                                  )}
                                                </td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                  {item.offer_type ? (
                                                    <span className="variant-chip offer-chip">{item.offer_type}</span>
                                                  ) : (
                                                    <span className="text-muted">—</span>
                                                  )}
                                                </td>
                                                <td>₹{item.price.toLocaleString('en-IN')}</td>
                                                <td>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      )}
                                    </>
                                  )
                                })()}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
