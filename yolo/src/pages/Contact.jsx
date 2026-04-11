import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitContactForm, trackOrder } from '../services/api'
import './Contact.css'

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)
const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)
const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const contactInfo = [
  { Icon: MapPinIcon, label: 'Visit Us',      value: '11, Javuli Kadai St, Kaliappa Nagar, Sivakasi-626123, Tamil Nadu'},
  { Icon: PhoneIcon,  label: 'Call Us',       value: '+91 95004 33564' },
  { Icon: MailIcon,   label: 'Email Us',      value: 'hello@yolotees.com' },
  { Icon: ClockIcon,  label: 'Working Hours', value: 'Mon – Fri\t: 9 am – 9 pm IST\n\nSun\t: 10:30 am – 2 pm IST' },
]

// ── Track Order panel ────────────────────────────────────────────
function TrackOrderPanel() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!orderId.trim() || !email.trim()) return
    setLoading(true); setErr(''); setResult(null)
    try {
      const data = await trackOrder(Number(orderId), email.trim())
      setResult(data)
    } catch {
      setErr('Order not found. Please check your Order ID and email address.')
    } finally {
      setLoading(false)
    }
  }

  const STATUS_COLOR = {
    pending: '#b45309', paid: '#065f46', shipped: '#1e40af',
    delivered: '#065f46', cancelled: '#991b1b',
  }

  return (
    <form className="qh-track-form" onSubmit={handleTrack}>
      <input
        className="qh-input"
        type="number"
        placeholder="Order ID (e.g. 1001)"
        value={orderId}
        onChange={e => setOrderId(e.target.value)}
        required
        min="1"
      />
      <input
        className="qh-input"
        type="email"
        placeholder="Email used at checkout"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button className="btn btn-primary btn-sm" type="submit" disabled={loading}>
        {loading ? 'Checking…' : 'Track Order →'}
      </button>
      {err && <p className="qh-error">{err}</p>}
      {result && (
        <div className="qh-track-result">
          <span
            className="qh-status-badge"
            style={{ background: STATUS_COLOR[result.status] + '20', color: STATUS_COLOR[result.status], border: `1px solid ${STATUS_COLOR[result.status]}40` }}
          >
            {result.status.toUpperCase()}
          </span>
          <p>Order <strong>#{result.id}</strong> · ₹{result.total_price?.toLocaleString('en-IN')} · {result.items?.length} item(s)</p>
          <p className="qh-track-date">Placed: {new Date(result.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      )}
    </form>
  )
}

// ── Size guide data ───────────────────────────────────────────────
const SIZE_ROWS = [
  { size: 'XS',  chest: '34–36"', shoulder: '16.5"', length: '26"' },
  { size: 'S',   chest: '36–38"', shoulder: '17.5"', length: '27"' },
  { size: 'M',   chest: '38–40"', shoulder: '18.5"', length: '28"' },
  { size: 'L',   chest: '40–42"', shoulder: '19.5"', length: '29"' },
  { size: 'XL',  chest: '42–44"', shoulder: '20.5"', length: '30"' },
  { size: 'XXL', chest: '44–46"', shoulder: '21.5"', length: '31"' },
]

// ── Accordion item ────────────────────────────────────────────────
function AccordionItem({ label, isOpen, onToggle, children }) {
  return (
    <div className={`qh-accordion ${isOpen ? 'qh-accordion--open' : ''}`}>
      <button type="button" className="qh-accordion__trigger" onClick={onToggle}>
        <span>{label}</span>
        <svg
          className="qh-accordion__chevron"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          width="14" height="14"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && <div className="qh-accordion__body">{children}</div>}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [openHelp, setOpenHelp] = useState(null)
  const formRef = useRef(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      await submitContactForm(form)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  const toggleHelp = (id) => setOpenHelp(prev => prev === id ? null : id)

  const fillWholesaleForm = () => {
    setForm(f => ({
      ...f,
      subject: 'Wholesale Inquiry',
      message: 'Hi YOLO team,\n\nI\'m interested in a wholesale partnership. Please share pricing and minimum order details.\n\nThank you.',
    }))
    setOpenHelp(null)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  const QUICK_HELP = [
    {
      id: 'track',
      label: 'Track your order',
      content: <TrackOrderPanel />,
    },
    {
      id: 'return',
      label: '↩  Return & refund policy',
      content: (
        <div className="qh-policy">
          <ul>
            <li>Returns accepted <strong>within 7 days</strong> of delivery.</li>
            <li>Item must be <strong>unworn, unwashed</strong> and in original packaging.</li>
            <li>Sale / BOGO items are <strong>not eligible</strong> for return.</li>
            <li>Exchanges available for sizing issues — contact us first.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            To start a return, email <strong>returns@yolotees.com</strong> with your order ID and reason.
            We'll send a prepaid label within 24 hrs. Refunds process in <strong>5–7 business days</strong> after we receive the item.
          </p>
        </div>
      ),
    },
    {
      id: 'size',
      label: '📏  Size guide',
      content: (
        <div className="qh-size-guide">
          <p className="qh-size-note">All measurements in inches. When between sizes, size up.</p>
          <div className="qh-size-scroll">
            <table className="qh-size-table">
              <thead>
                <tr><th>Size</th><th>Chest</th><th>Shoulder</th><th>Length</th></tr>
              </thead>
              <tbody>
                {SIZE_ROWS.map(r => (
                  <tr key={r.size}>
                    <td><strong>{r.size}</strong></td>
                    <td>{r.chest}</td>
                    <td>{r.shoulder}</td>
                    <td>{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'wholesale',
      label: '🏭  Wholesale inquiries',
      content: (
        <div className="qh-wholesale">
          <p>We partner with retailers and boutiques across India. Minimum order: <strong>50 pieces</strong>. Bulk discounts apply at 100+ units.</p>
          <p style={{ marginTop: '0.5rem' }}>Fill out the contact form and we'll get back within 48 hours with a full catalogue and pricing sheet.</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '0.9rem' }}
            onClick={fillWholesaleForm}
          >
            Pre-fill wholesale form ↓
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="contact-page">
      <div className="contact-page__hero">
        <div className="container">
          <nav className="contact-page__breadcrumb">
            <Link to="/">Home</Link><span>/</span><span>Contact Us</span>
          </nav>
          <h1 className="contact-page__title">Get In Touch</h1>
          <p className="contact-page__desc">
            Questions, order issues, wholesale inquiries — we're here for it all.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="contact-page__layout">
          {/* ── Contact form ── */}
          <div className="contact-page__form-side" ref={formRef}>
            {status === 'success' ? (
              <div className="contact-page__success">
                <div className="contact-page__success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3>Message Sent</h3>
                <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  style={{ marginTop: '1.5rem' }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2 className="contact-form__title">Send a Message</h2>
                {status === 'error' && (
                  <div className="contact-form__error">{errorMsg}</div>
                )}
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label>Your Name*</label>
                    <input type="text" name="name" placeholder="Your Name" value={form.name} onChange={handleChange} required />
                  </div>
                  <div className="contact-form__field">
                    <label>Email Address*</label>
                    <input type="email" name="email" placeholder="you@email.com" value={form.email} onChange={handleChange} required />
                  </div>
                </div>
                <div className="contact-form__field">
                  <label>Subject*</label>
                  <input type="text" name="subject" placeholder="How can we help?" value={form.subject} onChange={handleChange} required />
                </div>
                <div className="contact-form__field">
                  <label>Message*</label>
                  <textarea name="message" rows={5} placeholder="Tell us more..." value={form.message} onChange={handleChange} required />
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={status === 'loading'}>
                  {status === 'loading' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="contact-page__info">
            {/* Contact info */}
            <div className="contact-info-card">
              <h3 className="contact-info-card__title">Contact Information</h3>
              {contactInfo.map(({ Icon, label, value }) => (
                <div key={label} className="contact-info-item">
                  <div className="contact-info-item__icon"><Icon /></div>
                  <div>
                    <div className="contact-info-item__label">{label}</div>
                    <div className="contact-info-item__value" style={{ whiteSpace: 'pre-line' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick help accordion */}
            <div className="contact-info-card">
              <h3 className="contact-info-card__title">Quick Help</h3>
              {QUICK_HELP.map(({ id, label, content }) => (
                <AccordionItem
                  key={id}
                  label={label}
                  isOpen={openHelp === id}
                  onToggle={() => toggleHelp(id)}
                >
                  {content}
                </AccordionItem>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
