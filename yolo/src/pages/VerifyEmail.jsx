import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { verifyEmail, resendVerification } from '../services/api'
import { useUserAuth } from '../context/UserAuthContext'
import './AuthPages.css'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { saveSession } = useUserAuth()

  const emailFromState = location.state?.email || ''
  const [email, setEmail] = useState(emailFromState)
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) {
      setErrorMsg('Enter the 6-digit verification code.')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await verifyEmail(email.trim().toLowerCase(), otp)
      saveSession(res.access_token, res.user)
      setSuccessMsg('Email verified! Redirecting…')
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Verification failed. Please try again.')
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setErrorMsg('')
    setSuccessMsg('')
    try {
      await resendVerification(email.trim().toLowerCase())
      setSuccessMsg('Verification code sent! Check your inbox.')
      setResendCooldown(60)
    } catch (err) {
      setErrorMsg(err.message || 'Failed to resend. Try again.')
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

        <h1 className="auth-card__title">Verify Your Email</h1>
        <p className="auth-card__desc">
          We sent a 6-digit code to <strong>{email || 'your email'}</strong>.
          Enter it below to activate your account.
        </p>

        {errorMsg && <div className="auth-error">{errorMsg}</div>}
        {successMsg && <div className="auth-success">{successMsg}</div>}

        <form className="auth-form" onSubmit={handleVerify}>
          {!emailFromState && (
            <div className="auth-field">
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
          )}
          <div className="auth-field">
            <label>Verification Code</label>
            <input
              type="text"
              className="verify-otp-input"
              maxLength={6}
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              autoFocus
              required
              style={{ letterSpacing: '0.5em', fontSize: '1.4rem', textAlign: 'center', fontWeight: 700 }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div className="auth-resend">
          <p>Didn't receive the code?</p>
          <button
            type="button"
            className="auth-resend-btn"
            onClick={handleResend}
            disabled={resendCooldown > 0}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
          </button>
        </div>

        <div className="auth-divider-line" />

        <p className="auth-switch">
          <Link to="/login">← Back to Sign In</Link>
        </p>
      </div>

      <div className="auth-panel">
        <img
          src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=800&h=1000&fit=crop"
          alt="YOLO"
          loading="lazy"
        />
        <div className="auth-panel__overlay">
          <span className="auth-panel__tagline">ALMOST THERE.</span>
          <span className="auth-panel__sub">VERIFY & START SHOPPING.</span>
        </div>
      </div>
    </div>
  )
}
