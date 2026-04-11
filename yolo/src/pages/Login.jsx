import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../services/api'
import { useUserAuth } from '../context/UserAuthContext'
import './AuthPages.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [errorType, setErrorType] = useState(null) // null | 'unverified' | 'locked' | 'rate_limited'
  const navigate = useNavigate()
  const { saveSession } = useUserAuth()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    setErrorType(null)
    try {
      const res = await login(form)
      saveSession(res.access_token, res.user, res.refresh_token)
      navigate('/')
    } catch (err) {
      setStatus('error')
      const msg = err.message || 'Invalid credentials. Please try again.'

      if (msg.includes('verify your email')) {
        setErrorType('unverified')
        setErrorMsg(msg)
      } else if (msg.includes('Account locked')) {
        setErrorType('locked')
        setErrorMsg(msg)
      } else if (msg.includes('Too many requests')) {
        setErrorType('rate_limited')
        setErrorMsg(msg)
      } else {
        setErrorMsg(msg)
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__brand">
          <Link to="/" className="auth-brand-logo">YOLO</Link>
          <p className="auth-brand-sub">Wear Bold. Live Free.</p>
        </div>

        <div className="auth-divider-line" />

        <h1 className="auth-card__title">Sign In</h1>
        <p className="auth-card__desc">Welcome back. Enter your details below.</p>

        {errorMsg && (
          <div className={`auth-error ${errorType === 'locked' ? 'auth-error--locked' : ''}`}>
            {errorMsg}
            {errorType === 'unverified' && (
              <Link to="/verify-email" state={{ email: form.email }} className="auth-error-link">
                Verify now →
              </Link>
            )}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
          <div className="auth-form__row">
            <label className="auth-check">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={status === 'loading' || errorType === 'locked' || errorType === 'rate_limited'}
          >
            {status === 'loading' ? 'Signing in…' : 'Sign In'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary, #3b82f6)' }}>Forgot password?</Link>
          </p>
        </form>

        <div className="auth-divider-line" />

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one →</Link>
        </p>
      </div>

      <div className="auth-panel">
        <img
          src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=1000&fit=crop"
          alt="YOLO"
          loading="lazy"
        />
        <div className="auth-panel__overlay">
          <span className="auth-panel__tagline">JUST DO IT.</span>
          <span className="auth-panel__sub">YOUR ONLY LIMIT IS YOU.</span>
        </div>
      </div>
    </div>
  )
}
