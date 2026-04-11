import { useEffect, useMemo, useRef, useState } from 'react'
import {
  createOffer as createOfferRequest,
  deleteOffer as deleteOfferRequest,
  getAdminOffers,
  getAnnouncement,
  updateAnnouncement,
  updateOffer,
} from '../api/adminApi'
import { useLoading } from '../context/LoadingContext'
import './OffersManagement.css'

const EMPTY_OFFER_FORM = {
  label: '',
  description: '',
  end_time: '',
  enabled: true,
}

const DEFAULT_ANNOUNCEMENT = {
  text: '',
  enabled: true,
}

function slugifyPreview(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
}

function formatDateInput(value) {
  return value ? value.replace('Z', '').slice(0, 16) : ''
}

function toApiDateTime(value) {
  return value ? `${value}:00` : null
}

function isExpired(offer) {
  return Boolean(offer?.end_time) && new Date(offer.end_time).getTime() < Date.now()
}

function isLive(offer) {
  return offer.enabled !== false && !isExpired(offer)
}

function getStatusMeta(offer) {
  if (isExpired(offer)) return { label: 'Expired', tone: 'muted' }
  if (offer.enabled === false) return { label: 'Hidden', tone: 'neutral' }
  return { label: 'Live on site', tone: 'success' }
}

export default function OffersManagement() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState(null)
  const [deletingKey, setDeletingKey] = useState(null)
  const [message, setMessage] = useState({ text: '', type: 'success' })

  const [offerForm, setOfferForm] = useState(EMPTY_OFFER_FORM)
  const [creating, setCreating] = useState(false)

  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT)
  const [announcementLoading, setAnnouncementLoading] = useState(true)
  const [announcementSaving, setAnnouncementSaving] = useState(false)
  const flashTimerRef = useRef(null)
  const { showLoading, hideLoading } = useLoading()

  const flash = (text, type = 'success') => {
    setMessage({ text, type })
    window.clearTimeout(flashTimerRef.current)
    flashTimerRef.current = window.setTimeout(() => {
      setMessage({ text: '', type: 'success' })
    }, 3500)
  }

  const loadData = async () => {
    setLoading(true)
    setAnnouncementLoading(true)

    try {
      const [offersResponse, announcementResponse] = await Promise.all([
        getAdminOffers(),
        getAnnouncement(),
      ])
      setOffers(offersResponse.data)
      setAnnouncement(announcementResponse.data)
    } catch {
      flash('Failed to load offer settings.', 'error')
    } finally {
      setLoading(false)
      setAnnouncementLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    return () => {
      window.clearTimeout(flashTimerRef.current)
    }
  }, [])

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99)),
    [offers],
  )

  const liveOffers = useMemo(
    () => sortedOffers.filter(isLive),
    [sortedOffers],
  )

  const stats = useMemo(() => ({
    total: sortedOffers.length,
    live: liveOffers.length,
    custom: sortedOffers.filter((offer) => !offer.is_builtin).length,
  }), [liveOffers.length, sortedOffers])

  const generatedKey = slugifyPreview(offerForm.label)

  const patchOffer = (offerKey, patch) => {
    setOffers((current) =>
      current.map((offer) =>
        offer.offer_key === offerKey ? { ...offer, ...patch } : offer,
      ),
    )
  }

  const handleCreateOffer = async () => {
    if (!offerForm.label.trim()) {
      flash('Offer name is required.', 'error')
      return
    }

    setCreating(true)
    showLoading('Creating offer...')
    try {
      const { data } = await createOfferRequest({
        label: offerForm.label.trim(),
        description: offerForm.description.trim() || undefined,
        enabled: offerForm.enabled,
        end_time: toApiDateTime(offerForm.end_time),
      })
      setOffers((current) => [...current, data])
      setOfferForm(EMPTY_OFFER_FORM)
      flash(`"${data.label}" now appears in the live offers list.`)
    } catch (error) {
      flash(error?.response?.data?.detail || 'Failed to create offer.', 'error')
    } finally {
      setCreating(false)
      hideLoading()
    }
  }

  const handleSaveOffer = async (offerKey) => {
    const offer = offers.find((item) => item.offer_key === offerKey)
    if (!offer) return

    setSavingKey(offerKey)
    showLoading('Saving offer...')
    try {
      const { data } = await updateOffer(offerKey, {
        label: offer.label,
        description: offer.description || '',
        enabled: offer.enabled,
        end_time: toApiDateTime(formatDateInput(offer.end_time)),
      })
      setOffers((current) =>
        current.map((item) => (item.offer_key === offerKey ? data : item)),
      )
      flash(`"${data.label}" updated.`)
    } catch (error) {
      flash(error?.response?.data?.detail || 'Save failed. Please try again.', 'error')
    } finally {
      setSavingKey(null)
      hideLoading()
    }
  }

  const handleDeleteOffer = async (offer) => {
    if (!window.confirm(`Delete "${offer.label}"? This cannot be undone.`)) return

    setDeletingKey(offer.offer_key)
    showLoading('Deleting offer...')
    try {
      await deleteOfferRequest(offer.offer_key)
      setOffers((current) =>
        current.filter((item) => item.offer_key !== offer.offer_key),
      )
      flash(`"${offer.label}" removed from the storefront offers menu.`)
    } catch (error) {
      flash(error?.response?.data?.detail || 'Failed to delete offer.', 'error')
    } finally {
      setDeletingKey(null)
      hideLoading()
    }
  }

  const handleSaveAnnouncement = async () => {
    setAnnouncementSaving(true)
    showLoading('Saving announcement...')
    try {
      const { data } = await updateAnnouncement(announcement)
      setAnnouncement(data)
      flash('Announcement bar updated.')
    } catch {
      flash('Failed to save announcement.', 'error')
    } finally {
      setAnnouncementSaving(false)
      hideLoading()
    }
  }

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="page-wrap offers-admin">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Offers</h1>
          <p className="page-subtitle">
            Create offer menu items for the storefront and control which ones stay live.
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type === 'error' ? 'error' : 'success'}`}>
          {message.text}
        </div>
      )}

      <section className="admin-card offers-admin__hero">
        <div className="offers-admin__hero-copy">
          <span className="offers-admin__eyebrow">Storefront sync</span>
          <h2>New offers added here show up in the Offers menu.</h2>
          <p>
            The preview mirrors the storefront dropdown. Disable or delete any offer you no longer
            want to show, including old custom entries like placeholder offers.
          </p>
        </div>

        <div className="offers-preview">
          <div className="offers-preview__trigger">Offers</div>
          <div className="offers-preview__menu">
            {liveOffers.length > 0 ? (
              liveOffers.map((offer) => (
                <div key={offer.offer_key} className="offers-preview__item">
                  {offer.label}
                </div>
              ))
            ) : (
              <div className="offers-preview__empty">No live offers yet.</div>
            )}
          </div>
        </div>
      </section>

      <div className="offers-admin__stats">
        <div className="admin-card offers-stat">
          <span className="offers-stat__label">Total offers</span>
          <strong className="offers-stat__value">{stats.total}</strong>
        </div>
        <div className="admin-card offers-stat">
          <span className="offers-stat__label">Live in menu</span>
          <strong className="offers-stat__value">{stats.live}</strong>
        </div>
        <div className="admin-card offers-stat">
          <span className="offers-stat__label">Custom offers</span>
          <strong className="offers-stat__value">{stats.custom}</strong>
        </div>
      </div>

      <div className="offers-admin__grid">
        <section className="admin-card offers-panel">
          <div className="offers-panel__head">
            <div>
              <h3>Announcement bar</h3>
              <p>Shown at the top of the storefront.</p>
            </div>
            <label className="toggle" title={announcement.enabled ? 'Visible' : 'Hidden'}>
              <input
                type="checkbox"
                checked={announcement.enabled}
                onChange={(event) =>
                  setAnnouncement((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
              />
              <span className="toggle-slider" />
            </label>
          </div>

          {announcementLoading ? (
            <div className="loading-center">
              <div className="spinner spinner-sm" />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Announcement text</label>
                <input
                  className="form-control"
                  type="text"
                  value={announcement.text}
                  onChange={(event) =>
                    setAnnouncement((current) => ({
                      ...current,
                      text: event.target.value,
                    }))
                  }
                  placeholder="FREE SHIPPING ON ORDERS ABOVE RS.1000"
                />
              </div>
              <p className="offers-panel__note">
                Use <code>|</code> to separate multiple messages.
              </p>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSaveAnnouncement}
                disabled={announcementSaving}
              >
                {announcementSaving ? 'Saving...' : 'Save announcement'}
              </button>
            </>
          )}
        </section>

        <section className="admin-card offers-panel">
          <div className="offers-panel__head">
            <div>
              <h3>Create new offer</h3>
              <p>Every new live offer is added to the storefront dropdown automatically.</p>
            </div>
          </div>

          <div className="offers-form-grid">
            <div className="form-group">
              <label className="form-label">Offer name</label>
              <input
                className="form-control"
                type="text"
                value={offerForm.label}
                onChange={(event) =>
                  setOfferForm((current) => ({ ...current, label: event.target.value }))
                }
                placeholder="Best Seller, Summer Drop..."
              />
              {generatedKey && (
                <p className="offers-panel__note">
                  Generated key: <code>{generatedKey}</code>
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Offer end time</label>
              <input
                className="form-control"
                type="datetime-local"
                value={offerForm.end_time}
                onChange={(event) =>
                  setOfferForm((current) => ({ ...current, end_time: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              value={offerForm.description}
              onChange={(event) =>
                setOfferForm((current) => ({ ...current, description: event.target.value }))
              }
              placeholder="Short helper text for the offers page."
            />
          </div>

          <div className="offers-panel__footer">
            <label className="offers-checkbox">
              <input
                type="checkbox"
                checked={offerForm.enabled}
                onChange={(event) =>
                  setOfferForm((current) => ({ ...current, enabled: event.target.checked }))
                }
              />
              <span>Create as live offer</span>
            </label>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleCreateOffer}
              disabled={creating || !offerForm.label.trim()}
            >
              {creating ? 'Creating...' : '+ Add new offer'}
            </button>
          </div>
        </section>
      </div>

      <section className="admin-card offers-list">
        <div className="offers-panel__head offers-list__head">
          <div>
            <h3>Manage offer items</h3>
            <p>Enable, edit, or remove the offers that should appear on the site.</p>
          </div>
        </div>

        {sortedOffers.length === 0 ? (
          <div className="offers-list__empty">No offers found.</div>
        ) : (
          <div className="offers-list__grid">
            {sortedOffers.map((offer) => {
              const status = getStatusMeta(offer)

              return (
                <article key={offer.offer_key} className="offer-card">
                  <div className="offer-card__header">
                    <div>
                      <div className="offer-card__title-row">
                        <h4>{offer.label}</h4>
                        <span className={`offer-badge offer-badge--${status.tone}`}>
                          {status.label}
                        </span>
                        <span className="offer-badge offer-badge--outline">
                          {offer.is_builtin ? 'Built-in' : 'Custom'}
                        </span>
                      </div>
                      <p className="offer-card__key">
                        Menu key: <code>{offer.offer_key}</code>
                      </p>
                    </div>

                    <label className="toggle" title={offer.enabled ? 'Visible' : 'Hidden'}>
                      <input
                        type="checkbox"
                        checked={offer.enabled ?? false}
                        onChange={(event) =>
                          patchOffer(offer.offer_key, { enabled: event.target.checked })
                        }
                      />
                      <span className="toggle-slider" />
                    </label>
                  </div>

                  <div className="offers-form-grid">
                    <div className="form-group">
                      <label className="form-label">Label</label>
                      <input
                        className="form-control"
                        type="text"
                        value={offer.label}
                        onChange={(event) =>
                          patchOffer(offer.offer_key, { label: event.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Offer end time</label>
                      <input
                        className="form-control"
                        type="datetime-local"
                        value={formatDateInput(offer.end_time)}
                        onChange={(event) =>
                          patchOffer(offer.offer_key, { end_time: toApiDateTime(event.target.value) })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={offer.description || ''}
                      onChange={(event) =>
                        patchOffer(offer.offer_key, { description: event.target.value })
                      }
                    />
                  </div>

                  <div className="offer-card__footer">
                    <span className="offers-panel__note">
                      {isLive(offer)
                        ? 'This offer is currently visible in the storefront menu.'
                        : 'This offer is hidden from the storefront menu.'}
                    </span>

                    <div className="offer-card__actions">
                      {!offer.is_builtin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleDeleteOffer(offer)}
                          disabled={deletingKey === offer.offer_key}
                        >
                          {deletingKey === offer.offer_key ? 'Deleting...' : 'Delete'}
                        </button>
                      )}

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSaveOffer(offer.offer_key)}
                        disabled={savingKey === offer.offer_key}
                      >
                        {savingKey === offer.offer_key ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
