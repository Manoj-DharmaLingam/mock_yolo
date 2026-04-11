import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'

const WishlistContext = createContext(null)

const STORAGE_KEY = 'yolo_wishlist'

const load = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
}

const persist = (items) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch { /* quota exceeded */ }
}

// Generate unique key for wishlist items (supports both products and combos)
const getItemKey = (item) => `${item.type || 'product'}-${item.id}`

const reducer = (state, action) => {
  switch (action.type) {
    case 'TOGGLE': {
      const itemKey = getItemKey(action.item)
      return state.some(i => getItemKey(i) === itemKey)
        ? state.filter(i => getItemKey(i) !== itemKey)
        : [...state, action.item]
    }
    case 'REMOVE': {
      const removeKey = `${action.itemType || 'product'}-${action.id}`
      return state.filter(i => getItemKey(i) !== removeKey)
    }
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function WishlistProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => { persist(items) }, [items])

  // O(1) lookup Set for isWishlisted - uses unique key
  const wishlistKeys = useMemo(() => new Set(items.map(i => getItemKey(i))), [items])

  const toggleWishlist = useCallback((item, type = 'product') => {
    // Add type to item if not present
    const itemWithType = { ...item, type }
    dispatch({ type: 'TOGGLE', item: itemWithType })
  }, [])

  const removeFromWishlist = useCallback((id, itemType = 'product') => {
    dispatch({ type: 'REMOVE', id, itemType })
  }, [])

  const clearWishlist = useCallback(() => dispatch({ type: 'CLEAR' }), [])

  // O(1) lookup using Set - supports both products and combos
  const isWishlisted = useCallback((id, type = 'product') => {
    return wishlistKeys.has(`${type}-${id}`)
  }, [wishlistKeys])

  // Filter items by type
  const products = useMemo(() => items.filter(i => (i.type || 'product') === 'product'), [items])
  const combos = useMemo(() => items.filter(i => i.type === 'combo'), [items])

  return (
    <WishlistContext.Provider value={{
      items,
      products,
      combos,
      count: items.length,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
      isWishlisted,
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return ctx
}
