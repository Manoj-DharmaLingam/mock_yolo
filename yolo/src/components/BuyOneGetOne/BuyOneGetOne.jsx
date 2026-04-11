import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../ProductCard/ProductCard'
import { getBogoProducts, getOfferSettings } from '../../services/api'
import './BuyOneGetOne.css'

// Countdown hook — driven by an absolute end timestamp (ms)
function useCountdown(endMs) {
  const calc = () => {
    if (!endMs) return null
    const diff = Math.max(0, endMs - Date.now())
    if (diff === 0) return { h: 0, m: 0, s: 0, expired: true }
    return {
      h: Math.floor(diff / 3_600_000),
      m: Math.floor((diff % 3_600_000) / 60_000),
      s: Math.floor((diff % 60_000) / 1_000),
      expired: false,
    }
  }
  const [time, setTime] = useState(calc)

  useEffect(() => {
    if (!endMs) { setTime(null); return }
    setTime(calc())
    const id = setInterval(() => setTime(calc()), 1_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endMs])

  return time
}

export default function BuyOneGetOne({ products: propProducts, embedded = false }) {
  const [products, setProducts] = useState(propProducts || [])
  const [productsLoaded, setProductsLoaded] = useState(false)
  const [offerEnabled, setOfferEnabled] = useState(null)  // null = loading
  const [endMs, setEndMs] = useState(null)
  const [settingsLoaded, setSettingsLoaded] = useState(false)

  const time = useCountdown(endMs)
  const pad = n => String(n).padStart(2, '0')

  // Fetch admin-controlled offer settings
  useEffect(() => {
    getOfferSettings()
      .then(settings => {
        const bogo = settings?.bogo || settings?.['buy-1-get-1']
        // Only hide if explicitly disabled. If no settings yet → show by default.
        if (bogo?.enabled === false) {
          setOfferEnabled(false)
        } else {
          setOfferEnabled(true)
          if (bogo?.end_time) {
            setEndMs(new Date(bogo.end_time).getTime())
          } else {
            setEndMs(null)
          }
        }
      })
      .catch(() => {
        // If API fails, still show the section (products will load independently)
        setOfferEnabled(true)
      })
      .finally(() => setSettingsLoaded(true))
  }, [])

  useEffect(() => {
    if (propProducts) { setProducts(propProducts); setProductsLoaded(true); return }
    getBogoProducts()
      .then(data => {
        console.log('BOGO products loaded:', data)
        setProducts(data || [])
      })
      .catch(err => {
        console.error('Failed to load BOGO products:', err)
        setProducts([])
      })
      .finally(() => setProductsLoaded(true))
  }, [propProducts])

  // Hide while loading to avoid flash, and if admin explicitly disabled it
  if (!settingsLoaded || !productsLoaded) return null
  if (offerEnabled === false) return null
  // If enabled but no BOGO products exist, hide section entirely
  if (products.length === 0) return null

  const expired = time?.expired === true
  const showTimer = endMs !== null && time !== null && !expired

  return (
    <section className={`bogo${embedded ? ' bogo--embedded' : ' section'}`}>
      <div className={embedded ? '' : 'container'}>
        <div className="bogo__banner">
          <div className="bogo__banner-content">
            <div className="bogo__tag">Limited Time Offer</div>
            <h2 className="bogo__banner-title">
              Buy 1, Get 1 <em>Free</em>
            </h2>
            <p className="bogo__banner-desc">
              On all eligible products. No coupon code needed — discount applied automatically at checkout.
            </p>
            <Link to="/offers?type=buy-1-get-1" className="btn btn-ghost btn-lg">
              Claim Offer
            </Link>
          </div>

          <div className="bogo__timer-wrap">
            {showTimer ? (
              <>
                <div className="bogo__timer-label">Offer Ends In</div>
                <div className="bogo__timer-digits">
                  <div className="bogo__digit">
                    <span className="bogo__digit-num">{pad(time.h)}</span>
                    <span className="bogo__digit-unit">Hrs</span>
                  </div>
                  <span className="bogo__colon">:</span>
                  <div className="bogo__digit">
                    <span className="bogo__digit-num">{pad(time.m)}</span>
                    <span className="bogo__digit-unit">Min</span>
                  </div>
                  <span className="bogo__colon">:</span>
                  <div className="bogo__digit">
                    <span className="bogo__digit-num">{pad(time.s)}</span>
                    <span className="bogo__digit-unit">Sec</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="bogo__timer-label" style={{ fontSize: '1rem', opacity: 0.75 }}>
                While stocks last
              </div>
            )}
          </div>
        </div>

        {products.length > 0 && (
          <>
            <div className="bogo__products-label">Eligible Products</div>
            <div className="bogo__grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

