const MOCK_ORIGIN = 'http://mock.local'

const STORAGE_KEYS = {
  users: 'yolo_mock_users',
  addressBook: 'yolo_mock_address_book',
  orders: 'yolo_mock_orders',
  productReviews: 'yolo_mock_product_reviews',
  comboReviews: 'yolo_mock_combo_reviews',
  ids: 'yolo_mock_ids',
}

const CATEGORY_LABELS = {
  'graphic-tees': 'Graphic Tees',
  oversized: 'Oversized',
  'plain-essentials': 'Plain Essentials',
  'limited-drops': 'Limited Drops',
  hoodies: 'Hoodies',
  polo: 'Polo',
}

const CATEGORY_LIST = Object.entries(CATEGORY_LABELS).map(([key, label]) => ({ key, label }))

const PRODUCTS = [
  {
    id: 101,
    name: 'Neon Rebel Graphic Tee',
    category: 'graphic-tees',
    subCategory: 'Graphic Tees',
    image: '/Yolo.png',
    images: ['/Yolo.png', '/Yolo.png'],
    price: 1499,
    discountPrice: 1099,
    badge: 'BEST SELLER',
    colors: ['#111827', '#ef4444', '#22c55e'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.7,
    reviews: 146,
    material: '100% Cotton',
    fit: 'Oversized',
    tags: ['Streetwear', 'Bestseller', 'Unisex'],
    description: 'A high-impact graphic tee made for everyday streetwear looks.',
    offerType: 'best-seller',
    created_at: '2026-03-05T08:10:00.000Z',
  },
  {
    id: 102,
    name: 'Cloud Oversized Tee',
    category: 'oversized',
    subCategory: 'Oversized',
    image: '/Yolo.png',
    images: ['/Yolo.png', '/Yolo.png'],
    price: 1599,
    discountPrice: 1199,
    badge: 'TRENDING',
    colors: ['#0f172a', '#eab308', '#fb923c'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.5,
    reviews: 91,
    material: 'French Terry Cotton',
    fit: 'Relaxed Oversized',
    tags: ['Oversized', 'Drop-Shoulder'],
    description: 'Soft premium oversized tee with a clean premium finish.',
    offerType: 'buy-1-get-1',
    created_at: '2026-03-22T11:00:00.000Z',
  },
  {
    id: 103,
    name: 'Core Plain Essential Tee',
    category: 'plain-essentials',
    subCategory: 'Plain Essentials',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 999,
    discountPrice: 799,
    badge: 'ESSENTIAL',
    colors: ['#1f2937', '#f8fafc', '#6b7280'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    rating: 4.4,
    reviews: 67,
    material: 'Combed Cotton',
    fit: 'Regular',
    tags: ['Basics', 'Daily Wear'],
    description: 'Minimal plain tee that pairs with everything.',
    offerType: 'buy-1-get-1',
    created_at: '2026-02-28T09:40:00.000Z',
  },
  {
    id: 104,
    name: 'Midnight Drop Hoodie',
    category: 'hoodies',
    subCategory: 'Hoodies',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 2499,
    discountPrice: 1999,
    badge: 'LIMITED',
    colors: ['#111827', '#a855f7'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.8,
    reviews: 52,
    material: 'Brushed Fleece',
    fit: 'Relaxed',
    tags: ['Hoodie', 'Limited Drop'],
    description: 'Heavyweight hoodie for cool days and bold fits.',
    offerType: 'best-seller',
    created_at: '2026-03-30T15:45:00.000Z',
  },
  {
    id: 105,
    name: 'Street Polo Classic',
    category: 'polo',
    subCategory: 'Polo',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 1799,
    discountPrice: 1399,
    badge: 'NEW',
    colors: ['#0f172a', '#2563eb', '#f97316'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.3,
    reviews: 38,
    material: 'Pique Cotton',
    fit: 'Tailored',
    tags: ['Polo', 'Smart Casual'],
    description: 'A modern polo designed for premium everyday styling.',
    offerType: 'featured',
    created_at: '2026-03-16T12:20:00.000Z',
  },
  {
    id: 106,
    name: 'Graffiti Burst Tee',
    category: 'graphic-tees',
    subCategory: 'Graphic Tees',
    image: '/Yolo.png',
    images: ['/Yolo.png', '/Yolo.png'],
    price: 1699,
    discountPrice: 1299,
    badge: 'HOT',
    colors: ['#111827', '#14b8a6', '#ec4899'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.6,
    reviews: 84,
    material: 'Premium Cotton',
    fit: 'Boxy',
    tags: ['Graphic', 'Street'],
    description: 'Statement-making front print with a bold street edge.',
    offerType: 'buy-1-get-1',
    created_at: '2026-03-27T10:00:00.000Z',
  },
  {
    id: 107,
    name: 'Limited Flame Tee',
    category: 'limited-drops',
    subCategory: 'Limited Drops',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 1899,
    discountPrice: 1499,
    badge: 'DROP',
    colors: ['#111827', '#dc2626'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.9,
    reviews: 71,
    material: 'Bio-Washed Cotton',
    fit: 'Oversized',
    tags: ['Limited', 'Drop', 'Exclusive'],
    description: 'Limited-run release with elevated detailing.',
    offerType: 'best-seller',
    created_at: '2026-04-01T06:30:00.000Z',
  },
  {
    id: 108,
    name: 'Sandstone Oversized Tee',
    category: 'oversized',
    subCategory: 'Oversized',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 1499,
    discountPrice: 1099,
    badge: 'BEST SELLER',
    colors: ['#78716c', '#f4d06f', '#0f172a'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.5,
    reviews: 93,
    material: 'Heavy Cotton',
    fit: 'Oversized',
    tags: ['Oversized', 'Core'],
    description: 'Neutral oversized tee with premium fabric feel.',
    offerType: 'best-seller',
    created_at: '2026-03-11T13:55:00.000Z',
  },
  {
    id: 109,
    name: 'Monochrome Polo',
    category: 'polo',
    subCategory: 'Polo',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 1699,
    discountPrice: 1299,
    badge: 'SMART',
    colors: ['#111827', '#f8fafc'],
    sizes: ['S', 'M', 'L', 'XL'],
    rating: 4.2,
    reviews: 26,
    material: 'Cotton Pique',
    fit: 'Regular',
    tags: ['Polo'],
    description: 'Clean monochrome polo built for polished casual wear.',
    offerType: 'featured',
    created_at: '2026-03-08T09:05:00.000Z',
  },
  {
    id: 110,
    name: 'Urban Plain Tee',
    category: 'plain-essentials',
    subCategory: 'Plain Essentials',
    image: '/Yolo.png',
    images: ['/Yolo.png'],
    price: 1099,
    discountPrice: 849,
    badge: 'VALUE',
    colors: ['#111827', '#f8fafc', '#84cc16'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    rating: 4.3,
    reviews: 41,
    material: 'Ring-Spun Cotton',
    fit: 'Regular',
    tags: ['Plain', 'Everyday'],
    description: 'Reliable everyday plain tee with a premium hand feel.',
    offerType: 'buy-1-get-1',
    created_at: '2026-03-18T16:15:00.000Z',
  },
]

const COMBO_OFFERS = [
  {
    id: 201,
    name: 'Street Duo Combo',
    pick_count: 2,
    combo_price: 1899,
    original_price: 2798,
    badge_text: 'PICK ANY 2',
    image_urls: ['/Yolo.png', '/Yolo.png'],
    colors: ['#111827', '#2563eb', '#e11d48', '#f59e0b'],
    sizes: ['S', 'M', 'L', 'XL'],
    material: '100% Cotton',
    fit: 'Oversized',
    description: 'Pick any two colors and sizes from our best-selling tees.',
    is_couple_offer: false,
  },
  {
    id: 202,
    name: 'His & Hers Couple Combo',
    pick_count: 2,
    combo_price: 2299,
    original_price: 3198,
    badge_text: 'COUPLE',
    image_urls: ['/Yolo.png'],
    men_colors: ['#111827', '#2563eb', '#f97316'],
    women_colors: ['#ec4899', '#8b5cf6', '#f43f5e'],
    men_sizes: ['M', 'L', 'XL'],
    women_sizes: ['S', 'M', 'L'],
    material: 'Premium Cotton',
    fit: 'Regular',
    description: 'A matching couple set with separate men and women size/color picks.',
    is_couple_offer: true,
  },
]

const OFFER_SETTINGS = {
  'best-seller': {
    enabled: true,
    label: 'Best Seller',
    description: 'Top-rated products customers keep coming back for.',
    sort_order: 1,
    end_time: null,
  },
  'buy-1-get-1': {
    enabled: true,
    label: 'Buy 1 Get 1',
    description: 'Choose one, get one free on selected products.',
    sort_order: 2,
    end_time: null,
  },
}

const HERO_SLIDES = [
  {
    id: 1,
    image_url: '/Yolo.png',
    title: 'WEAR BOLD.\nLIVE FREE.',
    subtitle: 'Mock storefront with local data only.',
    button_text: 'Shop Mock Products',
    button_link: '/products',
  },
  {
    id: 2,
    image_url: '/Yolo.png',
    title: 'BEST SELLERS\nREADY TO SHIP',
    subtitle: 'No backend required. Everything runs locally.',
    button_text: 'View Best Sellers',
    button_link: '/offers?type=best-seller',
  },
  {
    id: 3,
    image_url: '/Yolo.png',
    title: 'DOUBLE THE STYLE',
    subtitle: 'Explore Buy 1 Get 1 offers in mock mode.',
    button_text: 'Claim Offer',
    button_link: '/offers?type=buy-1-get-1',
  },
]

const ANNOUNCEMENT = {
  enabled: true,
  text: 'MOCK MODE ACTIVE  |  NO BACKEND CONNECTION  |  ALL DATA IS LOCAL',
}

const STORE_SETTINGS = {
  shipping_price: 79,
  free_shipping_threshold: 1499,
}

const DEFAULT_PRODUCT_REVIEWS = {
  101: [
    {
      id: 9001,
      user_id: 1,
      user_name: 'Demo User',
      rating: 5,
      description: 'Loved the fit and fabric quality.',
      created_at: '2026-03-25T09:00:00.000Z',
    },
  ],
}

const DEFAULT_COMBO_REVIEWS = {
  201: [
    {
      id: 9101,
      user_id: 1,
      user_name: 'Demo User',
      rating: 5,
      description: 'Great value combo and smooth checkout.',
      created_at: '2026-03-26T13:30:00.000Z',
    },
  ],
}

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@yolo.com',
    phone: '+919500433564',
    password: 'Password@123',
    verified: true,
    address: '22 Fashion Street, Sivakasi',
  },
]

const DEFAULT_ADDRESS_BOOK = {
  1: [
    {
      id: 1,
      label: 'Home',
      name: 'Demo User',
      phone: '+919500433564',
      address_line: '22 Fashion Street',
      city: 'Sivakasi',
      state: 'Tamil Nadu',
      pincode: '626123',
      is_default: true,
    },
  ],
}

const DEFAULT_ORDERS = [
  {
    id: 1001,
    user_order_number: 1001,
    user_id: 1,
    email: 'demo@yolo.com',
    created_at: '2026-03-29T11:45:00.000Z',
    status: 'delivered',
    subtotal: 1999,
    shipping: 0,
    discount: 0,
    total_price: 1999,
    payment_method: 'upi',
    payment_reference: 'PAY-DEMO-1001',
    shipping_address: '22 Fashion Street, Sivakasi, Tamil Nadu, 626123',
    items: [
      {
        id: 5001,
        product_id: 104,
        product_name: 'Midnight Drop Hoodie',
        product_image: '/Yolo.png',
        selected_size: 'L',
        selected_color: '#111827',
        quantity: 1,
        price: 1999,
      },
    ],
  },
]

const DEFAULT_IDS = {
  user: 1,
  address: 1,
  order: 1001,
  orderItem: 5001,
  review: 9101,
}

const memoryStore = new Map()

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const readRaw = (key) => {
  if (canUseStorage()) return window.localStorage.getItem(key)
  return memoryStore.has(key) ? memoryStore.get(key) : null
}

const writeRaw = (key, value) => {
  if (canUseStorage()) {
    window.localStorage.setItem(key, value)
    return
  }
  memoryStore.set(key, value)
}

const clone = (value) => {
  if (typeof structuredClone === 'function') return structuredClone(value)
  return JSON.parse(JSON.stringify(value))
}

const readStore = (key, fallback) => {
  const raw = readRaw(key)
  if (!raw) return clone(fallback)
  try {
    return JSON.parse(raw)
  } catch {
    return clone(fallback)
  }
}

const writeStore = (key, value) => {
  writeRaw(key, JSON.stringify(value))
}

const initStore = (key, fallback) => {
  if (readRaw(key) === null) {
    writeStore(key, fallback)
  }
}

const ensureSeedData = () => {
  initStore(STORAGE_KEYS.users, DEFAULT_USERS)
  initStore(STORAGE_KEYS.addressBook, DEFAULT_ADDRESS_BOOK)
  initStore(STORAGE_KEYS.orders, DEFAULT_ORDERS)
  initStore(STORAGE_KEYS.productReviews, DEFAULT_PRODUCT_REVIEWS)
  initStore(STORAGE_KEYS.comboReviews, DEFAULT_COMBO_REVIEWS)
  initStore(STORAGE_KEYS.ids, DEFAULT_IDS)
}

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100
const nowIso = () => new Date().toISOString()
const wait = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms))

const throwHttpError = (status, message) => {
  const err = new Error(message)
  err.status = status
  throw err
}

const parseBody = (body) => {
  if (!body) return {}
  if (typeof body === 'string') {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  if (typeof body === 'object') return body
  return {}
}

const normalizeEmail = (value = '') => String(value).trim().toLowerCase()

const parseTokenUserId = (token) => {
  if (!token) return null
  const parts = String(token).split('.')
  if (parts.length < 3) return null
  const maybeId = Number(parts[1])
  return Number.isInteger(maybeId) ? maybeId : null
}

const parseAuthToken = (headers = {}) => {
  const auth = headers.Authorization || headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  return auth.slice(7).trim()
}

const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
})

const getUsers = () => readStore(STORAGE_KEYS.users, DEFAULT_USERS)
const saveUsers = (users) => writeStore(STORAGE_KEYS.users, users)

const getAddressBook = () => readStore(STORAGE_KEYS.addressBook, DEFAULT_ADDRESS_BOOK)
const saveAddressBook = (addressBook) => writeStore(STORAGE_KEYS.addressBook, addressBook)

const getOrders = () => readStore(STORAGE_KEYS.orders, DEFAULT_ORDERS)
const saveOrders = (orders) => writeStore(STORAGE_KEYS.orders, orders)

const getProductReviews = () => readStore(STORAGE_KEYS.productReviews, DEFAULT_PRODUCT_REVIEWS)
const saveProductReviews = (reviews) => writeStore(STORAGE_KEYS.productReviews, reviews)

const getComboReviews = () => readStore(STORAGE_KEYS.comboReviews, DEFAULT_COMBO_REVIEWS)
const saveComboReviews = (reviews) => writeStore(STORAGE_KEYS.comboReviews, reviews)

const getIds = () => readStore(STORAGE_KEYS.ids, DEFAULT_IDS)
const saveIds = (ids) => writeStore(STORAGE_KEYS.ids, ids)

const nextId = (key) => {
  const ids = getIds()
  const nextValue = (ids[key] || 0) + 1
  ids[key] = nextValue
  saveIds(ids)
  return nextValue
}

const makeAccessToken = (userId) => `mock.${userId}.token`
const makeRefreshToken = (userId) => `refresh.${userId}.token`

const getAuthedUser = (headers) => {
  const token = parseAuthToken(headers)
  const userId = parseTokenUserId(token)
  if (!userId) throwHttpError(401, 'Please sign in to continue.')
  const user = getUsers().find(entry => entry.id === userId)
  if (!user) throwHttpError(401, 'Session expired. Please sign in again.')
  return user
}

const toProduct = (product) => ({
  ...product,
  image: product.image || product.images?.[0] || '/Yolo.png',
})

const offerTypeMatch = (offerType, product) => {
  if (!offerType) return true
  if (offerType === 'bogo') return product.offerType === 'buy-1-get-1'
  return product.offerType === offerType
}

const searchProductCatalog = (searchParams) => {
  const category = searchParams.get('category') || 'all'
  const search = (searchParams.get('search') || '').trim().toLowerCase()
  const offerType = (searchParams.get('offerType') || '').trim()
  const sort = searchParams.get('sort') || 'default'
  const exclude = searchParams.get('exclude')
  const limitValue = Number(searchParams.get('limit') || 0)
  const maxPrice = Number(searchParams.get('maxPrice') || 0)

  let items = PRODUCTS.filter((product) => {
    if (category !== 'all' && product.category !== category) return false
    if (!offerTypeMatch(offerType, product)) return false
    if (exclude && String(product.id) === String(exclude)) return false
    if (Number.isFinite(maxPrice) && maxPrice > 0 && product.discountPrice > maxPrice) return false
    if (!search) return true
    const haystack = `${product.name} ${product.category} ${product.subCategory} ${product.description}`.toLowerCase()
    return haystack.includes(search)
  })

  if (sort === 'price-asc') items.sort((a, b) => a.discountPrice - b.discountPrice)
  if (sort === 'price-desc') items.sort((a, b) => b.discountPrice - a.discountPrice)
  if (sort === 'rating') items.sort((a, b) => b.rating - a.rating)
  if (sort === 'newest') items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

  if (Number.isFinite(limitValue) && limitValue > 0) {
    items = items.slice(0, limitValue)
  }

  return items.map(toProduct)
}

const buildCategoryCounts = () => PRODUCTS.reduce((acc, product) => {
  acc[product.category] = (acc[product.category] || 0) + 1
  return acc
}, {})

const getUserAddresses = (userId) => {
  const book = getAddressBook()
  return clone(book[userId] || [])
}

const setUserAddresses = (userId, addresses) => {
  const book = getAddressBook()
  book[userId] = addresses
  saveAddressBook(book)
}

export async function handleMockRequest(path, options = {}) {
  ensureSeedData()
  await wait()

  const method = (options.method || 'GET').toUpperCase()
  const headers = options.headers || {}
  const body = parseBody(options.body)
  const url = new URL(path, MOCK_ORIGIN)
  const pathname = url.pathname

  const productReviewMatch = pathname.match(/^\/api\/products\/([^/]+)\/reviews$/)
  if (productReviewMatch) {
    const productId = productReviewMatch[1]
    if (method === 'GET') {
      const reviewsByProduct = getProductReviews()
      return clone(reviewsByProduct[productId] || [])
    }
    if (method === 'POST') {
      const user = getAuthedUser(headers)
      if (!body.rating || !body.description) throwHttpError(400, 'Rating and review are required.')
      const reviewsByProduct = getProductReviews()
      const existing = reviewsByProduct[productId] || []
      const nextReview = {
        id: nextId('review'),
        user_id: user.id,
        user_name: user.name,
        rating: Number(body.rating),
        description: String(body.description).trim(),
        created_at: nowIso(),
      }
      reviewsByProduct[productId] = [nextReview, ...existing.filter(item => item.user_id !== user.id)]
      saveProductReviews(reviewsByProduct)
      return clone(nextReview)
    }
  }

  const comboReviewMatch = pathname.match(/^\/api\/combo-offers\/([^/]+)\/reviews$/)
  if (comboReviewMatch) {
    const comboId = comboReviewMatch[1]
    if (method === 'GET') {
      const reviewsByCombo = getComboReviews()
      return clone(reviewsByCombo[comboId] || [])
    }
    if (method === 'POST') {
      const user = getAuthedUser(headers)
      if (!body.rating || !body.description) throwHttpError(400, 'Rating and review are required.')
      const reviewsByCombo = getComboReviews()
      const existing = reviewsByCombo[comboId] || []
      const nextReview = {
        id: nextId('review'),
        user_id: user.id,
        user_name: user.name,
        rating: Number(body.rating),
        description: String(body.description).trim(),
        created_at: nowIso(),
      }
      reviewsByCombo[comboId] = [nextReview, ...existing.filter(item => item.user_id !== user.id)]
      saveComboReviews(reviewsByCombo)
      return clone(nextReview)
    }
  }

  if (method === 'GET' && pathname === '/api/products') {
    return clone(searchProductCatalog(url.searchParams))
  }

  const productMatch = pathname.match(/^\/api\/products\/([^/]+)$/)
  if (method === 'GET' && productMatch) {
    const product = PRODUCTS.find(item => String(item.id) === String(productMatch[1]))
    if (!product) throwHttpError(404, 'Product not found.')
    return clone(toProduct(product))
  }

  if (method === 'GET' && pathname === '/api/categories') {
    return clone(CATEGORY_LIST)
  }

  if (method === 'GET' && pathname === '/api/categories/counts') {
    return clone(buildCategoryCounts())
  }

  if (method === 'GET' && pathname === '/api/offers/settings') {
    return clone(OFFER_SETTINGS)
  }

  if (method === 'GET' && pathname === '/api/hero-slides') {
    return clone(HERO_SLIDES)
  }

  if (method === 'GET' && pathname === '/api/announcement') {
    return clone(ANNOUNCEMENT)
  }

  if (method === 'GET' && pathname === '/api/homepage-data') {
    const bestSellers = searchProductCatalog(new URLSearchParams('offerType=best-seller&limit=4'))
    const bogo = searchProductCatalog(new URLSearchParams('offerType=buy-1-get-1&limit=4'))
    return clone({
      hero_slides: HERO_SLIDES,
      best_sellers: bestSellers,
      bogo_products: bogo,
      offer_settings: OFFER_SETTINGS,
      combo_offers: COMBO_OFFERS,
    })
  }

  if (method === 'GET' && pathname === '/api/combo-offers') {
    return clone(COMBO_OFFERS)
  }

  const comboMatch = pathname.match(/^\/api\/combo-offers\/([^/]+)$/)
  if (method === 'GET' && comboMatch) {
    const combo = COMBO_OFFERS.find(item => String(item.id) === String(comboMatch[1]))
    if (!combo) throwHttpError(404, 'Combo offer not found.')
    return clone(combo)
  }

  if (method === 'GET' && pathname === '/api/store-settings') {
    return clone(STORE_SETTINGS)
  }

  if (method === 'POST' && pathname === '/api/contact') {
    if (!body.name || !body.email || !body.subject || !body.message) {
      throwHttpError(400, 'Please complete all contact form fields.')
    }
    return { success: true, message: 'Thanks! Your message has been received.' }
  }

  if (method === 'POST' && pathname === '/api/newsletter') {
    if (!body.email) throwHttpError(400, 'Email is required.')
    return { success: true, message: 'Subscribed successfully.' }
  }

  if (method === 'POST' && pathname === '/api/auth/register') {
    const email = normalizeEmail(body.email)
    if (!body.name || !email || !body.password) throwHttpError(400, 'Missing required fields.')
    const users = getUsers()
    if (users.some(user => normalizeEmail(user.email) === email)) {
      throwHttpError(409, 'An account with this email already exists.')
    }
    const created = {
      id: nextId('user'),
      name: String(body.name).trim(),
      email,
      phone: String(body.phone || '').trim(),
      password: String(body.password),
      verified: false,
      address: '',
    }
    users.push(created)
    saveUsers(users)
    return {
      requires_verification: true,
      message: 'Verification code sent. Use any 6-digit code in mock mode.',
    }
  }

  if (method === 'POST' && pathname === '/api/auth/verify-email') {
    const email = normalizeEmail(body.email)
    const users = getUsers()
    const user = users.find(entry => normalizeEmail(entry.email) === email)
    if (!user) throwHttpError(404, 'Account not found for this email.')
    user.verified = true
    saveUsers(users)
    return {
      access_token: makeAccessToken(user.id),
      refresh_token: makeRefreshToken(user.id),
      user: publicUser(user),
    }
  }

  if (method === 'POST' && pathname === '/api/auth/resend-verification') {
    return { message: 'Verification code resent. Use any 6-digit code in mock mode.' }
  }

  if (method === 'POST' && pathname === '/api/auth/login') {
    const email = normalizeEmail(body.email)
    const password = String(body.password || '')
    const users = getUsers()
    const user = users.find(entry => normalizeEmail(entry.email) === email)
    if (!user || user.password !== password) {
      throwHttpError(401, 'Incorrect email or password. Please try again.')
    }
    if (!user.verified) {
      throwHttpError(403, 'Please verify your email before signing in.')
    }
    return {
      access_token: makeAccessToken(user.id),
      refresh_token: makeRefreshToken(user.id),
      user: publicUser(user),
    }
  }

  if (method === 'POST' && pathname === '/api/auth/refresh') {
    const refreshToken = body.refresh_token || parseAuthToken(headers)
    const userId = parseTokenUserId(refreshToken)
    const users = getUsers()
    const user = users.find(entry => entry.id === userId) || users[0]
    if (!user) throwHttpError(401, 'Unable to refresh session.')
    return {
      access_token: makeAccessToken(user.id),
      refresh_token: makeRefreshToken(user.id),
      user: publicUser(user),
    }
  }

  if (method === 'POST' && pathname === '/api/auth/logout') {
    return { success: true }
  }

  if (method === 'POST' && pathname === '/api/auth/forgot-password') {
    if (!body.identifier) throwHttpError(400, 'Identifier is required.')
    return { message: 'OTP sent. Use 123456 in mock mode.' }
  }

  if (method === 'POST' && pathname === '/api/auth/verify-otp') {
    if (String(body.otp_code || '') !== '123456') {
      throwHttpError(400, 'Invalid OTP. Use 123456 in mock mode.')
    }
    return { success: true, message: 'OTP verified.' }
  }

  if (method === 'POST' && pathname === '/api/auth/reset-password') {
    if (String(body.otp_code || '') !== '123456') {
      throwHttpError(400, 'Invalid OTP. Use 123456 in mock mode.')
    }
    const users = getUsers()
    const email = normalizeEmail(body.identifier)
    const user = users.find(entry => normalizeEmail(entry.email) === email)
    if (user) {
      user.password = String(body.new_password || user.password)
      saveUsers(users)
    }
    return { success: true, message: 'Password reset successful.' }
  }

  if (method === 'GET' && pathname === '/api/auth/profile') {
    const user = getAuthedUser(headers)
    return clone(publicUser(user))
  }

  if (method === 'GET' && pathname === '/api/auth/profile-data') {
    const user = getAuthedUser(headers)
    return {
      profile: {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      },
      addresses: getUserAddresses(user.id),
    }
  }

  if (method === 'PUT' && pathname === '/api/auth/profile') {
    const user = getAuthedUser(headers)
    const users = getUsers()
    const target = users.find(entry => entry.id === user.id)
    if (!target) throwHttpError(404, 'User not found.')
    target.name = body.name ?? target.name
    target.phone = body.phone ?? target.phone
    target.address = body.address ?? target.address
    saveUsers(users)
    return clone({
      name: target.name,
      email: target.email,
      phone: target.phone,
      address: target.address,
    })
  }

  if (method === 'GET' && pathname === '/api/auth/addresses') {
    const user = getAuthedUser(headers)
    return getUserAddresses(user.id)
  }

  if (method === 'POST' && pathname === '/api/auth/addresses') {
    const user = getAuthedUser(headers)
    if (!body.name || !body.phone || !body.address_line || !body.city || !body.pincode) {
      throwHttpError(400, 'Please fill all required address fields.')
    }
    const addresses = getUserAddresses(user.id)
    const nextAddress = {
      id: nextId('address'),
      label: body.label || 'Home',
      name: String(body.name).trim(),
      phone: String(body.phone).trim(),
      address_line: String(body.address_line).trim(),
      city: String(body.city).trim(),
      state: String(body.state || '').trim(),
      pincode: String(body.pincode).trim(),
      is_default: Boolean(body.is_default) || addresses.length === 0,
    }
    const normalized = nextAddress.is_default
      ? addresses.map(item => ({ ...item, is_default: false })).concat(nextAddress)
      : addresses.concat(nextAddress)
    setUserAddresses(user.id, normalized)
    return clone(nextAddress)
  }

  const addressMatch = pathname.match(/^\/api\/auth\/addresses\/([^/]+)$/)
  if (addressMatch) {
    const addressId = Number(addressMatch[1])
    const user = getAuthedUser(headers)
    const addresses = getUserAddresses(user.id)
    const index = addresses.findIndex(item => item.id === addressId)
    if (index === -1) throwHttpError(404, 'Address not found.')

    if (method === 'PUT') {
      const updated = {
        ...addresses[index],
        ...body,
        id: addressId,
      }
      let nextAddresses = addresses.map(item => (item.id === addressId ? updated : item))
      if (updated.is_default) {
        nextAddresses = nextAddresses.map(item => ({
          ...item,
          is_default: item.id === addressId,
        }))
      }
      setUserAddresses(user.id, nextAddresses)
      return clone(updated)
    }

    if (method === 'DELETE') {
      const nextAddresses = addresses.filter(item => item.id !== addressId)
      if (nextAddresses.length > 0 && !nextAddresses.some(item => item.is_default)) {
        nextAddresses[0] = { ...nextAddresses[0], is_default: true }
      }
      setUserAddresses(user.id, nextAddresses)
      return { success: true }
    }
  }

  const defaultAddressMatch = pathname.match(/^\/api\/auth\/addresses\/([^/]+)\/default$/)
  if (defaultAddressMatch && method === 'PATCH') {
    const addressId = Number(defaultAddressMatch[1])
    const user = getAuthedUser(headers)
    const addresses = getUserAddresses(user.id)
    if (!addresses.some(item => item.id === addressId)) throwHttpError(404, 'Address not found.')
    const nextAddresses = addresses.map(item => ({
      ...item,
      is_default: item.id === addressId,
    }))
    setUserAddresses(user.id, nextAddresses)
    return { success: true }
  }

  if (method === 'GET' && pathname === '/api/auth/my-orders') {
    const user = getAuthedUser(headers)
    const orders = getOrders()
      .filter(order => order.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return clone(orders)
  }

  const cancelOrderMatch = pathname.match(/^\/api\/auth\/my-orders\/([^/]+)\/cancel$/)
  if (cancelOrderMatch && method === 'POST') {
    const user = getAuthedUser(headers)
    const orderId = Number(cancelOrderMatch[1])
    const orders = getOrders()
    const target = orders.find(order => order.id === orderId && order.user_id === user.id)
    if (!target) throwHttpError(404, 'Order not found.')
    if (target.status === 'packed' || target.status === 'shipped' || target.status === 'delivered') {
      throwHttpError(400, 'This order can no longer be cancelled.')
    }
    target.status = 'cancelled'
    saveOrders(orders)
    return { success: true, status: 'cancelled' }
  }

  const updateOrderAddressMatch = pathname.match(/^\/api\/auth\/my-orders\/([^/]+)\/address$/)
  if (updateOrderAddressMatch && method === 'PATCH') {
    const user = getAuthedUser(headers)
    const orderId = Number(updateOrderAddressMatch[1])
    const orders = getOrders()
    const target = orders.find(order => order.id === orderId && order.user_id === user.id)
    if (!target) throwHttpError(404, 'Order not found.')
    if (!body.shipping_address || !String(body.shipping_address).trim()) {
      throwHttpError(400, 'Shipping address is required.')
    }
    if (target.status !== 'pending' && target.status !== 'paid') {
      throwHttpError(400, 'Address can only be updated before packing.')
    }
    target.shipping_address = String(body.shipping_address).trim()
    saveOrders(orders)
    return clone(target)
  }

  if (method === 'GET' && pathname === '/api/orders/track') {
    const orderId = Number(url.searchParams.get('order_id'))
    const email = normalizeEmail(url.searchParams.get('email'))
    const order = getOrders().find(item => item.id === orderId && normalizeEmail(item.email) === email)
    if (!order) throwHttpError(404, 'Order not found.')
    return clone(order)
  }

  if (method === 'POST' && pathname === '/api/payment/create-order') {
    const amount = Number(body.amount || 0)
    if (!Number.isFinite(amount) || amount <= 0) throwHttpError(400, 'Amount must be greater than zero.')
    return {
      order_id: `order_mock_${Date.now()}`,
      amount: Math.round(amount * 100),
      currency: 'INR',
      key_id: 'rzp_mock_key',
    }
  }

  if (method === 'POST' && pathname === '/api/payment/verify-payment') {
    return {
      success: true,
      payment_reference: body.razorpay_payment_id || `pay_mock_${Date.now()}`,
    }
  }

  const upiStatusMatch = pathname.match(/^\/api\/payment\/upi-status\/([^/]+)$/)
  if (upiStatusMatch && method === 'GET') {
    return {
      status: 'paid',
      payment_id: `pay_${upiStatusMatch[1]}`,
    }
  }

  if (method === 'POST' && pathname === '/api/checkout') {
    const user = getAuthedUser(headers)
    const incomingItems = Array.isArray(body.items) ? body.items : []
    const incomingCombos = Array.isArray(body.combo_items) ? body.combo_items : []
    if (incomingItems.length === 0 && incomingCombos.length === 0) {
      throwHttpError(400, 'Your cart is empty.')
    }
    if (!body.shipping_address) throwHttpError(400, 'Shipping address is required.')

    const orderItems = []
    let subtotal = 0

    incomingItems.forEach((item) => {
      const product = PRODUCTS.find(entry => String(entry.id) === String(item.product_id))
      if (!product) throwHttpError(400, `Product ${item.product_id} not found.`)
      const quantity = Math.max(1, Number(item.quantity || 1))
      const unitPrice = Number(product.discountPrice || product.price || 0)
      subtotal += unitPrice * quantity
      orderItems.push({
        id: nextId('orderItem'),
        product_id: product.id,
        product_name: product.name,
        product_image: product.image || '/Yolo.png',
        selected_size: item.selected_size || '',
        selected_color: item.selected_color || '',
        quantity,
        price: unitPrice,
      })
    })

    incomingCombos.forEach((comboItem) => {
      const combo = COMBO_OFFERS.find(entry => String(entry.id) === String(comboItem.combo_offer_id))
      const comboPrice = Number(comboItem.combo_price || combo?.combo_price || 0)
      const firstSelection = Array.isArray(comboItem.selections) ? comboItem.selections[0] : null
      subtotal += comboPrice
      orderItems.push({
        id: nextId('orderItem'),
        product_id: `combo-${comboItem.combo_offer_id}`,
        product_name: comboItem.combo_name || combo?.name || 'Combo Offer',
        product_image: combo?.image_urls?.[0] || '/Yolo.png',
        selected_size: firstSelection?.selected_size || '',
        selected_color: firstSelection?.selected_color || '',
        quantity: 1,
        price: comboPrice,
      })
    })

    subtotal = roundMoney(subtotal)
    const shipping = subtotal >= STORE_SETTINGS.free_shipping_threshold ? 0 : STORE_SETTINGS.shipping_price
    const total = roundMoney(subtotal + shipping)
    const orderId = nextId('order')
    const paymentReference = body.razorpay_payment_id || `PAY-${orderId}`

    const order = {
      id: orderId,
      user_order_number: orderId,
      user_id: user.id,
      email: user.email,
      created_at: nowIso(),
      status: body.payment_method === 'upi' ? 'paid' : 'pending',
      subtotal,
      shipping,
      discount: 0,
      total_price: total,
      payment_method: body.payment_method || 'cod',
      payment_reference: paymentReference,
      shipping_address: String(body.shipping_address).trim(),
      items: orderItems,
    }

    const orders = getOrders()
    orders.unshift(order)
    saveOrders(orders)

    return {
      order_id: orderId,
      subtotal,
      shipping,
      discount: 0,
      total,
      payment_reference: paymentReference,
    }
  }

  throwHttpError(404, `Mock endpoint not found: ${method} ${pathname}`)
}
