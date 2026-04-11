import { useState, useRef } from 'react'
import { bulkUploadProducts } from '../api/adminApi'
import './BulkUpload.css'

const TEMPLATE_HEADERS = 'name,description,price,discount_price,category,sub_category,stock,available,badge,material,fit,is_best_seller,is_bogo,image_url'
const TEMPLATE_ROW = 'Street Signal Tee,Bold graphic print,1299,899,graphic-tees,Graphic,50,true,Bestseller,100% Cotton 220GSM,Regular Fit,true,false,https://example.com/img.jpg'

export default function BulkUpload() {
  const fileRef = useRef()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const handleFile = (e) => {
    const f = e.target.files[0]
    setFile(f || null)
    setResult(null)
    setError('')
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const { data } = await bulkUploadProducts(fd)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csv = `${TEMPLATE_HEADERS}\n${TEMPLATE_ROW}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'yolo_product_template.csv'
    a.click()
  }

  return (
    <div className="bulk-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Bulk Upload</h1>
          <p className="page-subtitle">Upload a CSV, Excel (.xlsx), or ZIP file containing a spreadsheet.</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Instructions */}
      <div className="admin-card bulk-page__info">
        <h3 className="bulk-page__info-title">📋 Supported Formats</h3>
        <div className="bulk-page__code">
          <code>{TEMPLATE_HEADERS}</code>
        </div>
        <ul className="bulk-page__rules">
          <li><strong>name</strong> and <strong>price</strong> are required.</li>
          <li><strong>available</strong>, <strong>is_best_seller</strong>, <strong>is_bogo</strong>: true / false</li>
          <li><strong>image_url</strong>: full URL or leave blank</li>
          <li>First row must be the header row (column names).</li>
          <li>ZIP files must contain a CSV or Excel file inside.</li>
        </ul>
        <button className="btn btn-secondary btn-sm" onClick={downloadTemplate}>
          ⬇ Download CSV Template
        </button>
      </div>

      {/* Upload area */}
      <div className="admin-card bulk-page__upload">
        <div
          className={`bulk-page__drop ${file ? 'bulk-page__drop--has-file' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files[0]
            if (f) { setFile(f); setResult(null); setError('') }
          }}
        >
          <span className="bulk-page__drop-icon">📂</span>
          {file ? (
            <span className="bulk-page__filename">{file.name}</span>
          ) : (
            <span>Click or drag &amp; drop a CSV, Excel, or ZIP file here</span>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls,.zip"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </div>

        <div className="bulk-page__actions">
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || loading}
          >
            {loading ? 'Uploading…' : '📤 Upload Products'}
          </button>
          {file && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setFile(null); setResult(null); setError(''); fileRef.current.value = '' }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="admin-card bulk-page__result">
          <div className={`alert ${result.errors === 0 ? 'alert-success' : 'alert-info'}`}>
            ✅ <strong>{result.created}</strong> products created
            {result.errors > 0 && <> — ⚠️ <strong>{result.errors}</strong> rows had errors</>}
          </div>

          {result.products?.length > 0 && (
            <>
              <h4 className="bulk-page__result-title">Created Products</h4>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>#</th><th>ID</th><th>Name</th></tr></thead>
                  <tbody>
                    {result.products.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {result.error_details?.length > 0 && (
            <>
              <h4 className="bulk-page__result-title" style={{ marginTop: '1.25rem', color: 'var(--red)' }}>
                Row Errors
              </h4>
              <div className="table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Row</th><th>Error</th></tr></thead>
                  <tbody>
                    {result.error_details.map((e, i) => (
                      <tr key={i}>
                        <td>{e.row}</td>
                        <td>{e.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
