import { useState, useEffect } from 'react'
import api, { uploadImage } from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import { API_ORIGIN } from '../api/runtimeConfig'
import './HeroSlides.css'

const BASE_URL = API_ORIGIN

function resolveImg(url) {
  if (!url) return ''
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

const emptyForm = {
  image_url: '',
  title: '',
  subtitle: '',
  button_text: 'Shop Now',
  button_link: '/products',
  sort_order: 0,
  active: true,
}

export default function HeroSlides() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null) // { type: 'success'|'error', text }
  const [imgMode, setImgMode] = useState('upload') // 'upload' | 'link'
  const [linkInput, setLinkInput] = useState('')
  const { showLoading, hideLoading } = useLoading()

  const flash = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  const load = async () => {
    try {
      const { data } = await api.get('/admin/hero-slides')
      setSlides(data)
    } catch {
      flash('error', 'Failed to load slides.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setForm({ ...emptyForm, sort_order: slides.length })
    setEditId(null)
    setImgMode('upload')
    setLinkInput('')
    setShowForm(true)
  }

  const openEdit = (slide) => {
    setForm({
      image_url: slide.image_url || '',
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      button_text: slide.button_text || 'Shop Now',
      button_link: slide.button_link || '/products',
      sort_order: slide.sort_order ?? 0,
      active: slide.active ?? true,
    })
    setEditId(slide.id)
    const isLink = (slide.image_url || '').startsWith('http')
    setImgMode(isLink ? 'link' : 'upload')
    setLinkInput(isLink ? slide.image_url : '')
    setShowForm(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      const { data } = await uploadImage(fd)
      setForm(f => ({ ...f, image_url: data.url }))
    } catch {
      flash('error', 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { flash('error', 'Title is required.'); return }
    if (!form.image_url.trim()) { flash('error', 'Please upload an image.'); return }
    setSaving(true)
    showLoading(editId ? 'Updating slide...' : 'Creating slide...')
    try {
      if (editId) {
        await api.put(`/admin/hero-slides/${editId}`, form)
        flash('success', 'Slide updated.')
      } else {
        await api.post('/admin/hero-slides', form)
        flash('success', 'Slide created.')
      }
      setShowForm(false)
      load()
    } catch {
      flash('error', 'Save failed. Please try again.')
    } finally {
      setSaving(false)
      hideLoading()
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return
    showLoading('Deleting slide...')
    try {
      await api.delete(`/admin/hero-slides/${id}`)
      flash('success', 'Slide deleted.')
      load()
    } catch {
      flash('error', 'Delete failed.')
    } finally {
      hideLoading()
    }
  }

  const handleToggle = async (slide) => {
    showLoading('Updating status...')
    try {
      await api.put(`/admin/hero-slides/${slide.id}`, { active: !slide.active })
      load()
    } catch {
      flash('error', 'Toggle failed.')
    } finally {
      hideLoading()
    }
  }

  const moveSlide = async (idx, dir) => {
    const next = slides.map(s => s.id)
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]]
    showLoading('Reordering...')
    try {
      await api.put('/admin/hero-slides-reorder', { ordered_ids: next })
      load()
    } catch {
      flash('error', 'Reorder failed.')
    } finally {
      hideLoading()
    }
  }

  return (
    <div className="hs-page">
      <div className="hs-header">
        <h1 className="hs-title">Hero Banner Slides</h1>
        <button className="hs-btn hs-btn--primary" onClick={openAdd}>+ Add Slide</button>
      </div>

      {msg && (
        <div className={`hs-alert hs-alert--${msg.type}`}>{msg.text}</div>
      )}

      {loading ? (
        <p className="hs-loading">Loading slides…</p>
      ) : slides.length === 0 ? (
        <div className="hs-empty">
          <p>No slides yet. Add your first hero banner slide.</p>
        </div>
      ) : (
        <div className="hs-list">
          {slides.map((slide, idx) => (
            <div key={slide.id} className={`hs-card ${!slide.active ? 'hs-card--inactive' : ''}`}>
              <div className="hs-card__thumb">
                {slide.image_url
                  ? <img src={resolveImg(slide.image_url)} alt={slide.title} />
                  : <div className="hs-card__no-img">No Image</div>
                }
              </div>
              <div className="hs-card__info">
                <div className="hs-card__title">{slide.title}</div>
                {slide.subtitle && <div className="hs-card__sub">{slide.subtitle}</div>}
                <div className="hs-card__meta">
                  <span className={`hs-badge ${slide.active ? 'hs-badge--on' : 'hs-badge--off'}`}>
                    {slide.active ? 'Active' : 'Hidden'}
                  </span>
                  <span className="hs-card__order">Order: {slide.sort_order}</span>
                  {slide.button_text && <span className="hs-card__btn-preview">Button: "{slide.button_text}"</span>}
                </div>
              </div>
              <div className="hs-card__actions">
                <button className="hs-icon-btn" title="Move Up" onClick={() => moveSlide(idx, -1)} disabled={idx === 0}>↑</button>
                <button className="hs-icon-btn" title="Move Down" onClick={() => moveSlide(idx, 1)} disabled={idx === slides.length - 1}>↓</button>
                <button
                  className={`hs-icon-btn ${slide.active ? 'hs-icon-btn--warn' : 'hs-icon-btn--ok'}`}
                  onClick={() => handleToggle(slide)}
                  title={slide.active ? 'Hide slide' : 'Show slide'}
                >
                  {slide.active ? 'Hide' : 'Show'}
                </button>
                <button className="hs-icon-btn hs-icon-btn--edit" onClick={() => openEdit(slide)}>Edit</button>
                <button className="hs-icon-btn hs-icon-btn--del" onClick={() => handleDelete(slide.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal form ── */}
      {showForm && (
        <div className="hs-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="hs-modal" onClick={e => e.stopPropagation()}>
            <div className="hs-modal__header">
              <h2>{editId ? 'Edit Slide' : 'New Slide'}</h2>
              <button className="hs-modal__close" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <div className="hs-modal__body">
              {/* Image source toggle */}
              <div className="hs-field">
                <span>Slide Image</span>
                <div className="hs-img-tabs">
                  <button
                    type="button"
                    className={`hs-img-tab${imgMode === 'upload' ? ' hs-img-tab--active' : ''}`}
                    onClick={() => setImgMode('upload')}
                  >
                    ↑ Upload File
                  </button>
                  <button
                    type="button"
                    className={`hs-img-tab${imgMode === 'link' ? ' hs-img-tab--active' : ''}`}
                    onClick={() => setImgMode('link')}
                  >
                    🔗 Paste Link
                  </button>
                </div>

                {imgMode === 'upload' && (
                  <>
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    {uploading && <span className="hs-hint">Uploading…</span>}
                  </>
                )}

                {imgMode === 'link' && (
                  <input
                    type="url"
                    className="hs-url-input"
                    placeholder="https://res.cloudinary.com/…"
                    value={linkInput}
                    onChange={e => {
                      setLinkInput(e.target.value)
                      setForm(f => ({ ...f, image_url: e.target.value.trim() }))
                    }}
                  />
                )}
              </div>

              {form.image_url && (
                <div className="hs-preview">
                  <img src={resolveImg(form.image_url)} alt="preview" />
                </div>
              )}

              <label className="hs-field">
                <span>Title *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="WEAR BOLD. LIVE FREE."
                />
              </label>

              <label className="hs-field">
                <span>Subtitle / Description</span>
                <textarea
                  value={form.subtitle}
                  onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                  rows={2}
                  placeholder="Premium streetwear tees…"
                />
              </label>

              <div className="hs-row">
                <label className="hs-field">
                  <span>Button Text</span>
                  <input
                    type="text"
                    value={form.button_text}
                    onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))}
                    placeholder="Shop Now"
                  />
                </label>
                <label className="hs-field">
                  <span>Button Link</span>
                  <input
                    type="text"
                    value={form.button_link}
                    onChange={e => setForm(f => ({ ...f, button_link: e.target.value }))}
                    placeholder="/products"
                  />
                </label>
              </div>

              <div className="hs-row">
                <label className="hs-field">
                  <span>Sort Order</span>
                  <input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                  />
                </label>
                <label className="hs-field hs-field--check">
                  <span>Active</span>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  />
                </label>
              </div>
            </div>

            <div className="hs-modal__footer">
              <button className="hs-btn" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="hs-btn hs-btn--primary" onClick={handleSave} disabled={saving || uploading}>
                {saving ? 'Saving…' : 'Save Slide'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
