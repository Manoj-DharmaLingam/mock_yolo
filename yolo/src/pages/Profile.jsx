import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProfileData, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/api'
import { clearCache } from '../services/apiClient'
import { useUserAuth } from '../context/UserAuthContext'
import './Profile.css'

const LABELS = ['Home', 'Work', 'Other']

function AddressForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || { label: 'Home', name: '', phone: '', address_line: '', city: '', state: '', pincode: '', is_default: false })
  const onChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }
  const handleSubmit = e => { e.preventDefault(); onSave(form) }
  return (
    <form className="addr-form" onSubmit={handleSubmit}>
      <div className="addr-form__grid">
        <div className="addr-form__field">
          <label>Label</label>
          <select name="label" value={form.label} onChange={onChange}>
            {LABELS.map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="addr-form__field">
          <label>Full Name *</label>
          <input name="name" value={form.name} onChange={onChange} required placeholder="Recipient name" />
        </div>
        <div className="addr-form__field">
          <label>Phone *</label>
          <input name="phone" value={form.phone} onChange={onChange} required placeholder="+91 9XXXXXXXXX" />
        </div>
        <div className="addr-form__field addr-form__field--full">
          <label>Address Line *</label>
          <textarea name="address_line" value={form.address_line} onChange={onChange} required placeholder="House No, Street, Landmark" rows={2} />
        </div>
        <div className="addr-form__field">
          <label>City *</label>
          <input name="city" value={form.city} onChange={onChange} required placeholder="City" />
        </div>
        <div className="addr-form__field">
          <label>State</label>
          <input name="state" value={form.state} onChange={onChange} placeholder="State" />
        </div>
        <div className="addr-form__field">
          <label>Pincode *</label>
          <input name="pincode" value={form.pincode} onChange={onChange} required placeholder="Pincode" maxLength={6} />
        </div>
        <div className="addr-form__field addr-form__field--full">
          <label className="addr-form__check-label">
            <input type="checkbox" name="is_default" checked={form.is_default} onChange={onChange} />
            Set as default address
          </label>
        </div>
      </div>
      <div className="addr-form__actions">
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving…' : 'Save Address'}</button>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

export default function Profile() {
  const { token, isLoggedIn, user, saveSession, logout } = useUserAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Addresses state
  const [addresses, setAddresses] = useState([])
  const [addrsLoading, setAddrsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editAddr, setEditAddr] = useState(null) // address object being edited
  const [savingAddr, setSavingAddr] = useState(false)
  const [addrError, setAddrError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    // Single API call for both profile and addresses
    getProfileData(token).then(data => {
      setForm({ 
        name: data.profile.name || '', 
        email: data.profile.email || '', 
        phone: data.profile.phone || '', 
        address: data.profile.address || '' 
      })
      setAddresses(data.addresses || [])
      setLoading(false)
      setAddrsLoading(false)
    }).catch(() => { 
      setLoading(false)
      setAddrsLoading(false)
    })
  }, [isLoggedIn, token, navigate])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const updated = await updateProfile({ name: form.name, phone: form.phone, address: form.address }, token)
      saveSession(token, { ...user, name: updated.name, email: updated.email })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const handleAddAddress = async (data) => {
    setSavingAddr(true)
    setAddrError('')
    try {
      const created = await createAddress(data, token)
      setAddresses(prev => data.is_default
        ? prev.map(a => ({ ...a, is_default: false })).concat(created)
        : [...prev, created])
      setShowAddForm(false)
      clearCache('/api/addresses')  // Clear cached addresses
    } catch (e) {
      setAddrError(e.message || 'Failed to add address.')
    } finally { setSavingAddr(false) }
  }

  const handleUpdateAddress = async (data) => {
    setSavingAddr(true)
    setAddrError('')
    try {
      const updated = await updateAddress(editAddr.id, data, token)
      setAddresses(prev => data.is_default
        ? prev.map(a => a.id === editAddr.id ? updated : { ...a, is_default: false })
        : prev.map(a => a.id === editAddr.id ? updated : a))
      setEditAddr(null)
      clearCache('/api/addresses')  // Clear cached addresses
    } catch (e) {
      setAddrError(e.message || 'Failed to update address.')
    } finally { setSavingAddr(false) }
  }

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Delete this address?')) return
    try {
      await deleteAddress(id, token)
      setAddresses(prev => prev.filter(a => a.id !== id))
      clearCache('/api/addresses')  // Clear cached addresses
    } catch (e) { alert(e.message || 'Failed to delete.') }
  }

  const handleSetDefault = async (id) => {
    try {
      const updated = await setDefaultAddress(id, token)
      setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
      clearCache('/api/addresses')  // Clear cached addresses
    } catch (e) { alert(e.message || 'Failed to set default.') }
  }



  if (loading) return <div className="profile-loading"><div className="yolo-spinner" /></div>

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="section-subtitle">Account</div>
          <h1 className="profile-title">My Profile</h1>
          <div className="divider" />
        </div>

        <div className="profile-layout">
          <div className="profile-sidebar">
            <div className="profile-avatar">
              {(form.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="profile-name">{form.name}</div>
            <div className="profile-email">{form.email}</div>
            <Link
              to="/my-orders"
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1.5rem', width: '100%', textAlign: 'center', textDecoration: 'none', display: 'block' }}
            >
              My Orders
            </Link>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '0.75rem', width: '100%' }}
              onClick={() => { logout(); navigate('/') }}
            >
              Sign Out
            </button>
          </div>

          <div className="profile-form-wrap">
            <div className="profile-card">
              <h2 className="profile-card-title">Personal Information</h2>
              {error && <div className="profile-alert profile-alert--error">{error}</div>}
              {success && <div className="profile-alert profile-alert--success">Profile updated successfully!</div>}

              <form onSubmit={handleSubmit}>
                <div className="profile-fields">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={onChange}
                      required
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="profile-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      disabled
                      title="Email cannot be changed"
                      style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                  </div>
                  <div className="profile-field">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      placeholder="+91 9XXXXXXXXX"
                    />
                  </div>
                  <div className="profile-field profile-field--full">
                    <label>Delivery Address</label>
                    <textarea
                      name="address"
                      value={form.address}
                      onChange={onChange}
                      placeholder="House No, Street, City, State, Pincode"
                      rows={3}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ marginTop: '1.5rem' }}
                >
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Saved Addresses */}
            <div className="profile-card" style={{ marginTop: '1.5rem' }}>
              <div className="profile-card-header">
                <h2 className="profile-card-title">Saved Addresses</h2>
                {!showAddForm && !editAddr && (
                  <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>+ Add Address</button>
                )}
              </div>

              {addrError && <div className="profile-alert profile-alert--error">{addrError}</div>}

              {showAddForm && (
                <div className="addr-form-wrap">
                  <div className="addr-form-wrap__title">New Address</div>
                  <AddressForm onSave={handleAddAddress} onCancel={() => { setShowAddForm(false); setAddrError('') }} saving={savingAddr} />
                </div>
              )}

              {addrsLoading && <div style={{ color: '#9ca3af', padding: '0.5rem 0' }}>Loading addresses…</div>}

              {!addrsLoading && addresses.length === 0 && !showAddForm && (
                <p style={{ color: '#9ca3af', margin: '0.5rem 0 0' }}>No saved addresses yet. Add one to speed up checkout!</p>
              )}

              <div className="addr-list">
                {addresses.map(addr => (
                  <div key={addr.id} className={`addr-card ${addr.is_default ? 'addr-card--default' : ''}`}>
                    {editAddr?.id === addr.id ? (
                      <div className="addr-form-wrap">
                        <AddressForm
                          initial={addr}
                          onSave={handleUpdateAddress}
                          onCancel={() => { setEditAddr(null); setAddrError('') }}
                          saving={savingAddr}
                        />
                      </div>
                    ) : (
                      <>
                        <div className="addr-card__head">
                          <span className="addr-card__label">{addr.label}</span>
                          {addr.is_default && <span className="addr-card__default-badge">Default</span>}
                        </div>
                        <div className="addr-card__name">{addr.name} · {addr.phone}</div>
                        <div className="addr-card__text">
                          {[addr.address_line, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                        </div>
                        <div className="addr-card__actions">
                          {!addr.is_default && (
                            <button className="addr-action-btn" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
                          )}
                          <button className="addr-action-btn" onClick={() => { setEditAddr(addr); setShowAddForm(false); setAddrError('') }}>Edit</button>
                          <button className="addr-action-btn addr-action-btn--danger" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
