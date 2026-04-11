import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  getAdminComboOffers,
  getAdminComboOffer,
  createComboOffer,
  updateComboOffer,
  deleteComboOffer,
  toggleComboOffer,
  initComboTable,
} from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import { API_ORIGIN } from '../api/runtimeConfig'
import './ComboOffersManagement.css'

const CATEGORIES = [
  'graphic-tees', 'oversized', 'plain-essentials',
  'limited-drops', 'hoodies', 'polo', 'combo-special',
]

const EMPTY_FORM = {
  name: '',
  description: '',
  pick_count: 2,
  combo_price: 0,
  original_price: 0,
  badge_text: 'Combo Offer',
  image_urls: [],
  category: '',
  material: '',
  fit: '',
  sizes: [],
  colors: [],
  is_couple_offer: false,
  men_sizes: [],
  men_colors: [],
  women_sizes: [],
  women_colors: [],
  variant_stock: {},
  is_active: true,
}

export default function ComboOffersManagement() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const isForm = isEdit || window.location.pathname.includes('/add')
  const navigate = useNavigate()
  const { showLoading, hideLoading } = useLoading()

  // List state
  const [combos, setCombos] = useState([])
  const [listLoading, setListLoading] = useState(true)

  // Form state
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Input helpers
  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')
  const [imageUrlInput, setImageUrlInput] = useState('')
  const [menSizeInput, setMenSizeInput] = useState('')
  const [menColorInput, setMenColorInput] = useState('')
  const [womenSizeInput, setWomenSizeInput] = useState('')
  const [womenColorInput, setWomenColorInput] = useState('')
  const fileRef = useRef()

  // Load combo list
  useEffect(() => {
    if (!isForm) {
      loadCombos()
    }
  }, [isForm])

  // Load single combo for editing
  useEffect(() => {
    if (!isEdit) return
    setFetching(true)
    getAdminComboOffer(id)
      .then(({ data }) => {
        setForm({
          name: data.name || '',
          description: data.description || '',
          pick_count: data.pick_count || 2,
          combo_price: data.combo_price || 0,
          original_price: data.original_price || 0,
          badge_text: data.badge_text || 'Combo Offer',
          image_urls: data.image_urls || [],
          category: data.category || '',
          material: data.material || '',
          fit: data.fit || '',
          sizes: data.sizes || [],
          colors: data.colors || [],
          is_couple_offer: data.is_couple_offer || false,
          men_sizes: data.men_sizes || [],
          men_colors: data.men_colors || [],
          women_sizes: data.women_sizes || [],
          women_colors: data.women_colors || [],
          variant_stock: data.variant_stock || {},
          is_active: data.is_active ?? true,
        })
      })
      .catch(() => setError('Failed to load combo offer.'))
      .finally(() => setFetching(false))
  }, [id, isEdit])

  const loadCombos = async () => {
    setListLoading(true)
    try {
      const { data } = await getAdminComboOffers(true)
      setCombos(data || [])
      setError('')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to load combo offers.'
      setError(msg)
    } finally {
      setListLoading(false)
    }
  }

  const handleInitTable = async () => {
    setLoading(true)
    setError('')
    try {
      await initComboTable()
      setSuccess('Combo table initialized successfully!')
      loadCombos()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initialize table.')
    } finally {
      setLoading(false)
    }
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  // Image URL add
  const addImageUrl = () => {
    const url = imageUrlInput.trim()
    if (!url) return
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('Please enter a valid URL starting with http:// or https://')
      return
    }
    setForm((f) => ({ ...f, image_urls: [...f.image_urls, url] }))
    setImageUrlInput('')
  }

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, image_urls: f.image_urls.filter((_, i) => i !== idx) }))

  // Size / Color adders
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

  // Men's size/color adders
  const addMenSize = () => {
    const v = menSizeInput.trim().toUpperCase()
    if (v && !form.men_sizes.includes(v)) set('men_sizes', [...form.men_sizes, v])
    setMenSizeInput('')
  }

  const addMenColor = () => {
    const v = menColorInput.trim()
    if (v && !form.men_colors.includes(v)) set('men_colors', [...form.men_colors, v])
    setMenColorInput('')
  }

  // Women's size/color adders
  const addWomenSize = () => {
    const v = womenSizeInput.trim().toUpperCase()
    if (v && !form.women_sizes.includes(v)) set('women_sizes', [...form.women_sizes, v])
    setWomenSizeInput('')
  }

  const addWomenColor = () => {
    const v = womenColorInput.trim()
    if (v && !form.women_colors.includes(v)) set('women_colors', [...form.women_colors, v])
    setWomenColorInput('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    showLoading(isEdit ? 'Updating combo offer...' : 'Creating combo offer...')

    const payload = {
      ...form,
      combo_price: parseFloat(form.combo_price) || 0,
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      pick_count: parseInt(form.pick_count) || 2,
    }

    try {
      if (isEdit) {
        await updateComboOffer(id, payload)
        setSuccess('Combo offer updated successfully!')
      } else {
        await createComboOffer(payload)
        setSuccess('Combo offer created successfully!')
        setForm(EMPTY_FORM)
      }
      setTimeout(() => navigate('/admin/combo-offers'), 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed. Check all fields.')
    } finally {
      setLoading(false)
      hideLoading()
    }
  }

  const handleDelete = async (comboId) => {
    if (!window.confirm('Delete this combo offer? This cannot be undone.')) return
    showLoading('Deleting combo offer...')
    try {
      await deleteComboOffer(comboId)
      loadCombos()
    } catch {
      setError('Failed to delete combo offer.')
    } finally {
      hideLoading()
    }
  }

  const handleToggle = async (comboId) => {
    showLoading('Updating status...')
    try {
      await toggleComboOffer(comboId)
      loadCombos()
    } catch {
      setError('Failed to toggle combo offer status.')
    } finally {
      hideLoading()
    }
  }

  // Computed savings
  const savings = form.original_price > form.combo_price 
    ? (form.original_price - form.combo_price).toFixed(2)
    : null

  // ── LIST VIEW ──
  if (!isForm) {
    return (
      <div className="combo-management">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Combo Offers</h1>
            <p className="page-subtitle">Manage your combo deals</p>
          </div>
          <div className="page-actions">
            <button 
              className="btn btn-secondary"
              onClick={handleInitTable}
              disabled={loading}
              title="Initialize combo tables in database"
            >
              {loading ? 'Initializing...' : '⚙️ Init Table'}
            </button>
            <Link to="/admin/combo-offers/add" className="btn btn-primary">
              + Add Combo Offer
            </Link>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            {error.includes('table') && (
              <button className="btn btn-sm btn-warning" onClick={handleInitTable} style={{marginLeft: '10px'}}>
                Initialize Table
              </button>
            )}
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}

        {listLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : combos.length === 0 ? (
          <div className="empty-state">
            <p>No combo offers yet. Create your first combo!</p>
          </div>
        ) : (
          <div className="combo-grid">
            {combos.map((combo) => (
              <div key={combo.id} className={`combo-card ${!combo.is_active ? 'inactive' : ''}`}>
                <div className="combo-card__image">
                  {combo.image_urls?.[0] ? (
                    <img src={combo.image_urls[0]} alt={combo.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  <span className={`status-badge ${combo.is_active ? 'active' : 'inactive'}`}>
                    {combo.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {combo.is_couple_offer && (
                    <span className="couple-badge">💑 COUPLE</span>
                  )}
                </div>
                <div className="combo-card__body">
                  <h3>{combo.name}</h3>
                  <p className="combo-card__meta">
                    {combo.is_couple_offer ? 'Couple Offer' : `Pick ${combo.pick_count}`} • ₹{combo.combo_price}
                    {combo.original_price > combo.combo_price && (
                      <span className="original-price">₹{combo.original_price}</span>
                    )}
                  </p>
                  <p className="combo-card__variants">
                    {combo.is_couple_offer 
                      ? `Men: ${combo.men_sizes?.length || 0} sizes • Women: ${combo.women_sizes?.length || 0} sizes`
                      : `${combo.sizes?.length || 0} sizes • ${combo.colors?.length || 0} colors`
                    }
                  </p>
                </div>
                <div className="combo-card__actions">
                  <Link to={`/admin/combo-offers/edit/${combo.id}`} className="btn btn-sm btn-secondary">
                    Edit
                  </Link>
                  <button 
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleToggle(combo.id)}
                  >
                    {combo.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(combo.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ── FORM VIEW (Add/Edit) ──
  if (fetching) return <div className="loading-center"><div className="spinner" /></div>

  return (
    <div className="combo-management combo-form-view">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isEdit ? 'Edit Combo Offer' : 'Add Combo Offer'}</h1>
          <p className="page-subtitle">{isEdit ? `Editing combo #${id}` : 'Create a new combo offer'}</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-ghost" onClick={() => navigate('/admin/combo-offers')}>
            ← Back
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          {/* ── LEFT COLUMN ── */}
          <div className="form-col">
            <div className="admin-card">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label className="form-label">Combo Name *</label>
                <input 
                  className="form-control" 
                  value={form.name} 
                  onChange={(e) => set('name', e.target.value)} 
                  required 
                  placeholder="e.g. Pick Any 3 T-Shirts" 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={form.description} 
                  onChange={(e) => set('description', e.target.value)} 
                  placeholder="Describe the combo offer..." 
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Pick Count *</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    min="1" 
                    value={form.pick_count} 
                    onChange={(e) => set('pick_count', e.target.value)} 
                    required 
                  />
                  <small>Number of items user must select</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Badge Text</label>
                  <input 
                    className="form-control" 
                    value={form.badge_text} 
                    onChange={(e) => set('badge_text', e.target.value)} 
                    placeholder="Combo Offer" 
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Combo Price (₹) *</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={form.combo_price} 
                    onChange={(e) => set('combo_price', e.target.value)} 
                    required 
                    placeholder="999" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Original Price (₹)</label>
                  <input 
                    className="form-control" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    value={form.original_price} 
                    onChange={(e) => set('original_price', e.target.value)} 
                    placeholder="1499" 
                  />
                  {savings && <small className="savings">Save ₹{savings}</small>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-control" 
                    value={form.category} 
                    onChange={(e) => set('category', e.target.value)}
                  >
                    <option value="">Select…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Material</label>
                  <select 
                    className="form-control" 
                    value={form.material} 
                    onChange={(e) => set('material', e.target.value)}
                  >
                    <option value="">Select…</option>
                    <option value="100% Cotton 220GSM">100% Cotton 220GSM</option>
                    <option value="100% Cotton 180GSM">100% Cotton 180GSM</option>
                    <option value="Poly-Cotton Blend">Poly-Cotton Blend</option>
                    <option value="100% Polyester">100% Polyester</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Fit</label>
                <select 
                  className="form-control" 
                  value={form.fit} 
                  onChange={(e) => set('fit', e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="Regular Fit">Regular Fit</option>
                  <option value="Oversized Fit">Oversized Fit</option>
                  <option value="Slim Fit">Slim Fit</option>
                  <option value="Relaxed Fit">Relaxed Fit</option>
                </select>
              </div>

              <div className="form-group">
                <label className="toggle-wrap">
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={form.is_active} 
                      onChange={(e) => set('is_active', e.target.checked)} 
                    />
                    <span className="toggle-slider" />
                  </label>
                  Active (visible to customers)
                </label>
              </div>

              <div className="form-group">
                <label className="toggle-wrap">
                  <label className="toggle">
                    <input 
                      type="checkbox" 
                      checked={form.is_couple_offer} 
                      onChange={(e) => {
                        set('is_couple_offer', e.target.checked)
                        if (e.target.checked) {
                          set('pick_count', 2)
                          set('badge_text', 'COUPLE')
                        }
                      }} 
                    />
                    <span className="toggle-slider" />
                  </label>
                  Couple Offer (separate Men &amp; Women options)
                </label>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="form-col">
            {/* Images */}
            <div className="admin-card">
              <h3 className="section-title">Combo Images</h3>
              <div className="img-preview-list">
                {form.image_urls.map((url, i) => (
                  <div key={i} className="img-preview-item">
                    <img src={url.startsWith('http') ? url : `${API_ORIGIN}${url}`} alt="" />
                    <button type="button" className="img-preview-item__remove" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
              </div>
              <p className="hint">Paste image URL (Cloudinary, etc.):</p>
              <div className="url-input-row">
                <input 
                  className="form-control" 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                  placeholder="https://..." 
                />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addImageUrl}>Add</button>
              </div>
            </div>

            {/* Sizes & Colors - conditional based on couple offer */}
            {!form.is_couple_offer ? (
              <>
                {/* Standard Sizes */}
                <div className="admin-card" style={{ marginTop: '1.25rem' }}>
                  <h3 className="section-title">Available Sizes</h3>
                  <div className="chips">
                    {form.sizes.map((s) => (
                      <span key={s} className="chip">
                        {s}
                        <button type="button" onClick={() => set('sizes', form.sizes.filter((x) => x !== s))}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="chip-input-row">
                    <input 
                      className="form-control" 
                      value={sizeInput} 
                      onChange={(e) => setSizeInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())} 
                      placeholder="XS, S, M, L, XL, XXL…" 
                    />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addSize}>Add</button>
                  </div>
                </div>

                {/* Standard Colors */}
                <div className="admin-card" style={{ marginTop: '1.25rem' }}>
                  <h3 className="section-title">Available Colors</h3>
                  <div className="chips">
                    {form.colors.map((c) => (
                      <span key={c} className="chip">
                        <span 
                          style={{ 
                            display: 'inline-block', 
                            width: 12, 
                            height: 12, 
                            background: c, 
                            border: '1px solid #ccc', 
                            marginRight: 4,
                            borderRadius: 2,
                          }} 
                        />
                        {c}
                        <button type="button" onClick={() => set('colors', form.colors.filter((x) => x !== c))}>✕</button>
                      </span>
                    ))}
                  </div>
                  <div className="chip-input-row">
                    <input 
                      className="form-control" 
                      value={colorInput} 
                      onChange={(e) => setColorInput(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())} 
                      placeholder="Black, White, Navy, #ff5733…" 
                    />
                    <button type="button" className="btn btn-ghost btn-sm" onClick={addColor}>Add</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Men's Shirt Options */}
                <div className="admin-card" style={{ marginTop: '1.25rem' }}>
                  <h3 className="section-title">👔 Men's Shirt Options</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Men's Sizes</label>
                    <div className="chips">
                      {form.men_sizes.map((s) => (
                        <span key={s} className="chip">
                          {s}
                          <button type="button" onClick={() => set('men_sizes', form.men_sizes.filter((x) => x !== s))}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-input-row">
                      <input 
                        className="form-control" 
                        value={menSizeInput} 
                        onChange={(e) => setMenSizeInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMenSize())} 
                        placeholder="S, M, L, XL, XXL…" 
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addMenSize}>Add</button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Men's Colors</label>
                    <div className="chips">
                      {form.men_colors.map((c) => (
                        <span key={c} className="chip">
                          <span 
                            style={{ 
                              display: 'inline-block', 
                              width: 12, 
                              height: 12, 
                              background: c, 
                              border: '1px solid #ccc', 
                              marginRight: 4,
                              borderRadius: 2,
                            }} 
                          />
                          {c}
                          <button type="button" onClick={() => set('men_colors', form.men_colors.filter((x) => x !== c))}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-input-row">
                      <input 
                        className="form-control" 
                        value={menColorInput} 
                        onChange={(e) => setMenColorInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMenColor())} 
                        placeholder="Black, White, Navy…" 
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addMenColor}>Add</button>
                    </div>
                  </div>
                </div>

                {/* Women's Shirt Options */}
                <div className="admin-card" style={{ marginTop: '1.25rem' }}>
                  <h3 className="section-title">👗 Women's Shirt Options</h3>
                  
                  <div className="form-group">
                    <label className="form-label">Women's Sizes</label>
                    <div className="chips">
                      {form.women_sizes.map((s) => (
                        <span key={s} className="chip">
                          {s}
                          <button type="button" onClick={() => set('women_sizes', form.women_sizes.filter((x) => x !== s))}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-input-row">
                      <input 
                        className="form-control" 
                        value={womenSizeInput} 
                        onChange={(e) => setWomenSizeInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWomenSize())} 
                        placeholder="XS, S, M, L, XL…" 
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addWomenSize}>Add</button>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '1rem' }}>
                    <label className="form-label">Women's Colors</label>
                    <div className="chips">
                      {form.women_colors.map((c) => (
                        <span key={c} className="chip">
                          <span 
                            style={{ 
                              display: 'inline-block', 
                              width: 12, 
                              height: 12, 
                              background: c, 
                              border: '1px solid #ccc', 
                              marginRight: 4,
                              borderRadius: 2,
                            }} 
                          />
                          {c}
                          <button type="button" onClick={() => set('women_colors', form.women_colors.filter((x) => x !== c))}>✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="chip-input-row">
                      <input 
                        className="form-control" 
                        value={womenColorInput} 
                        onChange={(e) => setWomenColorInput(e.target.value)} 
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addWomenColor())} 
                        placeholder="Black, White, Pink…" 
                      />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={addWomenColor}>Add</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-submit">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Saving…' : isEdit ? 'Update Combo Offer' : 'Create Combo Offer'}
          </button>
          <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/admin/combo-offers')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
