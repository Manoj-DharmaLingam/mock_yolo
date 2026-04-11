import { createContext, useContext, useReducer, useEffect, useCallback, useState, useMemo } from 'react'
import { get } from '../services/apiClient'

const CartContext = createContext(null)

const STORAGE_KEY = 'yolo_cart'
const COMBO_STORAGE_KEY = 'yolo_combo_cart'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

const loadCombos = () => {
  try { return JSON.parse(localStorage.getItem(COMBO_STORAGE_KEY)) || [] } catch { return [] }
}

const persist = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* quota exceeded */ }
}

const persistCombos = (combos) => {
  try { localStorage.setItem(COMBO_STORAGE_KEY, JSON.stringify(combos)) } catch { /* quota exceeded */ }
}

const makeKey = (id, size, color) => `${id}__${size}__${color}`

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const { product, qty = 1, size, color } = action
      
      // Regular product
      const key = makeKey(product.id, size, color)
      const idx = state.findIndex(i => i._key === key)
      if (idx !== -1) {
        const updated = [...state]
        updated[idx] = { ...updated[idx], qty: updated[idx].qty + qty }
        return updated
      }
      return [...state, { ...product, qty, selectedSize: size, selectedColor: color, _key: key }]
    }
    case 'REMOVE':
      return state.filter(i => i._key !== action.key)
    case 'SET_QTY':
      return state.map(i => i._key === action.key ? { ...i, qty: Math.max(1, action.qty) } : i)
    case 'CLEAR':
      return []
    default:
      return state
  }
}

const comboReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_COMBO': {
      const combo = action.combo
      // Generate unique ID for this combo instance
      const comboKey = `combo_${combo.combo_offer_id}_${Date.now()}`
      return [...state, { ...combo, _comboKey: comboKey, qty: 1 }]
    }
    case 'REMOVE_COMBO':
      return state.filter(c => c._comboKey !== action.comboKey)
    case 'SET_COMBO_QTY':
      return state.map(c => c._comboKey === action.comboKey ? { ...c, qty: Math.max(1, action.qty) } : c)
    case 'CLEAR_COMBOS':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)
  const [combos, comboDispatch] = useReducer(comboReducer, undefined, loadCombos)
  const [shippingSettings, setShippingSettings] = useState({ shipping_price: 79, free_shipping_threshold: 1499 })

  useEffect(() => { persist(items) }, [items])
  useEffect(() => { persistCombos(combos) }, [combos])

  useEffect(() => {
    // Use apiClient for caching and consistency
    get('/api/store-settings')
      .then(data => {
        if (data && typeof data.shipping_price === 'number') {
          setShippingSettings({
            shipping_price: data.shipping_price,
            free_shipping_threshold: data.free_shipping_threshold ?? 1499,
          })
        }
      })
      .catch(() => { /* use defaults */ })
  }, [])

  const addToCart = useCallback((product, { qty = 1, size, color } = {}) => {
    dispatch({
      type: 'ADD',
      product,
      qty,
      size: size ?? product.sizes?.[0] ?? 'M',
      color: color ?? product.colors?.[0] ?? '',
    })
  }, [])

  const removeFromCart = useCallback((key) => dispatch({ type: 'REMOVE', key }), [])

  const setQty = useCallback((key, qty) => dispatch({ type: 'SET_QTY', key, qty }), [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
    comboDispatch({ type: 'CLEAR_COMBOS' })
  }, [])

  // Combo functions
  const addComboToCart = useCallback((combo) => {
    comboDispatch({ type: 'ADD_COMBO', combo })
  }, [])

  const removeComboFromCart = useCallback((comboKey) => {
    comboDispatch({ type: 'REMOVE_COMBO', comboKey })
  }, [])

  const setComboQty = useCallback((comboKey, qty) => {
    comboDispatch({ type: 'SET_COMBO_QTY', comboKey, qty })
  }, [])

  // Memoize computed values
  const count = useMemo(() => {
    const itemCount = items.reduce((s, i) => s + i.qty, 0)
    const comboCount = combos.reduce((s, c) => s + (c.pick_count * (c.qty || 1)), 0)
    return itemCount + comboCount
  }, [items, combos])

  const subtotal = useMemo(() => {
    const itemsSubtotal = items.reduce((s, i) => s + (i.discountPrice || i.price) * i.qty, 0)
    const combosSubtotal = combos.reduce((s, c) => s + (c.combo_price * (c.qty || 1)), 0)
    return itemsSubtotal + combosSubtotal
  }, [items, combos])

  const { shipping_price, free_shipping_threshold } = shippingSettings
  const shipping = useMemo(() => subtotal > 0 ? (subtotal >= free_shipping_threshold ? 0 : shipping_price) : 0, [subtotal, shipping_price, free_shipping_threshold])
  const total = useMemo(() => subtotal + shipping, [subtotal, shipping])

  return (
    <CartContext.Provider value={{
      items,
      combos,
      count,
      subtotal,
      shipping,
      total,
      shippingSettings,
      addToCart,
      removeFromCart,
      setQty,
      clearCart,
      addComboToCart,
      removeComboFromCart,
      setComboQty,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
