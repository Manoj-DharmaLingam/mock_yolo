import { useState, useEffect } from 'react'
import { getAdminCategories, updateCategories } from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import './Categories.css'

const DEFAULT_CATEGORIES = [
  { key: 'graphic-tees',     label: 'Graphic Tees',    sort_order: 0, visible: true },
  { key: 'oversized',        label: 'Oversized',        sort_order: 1, visible: true },
  { key: 'plain-essentials', label: 'Plain Essentials', sort_order: 2, visible: true },
  { key: 'limited-drops',    label: 'Limited Drops',    sort_order: 3, visible: true },
  { key: 'hoodies',          label: 'Hoodies',          sort_order: 4, visible: true },
  { key: 'polo',             label: 'Polo',             sort_order: 5, visible: true },
]

function slugify(str) {
  return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function Categories() {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [newKey, setNewKey] = useState('')
  const { showLoading, hideLoading } = useLoading()

  useEffect(() => {
    getAdminCategories()
      .then(r => setCats(r.data && r.data.length ? r.data : DEFAULT_CATEGORIES))
      .catch(() => setCats(DEFAULT_CATEGORIES))
      .finally(() => setLoading(false))
  }, [])

  const move = (idx, dir) => {
    const next = [...cats]
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= next.length) return
    ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
    setCats(next.map((c, i) => ({ ...c, sort_order: i })))
  }

  const update = (idx, field, value) => {
    setCats(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c))
  }

  const remove = (idx) => {
    if (!window.confirm('Remove this category?')) return
    setCats(prev => prev.filter((_, i) => i !== idx).map((c, i) => ({ ...c, sort_order: i })))
  }

  const addCategory = () => {
    const label = newLabel.trim()
    if (!label) return
    const key = newKey.trim() || slugify(label)
    if (!key) return
    if (cats.some(c => c.key === key)) {
      setError(`Category key "${key}" already exists.`)
      return
    }
    setCats(prev => [...prev, { key, label, sort_order: prev.length, visible: true }])
    setNewLabel('')
    setNewKey('')
    setError('')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    showLoading('Saving categories...')
    try {
      await updateCategories(cats)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to save.')
    } finally {
      setSaving(false)
      hideLoading()
    }
  }

  if (loading) return (
    <div className="cat-page">
      <div style={{ textAlign: 'center', padding: '3rem' }}>Loading…</div>
    </div>
  )

  return (
    <div className="cat-page">
      <div className="cat-page__header">
        <h1 className="cat-page__title">Shop Categories</h1>
        <p className="cat-page__sub">Manage the categories shown in the navigation shop menu.</p>
      </div>

      {error && <div className="cat-alert cat-alert--error">{error}</div>}
      {success && <div className="cat-alert cat-alert--success">✓ Categories saved successfully!</div>}

      <div className="cat-card">
        <div className="cat-list">
          {cats.map((cat, idx) => (
            <div key={cat.key} className={`cat-row ${!cat.visible ? 'cat-row--hidden' : ''}`}>
              <div className="cat-row__order">
                <button className="cat-order-btn" onClick={() => move(idx, -1)} disabled={idx === 0} title="Move up">▲</button>
                <span className="cat-row__num">{idx + 1}</span>
                <button className="cat-order-btn" onClick={() => move(idx, 1)} disabled={idx === cats.length - 1} title="Move down">▼</button>
              </div>

              <div className="cat-row__fields">
                <div className="cat-field">
                  <label>Label</label>
                  <input
                    value={cat.label}
                    onChange={e => update(idx, 'label', e.target.value)}
                    placeholder="Display name"
                  />
                </div>
                <div className="cat-field">
                  <label>Key (slug)</label>
                  <input
                    value={cat.key}
                    onChange={e => update(idx, 'key', slugify(e.target.value))}
                    placeholder="url-slug"
                  />
                </div>
              </div>

              <div className="cat-row__actions">
                <label className="cat-toggle" title={cat.visible ? 'Visible' : 'Hidden'}>
                  <input
                    type="checkbox"
                    checked={cat.visible}
                    onChange={e => update(idx, 'visible', e.target.checked)}
                  />
                  <span className="cat-toggle__track" />
                  <span className="cat-toggle__label">{cat.visible ? 'Visible' : 'Hidden'}</span>
                </label>
                <button className="cat-del-btn" onClick={() => remove(idx)} title="Delete">✕</button>
              </div>
            </div>
          ))}
        </div>

        <div className="cat-add">
          <h3 className="cat-add__title">Add New Category</h3>
          <div className="cat-add__row">
            <input
              value={newLabel}
              onChange={e => {
                setNewLabel(e.target.value)
                if (!newKey) setNewKey(slugify(e.target.value))
              }}
              placeholder="Label (e.g. Hoodies)"
              className="cat-add__input"
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <input
              value={newKey}
              onChange={e => setNewKey(slugify(e.target.value))}
              placeholder="Key (e.g. hoodies)"
              className="cat-add__input"
              onKeyDown={e => e.key === 'Enter' && addCategory()}
            />
            <button className="cat-add__btn" onClick={addCategory}>+ Add</button>
          </div>
        </div>
      </div>

      <div className="cat-save-row">
        <button
          className="cat-save-btn"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          className="cat-reset-btn"
          onClick={() => { if (window.confirm('Reset to defaults?')) setCats(DEFAULT_CATEGORIES) }}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
