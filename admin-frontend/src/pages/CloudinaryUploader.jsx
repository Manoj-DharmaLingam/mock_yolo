import { useState, useRef, useCallback } from 'react'
import api from '../api/adminApi'
import './CloudinaryUploader.css'

const CloudIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
)

const CopyIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
)

export default function CloudinaryUploader() {
  const [queue, setQueue] = useState([])       // { id, file, preview, status, url, error }
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const inputRef = useRef()

  const makeEntry = (file) => ({
    id: `${file.name}-${Date.now()}-${Math.random()}`,
    file,
    preview: URL.createObjectURL(file),
    status: 'pending',   // pending | uploading | done | error
    url: null,
    error: null,
  })

  const addFiles = (files) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    const valid = Array.from(files).filter(f => allowed.includes(f.type))
    if (!valid.length) return
    setQueue(q => [...q, ...valid.map(makeEntry)])
  }

  const onFileChange = (e) => { addFiles(e.target.files); e.target.value = '' }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [])

  const onDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const removeEntry = (id) => {
    setQueue(q => {
      const entry = q.find(x => x.id === id)
      if (entry?.preview) URL.revokeObjectURL(entry.preview)
      return q.filter(x => x.id !== id)
    })
  }

  const clearAll = () => {
    queue.forEach(e => { if (e.preview) URL.revokeObjectURL(e.preview) })
    setQueue([])
  }

  const uploadAll = async () => {
    const pending = queue.filter(e => e.status === 'pending')
    if (!pending.length) return

    setUploading(true)

    // Mark all pending as uploading
    setQueue(q => q.map(e => e.status === 'pending' ? { ...e, status: 'uploading' } : e))

    const fd = new FormData()
    pending.forEach(e => fd.append('files', e.file))

    try {
      const { data } = await api.post('/admin/upload-images', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const resultMap = {}
      data.uploads.forEach((r, i) => { resultMap[pending[i].id] = r })

      setQueue(q => q.map(e => {
        const r = resultMap[e.id]
        if (!r) return e
        return r.url
          ? { ...e, status: 'done', url: r.url }
          : { ...e, status: 'error', error: r.error || 'Upload failed' }
      }))
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed'
      setQueue(q => q.map(e => e.status === 'uploading' ? { ...e, status: 'error', error: msg } : e))
    } finally {
      setUploading(false)
    }
  }

  const copyUrl = (id, url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const copyAll = () => {
    const urls = queue.filter(e => e.url).map(e => e.url).join('\n')
    navigator.clipboard.writeText(urls).then(() => {
      setCopiedId('all')
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const pendingCount   = queue.filter(e => e.status === 'pending').length
  const doneCount      = queue.filter(e => e.status === 'done').length
  const errorCount     = queue.filter(e => e.status === 'error').length
  const uploadingCount = queue.filter(e => e.status === 'uploading').length

  return (
    <div className="cu-page">
      <div className="cu-header">
        <div>
          <h1 className="cu-title">☁️ Cloudinary Image Uploader</h1>
          <p className="cu-subtitle">Upload images directly to Cloudinary and copy the links</p>
        </div>
        {queue.length > 0 && (
          <div className="cu-header-actions">
            {doneCount > 1 && (
              <button className="cu-btn cu-btn--ghost" onClick={copyAll}>
                {copiedId === 'all' ? <CheckIcon /> : <CopyIcon />}
                {copiedId === 'all' ? 'Copied!' : `Copy All ${doneCount} URLs`}
              </button>
            )}
            <button className="cu-btn cu-btn--ghost cu-btn--danger" onClick={clearAll} disabled={uploading}>
              Clear All
            </button>
            {pendingCount > 0 && (
              <button className="cu-btn cu-btn--primary" onClick={uploadAll} disabled={uploading}>
                {uploading
                  ? `Uploading ${uploadingCount}…`
                  : `Upload ${pendingCount} Image${pendingCount !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`cu-dropzone${dragging ? ' cu-dropzone--active' : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="cu-hidden-input"
          onChange={onFileChange}
        />
        <div className="cu-dropzone__icon"><CloudIcon /></div>
        <p className="cu-dropzone__primary">
          {dragging ? 'Drop images here' : 'Drag & drop images or click to browse'}
        </p>
        <p className="cu-dropzone__hint">JPG, PNG, WEBP, GIF — multiple files supported</p>
      </div>

      {/* Stats bar */}
      {queue.length > 0 && (
        <div className="cu-stats">
          <span className="cu-stat">{queue.length} selected</span>
          {pendingCount > 0   && <span className="cu-stat cu-stat--pending">{pendingCount} pending</span>}
          {uploadingCount > 0 && <span className="cu-stat cu-stat--uploading">{uploadingCount} uploading…</span>}
          {doneCount > 0      && <span className="cu-stat cu-stat--done">{doneCount} uploaded</span>}
          {errorCount > 0     && <span className="cu-stat cu-stat--error">{errorCount} failed</span>}
        </div>
      )}

      {/* Image grid */}
      {queue.length > 0 && (
        <div className="cu-grid">
          {queue.map(entry => (
            <div key={entry.id} className={`cu-card cu-card--${entry.status}`}>
              <div className="cu-card__thumb">
                <img src={entry.preview} alt={entry.file.name} />
                <div className={`cu-card__status-badge cu-card__status-badge--${entry.status}`}>
                  {entry.status === 'pending'   && 'Pending'}
                  {entry.status === 'uploading' && '↑ Uploading…'}
                  {entry.status === 'done'      && '✓ Done'}
                  {entry.status === 'error'     && '✕ Failed'}
                </div>
                {entry.status === 'pending' && (
                  <button className="cu-card__remove" onClick={() => removeEntry(entry.id)} title="Remove">
                    <TrashIcon />
                  </button>
                )}
              </div>

              <div className="cu-card__body">
                <p className="cu-card__name" title={entry.file.name}>{entry.file.name}</p>
                <p className="cu-card__size">{(entry.file.size / 1024).toFixed(1)} KB</p>

                {entry.url && (
                  <div className="cu-card__url-row">
                    <input
                      className="cu-card__url-input"
                      value={entry.url}
                      readOnly
                      onClick={e => e.target.select()}
                    />
                    <button
                      className={`cu-copy-btn${copiedId === entry.id ? ' cu-copy-btn--copied' : ''}`}
                      onClick={() => copyUrl(entry.id, entry.url)}
                      title="Copy URL"
                    >
                      {copiedId === entry.id ? <CheckIcon /> : <CopyIcon />}
                      {copiedId === entry.id ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}

                {entry.error && (
                  <p className="cu-card__error">{entry.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {queue.length === 0 && (
        <div className="cu-empty">
          <p>No images selected yet. Use the drop zone above to get started.</p>
        </div>
      )}
    </div>
  )
}
