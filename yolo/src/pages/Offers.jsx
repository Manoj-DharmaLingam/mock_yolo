import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts, getOfferTypes, offerCategories } from '../services/api'
import ProductCard from '../components/ProductCard/ProductCard'
import BuyOneGetOne from '../components/BuyOneGetOne/BuyOneGetOne'
import './Offers.css'

export default function Offers() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [offerTabs, setOfferTabs]       = useState([])
  const [tabsLoading, setTabsLoading]   = useState(true)

  // product data keyed by offer_key
  const [products, setProducts]         = useState({})
  const [loadingKey, setLoadingKey]     = useState(null)
  const requestedType = searchParams.get('type')

  // Load offer types dynamically from backend
  useEffect(() => {
    getOfferTypes()
      .then(setOfferTabs)
      .catch(() => {
        // fallback to hardcoded tabs if API fails
        setOfferTabs(offerCategories.map(tab => ({ ...tab, description: '' })))
      })
      .finally(() => setTabsLoading(false))
  }, [])

  useEffect(() => {
    if (tabsLoading || offerTabs.length === 0) return
    if (!requestedType || !offerTabs.some(tab => tab.key === requestedType)) {
      setSearchParams({ type: offerTabs[0].key }, { replace: true })
    }
  }, [offerTabs, requestedType, setSearchParams, tabsLoading])

  const activeTab = offerTabs.some(tab => tab.key === requestedType)
    ? requestedType
    : offerTabs[0]?.key || 'best-seller'
  const setTab = (key) => setSearchParams({ type: key })
  const activeTabLabel = offerTabs.find(t => t.key === activeTab)?.label || activeTab
  const activeTabDesc  = offerTabs.find(t => t.key === activeTab)?.description || ''

  // Fetch products when active tab changes (skip bogo — BuyOneGetOne fetches its own)
  useEffect(() => {
    if (!activeTab || activeTab === 'buy-1-get-1') return
    if (products[activeTab] !== undefined) return  // already loaded

    setLoadingKey(activeTab)

    getProducts({ offerType: activeTab })
      .then(data => setProducts(prev => ({ ...prev, [activeTab]: data })))
      .catch(() => setProducts(prev => ({ ...prev, [activeTab]: [] })))
      .finally(() => setLoadingKey(null))
  }, [activeTab])  // eslint-disable-line react-hooks/exhaustive-deps

  if (tabsLoading) {
    return (
      <div className="offers-page">
        <div className="offers-page__loading"><div className="offers-page__spinner" /></div>
      </div>
    )
  }

  const isBogo         = activeTab === 'buy-1-get-1'
  const tabProducts    = products[activeTab] || []
  const isLoading      = loadingKey === activeTab

  return (
    <div className="offers-page">
      {/* Hero */}
      <div className="offers-page__hero">
        <div className="container">
          <nav className="offers-page__breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>{activeTabLabel}</span>
          </nav>
          <h1 className="offers-page__title">Special Offers</h1>
          <p className="offers-page__desc">
            Exclusive deals and bundles curated just for you. Shop now before they're gone.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="offers-page__tabs-bar">
        <div className="container">
          <div className="offers-page__tabs">
            {offerTabs.map(tab => (
              <button
                key={tab.key}
                className={`offers-tab${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container">
        {isLoading ? (
          <div className="offers-page__loading">
            <div className="offers-page__spinner" />
          </div>
        ) : (
          <>
            {/* BOGO — component handles its own data & countdown */}
            {isBogo && (
              <section className="offers-page__section">
                <BuyOneGetOne embedded />
              </section>
            )}

            {/* All other tabs (best-seller or any custom offer) */}
            {!isBogo && (
              <section className="offers-page__section">
                <div className="offers-page__section-header">
                  <h2 className="section-title">{activeTabLabel}</h2>
                  <div className="divider" />
                  {activeTabDesc && (
                    <p className="section-description">{activeTabDesc}</p>
                  )}
                </div>
                {tabProducts.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    No products available in this offer right now.
                  </p>
                ) : (
                  <div className="offers-page__product-grid">
                    {tabProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
