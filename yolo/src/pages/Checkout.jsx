import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { checkout, getAddresses, createAddress, createOrder, verifyPayment } from '../services/api'
import { useCart } from '../context/CartContext'
import { useUserAuth } from '../context/UserAuthContext'
import { resolveImg } from '../services/apiClient'
import './Checkout.css'
import { BanknoteIcon, CheckCircleIcon, PackageIcon, LockIcon, CheckIcon, XIcon, SmartphoneIcon } from '../components/Icons/Icons'

const QR_TIMEOUT_SEC = 900  // 15 minutes
const PAYMENT_CONTEXT_KEY = 'yolo_checkout_payment_context'

const CodIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
)
const UpiIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>
)

function parseOrderError(err) {
  const msg = err?.message || String(err) || ''
  if (/stock|inventory|available/i.test(msg)) return msg
  if (/mismatch/i.test(msg)) return msg
  if (/not confirmed|not received/i.test(msg)) return 'Payment not confirmed. Please try again.'
  if (/login|auth|401/i.test(msg)) return 'Session expired. Please log in again.'
  if (/network|fetch|failed to fetch/i.test(msg)) return 'Network error — check your internet and try again.'
  if (/500|server/i.test(msg)) return 'Server error. Please try again in a moment.'
  return msg || 'Something went wrong. Please try again.'
}

function fmt(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const savePaymentContext = (context) => {
  try {
    sessionStorage.setItem(PAYMENT_CONTEXT_KEY, JSON.stringify({
      ...context,
      ts: Date.now(),
    }))
  } catch {}
}

const readPaymentContext = () => {
  try {
    const raw = sessionStorage.getItem(PAYMENT_CONTEXT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const clearPaymentContext = () => {
  try {
    sessionStorage.removeItem(PAYMENT_CONTEXT_KEY)
  } catch {}
}

const isMobileCheckout = () => {
  if (typeof window === 'undefined') return false

  const ua = window.navigator.userAgent || ''
  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false

  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || coarsePointer || window.innerWidth < 900
}

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, combos, subtotal, shipping, total, clearCart } = useCart()
  const { isLoggedIn, user, token } = useUserAuth()

  const [step, setStep] = useState('details') // details | payment | upi-scan | success
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [form, setForm] = useState({ name: '', phone: '', address: '', pincode: '', city: '', state: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orderId, setOrderId] = useState(null)
  const [invoiceData, setInvoiceData] = useState(null)  // snapshot for invoice

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddrId, setSelectedAddrId] = useState('new')
  const [saveAddr, setSaveAddr] = useState(false)
  const [loadingAddrs, setLoadingAddrs] = useState(false)

  // UPI QR state
  const [qrData, setQrData] = useState(null)     // { qr_id, image_url, expires_at, amount }
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState('')
  const [timeLeft, setTimeLeft] = useState(QR_TIMEOUT_SEC)
  const [paymentStatus, setPaymentStatus] = useState('waiting') // waiting | detected | placing | expired | failed
  const [detectedPaymentId, setDetectedPaymentId] = useState(null)
  const pollRef = useRef(null)
  const timerRef = useRef(null)
  const orderPlacedRef = useRef(false)

  const isEmpty = items.length === 0 && combos.length === 0
  const fullAddress = [form.address, form.city, form.state, form.pincode].filter(Boolean).join(', ')

  useEffect(() => {
    if (!isLoggedIn) navigate('/login?next=/checkout')
    if (isEmpty && step !== 'success') navigate('/cart')
  }, [isLoggedIn, isEmpty, navigate, step])

  useEffect(() => {
    if (!isLoggedIn) return
    setLoadingAddrs(true)
    getAddresses(token)
      .then(addrs => {
        setSavedAddresses(addrs || [])
        const def = (addrs || []).find(a => a.is_default)
        if (def) {
          setSelectedAddrId(def.id)
          setForm(f => ({
            ...f,
            name: def.name || f.name, phone: def.phone || f.phone,
            address: def.address_line || f.address, city: def.city || f.city,
            state: def.state || f.state, pincode: def.pincode || f.pincode,
          }))
        }
      })
      .catch(() => {})
      .finally(() => setLoadingAddrs(false))
  }, [isLoggedIn, token])

  // Stop polling on unmount
  useEffect(() => () => { clearInterval(pollRef.current); clearInterval(timerRef.current) }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('rzp_status')
    if (!status || !token || orderPlacedRef.current) return

    const paymentId = params.get('razorpay_payment_id')
    const orderId = params.get('razorpay_order_id')
    const signature = params.get('razorpay_signature')
    const paymentContext = readPaymentContext()
    const fallbackAddress = paymentContext?.address || fullAddress

    const finishRedirectPayment = async () => {
      if (status === 'success' && paymentId && orderId && signature) {
        setStep('payment')
        setQrLoading(false)
        setQrError('')
        setPaymentStatus('placing')

        if (paymentContext?.form) {
          setForm(prev => ({
            ...prev,
            ...paymentContext.form,
          }))
        }

        try {
          await verifyPayment({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          }, token)
          await placeOrderWithPaymentAndAddress(paymentId, fallbackAddress)
          clearPaymentContext()
        } catch (err) {
          setPaymentStatus('failed')
          setQrError(parseOrderError(err))
        } finally {
          navigate('/checkout', { replace: true })
        }
        return
      }

      setStep('payment')
      setQrLoading(false)
      setPaymentStatus('failed')
      setQrError(
        params.get('error_description') ||
        params.get('error_reason') ||
        'Payment was cancelled or not completed.'
      )
      navigate('/checkout', { replace: true })
    }

    finishRedirectPayment().catch(() => {
      setStep('payment')
      setQrLoading(false)
      setPaymentStatus('failed')
      setQrError('Could not confirm payment. Please try again.')
      navigate('/checkout', { replace: true })
    })
  }, [location.search, token, fullAddress, navigate])

  const fillFromAddress = (addr) => setForm(f => ({
    ...f,
    name: addr.name || f.name, phone: addr.phone || f.phone,
    address: addr.address_line || f.address, city: addr.city || f.city,
    state: addr.state || f.state, pincode: addr.pincode || f.pincode,
  }))

  const onSelectAddr = (id) => {
    setSelectedAddrId(id)
    if (id !== 'new') { const found = savedAddresses.find(a => a.id === id); if (found) fillFromAddress(found) }
  }

  useEffect(() => {
    if (user && selectedAddrId === 'new')
      setForm(f => ({ ...f, name: f.name || user.name || '', phone: f.phone || user.phone || '' }))
  }, [user])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()
    const needsForm = selectedAddrId === 'new' || savedAddresses.length === 0
    if (needsForm && (!form.name || !form.phone || !form.address || !form.pincode || !form.city)) {
      setError('Please fill in all required fields.'); return
    }
    if (!needsForm && (!form.address || !form.pincode)) {
      setError('Selected address is incomplete.'); return
    }
    setError('')
    if (selectedAddrId === 'new' && saveAddr) {
      try {
        const newAddr = await createAddress({
          label: 'Home', name: form.name, phone: form.phone,
          address_line: form.address, city: form.city, state: form.state,
          pincode: form.pincode, is_default: savedAddresses.length === 0,
        }, token)
        setSavedAddresses(prev => [...prev, newAddr])
      } catch {
        setError('Could not save address. You can continue checkout without saving it.')
      }
    }
    setStep('payment')
  }

  // ── Initiate UPI payment in mock mode ────────────────────────────
  const startUpiPayment = useCallback(async () => {
    const currentAddress = fullAddress

    setQrLoading(true)
    setQrError('')
    setPaymentStatus('placing')
    orderPlacedRef.current = false

    try {
      const orderData = await createOrder(total, token)
      const mockPaymentId = `pay_mock_${Date.now()}`
      await verifyPayment({
        razorpay_order_id: orderData.order_id,
        razorpay_payment_id: mockPaymentId,
        razorpay_signature: 'mock_signature',
      }, token)
      await placeOrderWithPaymentAndAddress(mockPaymentId, currentAddress)
    } catch (e) {
      setQrError(e.message || 'Could not process UPI payment in mock mode.')
      setPaymentStatus('failed')
    } finally {
      setQrLoading(false)
    }
  }, [total, token, fullAddress])

  // ── Place order after payment detected (with explicit address) ────
  const placeOrderWithPaymentAndAddress = async (paymentId, address) => {
    if (orderPlacedRef.current) return
    orderPlacedRef.current = true
    setPaymentStatus('placing')
    setError('')
    try {
      const payload = {
        items: items.map(i => ({ 
          product_id: i.id, 
          quantity: i.qty,
          selected_size: i.selectedSize,
          selected_color: i.selectedColor,
        })),
        combo_items: combos.map(c => ({
          combo_offer_id: c.combo_offer_id,
          combo_name: c.combo_name,
          combo_price: c.combo_price,
          pick_count: c.pick_count,
          selections: c.items.map(item => ({
            item_index: item.item_index,
            selected_color: item.selected_color,
            selected_size: item.selected_size,
          })),
        })),
        shipping_address: address,
        payment_method: 'upi',
        razorpay_payment_id: paymentId,
      }
      const res = await checkout(payload, token)
      setOrderId(res.order_id)
      setInvoiceData({
        orderId: res.order_id,
        date: new Date(),
        customer: { name: form.name, phone: form.phone },
        address: address,
        items: items.map(i => ({
          name: i.name, qty: i.qty,
          price: i.discountPrice || i.price, image: i.image,
          size: i.selectedSize, color: i.selectedColor,
        })),
        combos: combos.map(c => ({
          name: c.combo_name,
          price: c.combo_price,
          items: c.items,
        })),
        subtotal: res.subtotal,
        shipping: res.shipping,
        discount: res.discount || 0,
        total: res.total,
        paymentMethod: 'upi',
        paymentReference: res.payment_reference,
      })
      clearCart()
      clearPaymentContext()
      setStep('success')
    } catch (err) {
      orderPlacedRef.current = false
      setPaymentStatus('failed')
      setError(parseOrderError(err))
    }
  }

  // Keep original function for backward compatibility (QR polling flow)
  const placeOrderWithPayment = async (paymentId) => {
    placeOrderWithPaymentAndAddress(paymentId, fullAddress)
  }

  // ── Place COD order ───────────────────────────────────────────────
  const handleCodOrder = async () => {
    setLoading(true); setError('')
    try {
      const payload = {
        items: items.map(i => ({ 
          product_id: i.id, 
          quantity: i.qty,
          selected_size: i.selectedSize,
          selected_color: i.selectedColor,
        })),
        combo_items: combos.map(c => ({
          combo_offer_id: c.combo_offer_id,
          combo_name: c.combo_name,
          combo_price: c.combo_price,
          pick_count: c.pick_count,
          selections: c.items.map(item => ({
            item_index: item.item_index,
            selected_color: item.selected_color,
            selected_size: item.selected_size,
          })),
        })),
        shipping_address: fullAddress,
        payment_method: 'cod',
      }
      const res = await checkout(payload, token)
      setOrderId(res.order_id)
      setInvoiceData({
        orderId: res.order_id,
        date: new Date(),
        customer: { name: form.name, phone: form.phone },
        address: fullAddress,
        items: items.map(i => ({
          name: i.name, qty: i.qty,
          price: i.discountPrice || i.price, image: i.image,
          size: i.selectedSize, color: i.selectedColor,
        })),
        combos: combos.map(c => ({
          name: c.combo_name,
          price: c.combo_price,
          items: c.items,
        })),
        subtotal: res.subtotal,
        shipping: res.shipping,
        discount: res.discount || 0,
        total: res.total,
        paymentMethod: 'cod',
        paymentReference: res.payment_reference,
      })
      clearCart()
      setStep('success')
    } catch (err) {
      setError(parseOrderError(err))
    } finally {
      setLoading(false)
    }
  }

  const retryUpi = () => {
    clearInterval(pollRef.current); clearInterval(timerRef.current)
    setStep('payment'); setQrData(null); setQrError('')
    setPaymentStatus('waiting'); setError('')
  }

  // ── Invoice / Success ─────────────────────────────────────────────
  if (step === 'success' && invoiceData) {
    const inv = invoiceData
    const dateStr = inv.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    const timeStr = inv.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    return (
      <div className="checkout-page inv-page">
        {/* Screen-only success banner */}
        <div className="inv-success-banner no-print">
          <span className="inv-success-banner__icon"><CheckCircleIcon width={24} height={24} /></span>
          <div>
            <div className="inv-success-banner__title">Order Placed Successfully!</div>
            <div className="inv-success-banner__sub">
              {inv.paymentMethod === 'cod'
                ? 'Your order is confirmed. Pay when it arrives.'
                : 'Payment received! Your order is on its way.'}
            </div>
          </div>
        </div>

        {/* Invoice document */}
        <div className="container">
          <div className="invoice" id="yolo-invoice">

            {/* Invoice header */}
            <div className="invoice__header">
              <div className="invoice__brand">
                <div className="invoice__logo">YOLO</div>
                <div className="invoice__brand-sub">Store</div>
              </div>
              <div className="invoice__meta">
                <div className="invoice__title">INVOICE</div>
                <div className="invoice__meta-row"><span>Order #</span><strong>{inv.orderId}</strong></div>
                <div className="invoice__meta-row"><span>Date</span><strong>{dateStr} · {timeStr}</strong></div>
                <div className="invoice__meta-row">
                  <span>Payment</span>
                  <strong className={`invoice__pm-badge invoice__pm-badge--${inv.paymentMethod}`}>
                    {inv.paymentMethod === 'cod'
                      ? <><BanknoteIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.3rem'}} />Cash on Delivery</>
                      : <><CheckCircleIcon width={14} height={14} style={{verticalAlign:'middle',marginRight:'0.3rem'}} />UPI Paid</>}
                  </strong>
                </div>
                {inv.paymentReference && (
                  <div className="invoice__meta-row"><span>Ref</span><strong>{inv.paymentReference}</strong></div>
                )}
              </div>
            </div>

            {/* Bill to */}
            <div className="invoice__parties">
              <div className="invoice__party">
                <div className="invoice__party-label">Bill To</div>
                <div className="invoice__party-name">{inv.customer.name}</div>
                {inv.customer.phone && <div className="invoice__party-detail">{inv.customer.phone}</div>}
              </div>
              <div className="invoice__party">
                <div className="invoice__party-label">Deliver To</div>
                <div className="invoice__party-detail">{inv.address || '—'}</div>
              </div>
            </div>

            {/* Items table */}
            <table className="invoice__table">
              <thead>
                <tr>
                  <th className="invoice__th">Item</th>
                  <th className="invoice__th invoice__th--center">Qty</th>
                  <th className="invoice__th invoice__th--right">Unit Price</th>
                  <th className="invoice__th invoice__th--right">Total</th>
                </tr>
              </thead>
              <tbody>
                {/* Regular items */}
                {inv.items.map((item, i) => (
                  <tr key={`item-${i}`} className="invoice__tr">
                    <td className="invoice__td">
                      <div className="invoice__item-name">{item.name}</div>
                      {(item.size || item.color) && (
                        <div className="invoice__item-meta">{[item.size, item.color].filter(Boolean).join(' · ')}</div>
                      )}
                    </td>
                    <td className="invoice__td invoice__td--center">{item.qty}</td>
                    <td className="invoice__td invoice__td--right">₹{item.price.toFixed(2)}</td>
                    <td className="invoice__td invoice__td--right">₹{(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
                {/* Combo items */}
                {inv.combos && inv.combos.map((combo, ci) => (
                  <tr key={`combo-${ci}`} className="invoice__tr">
                    <td className="invoice__td">
                      <div className="invoice__item-name">{combo.name}</div>
                      <div className="invoice__item-meta">
                        {combo.items.map((sel, si) => (
                          <div key={si}>{[sel.selected_size, sel.selected_color].filter(Boolean).join(' · ')}</div>
                        ))}
                      </div>
                    </td>
                    <td className="invoice__td invoice__td--center">1</td>
                    <td className="invoice__td invoice__td--right">₹{combo.price.toFixed(2)}</td>
                    <td className="invoice__td invoice__td--right">₹{combo.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="invoice__totals">
              <div className="invoice__total-row">
                <span>Subtotal</span><span>₹{inv.subtotal.toFixed(2)}</span>
              </div>
              <div className="invoice__total-row">
                <span>Shipping</span>
                <span>{inv.shipping === 0 ? 'FREE' : `₹${inv.shipping.toFixed(2)}`}</span>
              </div>
              {inv.discount > 0 && (
                <div className="invoice__total-row invoice__total-row--discount">
                  <span>Discount</span><span>−₹{inv.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="invoice__total-row invoice__total-row--grand">
                <span>Grand Total</span><span>₹{inv.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Status & tracking note */}
            <div className="invoice__track-note">
              <div className="invoice__track-note__icon"><PackageIcon width={20} height={20} /></div>
              <div>
                <div className="invoice__track-note__title">
                  {inv.paymentMethod === 'cod'
                    ? 'Your order has been placed! Pay on delivery.'
                    : 'Payment confirmed! Your order is being processed.'}
                </div>
                <div className="invoice__track-note__sub">
                  You can track your order anytime from <strong>My Orders</strong> in your account.
                  Keep Order #{inv.orderId} handy for any queries.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice__footer">
              <div>Thank you for shopping with YOLO Store!</div>
              <div className="invoice__footer-sub">This is a computer-generated invoice and does not require a signature.</div>
            </div>
          </div>

          {/* Action buttons — hidden in print */}
          <div className="inv-actions no-print">
            <button className="btn btn-primary inv-download-btn" onClick={() => window.print()}>
              ⬇ Download Invoice (PDF)
            </button>
            <Link to="/my-orders" className="btn btn-secondary">Track My Order</Link>
            <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  // ── UPI QR Scan Screen ────────────────────────────────────────────
  if (step === 'upi-scan') {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="checkout-upi-scan">
            <div className="checkout-upi-scan__header">
              <h2>Scan &amp; Pay ₹{total}</h2>
              <p>Open GPay, PhonePe, or Paytm → Scan QR → Pay</p>
            </div>

            {paymentStatus === 'waiting' && qrData && (
              <>
                <div className="checkout-upi-scan__qr-wrap">
                  <img
                    src={qrData.image_url}
                    alt="UPI QR Code"
                    className="checkout-upi-scan__qr-img"
                  />
                  <div className="checkout-upi-scan__apps">
                    <a href={`tez://upi/pay?pa=${qrData.qr_id}&am=${total}&cu=INR`} className="checkout-upi-app checkout-upi-app--gpay"><span className="checkout-upi-app__icon">G</span>GPay</a>
                    <a href={`phonepe://pay?pa=${qrData.qr_id}&am=${total}&cu=INR`} className="checkout-upi-app checkout-upi-app--phonepe"><span className="checkout-upi-app__icon">P</span>PhonePe</a>
                    <a href={`paytmmp://pay?pa=${qrData.qr_id}&am=${total}&cu=INR`} className="checkout-upi-app checkout-upi-app--paytm"><span className="checkout-upi-app__icon">B</span>Paytm</a>
                  </div>
                </div>
                <div className="checkout-upi-scan__status">
                  <div className="checkout-upi-scan__pulse">
                    <span className="checkout-upi-pulse-dot" />
                    Waiting for payment…
                  </div>
                  <div className={`checkout-upi-scan__timer${timeLeft < 60 ? ' checkout-upi-scan__timer--urgent' : ''}`}>
                    Expires in {fmt(timeLeft)}
                  </div>
                </div>
              </>
            )}

            {paymentStatus === 'detected' && (
              <div className="checkout-upi-scan__detected">
                <div className="checkout-upi-scan__detected-icon"><CheckCircleIcon width={48} height={48} /></div>
                <div>Payment received! Confirming your order…</div>
              </div>
            )}

            {paymentStatus === 'placing' && (
              <div className="checkout-upi-scan__detected">
                <div className="checkout-upi-scan__spinner" />
                <div>Placing your order…</div>
              </div>
            )}

            {paymentStatus === 'expired' && (
              <div className="checkout-upi-scan__error">
                <div className="checkout-upi-scan__error-icon">⏱</div>
                <div className="checkout-upi-scan__error-title">QR Code Expired</div>
                <p>No payment was received within 15 minutes. Your cart is safe — try again.</p>
                <button className="btn btn-primary" onClick={retryUpi}>Try Again</button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="checkout-upi-scan__error">
                <div className="checkout-upi-scan__error-icon"><XIcon width={48} height={48} /></div>
                <div className="checkout-upi-scan__error-title">Order Failed</div>
                <p>{error}</p>
                <button className="btn btn-primary" onClick={retryUpi}>Try Again</button>
              </div>
            )}

            {paymentStatus === 'waiting' && (
              <button className="checkout-upi-scan__back" onClick={retryUpi} type="button">
                ← Cancel &amp; Go Back
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Main checkout ─────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <div className="section-subtitle">Almost there</div>
          <h1 className="checkout-title">Checkout</h1>
          <div className="divider" />
          <div className="checkout-steps">
            <div className={`checkout-step${step === 'details' ? ' active' : ' done'}`}>1. Delivery Details</div>
            <div className="checkout-step-sep">→</div>
            <div className={`checkout-step${step === 'payment' ? ' active' : ''}`}>2. Payment</div>
          </div>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">

            {step === 'details' && (
              <form className="checkout-card" onSubmit={handleDetailsSubmit}>
                <h3 className="checkout-card__title">Delivery Details</h3>
                {error && <div className="checkout-alert">{error}</div>}

                {savedAddresses.length > 0 && (
                  <div className="checkout-addr-picker">
                    <div className="checkout-addr-picker__title">Select Delivery Address</div>
                    {loadingAddrs && <div className="checkout-addr-picker__loading">Loading…</div>}
                    <div className="checkout-addr-cards">
                      {savedAddresses.map(addr => (
                        <label key={addr.id} className={`checkout-addr-card ${selectedAddrId === addr.id ? 'selected' : ''}`}>
                          <input type="radio" name="saved_addr" value={addr.id} checked={selectedAddrId === addr.id} onChange={() => onSelectAddr(addr.id)} />
                          <div className="checkout-addr-card__body">
                            <div className="checkout-addr-card__top">
                              <span className="checkout-addr-card__label">{addr.label}</span>
                              {addr.is_default && <span className="checkout-addr-card__default">Default</span>}
                            </div>
                            <div className="checkout-addr-card__name">{addr.name} · {addr.phone}</div>
                            <div className="checkout-addr-card__text">
                              {[addr.address_line, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </label>
                      ))}
                      <label className={`checkout-addr-card checkout-addr-card--new ${selectedAddrId === 'new' ? 'selected' : ''}`}>
                        <input type="radio" name="saved_addr" value="new" checked={selectedAddrId === 'new'} onChange={() => onSelectAddr('new')} />
                        <div className="checkout-addr-card__body">
                          <div className="checkout-addr-card__name">+ Use a new address</div>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {(selectedAddrId === 'new' || savedAddresses.length === 0) && (
                  <>
                    <div className="checkout-fields">
                      <div className="checkout-field"><label>Full Name *</label><input name="name" value={form.name} onChange={onChange} required placeholder="Your full name" /></div>
                      <div className="checkout-field"><label>Phone *</label><input name="phone" value={form.phone} onChange={onChange} required placeholder="+91 9XXXXXXXXX" /></div>
                      <div className="checkout-field checkout-field--full"><label>Address *</label><textarea name="address" value={form.address} onChange={onChange} required placeholder="House No, Street, Landmark" rows={2} /></div>
                      <div className="checkout-field"><label>City *</label><input name="city" value={form.city} onChange={onChange} required placeholder="City" /></div>
                      <div className="checkout-field"><label>State</label><input name="state" value={form.state} onChange={onChange} placeholder="State" /></div>
                      <div className="checkout-field"><label>Pincode *</label><input name="pincode" value={form.pincode} onChange={onChange} required placeholder="6-digit pincode" maxLength={6} /></div>
                    </div>
                    <label className="checkout-save-addr">
                      <input type="checkbox" checked={saveAddr} onChange={e => setSaveAddr(e.target.checked)} />
                      <span>Save this address for future orders</span>
                    </label>
                  </>
                )}

                <button type="submit" className="btn btn-primary checkout-next-btn">Continue to Payment →</button>
              </form>
            )}

            {step === 'payment' && (
              <div className="checkout-card">
                <h3 className="checkout-card__title">Payment Method</h3>
                {error && <div className="checkout-alert">{error}</div>}
                {qrError && <div className="checkout-alert">{qrError}</div>}

                <div className="checkout-payment-methods">
                  <label className={`checkout-pm${paymentMethod === 'cod' ? ' active' : ''}`}>
                    <input type="radio" name="pm" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                    <div className="checkout-pm__icon"><CodIcon /></div>
                    <div>
                      <div className="checkout-pm__name">Cash on Delivery</div>
                      <div className="checkout-pm__desc">Pay when your order arrives</div>
                    </div>
                  </label>

                  <label className={`checkout-pm${paymentMethod === 'upi' ? ' active' : ''}`}>
                    <input type="radio" name="pm" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                    <div className="checkout-pm__icon"><UpiIcon /></div>
                    <div>
                      <div className="checkout-pm__name">UPI / GPay / PhonePe / Paytm</div>
                      <div className="checkout-pm__desc">Mock UPI checkout — order confirmed immediately after payment simulation</div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="checkout-upi-info">
                    <span className="checkout-upi-info__icon"><LockIcon width={13} height={13} /></span>
                    <span>No external gateway is used in mock mode. Your order is placed after local payment simulation.</span>
                  </div>
                )}

                <div className="checkout-payment-actions">
                  <button className="btn btn-secondary" onClick={() => { setStep('details'); setError('') }} type="button">← Back</button>
                  {paymentMethod === 'cod' ? (
                    <button className="btn btn-primary" onClick={handleCodOrder} disabled={loading} type="button">
                      {loading ? 'Placing Order…' : `Place Order — ₹${total}`}
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={startUpiPayment} disabled={qrLoading} type="button">
                      {qrLoading ? 'Processing UPI…' : `Pay ₹${total} securely →`}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="checkout-sidebar">
            <div className="checkout-order-summary">
              <div className="checkout-order-summary__title">Order Summary</div>
              <div className="checkout-order-items">
                {items.map(item => (
                  <div key={item._key} className="checkout-order-item">
                    <img src={resolveImg(item.image)} alt={item.name} className="checkout-order-item__img" loading="lazy" />
                    <div className="checkout-order-item__info">
                      <div className="checkout-order-item__name">{item.name}</div>
                      <div className="checkout-order-item__meta">{[item.selectedSize, item.selectedColor].filter(Boolean).join(' · ')} × {item.qty}</div>
                    </div>
                    <div className="checkout-order-item__price">₹{item.discountPrice * item.qty}</div>
                  </div>
                ))}
              </div>
              <div className="checkout-summary-rows">
                <div className="checkout-summary-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="checkout-summary-row"><span>Shipping</span><span className={shipping === 0 ? 'free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
                <div className="checkout-summary-row checkout-summary-row--total"><span>Total</span><span>₹{total}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
