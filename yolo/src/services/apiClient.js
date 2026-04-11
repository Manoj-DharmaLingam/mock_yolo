import { handleMockRequest } from './mockApi'

// ============================================
// YOLO — Mock API Client (No backend calls)
// ============================================

export const BASE_URL = ''

export const resolveImg = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return url.startsWith('/') ? url : `/${url}`
}

// ── In-memory response cache with differentiated TTLs ──────────────────
const CACHE_TTLS = {
  static: 300_000,   // 5 min for categories, offers, hero slides
  products: 60_000,  // 1 min for product listings
  default: 15_000,   // 15s for other dynamic data
}

const cache = new Map()
const inFlightRequests = new Map()

const getTTL = (key) => {
  if (key.includes('/categories') || key.includes('/offers') || key.includes('/hero')) {
    return CACHE_TTLS.static
  }
  if (key.includes('/products')) {
    return CACHE_TTLS.products
  }
  return CACHE_TTLS.default
}

const getCached = (key) => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > getTTL(key)) {
    cache.delete(key)
    return null
  }
  return entry.data
}

const setCached = (key, data) => cache.set(key, { data, ts: Date.now() })

export const clearCache = (prefix) => {
  if (!prefix) {
    cache.clear()
    return
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}

// ── Core fetch helper (mock router only) ───────────────────────────────
export async function apiFetch(path, options = {}) {
  const { headers: extraHeaders, ...restOptions } = options
  const method = (restOptions.method || 'GET').toUpperCase()
  const headers = { 'Content-Type': 'application/json', ...extraHeaders }

  return handleMockRequest(path, {
    ...restOptions,
    method,
    headers,
  })
}

// ── Public methods ──────────────────────────────────────────────────────
export const get = async (path, { useCache = true } = {}) => {
  if (useCache) {
    const cached = getCached(path)
    if (cached !== null) return cached

    if (inFlightRequests.has(path)) {
      return inFlightRequests.get(path)
    }
  }

  const requestPromise = apiFetch(path)
    .then((data) => {
      if (useCache) setCached(path, data)
      return data
    })
    .finally(() => {
      inFlightRequests.delete(path)
    })

  if (useCache) {
    inFlightRequests.set(path, requestPromise)
  }

  return requestPromise
}

export const post = async (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) })

export const put = async (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) })

const authHeaders = (token) =>
  (token && token.split('.').length === 3 ? { Authorization: `Bearer ${token}` } : {})

export const postWithAuth = async (path, body, token) =>
  apiFetchWithRefresh(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: authHeaders(token),
  })

export const putWithAuth = async (path, body, token) =>
  apiFetchWithRefresh(path, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: authHeaders(token),
  })

export const getWithAuth = async (path, token, { useCache = false } = {}) => {
  if (useCache) {
    const cached = getCached(path)
    if (cached !== null) return cached
  }
  return apiFetchWithRefresh(path, { headers: authHeaders(token) })
}

export const del = async (path) =>
  apiFetch(path, { method: 'DELETE' })

export const delWithAuth = async (path, token) =>
  apiFetchWithRefresh(path, { method: 'DELETE', headers: authHeaders(token) })

export const patchWithAuth = async (path, body, token) =>
  apiFetchWithRefresh(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: authHeaders(token),
  })

// ── Token refresh helper ───────────────────────────────────────────────
let _refreshCallback = null
export const setRefreshCallback = (cb) => { _refreshCallback = cb }

export async function apiFetchWithRefresh(path, options = {}) {
  try {
    return await apiFetch(path, options)
  } catch (err) {
    const isRefreshCall = path.includes('/api/auth/refresh')
    if (err.status === 401 && !isRefreshCall && _refreshCallback) {
      const newToken = await _refreshCallback()
      if (newToken) {
        const retryHeaders = { ...options.headers, Authorization: `Bearer ${newToken}` }
        return apiFetch(path, { ...options, headers: retryHeaders })
      }
    }
    throw err
  }
}

export const buildQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 'all') {
      query.set(key, value)
    }
  })
  const serialized = query.toString()
  return serialized ? `?${serialized}` : ''
}
