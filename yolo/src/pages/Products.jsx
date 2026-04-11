import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getCategories, getCategoryCounts } from '../services/api'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './Products.css'

const DEBOUNCE_MS = 300

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filter state from URL (source of truth for shareable/bookmarkable state)
  const urlCategory = searchParams.get('category') || 'all'
  const urlSort     = searchParams.get('sort')      || 'default'
  const urlSearch   = searchParams.get('search')    || ''
  const urlMaxPrice = parseInt(searchParams.get('maxPrice') || '3000')

  // Local UI state — debounced before being committed to URL
  const [searchInput, setSearchInput] = useState(urlSearch)
  const [priceInput, setPriceInput]   = useState(urlMaxPrice)

  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [categoryCounts, setCategoryCounts] = useState({})
  const [baseCategories, setBaseCategories] = useState([{ key: 'all', label: 'All Products', count: null }])

  const debounceRef = useRef(null)

  // Fetch dynamic categories from backend
  useEffect(() => {
    getCategories()
      .then(cats => {
        if (cats && cats.length) {
          setBaseCategories([{ key: 'all', label: 'All Products', count: null }, ...cats.map(c => ({ key: c.key, label: c.label, count: null }))])
        }
      })
      .catch(() => {})
  }, [])

  // Fetch live category counts once on mount
  useEffect(() => {
    getCategoryCounts()
      .then(data => setCategoryCounts(data))
      .catch(() => {})
  }, [])

  // Memoize allCategories calculation to prevent recalc on every render
  const allCategories = useMemo(() => baseCategories.map(cat => ({
    ...cat,
    count: cat.key === 'all'
      ? Object.values(categoryCounts).reduce((s, n) => s + n, 0) || cat.count
      : (categoryCounts[cat.key] ?? cat.count),
  })), [baseCategories, categoryCounts])

  const setParam = useCallback((key, val, defaultVal = '') => {
    setSearchParams(prev => {
      const p = new URLSearchParams(prev)
      if (val && val !== defaultVal && String(val) !== String(defaultVal)) p.set(key, val)
      else p.delete(key)
      return p
    })
  }, [setSearchParams])

  // Debounce search → URL
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setParam('search', searchInput), DEBOUNCE_MS)
    return () => clearTimeout(debounceRef.current)
  }, [searchInput, setParam])

  // Debounce price → URL
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setParam('maxPrice', priceInput, 3000), DEBOUNCE_MS)
    return () => clearTimeout(debounceRef.current)
  }, [priceInput, setParam])

  // Sync local inputs when URL changes externally (e.g. browser back)
  useEffect(() => { setSearchInput(urlSearch) }, [urlSearch])
  useEffect(() => { setPriceInput(urlMaxPrice) }, [urlMaxPrice])

  // Fetch whenever URL filter params change
  useEffect(() => {
    setLoading(true)
    setError(null)
    getProducts({ category: urlCategory, search: urlSearch, maxPrice: urlMaxPrice, sort: urlSort })
      .then(data => { setProducts(data); setLoading(false) })
      .catch(err  => { setError(err.message); setLoading(false) })
  }, [urlCategory, urlSearch, urlMaxPrice, urlSort])

  // Memoize current category lookup
  const currentCat = useMemo(() => 
    allCategories.find(c => c.key === urlCategory) || allCategories[0],
    [allCategories, urlCategory]
  )

  const clearAll = () => {
    setSearchInput('')
    setPriceInput(3000)
    setSearchParams({})
  }

  return (
    <div className="yolo-products">
      <div className="yolo-products__hero">
        <div className="container">
          <nav className="yolo-breadcrumb">
            <Link to="/">Home</Link><span>/</span><span>{currentCat.label}</span>
          </nav>
          <h1 className="yolo-products__title">{currentCat.label}</h1>
          {!loading && <p className="yolo-products__count"><strong>{products.length}</strong> products found</p>}
        </div>
      </div>

      <div className="container">
        <div className="yolo-products__layout">
          {/* Sidebar */}
          <aside className="yolo-products__sidebar">
            <div className="yolo-filter-block">
              <div className="yolo-filter-block__title">Category</div>
              {allCategories.map(cat => (
                <button
                  key={cat.key}
                  className={`yolo-filter-cat${urlCategory === cat.key ? ' active' : ''}`}
                  onClick={() => setParam('category', cat.key, 'all')}
                >
                  <span>{cat.label}</span>
                  {cat.count !== null && <span>{cat.count}</span>}
                </button>
              ))}
            </div>

            <div className="yolo-filter-block">
              <div className="yolo-filter-block__title">
                Max Price <span className="yolo-filter-price-val">₹{priceInput}</span>
              </div>
              <input
                type="range"
                min={300}
                max={3000}
                step={100}
                value={priceInput}
                onChange={e => setPriceInput(Number(e.target.value))}
                className="yolo-filter-range"
              />
              <div className="yolo-filter-range-labels"><span>₹300</span><span>₹3,000</span></div>
            </div>

            <button className="yolo-filter-clear" onClick={clearAll}>Clear All Filters</button>
          </aside>

          {/* Main */}
          <div className="yolo-products__main">
            <div className="yolo-products__toolbar">
              <div className="yolo-search-wrap">
                <svg className="yolo-search-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="9" cy="9" r="6" /><line x1="13.5" y1="13.5" x2="18" y2="18" />
                </svg>
                <input
                  type="text"
                  className="yolo-search"
                  placeholder="Search tees..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                />
              </div>
              <select
                className="yolo-sort-select"
                value={urlSort}
                onChange={e => setParam('sort', e.target.value, 'default')}
              >
                <option value="default">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            {error ? (
              <div className="yolo-loading"><p style={{ color: 'red' }}>Error: {error}</p></div>
            ) : loading ? (
              <div className="yolo-loading"><div className="yolo-spinner" /></div>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

