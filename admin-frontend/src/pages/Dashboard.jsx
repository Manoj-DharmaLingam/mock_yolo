import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboard } from '../api/adminApi'
import './Dashboard.css'

const STATUS_COLORS = {
  pending: 'badge-pending',
  paid: 'badge-paid',
  shipped: 'badge-shipped',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-center"><div className="spinner" /></div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div className="dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening.</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/products/add" className="btn btn-primary">+ Add Product</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card__label">Total Products</div>
          <div className="stat-card__value">{data.total_products}</div>
          <div className="stat-card__sub">All items in catalogue</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Total Orders</div>
          <div className="stat-card__value">{data.total_orders}</div>
          <div className="stat-card__sub">All time orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__label">Revenue</div>
          <div className="stat-card__value">₹{data.total_revenue.toLocaleString('en-IN')}</div>
          <div className="stat-card__sub">Paid + shipped + delivered</div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="admin-card">
        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">View All →</Link>
        </div>
        {data.recent_orders.length === 0 ? (
          <p className="dashboard__empty">No orders yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{o.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{o.customer_email}</div>
                    </td>
                    <td>₹{o.total_price.toLocaleString('en-IN')}</td>
                    <td style={{ fontSize: '0.78rem', fontWeight: 600 }}>{(o.payment_method || 'cod').toUpperCase()}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[o.status] || ''}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
