import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getAdminProducts, deleteProduct, toggleProductAvailability } from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import { API_ORIGIN } from '../api/runtimeConfig'
import './Products.css'

const API_BASE = API_ORIGIN

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [togglingId, setTogglingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [msg, setMsg] = useState('')
  const { showLoading, hideLoading } = useLoading()

  const load = useCallback(() => {
    setLoading(true)
    getAdminProducts()
      .then((r) => setProducts(r.data))
      .catch(() => setError('Failed to load products.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleToggle = async (id) => {
    setTogglingId(id)
    showLoading('Updating availability...')
    try {
      const { data } = await toggleProductAvailability(id)
      setProducts((ps) =>
        ps.map((p) => (p.id === id ? { ...p, available: data.available } : p))
      )
    } catch {
      setError('Toggle failed.')
    } finally {
      setTogglingId(null)
      hideLoading()
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    showLoading('Deleting product...')
    try {
      await deleteProduct(id)
      setProducts((ps) => ps.filter((p) => p.id !== id))
      setMsg(`"${name}" deleted.`)
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      // Handle structured API errors
      const errorMsg = err.response?.data?.detail 
        || err.response?.data?.message 
        || err.message 
        || 'Delete failed.'
      setError(errorMsg)
      setTimeout(() => setError(''), 8000)
    } finally {
      setDeletingId(null)
      hideLoading()
    }
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const filtered = products.filter((p) => {
    const matchSearch =
      !search || p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !category || p.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="products-page">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} total products</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/products/bulk-upload" className="btn btn-secondary">
            📤 Bulk Upload
          </Link>
          <Link to="/admin/products/add" className="btn btn-primary">
            + Add Product
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Filters */}
      <div className="products-filters">
        <input
          className="form-control"
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <select
          className="form-control"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ maxWidth: 200 }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="admin-card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
          No products found.
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.image ? (
                        <img
                          src={p.image.startsWith('http') ? p.image : `${API_BASE}${p.image}`}
                          alt={p.name}
                          className="products-page__thumb"
                        />
                      ) : (
                        <div className="products-page__no-img">No img</div>
                      )}
                    </td>
                    <td>
                      <strong>{p.name}</strong>
                      {p.badge && <span className="products-page__badge">{p.badge}</span>}
                    </td>
                    <td>{p.category || '—'}</td>
                    <td>
                      <span className="products-page__price">₹{p.discountPrice}</span>
                      {p.price !== p.discountPrice && (
                        <span className="products-page__original">₹{p.price}</span>
                      )}
                    </td>
                    <td>
                      <span className={p.stock === 0 ? 'products-page__out' : ''}>
                        {p.stock}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isBestSeller ? 'badge-paid' : ''}`}>
                        {p.isBestSeller ? 'Bestseller' : p.isBogo ? 'BOGO' : 'Regular'}
                      </span>
                    </td>
                    <td>
                      <label className="toggle" title={p.available ? 'Available' : 'Unavailable'}>
                        <input
                          type="checkbox"
                          checked={p.available}
                          onChange={() => handleToggle(p.id)}
                          disabled={togglingId === p.id}
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <div className="products-page__actions">
                        <Link
                          to={`/admin/products/edit/${p.id}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p.id, p.name)}
                          disabled={deletingId === p.id}
                        >
                          {deletingId === p.id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
