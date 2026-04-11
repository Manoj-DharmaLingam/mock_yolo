const STORAGE_KEY = 'yolo_admin_mock_store_v1'
const now = Date.now()

const deepClone = (value) => JSON.parse(JSON.stringify(value))
const wait = (ms = 90) => new Promise((resolve) => setTimeout(resolve, ms))

const mockImage = (seed) => `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1100">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <rect width="900" height="1100" fill="url(#g)" />
    <text x="50%" y="48%" fill="#f8fafc" font-size="78" font-family="Arial, sans-serif" text-anchor="middle">YOLO ADMIN</text>
    <text x="50%" y="56%" fill="#9ca3af" font-size="28" font-family="Arial, sans-serif" text-anchor="middle">${seed}</text>
  </svg>`
)}`

const DEFAULT_STORE = {
  nextIds: {
    product: 1001,
    order: 3001,
    heroSlide: 101,
    combo: 501,
    offer: 1,
  },
  admin: {
    id: 1,
    username: 'admin',
    password: 'admin123',
    name: 'YOLO Admin',
  },
  products: [
    {
      id: 901,
      name: 'Street Signal Tee',
      description: 'Heavyweight graphic tee with oversized street print.',
      price: 1299,
      discountPrice: 899,
      category: 'graphic-tees',
      subCategory: 'Graphic',
      stock: 42,
      available: true,
      badge: 'Bestseller',
      material: '100% Cotton 220GSM',
      fit: 'Regular Fit',
      rating: 4.7,
      reviews: 128,
      isBestSeller: true,
      isBogo: true,
      offerType: 'buy-1-get-1',
      offerEndTime: null,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#111111', '#f5f5f5', '#1d4ed8'],
      tags: ['streetwear', 'graphic'],
      image: mockImage('street-signal'),
      images: [mockImage('street-signal'), mockImage('street-signal-2')],
      created_at: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 902,
      name: 'Neon Drift Oversized Tee',
      description: 'Dropped-shoulder oversized silhouette for all-day comfort.',
      price: 1499,
      discountPrice: 1099,
      category: 'oversized',
      subCategory: 'Oversized',
      stock: 31,
      available: true,
      badge: 'Trending',
      material: '100% Cotton 220GSM',
      fit: 'Oversized Fit',
      rating: 4.5,
      reviews: 74,
      isBestSeller: true,
      isBogo: false,
      offerType: 'best-seller',
      offerEndTime: null,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#0f172a', '#f59e0b', '#ef4444'],
      tags: ['oversized', 'new-drop'],
      image: mockImage('neon-drift'),
      images: [mockImage('neon-drift'), mockImage('neon-drift-2')],
      created_at: new Date(now - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 903,
      name: 'Core Plain Essential',
      description: 'Minimal plain essential with premium finish.',
      price: 999,
      discountPrice: 749,
      category: 'plain-essentials',
      subCategory: 'Plain',
      stock: 58,
      available: true,
      badge: '',
      material: '100% Cotton 180GSM',
      fit: 'Regular Fit',
      rating: 4.4,
      reviews: 52,
      isBestSeller: false,
      isBogo: true,
      offerType: 'buy-1-get-1',
      offerEndTime: null,
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#111111', '#ffffff', '#10b981'],
      tags: ['plain', 'daily'],
      image: mockImage('core-plain'),
      images: [mockImage('core-plain'), mockImage('core-plain-2')],
      created_at: new Date(now - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
  ],
  orders: [
    {
      id: 3001,
      user_order_number: 3001,
      customer_name: 'Demo Shopper',
      customer_email: 'demo@yolo.mock',
      customer_phone: '9876543210',
      shipping_address: '12, Market Street, Chennai, Tamil Nadu, 600001',
      status: 'pending',
      payment_status: 'pending',
      payment_method: 'cod',
      payment_reference: 'COD-3001',
      total_price: 1999,
      created_at: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      items: [
        {
          id: 1,
          product_name: 'Street Signal Tee',
          product_image: mockImage('street-signal'),
          quantity: 1,
          price: 666,
          selected_size: 'M',
          selected_color: '#111111',
          combo_offer_id: 501,
          combo_offer_name: 'Pick Any 3 Street Tees',
          combo_item_index: 0,
          is_couple_offer: false,
        },
        {
          id: 2,
          product_name: 'Neon Drift Oversized Tee',
          product_image: mockImage('neon-drift'),
          quantity: 1,
          price: 666,
          selected_size: 'L',
          selected_color: '#0f172a',
          combo_offer_id: 501,
          combo_offer_name: 'Pick Any 3 Street Tees',
          combo_item_index: 1,
          is_couple_offer: false,
        },
        {
          id: 3,
          product_name: 'Core Plain Essential',
          product_image: mockImage('core-plain'),
          quantity: 1,
          price: 667,
          selected_size: 'S',
          selected_color: '#ffffff',
          combo_offer_id: 501,
          combo_offer_name: 'Pick Any 3 Street Tees',
          combo_item_index: 2,
          is_couple_offer: false,
        },
      ],
    },
    {
      id: 3002,
      user_order_number: 3002,
      customer_name: 'Priya',
      customer_email: 'priya@example.com',
      customer_phone: '9123456789',
      shipping_address: '221, Lake Road, Coimbatore, Tamil Nadu, 641001',
      status: 'delivered',
      payment_status: 'paid',
      payment_method: 'upi',
      payment_reference: 'pay_mock_3002',
      total_price: 2198,
      created_at: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
      items: [
        {
          id: 4,
          product_name: 'Neon Drift Oversized Tee',
          product_image: mockImage('neon-drift'),
          quantity: 2,
          price: 1099,
          selected_size: 'M',
          selected_color: '#ef4444',
        },
      ],
    },
  ],
  storeSettings: {
    shipping_price: 79,
    free_shipping_threshold: 1499,
    offer_discount: 0,
  },
  announcement: {
    text: 'FREE SHIPPING ON ORDERS ABOVE ₹1499 | USE CODE YOLO10 FOR 10% OFF',
    enabled: true,
  },
  offers: [
    {
      offer_key: 'best-seller',
      label: 'Best Seller',
      description: 'Top-performing styles.',
      enabled: true,
      sort_order: 0,
      end_time: null,
      is_builtin: true,
    },
    {
      offer_key: 'buy-1-get-1',
      label: 'Buy 1 Get 1',
      description: 'Buy one and get one free.',
      enabled: true,
      sort_order: 1,
      end_time: new Date(now + 1000 * 60 * 60 * 24 * 10).toISOString(),
      is_builtin: true,
    },
    {
      offer_key: 'summer-drop',
      label: 'Summer Drop',
      description: 'Fresh seasonal arrivals.',
      enabled: true,
      sort_order: 2,
      end_time: null,
      is_builtin: false,
    },
  ],
  categories: [
    { key: 'graphic-tees', label: 'Graphic Tees', sort_order: 0, visible: true },
    { key: 'oversized', label: 'Oversized', sort_order: 1, visible: true },
    { key: 'plain-essentials', label: 'Plain Essentials', sort_order: 2, visible: true },
    { key: 'limited-drops', label: 'Limited Drops', sort_order: 3, visible: true },
    { key: 'hoodies', label: 'Hoodies', sort_order: 4, visible: true },
    { key: 'polo', label: 'Polo', sort_order: 5, visible: true },
  ],
  heroSlides: [
    {
      id: 101,
      image_url: mockImage('hero-1'),
      title: 'WEAR BOLD.\nLIVE FREE.',
      subtitle: 'Premium streetwear tees built for daily grind.',
      button_text: 'Shop Now',
      button_link: '/products',
      sort_order: 0,
      active: true,
    },
    {
      id: 102,
      image_url: mockImage('hero-2'),
      title: 'LIMITED DROP',
      subtitle: 'New collection now live.',
      button_text: 'Explore',
      button_link: '/offers',
      sort_order: 1,
      active: true,
    },
  ],
  comboOffers: [
    {
      id: 501,
      name: 'Pick Any 3 Street Tees',
      description: 'Choose any 3 tees and save big.',
      pick_count: 3,
      combo_price: 1999,
      original_price: 2997,
      badge_text: 'PICK 3',
      image_urls: [mockImage('combo-pick-3')],
      category: 'combo-special',
      material: '100% Cotton 220GSM',
      fit: 'Regular Fit',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['#111111', '#f8fafc', '#1d4ed8', '#ef4444'],
      is_couple_offer: false,
      men_sizes: [],
      men_colors: [],
      women_sizes: [],
      women_colors: [],
      variant_stock: {},
      is_active: true,
    },
    {
      id: 502,
      name: 'His & Hers Weekend Combo',
      description: 'A couple combo with separate men and women options.',
      pick_count: 2,
      combo_price: 1799,
      original_price: 2598,
      badge_text: 'COUPLE',
      image_urls: [mockImage('combo-couple')],
      category: 'combo-special',
      material: '100% Cotton 220GSM',
      fit: 'Regular Fit',
      sizes: [],
      colors: [],
      is_couple_offer: true,
      men_sizes: ['M', 'L', 'XL'],
      men_colors: ['#111111', '#1d4ed8', '#6b7280'],
      women_sizes: ['S', 'M', 'L'],
      women_colors: ['#f472b6', '#111111', '#f8fafc'],
      variant_stock: {},
      is_active: true,
    },
  ],
  contentSections: {
    banner: {
      title: 'Wear Bold. Live Free.',
      subtitle: 'Mock homepage banner',
      description: 'This content is served from local mock data.',
      image_url: mockImage('content-banner'),
    },
    offers: {
      title: 'Special Offers',
      subtitle: 'Mock offers section',
      description: 'Toggle and edit this text in admin settings.',
      image_url: mockImage('content-offers'),
    },
    about: {
      title: 'About YOLO',
      subtitle: 'Mock story section',
      description: 'No backend calls are required for this content.',
      image_url: mockImage('content-about'),
    },
    footer: {
      title: 'Stay Connected',
      subtitle: '',
      description: 'Mock footer text',
      image_url: '',
    },
  },
}

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STORE))
      return deepClone(DEFAULT_STORE)
    }
    return { ...deepClone(DEFAULT_STORE), ...JSON.parse(raw) }
  } catch {
    return deepClone(DEFAULT_STORE)
  }
}

const writeStore = (store) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

const asAxiosError = (detail, status = 400) => ({
  response: { status, data: { detail } },
  message: detail,
})

const slugify = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)

const ensureOfferKey = (store, label) => {
  const base = slugify(label) || `offer-${store.nextIds.offer++}`
  let key = base
  let suffix = 1
  while (store.offers.some((offer) => offer.offer_key === key)) {
    key = `${base}-${suffix++}`
  }
  return key
}

const statusToPaymentStatus = (status) => {
  if (['paid', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(status)) return 'paid'
  if (status === 'cancelled') return 'cancelled'
  return 'pending'
}

const fromPayloadToProduct = (payload, existing = null) => {
  const images = payload.image_urls || payload.images || existing?.images || []
  const firstImage = images[0] || existing?.image || mockImage(`product-${Date.now()}`)
  return {
    id: existing?.id,
    name: payload.name || existing?.name || '',
    description: payload.description || existing?.description || '',
    price: Number(payload.price ?? existing?.price ?? 0),
    discountPrice: Number(payload.discount_price ?? payload.discountPrice ?? existing?.discountPrice ?? payload.price ?? 0),
    category: payload.category || existing?.category || '',
    subCategory: payload.sub_category ?? payload.subCategory ?? existing?.subCategory ?? '',
    stock: Number(payload.stock ?? existing?.stock ?? 0),
    available: payload.available ?? existing?.available ?? true,
    badge: payload.badge ?? existing?.badge ?? '',
    material: payload.material ?? existing?.material ?? '',
    fit: payload.fit ?? existing?.fit ?? '',
    rating: Number(payload.rating ?? existing?.rating ?? 0),
    reviews: Number(payload.reviews ?? existing?.reviews ?? 0),
    isBestSeller: payload.is_best_seller ?? payload.isBestSeller ?? existing?.isBestSeller ?? false,
    isBogo: payload.is_bogo ?? payload.isBogo ?? existing?.isBogo ?? false,
    offerType: payload.offer_type ?? payload.offerType ?? existing?.offerType ?? null,
    offerEndTime: payload.offer_end_time ?? payload.offerEndTime ?? existing?.offerEndTime ?? null,
    sizes: payload.sizes ?? existing?.sizes ?? [],
    colors: payload.colors ?? existing?.colors ?? [],
    tags: payload.tags ?? existing?.tags ?? [],
    image: firstImage,
    images,
    created_at: existing?.created_at || new Date().toISOString(),
  }
}

const action = async (handler) => {
  await wait()
  try {
    const data = handler()
    return { data: deepClone(data) }
  } catch (error) {
    if (error?.response) throw error
    throw asAxiosError(error.message || 'Something went wrong.', error.status || 500)
  }
}

// ── Auth ─────────────────────────────────────────────────────────────
export const adminLogin = (username, password) =>
  action(() => {
    const store = readStore()
    if (username !== store.admin.username || password !== store.admin.password) {
      throw asAxiosError('Invalid admin credentials.', 401)
    }
    return {
      access_token: 'admin.mock.token',
      admin: { id: store.admin.id, username: store.admin.username, name: store.admin.name },
    }
  })

// ── Dashboard ────────────────────────────────────────────────────────
export const getDashboard = () =>
  action(() => {
    const store = readStore()
    const totalRevenue = store.orders
      .filter((order) => ['paid', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status))
      .reduce((sum, order) => sum + (order.total_price || 0), 0)

    return {
      total_products: store.products.length,
      total_orders: store.orders.length,
      total_revenue: totalRevenue,
      recent_orders: [...store.orders]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8),
    }
  })

// ── Products ─────────────────────────────────────────────────────────
export const getAdminProducts = () =>
  action(() => readStore().products)

export const getProductById = (id) =>
  action(() => {
    const product = readStore().products.find((item) => item.id === Number(id))
    if (!product) throw asAxiosError('Product not found.', 404)
    return product
  })

export const createProduct = (payload) =>
  action(() => {
    const store = readStore()
    const product = fromPayloadToProduct(payload)
    product.id = store.nextIds.product++
    store.products.unshift(product)
    writeStore(store)
    return product
  })

export const updateProduct = (id, payload) =>
  action(() => {
    const store = readStore()
    const index = store.products.findIndex((item) => item.id === Number(id))
    if (index < 0) throw asAxiosError('Product not found.', 404)
    const updated = fromPayloadToProduct(payload, store.products[index])
    updated.id = Number(id)
    store.products[index] = updated
    writeStore(store)
    return updated
  })

export const deleteProduct = (id) =>
  action(() => {
    const store = readStore()
    const productId = Number(id)
    const product = store.products.find((item) => item.id === productId)
    if (!product) throw asAxiosError('Product not found.', 404)
    store.products = store.products.filter((item) => item.id !== productId)
    writeStore(store)
    return { ok: true }
  })

export const toggleProductAvailability = (id) =>
  action(() => {
    const store = readStore()
    const product = store.products.find((item) => item.id === Number(id))
    if (!product) throw asAxiosError('Product not found.', 404)
    product.available = !product.available
    writeStore(store)
    return { available: product.available }
  })

export const uploadImage = () =>
  action(() => ({ url: mockImage(`upload-${Date.now()}`) }))

export const bulkUploadProducts = () =>
  action(() => {
    const store = readStore()
    const createdProducts = []
    for (let i = 0; i < 3; i += 1) {
      const product = {
        id: store.nextIds.product++,
        name: `Bulk Mock Product ${store.nextIds.product}`,
        description: 'Created from mock bulk upload.',
        price: 1299,
        discountPrice: 899,
        category: 'graphic-tees',
        subCategory: 'Graphic',
        stock: 25,
        available: true,
        badge: '',
        material: '100% Cotton 220GSM',
        fit: 'Regular Fit',
        rating: 4.2,
        reviews: 0,
        isBestSeller: false,
        isBogo: false,
        offerType: null,
        offerEndTime: null,
        sizes: ['S', 'M', 'L'],
        colors: ['#111111', '#f8fafc'],
        tags: ['bulk-upload'],
        image: mockImage(`bulk-${Date.now()}-${i}`),
        images: [mockImage(`bulk-${Date.now()}-${i}`)],
        created_at: new Date().toISOString(),
      }
      store.products.unshift(product)
      createdProducts.push({ id: product.id, name: product.name })
    }
    writeStore(store)
    return {
      created: createdProducts.length,
      errors: 0,
      products: createdProducts,
      error_details: [],
    }
  })

// ── Orders ───────────────────────────────────────────────────────────
export const getAdminOrders = (status) =>
  action(() => {
    const store = readStore()
    const orders = status
      ? store.orders.filter((order) => order.status === status)
      : store.orders
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  })

export const getAdminOrderDetail = (id) =>
  action(() => {
    const order = readStore().orders.find((item) => item.id === Number(id))
    if (!order) throw asAxiosError('Order not found.', 404)
    return order
  })

export const updateOrderStatus = (id, status) =>
  action(() => {
    const store = readStore()
    const order = store.orders.find((item) => item.id === Number(id))
    if (!order) throw asAxiosError('Order not found.', 404)
    order.status = status
    order.payment_status = statusToPaymentStatus(status)
    writeStore(store)
    return order
  })

// ── Store settings ───────────────────────────────────────────────────
export const getStoreSettings = () =>
  action(() => readStore().storeSettings)

export const updateStoreSettings = (data) =>
  action(() => {
    const store = readStore()
    store.storeSettings = { ...store.storeSettings, ...data }
    writeStore(store)
    return store.storeSettings
  })

// ── Content ──────────────────────────────────────────────────────────
export const getContent = (section) =>
  action(() => {
    const store = readStore()
    return store.contentSections[section] || { title: '', subtitle: '', description: '', image_url: '' }
  })

export const updateContent = (section, data) =>
  action(() => {
    const store = readStore()
    store.contentSections[section] = { ...(store.contentSections[section] || {}), ...data }
    writeStore(store)
    return store.contentSections[section]
  })

// ── Hero slides ──────────────────────────────────────────────────────
export const getAdminHeroSlides = () =>
  action(() => [...readStore().heroSlides].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)))

export const createHeroSlide = (data) =>
  action(() => {
    const store = readStore()
    const slide = {
      id: store.nextIds.heroSlide++,
      image_url: data.image_url || mockImage(`hero-${Date.now()}`),
      title: data.title || 'New Slide',
      subtitle: data.subtitle || '',
      button_text: data.button_text || 'Shop Now',
      button_link: data.button_link || '/products',
      sort_order: Number(data.sort_order ?? store.heroSlides.length),
      active: data.active ?? true,
    }
    store.heroSlides.push(slide)
    writeStore(store)
    return slide
  })

export const updateHeroSlide = (id, data) =>
  action(() => {
    const store = readStore()
    const slide = store.heroSlides.find((item) => item.id === Number(id))
    if (!slide) throw asAxiosError('Slide not found.', 404)
    Object.assign(slide, data)
    writeStore(store)
    return slide
  })

export const deleteHeroSlide = (id) =>
  action(() => {
    const store = readStore()
    store.heroSlides = store.heroSlides.filter((slide) => slide.id !== Number(id))
    writeStore(store)
    return { ok: true }
  })

export const reorderHeroSlides = (ordered_ids) =>
  action(() => {
    const store = readStore()
    ordered_ids.forEach((id, index) => {
      const slide = store.heroSlides.find((item) => item.id === Number(id))
      if (slide) slide.sort_order = index
    })
    writeStore(store)
    return { ok: true }
  })

// ── Announcement + offers ────────────────────────────────────────────
export const getAnnouncement = () =>
  action(() => readStore().announcement)

export const updateAnnouncement = (data) =>
  action(() => {
    const store = readStore()
    store.announcement = { ...store.announcement, ...data }
    writeStore(store)
    return store.announcement
  })

export const getAdminOffers = () =>
  action(() => [...readStore().offers].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)))

export const createOffer = (data) =>
  action(() => {
    const store = readStore()
    const offer = {
      offer_key: ensureOfferKey(store, data.label || 'offer'),
      label: data.label || 'New Offer',
      description: data.description || '',
      enabled: data.enabled ?? true,
      sort_order: store.offers.length,
      end_time: data.end_time || null,
      is_builtin: false,
    }
    store.offers.push(offer)
    writeStore(store)
    return offer
  })

export const updateOffer = (key, data) =>
  action(() => {
    const store = readStore()
    const offer = store.offers.find((item) => item.offer_key === key)
    if (!offer) throw asAxiosError('Offer not found.', 404)
    Object.assign(offer, data)
    writeStore(store)
    return offer
  })

export const deleteOffer = (key) =>
  action(() => {
    const store = readStore()
    const offer = store.offers.find((item) => item.offer_key === key)
    if (!offer) throw asAxiosError('Offer not found.', 404)
    if (offer.is_builtin) throw asAxiosError('Built-in offers cannot be deleted.', 400)
    store.offers = store.offers.filter((item) => item.offer_key !== key)
    writeStore(store)
    return { ok: true }
  })

// ── Categories ───────────────────────────────────────────────────────
export const getAdminCategories = () =>
  action(() => [...readStore().categories].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)))

export const updateCategories = (categories) =>
  action(() => {
    const store = readStore()
    store.categories = (categories || []).map((category, index) => ({
      ...category,
      sort_order: index,
    }))
    writeStore(store)
    return store.categories
  })

// ── Combo offers ─────────────────────────────────────────────────────
export const getAdminComboOffers = (includeInactive = true) =>
  action(() => {
    const combos = readStore().comboOffers
    return includeInactive ? combos : combos.filter((combo) => combo.is_active !== false)
  })

export const getAdminComboOffer = (id) =>
  action(() => {
    const combo = readStore().comboOffers.find((item) => item.id === Number(id))
    if (!combo) throw asAxiosError('Combo offer not found.', 404)
    return combo
  })

export const createComboOffer = (data) =>
  action(() => {
    const store = readStore()
    const combo = {
      ...data,
      id: store.nextIds.combo++,
      image_urls: data.image_urls?.length ? data.image_urls : [mockImage(`combo-${Date.now()}`)],
    }
    store.comboOffers.push(combo)
    writeStore(store)
    return combo
  })

export const updateComboOffer = (id, data) =>
  action(() => {
    const store = readStore()
    const combo = store.comboOffers.find((item) => item.id === Number(id))
    if (!combo) throw asAxiosError('Combo offer not found.', 404)
    Object.assign(combo, data)
    writeStore(store)
    return combo
  })

export const deleteComboOffer = (id) =>
  action(() => {
    const store = readStore()
    store.comboOffers = store.comboOffers.filter((item) => item.id !== Number(id))
    writeStore(store)
    return { ok: true }
  })

export const toggleComboOffer = (id) =>
  action(() => {
    const store = readStore()
    const combo = store.comboOffers.find((item) => item.id === Number(id))
    if (!combo) throw asAxiosError('Combo offer not found.', 404)
    combo.is_active = !combo.is_active
    writeStore(store)
    return combo
  })

export const getComboOrders = (comboId) =>
  action(() => {
    const comboIdNumber = Number(comboId)
    const orders = readStore().orders.filter((order) =>
      (order.items || []).some((item) => item.combo_offer_id === comboIdNumber)
    )
    return orders
  })

export const initComboTable = () =>
  action(() => ({ ok: true, message: 'Mock combo table is ready.' }))

export const getComboHealth = () =>
  action(() => ({ status: 'healthy', mode: 'mock' }))

// ── Migrations ───────────────────────────────────────────────────────
export const runMigrations = () =>
  action(() => ({ ok: true, message: 'Mock migrations completed.' }))

const routeRequest = (method, path, payload = {}, config = {}) => {
  const run = () => {
    const normalized = path.replace(/\/+$/, '')
    const params = config?.params || {}

    if (method === 'GET' && normalized === '/admin/hero-slides') return getAdminHeroSlides()
    if (method === 'POST' && normalized === '/admin/hero-slides') return createHeroSlide(payload)
    if (method === 'PUT' && /^\/admin\/hero-slides\/\d+$/.test(normalized)) return updateHeroSlide(normalized.split('/').pop(), payload)
    if (method === 'DELETE' && /^\/admin\/hero-slides\/\d+$/.test(normalized)) return deleteHeroSlide(normalized.split('/').pop())
    if (method === 'PUT' && normalized === '/admin/hero-slides-reorder') return reorderHeroSlides(payload.ordered_ids || [])

    if (method === 'POST' && normalized === '/admin/upload-images') {
      return action(() => {
        const files = payload?.getAll?.('files') || []
        const uploads = files.length
          ? files.map((_, index) => ({ url: mockImage(`cloudinary-${Date.now()}-${index}`) }))
          : [{ url: mockImage(`cloudinary-${Date.now()}`) }]
        return { uploads }
      })
    }

    if (method === 'GET' && normalized === '/admin/orders') return getAdminOrders(params.status)

    throw asAxiosError(`Mock route not found: ${method} ${path}`, 404)
  }

  return run()
}

const api = {
  get: (path, config) => routeRequest('GET', path, null, config),
  post: (path, payload, config) => routeRequest('POST', path, payload, config),
  put: (path, payload, config) => routeRequest('PUT', path, payload, config),
  delete: (path, config) => routeRequest('DELETE', path, null, config),
  patch: (path, payload, config) => routeRequest('PATCH', path, payload, config),
}

export default api
