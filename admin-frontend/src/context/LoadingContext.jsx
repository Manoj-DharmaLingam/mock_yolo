import { createContext, useContext, useState, useCallback } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const showLoading = useCallback((msg = '') => {
    setMessage(msg)
    setLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setLoading(false)
    setMessage('')
  }, [])

  // Helper to wrap async actions with loading state
  const withLoading = useCallback(async (asyncFn, msg = '') => {
    showLoading(msg)
    try {
      return await asyncFn()
    } finally {
      hideLoading()
    }
  }, [showLoading, hideLoading])

  return (
    <LoadingContext.Provider value={{ loading, message, showLoading, hideLoading, withLoading }}>
      {children}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-overlay__content">
            <div className="spinner" />
            {message && <span className="loading-overlay__msg">{message}</span>}
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}
