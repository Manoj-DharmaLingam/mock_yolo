import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  createProduct,
  updateProduct,
  getProductById,
  uploadImage,
  getAdminOffers,
  getAdminCategories,
} from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import { API_ORIGIN } from '../api/runtimeConfig'
import './AddProduct.css'

const EMPTY = {
  name: '', description: '', price: '', discount_price: '', category: '',
  sub_category: '', stock: 0, available: true, badge: '', material: '',
  fit: '', rating: 0, reviews: 0,
  is_best_seller: false, is_bogo: false,
  offer_type: 'none', offer_end_time: '',
  sizes: [], colors: [], tags: [], image_urls: [],
}

export default function AddProduct() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploading, setUploading] = useState(false)
  const [offers, setOffers] = useState([])
  const [categories, setCategories] = useState([])
  const fileRef = useRef()

  // Tag/size/color input helpers
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Fetch product if editing
  useEffect(() => {
    if (!isEdit) return
    getProductById(id)
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price || '',
          discount_price: data.discountPrice || '',
          category: data.category || '',
          sub_category: data.subCategory || '',
          stock: data.stock || 0,
          available: data.available ?? true,
          badge: data.badge || '',
          material: data.material || '',
          fit: data.fit || '',
          rating: data.rating || 0,
          reviews: data.reviews || 0,
          is_best_seller: data.isBestSeller || false,
          is_bogo: data.isBogo || false,
          offer_type: data.offerType || 'none',
          offer_end_time: data.offerEndTime || '',
          sizes: data.sizes || [],
          colors: data.colors || [],
          tags: data.tags || [],
          image_urls: data.images || [],
        })
      })
      .catch(() => setError('Failed to load product.'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  // Fetch offers for dropdown
  useEffect(() => {
    getAdminOffers()
      .then(({ data }) => setOffers(data.filter(o => o.enabled)))
      .catch(() => {})
  }, [])

  // Fetch categories for dropdown
  useEffect(() => {
    getAdminCategories()
      .then(({ data }) => setCategories((data || []).filter(c => c.visible !== false)))
      .catch(() => {})
  }, [])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // Upload image to backend
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData()
          fd.append('file', file)
          const { data } = await uploadImage(fd)
          return data.url
        })
      )
      setForm((f) => ({ ...f, image_urls: [...f.image_urls, ...urls] }))
    } catch {
      setError('Image upload failed. Make sure you are logged in.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }))

  // Tag / size / color adders
  const addSize = () => {
    const v = sizeInput.trim().toUpperCase()
    if (v && !form.sizes.includes(v)) set('sizes', [...form.sizes, v])
    setSizeInput('')
  }
  const addColor = () => {
    const v = colorInput.trim()
    if (v && !form.colors.includes(v)) set('colors', [...form.colors, v])
    setColorInput('')
  }
  const addTag = () => {
    const v = tagInput.trim().toLowerCase()
    if (v && !form.tags.includes(v)) set('tags', [...form.tags, v])
    setTagInput('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    showLoading(isEdit ? 'Updating product...' : 'Creating product...')

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
      stock: parseInt(form.stock) || 0,
      rating: parseFloat(form.rating) || 0,
      reviews: parseInt(form.reviews) || 0,
      offer_type: form.offer_type !== 'none' ? form.offer_type : null,
      offer_end_time: form.offer_end_time || null,
    }

    try {
      if (isEdit) {
        await updateProduct(id, payload)
        setSuccess('Product updated successfully!')
      } else {
        await createProduct(payload)
        setSuccess('Product created successfully!')
        setForm(EMPTY)
      }
      setTimeout(() => navigate('/admin/products'), 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed. Check all fields.')
    } finally {
      setLoading(false)
      hideLoading()
    }
  }

  if (fetching) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="add-product">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1>
          <p className="page-subtitle">{isEdit ? `Editing product #${id}` : 'Create a new product listing'}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/admin/products')}>
            ← Back
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="add-product__grid">
          {/* ── LEFT COLUMN ── */}
          <div className="add-product__col">
            <div className="admin-card">
              <h3 className="add-product__section-title">Basic Information</h3>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-control" value={form.name} onChange={(e) => set('name', e.target.value)} required placeholder="e.g. Street Signal Tee" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Product description…" />
              </div>
              <div className="add-product__row">
                <div className="form-group">
                  <label className="form-label">Original Price (₹) *</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} required placeholder="1299" />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount Price (₹)</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.discount_price} onChange={(e) => set('discount_price', e.target.value)} placeholder="899" />
                </div>
              </div>
              <div className="add-product__row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-control" value={form.category} onChange={(e) => set('category', e.target.value)}>
                    <option value="">Select…</option>
                    {categories.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sub-Category</label>
                  <input className="form-control" value={form.sub_category} onChange={(e) => set('sub_category', e.target.value)} placeholder="e.g. Graphic" />
                </div>
              </div>
                <div className="add-product__row">
                <div className="form-group">
                   <label className="form-label">Stock Quantity *</label>
                   <input className="form-control" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} required />
                 </div>
                 <div className="form-group">
                   <label className="form-label">Badge</label>
                   <select className="form-control" value={form.badge} onChange={(e) => set('badge', e.target.value)}>
                     <option value="">None</option>
                     <option value="New">New</option>
                     <option value="Bestseller">Bestseller</option>
                     <option value="Limited">Limited</option>
                     <option value="Sale">Sale</option>
                     <option value="Trending">Trending</option>
                   </select>
                 </div>
               </div>
               <div className="add-product__row">
                 <div className="form-group">
                   <label className="form-label">Material</label>
                   <select className="form-control" value={form.material} onChange={(e) => set('material', e.target.value)}>
                     <option value="">Select…</option>
                     <option value="100% Cotton 220GSM">100% Cotton 220GSM</option>
                     <option value="100% Cotton 180GSM">100% Cotton 180GSM</option>
                     <option value="Poly-Cotton Blend">Poly-Cotton Blend</option>
                     <option value="100% Polyester">100% Polyester</option>
                   </select>
                 </div>
                 <div className="form-group">
                   <label className="form-label">Fit</label>
                   <select className="form-control" value={form.fit} onChange={(e) => set('fit', e.target.value)}>
                     <option value="">Select…</option>
                     <option value="Regular Fit">Regular Fit</option>
                     <option value="Oversized Fit">Oversized Fit</option>
                     <option value="Slim Fit">Slim Fit</option>
                     <option value="Relaxed Fit">Relaxed Fit</option>
                   </select>
                 </div>
               </div>
              <div className="add-product__row">
                <div className="form-group">
                  <label className="form-label">Rating (0–5)</label>
                  <input className="form-control" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(e) => set('rating', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reviews Count</label>
                  <input className="form-control" type="number" min="0" value={form.reviews} onChange={(e) => set('reviews', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="admin-card" style={{ marginTop: '1.25rem' }}>
              <h3 className="add-product__section-title">Flags</h3>
              <div className="add-product__flags">
                <label className="toggle-wrap">
                  <label className="toggle">
                    <input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  Available for purchase
                </label>
                <label className="toggle-wrap">
                  <label className="toggle">
                    <input type="checkbox" checked={form.is_best_seller} onChange={(e) => set('is_best_seller', e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  Best Seller
                </label>
                <label className="toggle-wrap">
                  <label className="toggle">
                    <input type="checkbox" checked={form.is_bogo} onChange={(e) => set('is_bogo', e.target.checked)} />
                    <span className="toggle-slider" />
                  </label>
                  Buy 1 Get 1 (BOGO)
                </label>
              </div>
              
              <div className="add-product__row" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Offer Type</label>
                  <select className="form-control" value={form.offer_type} onChange={(e) => set('offer_type', e.target.value)}>
                    <option value="none">None</option>
                    {offers.map((offer) => (
                      <option key={offer.offer_key} value={offer.offer_key}>
                        {offer.label}
                      </option>
                    ))}
                  </select>
                </div>
                {form.offer_type !== 'none' && (
                  <div className="form-group">
                    <label className="form-label">Offer End Time</label>
                    <input
                      className="form-control"
                      type="datetime-local"
                      value={form.offer_end_time}
                      onChange={(e) => set('offer_end_time', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="add-product__col">
            {/* Images */}
            <div className="admin-card">
              <h3 className="add-product__section-title">Product Images</h3>
              <div className="img-preview-list">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="img-preview-item">
                    <img
                      src={url.startsWith('http') ? url : `${API_ORIGIN}${url}`}
                      alt=""
                    />
                    <button type="button" className="img-preview-item__remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="add-product__upload-row">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? 'Uploading…' : '+ Upload Images'}
                </button>
                {uploading && <div className="spinner spinner-sm" />}
              </div>
              <p className="add-product__hint">You can also paste an image URL below:</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input id="urlInput" className="form-control" placeholder="https://…" style={{ flex: 1 }} />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    const v = document.getElementById('urlInput').value.trim()
                    if (v) { setForm((f) => ({ ...f, image_urls: [...f.image_urls, v] })); document.getElementById('urlInput').value = '' }
                  }}
                >Add</button>
              </div>
            </div>

            {/* Sizes */}
            <div className="admin-card" style={{ marginTop: '1.25rem' }}>
              <h3 className="add-product__section-title">Sizes</h3>
              <div className="add-product__chips">
                {form.sizes.map((s) => (
                  <span key={s} className="add-product__chip">
                    {s}
                    <button type="button" onClick={() => set('sizes', form.sizes.filter((x) => x !== s))}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input className="form-control" value={sizeInput} onChange={(e) => setSizeInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} placeholder="XS, S, M, L…" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addSize}>Add</button>
              </div>
            </div>

            {/* Colors */}
            <div className="admin-card" style={{ marginTop: '1.25rem' }}>
              <h3 className="add-product__section-title">Colors</h3>
              <div className="add-product__chips">
                {form.colors.map((c) => (
                  <span key={c} className="add-product__chip">
                    <span style={{ display: 'inline-block', width: 12, height: 12, background: c, border: '1px solid #ccc', marginRight: 4 }} />
                    {c}
                    <button type="button" onClick={() => set('colors', form.colors.filter((x) => x !== c))}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input className="form-control" value={colorInput} onChange={(e) => setColorInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} placeholder="#0a0a0a or red" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addColor}>Add</button>
              </div>
            </div>

            {/* Tags */}
            <div className="admin-card" style={{ marginTop: '1.25rem' }}>
              <h3 className="add-product__section-title">Tags</h3>
              <div className="add-product__chips">
                {form.tags.map((t) => (
                  <span key={t} className="add-product__chip">
                    {t}
                    <button type="button" onClick={() => set('tags', form.tags.filter((x) => x !== t))}>✕</button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <input className="form-control" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="streetwear, bold…" />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addTag}>Add</button>
              </div>
            </div>
          </div>
        </div>

        <div className="add-product__submit">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
