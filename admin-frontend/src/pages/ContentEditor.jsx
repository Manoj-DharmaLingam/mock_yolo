import { useState, useEffect, useRef } from 'react'
import { getContent, updateContent, uploadImage } from '../api/adminApi'
import { API_ORIGIN } from '../api/runtimeConfig'
import './ContentEditor.css'

const SECTIONS = [
  { key: 'banner',  label: 'Homepage Banner', icon: '🖼' },
  { key: 'offers',  label: 'Offers Section',  icon: '🏷' },
  { key: 'about',   label: 'About Section',   icon: 'ℹ️' },
  { key: 'footer',  label: 'Footer Text',     icon: '🔻' },
]

export default function ContentEditor() {
  const [activeSection, setActiveSection] = useState('banner')
  const [formData, setFormData] = useState({ title: '', subtitle: '', description: '', image_url: '' })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    setLoading(true)
    setError('')
    setSuccess('')
    getContent(activeSection)
      .then(({ data }) =>
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          image_url: data.image_url || '',
        })
      )
      .catch(() => setError('Failed to load content.'))
      .finally(() => setLoading(false))
  }, [activeSection])

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const { data } = await uploadImage(fd)
      setFormData((f) => ({ ...f, image_url: data.url }))
    } catch {
      setError('Image upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await updateContent(activeSection, formData)
      setSuccess('Content saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch {
      setError('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const API_BASE = API_ORIGIN
  const imagePreviewUrl = formData.image_url
    ? formData.image_url.startsWith('http')
      ? formData.image_url
      : `${API_BASE}${formData.image_url}`
    : null

  return (
    <div className="content-editor">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Content Editor</h1>
          <p className="page-subtitle">Edit the live content displayed on the storefront.</p>
        </div>
      </div>

      <div className="content-editor__layout">
        {/* Section tabs */}
        <aside className="content-editor__sections">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`content-editor__section-btn ${activeSection === s.key ? 'active' : ''}`}
              onClick={() => setActiveSection(s.key)}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </aside>

        {/* Editor form */}
        <div className="content-editor__form-wrap">
          <div className="admin-card">
            <h3 className="content-editor__form-title">
              {SECTIONS.find((s) => s.key === activeSection)?.label}
            </h3>
            <div className="divider" />

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Section title…"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subtitle</label>
                  <input
                    className="form-control"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleChange}
                    placeholder="Section subtitle or tagline…"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description / Body Text</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Longer description or body text…"
                    style={{ minHeight: 120 }}
                  />
                </div>

                {/* Image section */}
                <div className="form-group">
                  <label className="form-label">Image URL / Upload</label>
                  <div className="content-editor__img-row">
                    <input
                      className="form-control"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleChange}
                      placeholder="https://… or upload below"
                      style={{ flex: 1 }}
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? '…' : '📷 Upload'}
                    </button>
                  </div>
                  {imagePreviewUrl && (
                    <div className="content-editor__img-preview">
                      <img src={imagePreviewUrl} alt="preview" />
                    </div>
                  )}
                </div>

                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : '💾 Save Changes'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
