// ============================================
// YOLO — API Service Layer
// All calls go to the FastAPI backend.
// ============================================

import { get, post, postWithAuth, putWithAuth, getWithAuth, delWithAuth, patchWithAuth, buildQuery, clearCache } from './apiClient'

// Static metadata (used by Navbar filters etc.)
export const productCategories = [
  { key: 'graphic-tees',     label: 'Graphic Tees',     count: '—' },
  { key: 'oversized',        label: 'Oversized',         count: '—' },
  { key: 'plain-essentials', label: 'Plain Essentials',  count: '—' },
  { key: 'limited-drops',    label: 'Limited Drops',     count: '—' },
  { key: 'hoodies',          label: 'Hoodies',           count: '—' },
  { key: 'polo',             label: 'Polo',              count: '—' },
]

export const offerCategories = [
  { key: 'best-seller', label: 'Best Seller' },
  { key: 'buy-1-get-1', label: 'Buy 1 Get 1' },
]

export const isOfferActive = (offer) => {
  if (!offer || offer.enabled === false) return false
  if (!offer.end_time) return true
  return new Date(offer.end_time).getTime() >= Date.now()
}

// ── Products ──────────────────────────────────

export const getProducts = (filters = {}) =>
  get(`/api/products${buildQuery(filters)}`)

export const getProductById = (id) =>
  get(`/api/products/${id}`)

export const getBestSellers = (limit) =>
  get(`/api/products${buildQuery({ offerType: 'best-seller', limit })}`)

export const getBogoProducts = (limit) =>
  get(`/api/products${buildQuery({ offerType: 'buy-1-get-1', limit })}`)

export const getRelatedProducts = (id, category, limit = 4) =>
  get(`/api/products${buildQuery({ category, exclude: id, limit })}`)

/** Combined homepage data - hero, best sellers, BOGO, offer settings in one call */
export const getHomepageData = () =>
  get('/api/homepage-data')

// ── Auth ──────────────────────────────────────

export const login = (credentials) =>
  post('/api/auth/login', credentials)

export const register = (data) =>
  post('/api/auth/register', data)

export const verifyEmail = (email, otp_code) =>
  post('/api/auth/verify-email', { email, otp_code })

export const resendVerification = (email) =>
  post('/api/auth/resend-verification', { email })

export const refreshToken = (refresh_token = null) =>
  post('/api/auth/refresh', refresh_token ? { refresh_token } : {})

export const logoutSession = () =>
  post('/api/auth/logout', {})

export const getProfile = (token) =>
  getWithAuth('/api/auth/profile', token)

/** Combined profile + addresses in single call */
export const getProfileData = (token) =>
  getWithAuth('/api/auth/profile-data', token)

export const updateProfile = (data, token) =>
  putWithAuth('/api/auth/profile', data, token)

// ── Reviews ───────────────────────────────────

export const getProductReviews = (productId) =>
  get(`/api/products/${productId}/reviews`, { useCache: false })

export const submitReview = (productId, data, token) =>
  postWithAuth(`/api/products/${productId}/reviews`, data, token)

// ── Combo Offer Reviews ───────────────────────

export const getComboReviews = (comboId) =>
  get(`/api/combo-offers/${comboId}/reviews`, { useCache: false })

export const submitComboReview = (comboId, data, token) =>
  postWithAuth(`/api/combo-offers/${comboId}/reviews`, data, token)

// ── Contact / Newsletter ──────────────────────

export const submitContactForm = (data) =>
  post('/api/contact', data)

export const subscribeNewsletter = (email) =>
  post('/api/newsletter', { email })

// ── Orders ───────────────────────────────────

export const checkoutWithAuth = (data, token) =>
  postWithAuth('/api/checkout', data, token)

// Keep old export for backward compat but it now requires auth
export const checkout = (data, token) =>
  postWithAuth('/api/checkout', data, token)

export const trackOrder = (orderId, email) =>
  get(`/api/orders/track?order_id=${orderId}&email=${encodeURIComponent(email)}`, { useCache: false })

export const getCategoryCounts = () => get('/api/categories/counts', { useCache: false })

export const getCategories = () => get('/api/categories', { useCache: false })

/** Returns admin-controlled offer settings: { offer_key: { enabled, label, description, sort_order, end_time } } */
export const getOfferSettings = () => get('/api/offers/settings', { useCache: false })

/** Returns only enabled offer tabs sorted by sort_order — used to build the Offers page tabs */
export const getOfferTypes = () =>
  getOfferSettings().then(settings =>
    Object.entries(settings)
      .filter(([, s]) => isOfferActive(s))
      .sort((a, b) => (a[1].sort_order ?? 99) - (b[1].sort_order ?? 99))
      .map(([key, s]) => ({ key, label: s.label || key, description: s.description || '' }))
  )

// ── UPI / Payment ─────────────────────────────────────────────────

/** Create a Razorpay UPI QR code for the given amount (rupees). 
 * NOTE: QR codes require special activation on live Razorpay accounts.
 * Deprecated: fallback now routes to create-order for compatibility. */
export const createUpiQR = (amount, token) =>
  postWithAuth('/api/payment/create-order', { amount }, token)

/** Poll Razorpay to check if the QR payment has been received. */
export const checkUpiStatus = (qrId, token) =>
  getWithAuth(`/api/payment/upi-status/${qrId}`, token, { useCache: false })

/** Create a Razorpay order for checkout (works with UPI, cards, netbanking, wallets).
 * Returns { order_id, amount, currency, key_id } for frontend integration. */
export const createOrder = (amount, token) =>
  postWithAuth('/api/payment/create-order', { amount }, token)

/** Verify Razorpay payment signature after successful payment.
 * Call this in the Razorpay checkout handler with payment response. */
export const verifyPayment = (paymentData, token) =>
  postWithAuth('/api/payment/verify-payment', paymentData, token)

// ── Saved Addresses ───────────────────────────────────────────────

export const getAddresses = (token) => getWithAuth('/api/auth/addresses', token)
export const createAddress = (data, token) => postWithAuth('/api/auth/addresses', data, token)
export const updateAddress = (id, data, token) => putWithAuth(`/api/auth/addresses/${id}`, data, token)
export const setDefaultAddress = (id, token) => patchWithAuth(`/api/auth/addresses/${id}/default`, {}, token)
export const deleteAddress = (id, token) => delWithAuth(`/api/auth/addresses/${id}`, token)

// ── My Orders ─────────────────────────────────────────────────────

export const getMyOrders = (token) => getWithAuth('/api/auth/my-orders', token)
export const cancelOrder = (orderId, token) => postWithAuth(`/api/auth/my-orders/${orderId}/cancel`, {}, token)
export const updateOrderAddress = (orderId, address, token) =>
  patchWithAuth(`/api/auth/my-orders/${orderId}/address`, { shipping_address: address }, token)

// ── Combo Offers ──────────────────────────────────────────────────

/** Get all active combo offers with products */
export const getComboOffers = () => get('/api/combo-offers')

/** Get a single combo offer by ID */
export const getComboOffer = (id) => get(`/api/combo-offers/${id}`)

export { clearCache }
