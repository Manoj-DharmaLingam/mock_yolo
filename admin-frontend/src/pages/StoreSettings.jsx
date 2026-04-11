import { useEffect, useState } from 'react'
import { getStoreSettings, updateStoreSettings } from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'

export default function StoreSettings() {
  const [form, setForm] = useState({
    shipping_price: 79,
    free_shipping_threshold: 1499,
    offer_discount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: 'success' })
  const { showLoading, hideLoading } = useLoading()

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 3500)
  }

  useEffect(() => {
    getStoreSettings()
      .then(r => setForm(prev => ({ ...prev, ...r.data })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    showLoading('Saving settings...')
    try {
      await updateStoreSettings(form)
      flash('Store settings saved successfully.')
    } catch {
      flash('Failed to save settings. Please try again.', 'error')
    } finally {
      setSaving(false)
      hideLoading()
    }
  }

  const exampleLow = form.shipping_price
  const exampleHigh = 0

  return (
    <div className="products-page" style={{ maxWidth: 620 }}>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Store Settings</h1>
          <p className="page-subtitle">Configure shipping prices and discount offers.</p>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-700)' }}>
              Shipping Settings
            </h3>

            <div className="form-group">
              <label className="form-label">Base Shipping Price (₹)</label>
              <input
                className="form-control"
                type="number"
                name="shipping_price"
                min="0"
                step="1"
                value={form.shipping_price}
                onChange={handleChange}
                required
              />
              <p className="form-hint">Charged when order is below the free shipping threshold.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Free Shipping Threshold (₹)</label>
              <input
                className="form-control"
                type="number"
                name="free_shipping_threshold"
                min="0"
                step="1"
                value={form.free_shipping_threshold}
                onChange={handleChange}
                required
              />
              <p className="form-hint">Orders at or above this amount get free shipping.</p>
            </div>

            <div className="settings-preview">
              <div className="settings-preview__title">Live Preview</div>
              <div className="settings-preview__row">
                <span>Order below ₹{form.free_shipping_threshold}</span>
                <span className="settings-preview__charge">+ ₹{exampleLow} shipping</span>
              </div>
              <div className="settings-preview__row">
                <span>Order ₹{form.free_shipping_threshold}+</span>
                <span className="settings-preview__free">FREE shipping ✓</span>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--gray-700)' }}>
              Discount / Offer
            </h3>

            <div className="form-group">
              <label className="form-label">Offer Discount (%)</label>
              <input
                className="form-control"
                type="number"
                name="offer_discount"
                min="0"
                max="100"
                step="0.5"
                value={form.offer_discount}
                onChange={handleChange}
              />
              <p className="form-hint">Set 0 to disable any automatic discount. Applied to all orders at checkout.</p>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ minWidth: 140 }}
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      )}
    </div>
  )
}
