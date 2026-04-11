import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../services/api'
import './AuthPages.css'

const PW_RULES = [
  { test: (p) => p.length >= 8, label: 'At least 8 characters' },
  { test: (p) => /[A-Z]/.test(p), label: 'One uppercase letter' },
  { test: (p) => /[a-z]/.test(p), label: 'One lowercase letter' },
  { test: (p) => /\d/.test(p), label: 'One digit' },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(p), label: 'One special character' },
]

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' })
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMsg, setErrorMsg] = useState('')
  const [showPwRules, setShowPwRules] = useState(false)
  const navigate = useNavigate()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const allPwRulesPassed = PW_RULES.every(r => r.test(form.password))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!agreed) {
      setStatus('error')
      setErrorMsg('Please agree to the Terms and Privacy Policy.')
      return
    }
    if (!allPwRulesPassed) {
      setStatus('error')
      setErrorMsg('Password does not meet the security requirements.')
      return
    }
    if (form.password !== form.confirm) {
      setStatus('error')
      setErrorMsg('Passwords do not match.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone })
      if (res.requires_verification) {
        navigate('/verify-email', { state: { email: form.email } })
      }
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Registration failed. Please try again.')
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

        <h1 className="auth-card__title">Create Account</h1>
        <p className="auth-card__desc">Join the YOLO family. No cap.</p>

        {errorMsg && (
          <div className="auth-error">{errorMsg}</div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={onChange}
              required
              minLength={2}
            />
          </div>
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
          <div className="auth-field-num">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="+91 9500433564"
              value={form.phone}
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
              onFocus={() => setShowPwRules(true)}
              required
            />
            {showPwRules && form.password.length > 0 && (
              <ul className="pw-rules">
                {PW_RULES.map((r, i) => (
                  <li key={i} className={r.test(form.password) ? 'pw-rule--pass' : 'pw-rule--fail'}>
                    <span className="pw-rule-icon">{r.test(form.password) ? '✓' : '✗'}</span>
                    {r.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirm"
              placeholder="••••••••"
              value={form.confirm}
              onChange={onChange}
              required
            />
            {form.confirm && form.password !== form.confirm && (
              <span className="pw-mismatch">Passwords do not match</span>
            )}
          </div>
          <label className="auth-check auth-check--block">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a></span>
          </label>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider-line" />

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>

      <div className="auth-panel">
        <img
          src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop"
          alt="YOLO"
          loading="lazy"
        />
        <div className="auth-panel__overlay">
          <span className="auth-panel__tagline">JOIN THE DROP.</span>
          <span className="auth-panel__sub">EARLY ACCESS. EXCLUSIVE DEALS.</span>
        </div>
      </div>
    </div>
  )
}

