import { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { productCategories, getCategoryCounts, getProducts, getCategories, getOfferTypes } from '../../services/api'
import { get, resolveImg } from '../../services/apiClient'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { useUserAuth } from '../../context/UserAuthContext'
import './Navbar.css'

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
)

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2 4 6 8 10 4" />
  </svg>
)

const ArrowRight = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="7" x2="12" y2="7" />
    <polyline points="8 3 12 7 8 11" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

const DEFAULT_ANNOUNCEMENT = 'FREE SHIPPING ON ORDERS ABOVE ₹1499  |  USE CODE YOLO10 FOR 10% OFF'

export default function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSection, setMobileSection] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [categoryCounts, setCategoryCounts] = useState({})
  const [dynamicCategories, setDynamicCategories] = useState(productCategories)
  const [dynamicOffers, setDynamicOffers] = useState([])
  const [announcement, setAnnouncement] = useState({ text: DEFAULT_ANNOUNCEMENT, enabled: true })

  // Search state
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchPanelRef = useRef(null)
  const searchInputRef = useRef(null)
  const searchTimeout = useRef(null)

  const navRef = useRef(null)
  const accountRef = useRef(null)
  const navigate = useNavigate()

  const { count: cartCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const { user, isLoggedIn, logout } = useUserAuth()

  // Build a per-user storage key so each account has its own history
  const recentKey = `yolo_recent_searches_${user?.id || user?.email || 'guest'}`

  // Reload search history whenever the logged-in user changes
  useEffect(() => {
    try {
      setRecentSearches(JSON.parse(localStorage.getItem(recentKey) || '[]'))
    } catch {
      setRecentSearches([])
    }
  }, [recentKey])

  useEffect(() => {
    getCategoryCounts().then(data => setCategoryCounts(data)).catch(() => {})
    getCategories().then(data => {
      if (data && data.length) setDynamicCategories(data.map(c => ({ key: c.key, label: c.label, count: '—' })))
    }).catch(() => {})
    getOfferTypes()
      .then((data) => setDynamicOffers(data))
      .catch(() => setDynamicOffers([]))
    get('/api/announcement')
      .then(data => { if (data) setAnnouncement(data) })
      .catch(() => {})
  }, [])

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target)) {
        setSearchOpen(false)
        setSearchResults([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60)
    }
    if (!searchOpen) {
      setSearchQuery('')
      setSearchResults([])
    }
  }, [searchOpen])

  // Persist recent searches
  const saveRecent = useCallback((term) => {
    setRecentSearches(prev => {
      const updated = [term, ...prev.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 8)
      localStorage.setItem(recentKey, JSON.stringify(updated))
      return updated
    })
  }, [recentKey])

  const removeRecent = useCallback((term, e) => {
    e.stopPropagation()
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== term)
      localStorage.setItem(recentKey, JSON.stringify(updated))
      return updated
    })
  }, [recentKey])

  const clearAllRecent = useCallback(() => {
    setRecentSearches([])
    localStorage.removeItem(recentKey)
  }, [recentKey])

  // Live search with debounce
  const handleSearchInput = useCallback((q) => {
    setSearchQuery(q)
    clearTimeout(searchTimeout.current)
    if (!q.trim()) { setSearchResults([]); return }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await getProducts({ search: q })
        setSearchResults((results || []).slice(0, 6))
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 280)
  }, [])

  const doSearch = (q = searchQuery) => {
    const term = (q || searchQuery).trim()
    if (!term) return
    saveRecent(term)
    setSearchOpen(false)
    setSearchResults([])
    setSearchQuery('')
    navigate(`/products?search=${encodeURIComponent(term)}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') doSearch()
    if (e.key === 'Escape') setSearchOpen(false)
  }

  const goResult = (product) => {
    saveRecent(product.name)
    setSearchOpen(false)
    setSearchResults([])
    setSearchQuery('')
    navigate(`/products/${product.id}`)
  }

  useEffect(() => {
    const handler = (e) => {
      if (!navRef.current || navRef.current.contains(e.target)) return
      setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeAll = () => {
    setOpenDropdown(null)
    setMobileOpen(false)
    setMobileSection(null)
    setAccountOpen(false)
  }

  const goCategory = (key) => { closeAll(); navigate(`/products?category=${key}`) }
  const goOffer = (key) => { closeAll(); navigate(`/offers?type=${key}`) }

  return (
    <>
      {announcement.enabled && (
        <div className="yolo-promo">{announcement.text}</div>
      )}

      <header className="yolo-nav" ref={navRef}>
        <div className="container yolo-nav__inner">

          <Link to="/" className="yolo-nav__logo" onClick={closeAll}>
            <img src="/Yolo.png" alt="YOLO" className="yolo-nav__logo-img" />
          </Link>

          <nav className="yolo-nav__left">
            <NavLink to="/" end className={({ isActive }) => `yolo-nav__link${isActive ? ' active' : ''}`} onClick={closeAll}>
              Home
            </NavLink>

            <div className={`yolo-nav__item${openDropdown === 'products' ? ' open' : ''}`}>
              <button
                className="yolo-nav__link yolo-nav__link--drop"
                onClick={() => setOpenDropdown(p => p === 'products' ? null : 'products')}
              >
                Shop <ChevronDown className="yolo-nav__chevron" />
              </button>
              <div className="yolo-dropdown yolo-dropdown--mega">
                <div className="yolo-mega-grid">
                  {dynamicCategories.map(cat => (
                    <button key={cat.key} className="yolo-mega-item" onClick={() => goCategory(cat.key)}>
                      <span>{cat.label}</span>
                      <span className="yolo-mega-count">({categoryCounts[cat.key] ?? cat.count})</span>
                    </button>
                  ))}
                </div>
                <div className="yolo-mega-footer">
                  <button className="yolo-mega-all" onClick={() => { navigate('/products'); closeAll() }}>
                    View All <ArrowRight />
                  </button>
                </div>
              </div>
            </div>

            <div className={`yolo-nav__item${openDropdown === 'offers' ? ' open' : ''}`}>
              <button
                className="yolo-nav__link yolo-nav__link--drop"
                onClick={() => setOpenDropdown(p => p === 'offers' ? null : 'offers')}
              >
                Offers <ChevronDown className="yolo-nav__chevron" />
              </button>
              <div className="yolo-dropdown yolo-dropdown--offers">
                {dynamicOffers.length > 0 ? (
                  dynamicOffers.map(o => (
                    <button key={o.key} className="yolo-dropdown-item" onClick={() => goOffer(o.key)}>
                      {o.label}
                    </button>
                  ))
                ) : (
                  <div className="yolo-dropdown-empty">No live offers</div>
                )}
                <button className="yolo-dropdown-item" onClick={() => { closeAll(); navigate('/combo-offers') }}>
                  Combos
                </button>
              </div>
            </div>

            <NavLink to="/customize" className={({ isActive }) => `yolo-nav__link yolo-nav__link--customize${isActive ? ' active' : ''}`} onClick={closeAll}>
              Customize
            </NavLink>

            <NavLink to="/about"className={({ isActive }) => `yolo-nav__link${isActive ? ' active' : ''}`} onClick={closeAll}>About</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `yolo-nav__link${isActive ? ' active' : ''}`} onClick={closeAll}>Contact</NavLink>
            {isLoggedIn && (
              <NavLink to="/my-orders" className={({ isActive }) => `yolo-nav__link${isActive ? ' active' : ''}`} onClick={closeAll}>My Orders</NavLink>
            )}
          </nav>

          <div className="yolo-nav__right">
            {/* ── Search icon ── */}
            <button
              className="yolo-nav__icon-btn"
              onClick={() => setSearchOpen(v => !v)}
              title="Search"
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            <div className="yolo-nav__account" ref={accountRef} style={{ position: 'relative' }}>
              {isLoggedIn ? (
                <>
                  <button
                    className="yolo-nav__icon-btn yolo-nav__account-btn"
                    onClick={() => setAccountOpen(v => !v)}
                    title="My Account"
                  >
                    <UserIcon />
                    <span className="yolo-nav__welcome">Hi, {user?.name?.split(' ')[0]}</span>
                  </button>
                  {accountOpen && (
                    <div className="yolo-nav__account-drop">
                      <div className="yolo-nav__account-email">{user?.email}</div>
                      <Link to="/profile" className="yolo-nav__account-link"
                        onClick={() => { setAccountOpen(false); closeAll() }}>
                        My Profile
                      </Link>
                      <Link to="/my-orders" className="yolo-nav__account-link"
                        onClick={() => { setAccountOpen(false); closeAll() }}>
                        My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setAccountOpen(false); closeAll(); navigate('/') }}
                        className="yolo-nav__account-link yolo-nav__account-link--danger"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login" className="yolo-nav__icon-btn" title="Account" onClick={closeAll}>
                  <UserIcon />
                </Link>
              )}
            </div>
            <Link to="/wishlist" className="yolo-nav__icon-btn" title="Wishlist" onClick={closeAll}>
              <HeartIcon />
              {wishlistCount > 0 && <span className="yolo-nav__badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="yolo-nav__icon-btn" title="Cart" onClick={closeAll}>
              <CartIcon />
              {cartCount > 0 && <span className="yolo-nav__badge">{cartCount}</span>}
            </Link>
            <button
              className={`yolo-hamburger${mobileOpen ? ' open' : ''}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Menu"
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      {/* ── Search Panel ── */}
      {searchOpen && (
        <div className="yolo-search-panel__overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="yolo-search-panel"
            ref={searchPanelRef}
            onClick={e => e.stopPropagation()}
          >
            {/* Input row */}
            <div className="yolo-search-panel__input-row">
              <span className="yolo-search-panel__icon"><SearchIcon /></span>
              <input
                ref={searchInputRef}
                className="yolo-search-panel__input"
                type="text"
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, categories…"
                autoComplete="off"
              />
              {searchQuery && (
                <button className="yolo-search-panel__clear-input" onClick={() => handleSearchInput('')} aria-label="Clear">✕</button>
              )}
              <button className="yolo-search-panel__close" onClick={() => setSearchOpen(false)} aria-label="Close search">✕</button>
            </div>

            {/* Body */}
            <div className="yolo-search-panel__body">
              {/* Live results */}
              {searching && (
                <div className="yolo-search-panel__loading">
                  <span className="yolo-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> Searching…
                </div>
              )}

              {!searching && searchResults.length > 0 && (
                <div className="yolo-search-panel__section">
                  <div className="yolo-search-panel__section-head">Results</div>
                  {searchResults.map(p => (
                    <button key={p.id} className="yolo-search-panel__result-item" onClick={() => goResult(p)}>
                      <img
                        src={resolveImg(p.image)}
                        alt={p.name}
                        className="yolo-search-panel__thumb"
                        onError={e => { e.target.style.display = 'none' }}
                      />
                      <div className="yolo-search-panel__result-info">
                        <span className="yolo-search-panel__result-name">{p.name}</span>
                        <span className="yolo-search-panel__result-price">
                          ₹{p.discountPrice}
                          {p.price !== p.discountPrice && (
                            <span className="yolo-search-panel__result-orig">₹{p.price}</span>
                          )}
                        </span>
                      </div>
                      {p.badge && <span className="yolo-search-panel__result-badge">{p.badge}</span>}
                    </button>
                  ))}
                  <button className="yolo-search-panel__see-all" onClick={() => doSearch()}>
                    See all results for "{searchQuery}" →
                  </button>
                </div>
              )}

              {!searching && searchResults.length === 0 && searchQuery.trim() && (
                <div className="yolo-search-panel__empty">No products found for "<strong>{searchQuery}</strong>"</div>
              )}

              {/* Recent searches — shown when no query typed */}
              {!searchQuery.trim() && recentSearches.length > 0 && (
                <div className="yolo-search-panel__section">
                  <div className="yolo-search-panel__section-head">
                    Recent Searches
                    <button className="yolo-search-panel__clear-all" onClick={clearAllRecent}>Clear all</button>
                  </div>
                  <div className="yolo-search-panel__recents">
                    {recentSearches.map(term => (
                      <div key={term} className="yolo-search-panel__recent-chip">
                        <button className="yolo-search-panel__recent-term" onClick={() => doSearch(term)}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          {term}
                        </button>
                        <button className="yolo-search-panel__recent-remove" onClick={(e) => removeRecent(term, e)} aria-label={`Remove ${term}`}>✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!searchQuery.trim() && recentSearches.length === 0 && (
                <div className="yolo-search-panel__hint">Start typing to search products…</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={`yolo-mobile${mobileOpen ? ' open' : ''}`}>
        <div className="yolo-mobile__header">
          <Link to="/" className="yolo-nav__logo" onClick={closeAll}>
            <img src="/Yolo.png" alt="YOLO" className="yolo-nav__logo-img" style={{ height: '34px' }} />
          </Link>
          <button className="yolo-mobile__close" onClick={closeAll}>✕</button>
        </div>
        <div className="yolo-mobile__body">
          <NavLink to="/" end className={({ isActive }) => `yolo-mobile__link${isActive ? ' active' : ''}`} onClick={closeAll}>Home</NavLink>

          <div className="yolo-mobile__section">
            <button
              className={`yolo-mobile__toggle${mobileSection === 'products' ? ' open' : ''}`}
              onClick={() => setMobileSection(s => s === 'products' ? null : 'products')}
            >
              Shop <ChevronDown className="yolo-mobile__chevron" />
            </button>
            <div className={`yolo-mobile__sub${mobileSection === 'products' ? ' open' : ''}`}>
              {dynamicCategories.map(cat => (
                <button key={cat.key} className="yolo-mobile__sublink" onClick={() => goCategory(cat.key)}>
                  {cat.label} <span>({categoryCounts[cat.key] ?? cat.count})</span>
                </button>
              ))}
              <button className="yolo-mobile__sublink yolo-mobile__sublink--all" onClick={() => { navigate('/products'); closeAll() }}>
                View All →
              </button>
            </div>
          </div>

          <div className="yolo-mobile__section">
            <button
              className={`yolo-mobile__toggle${mobileSection === 'offers' ? ' open' : ''}`}
              onClick={() => setMobileSection(s => s === 'offers' ? null : 'offers')}
            >
              Offers <ChevronDown className="yolo-mobile__chevron" />
            </button>
            <div className={`yolo-mobile__sub${mobileSection === 'offers' ? ' open' : ''}`}>
              {dynamicOffers.length > 0 ? (
                dynamicOffers.map(o => (
                  <button key={o.key} className="yolo-mobile__sublink" onClick={() => goOffer(o.key)}>{o.label}</button>
                ))
              ) : (
                <div className="yolo-mobile__empty">No live offers</div>
              )}
              <button className="yolo-mobile__sublink" onClick={() => { closeAll(); navigate('/combo-offers') }}>Combos</button>
            </div>
          </div>

          <NavLink to="/customize" className={({ isActive }) => `yolo-mobile__link yolo-mobile__link--customize${isActive ? ' active' : ''}`} onClick={closeAll}>
            Customize
          </NavLink>

          <NavLink to="/about"className={({ isActive }) => `yolo-mobile__link${isActive ? ' active' : ''}`} onClick={closeAll}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => `yolo-mobile__link${isActive ? ' active' : ''}`} onClick={closeAll}>Contact</NavLink>

          {isLoggedIn ? (
            <>
              <NavLink to="/my-orders" className={({ isActive }) => `yolo-mobile__link yolo-mobile__link--orders${isActive ? ' active' : ''}`} onClick={closeAll}>My Orders</NavLink>
              <NavLink to="/profile" className={({ isActive }) => `yolo-mobile__link${isActive ? ' active' : ''}`} onClick={closeAll}>My Profile</NavLink>
              <button
                className="yolo-mobile__link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c0392b', textAlign: 'left', width: '100%' }}
                onClick={() => { logout(); closeAll(); navigate('/') }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => `yolo-mobile__link${isActive ? ' active' : ''}`} onClick={closeAll}>Login</NavLink>
          )}
        </div>
        <div className="yolo-mobile__actions">
          <Link to="/wishlist" className="btn btn-secondary btn-sm" onClick={closeAll} style={{ flex: 1, textAlign: 'center' }}>
            Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
          </Link>
          <Link to="/cart" className="btn btn-primary btn-sm" onClick={closeAll} style={{ flex: 1, textAlign: 'center' }}>
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>
        </div>
      </div>
    </>
  )
}
