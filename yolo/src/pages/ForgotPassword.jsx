import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../services/apiClient'
import './ForgotPassword.css'

const STEPS = { REQUEST: 'request', VERIFY: 'verify', RESET: 'reset', DONE: 'done' }

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.REQUEST)
  const [identifier, setIdentifier] = useState('')
  const [method, setMethod] = useState('email')
  const [otp, setOtp] = useState('')
  const [newPass, setNewPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const handleRequest = async (e) => {
    e.preventDefault()
    if (!identifier.trim()) { setError('Enter your email or phone number.'); return }
    setError(''); setLoading(true)
    try {
      const res = await apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase(), method }),
      })
      setMsg(res.message || 'OTP sent. Check your email/phone.')
      setStep(STEPS.VERIFY)
    } catch (err) {
      setError(err.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Enter the 6-digit OTP.'); return }
    setError(''); setLoading(true)
    try {
      await apiFetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase(), otp_code: otp }),
      })
      setMsg('OTP verified. Set your new password.')
      setStep(STEPS.RESET)
    } catch (err) {
      setError(err.message || 'Invalid OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPass.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!/[A-Z]/.test(newPass)) { setError('Password must contain an uppercase letter.'); return }
    if (!/[a-z]/.test(newPass)) { setError('Password must contain a lowercase letter.'); return }
    if (!/\d/.test(newPass)) { setError('Password must contain a digit.'); return }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'/`~]/.test(newPass)) { setError('Password must contain a special character.'); return }
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      const res = await apiFetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim().toLowerCase(), otp_code: otp, new_password: newPass }),
      })
      setMsg(res.message || 'Password reset successfully!')
      setStep(STEPS.DONE)
    } catch (err) {
      setError(err.message || 'Reset failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-header">
          <h2 className="fp-title">Forgot Password</h2>
          <p className="fp-sub">
            {step === STEPS.REQUEST && 'Enter your email or phone to receive an OTP.'}
            {step === STEPS.VERIFY && 'Enter the 6-digit OTP we sent you.'}
            {step === STEPS.RESET && 'Create your new password.'}
            {step === STEPS.DONE && 'All done!'}
          </p>
        </div>

        {error && <div className="fp-error">{error}</div>}
        {msg && <div className="fp-msg">{msg}</div>}

        {step === STEPS.REQUEST && (
          <form onSubmit={handleRequest}>
            <div className="fp-field">
              <label>Email or Phone</label>
              <input
                type="text"
                className="fp-input"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="you@example.com or 9876543210"
                required
              />
            </div>
            <div className="fp-field">
              <label>Send OTP via</label>
              <div className="fp-radio-group">
                <label className="fp-radio">
                  <input type="radio" value="email" checked={method === 'email'} onChange={() => setMethod('email')} />
                  <span>Email</span>
                </label>
                <label className="fp-radio">
                  <input type="radio" value="sms" checked={method === 'sms'} onChange={() => setMethod('sms')} />
                  <span>SMS</span>
                </label>
              </div>
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === STEPS.VERIFY && (
          <form onSubmit={handleVerify}>
            <div className="fp-field">
              <label>6-Digit OTP</label>
              <input
                type="text"
                className="fp-input fp-otp"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                required
              />
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button type="button" className="fp-link" onClick={() => setStep(STEPS.REQUEST)}>← Back</button>
          </form>
        )}

        {step === STEPS.RESET && (
          <form onSubmit={handleReset}>
            <div className="fp-field">
              <label>New Password</label>
              <input
                type="password"
                className="fp-input"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min 8 chars, upper, lower, digit, special"
                required
              />
            </div>
            <div className="fp-field">
              <label>Confirm New Password</label>
              <input
                type="password"
                className="fp-input"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repeat password"
                required
              />
            </div>
            <button type="submit" className="fp-btn" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        {step === STEPS.DONE && (
          <div className="fp-done">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>Password reset successfully.</p>
            <Link to="/login" className="fp-btn" style={{ textAlign: 'center', display: 'block', marginTop: '1rem' }}>
              Sign In
            </Link>
          </div>
        )}

        {step !== STEPS.DONE && (
          <p className="fp-footer">
            <Link to="/login">← Back to Login</Link>
          </p>
        )}
      </div>
    </div>
  )
}
