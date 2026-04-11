import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { setRefreshCallback } from '../services/apiClient'
import { refreshToken as apiRefreshToken, logoutSession } from '../services/api'

const USER_KEY = 'yolo_user'
const TOKEN_KEY = 'yolo_access_token'
const REFRESH_TOKEN_KEY = 'yolo_refresh_token'

const UserAuthContext = createContext(null)

export function UserAuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Restore access token from localStorage on initial load
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  })
  const [refreshTokenValue, setRefreshTokenValue] = useState(() => {
    try { return localStorage.getItem(REFRESH_TOKEN_KEY) } catch { return null }
  })
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })

  const saveSession = useCallback((access_token, userData, refresh_token = null) => {
    if (access_token) {
      setToken(access_token)
      try { localStorage.setItem(TOKEN_KEY, access_token) } catch {}
    }
    if (refresh_token) {
      setRefreshTokenValue(refresh_token)
      try { localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token) } catch {}
    }
    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData))
      setUser(userData)
    }
  }, [])

  const clearSessionState = useCallback(() => {
    // Clear all auth-related localStorage items
    localStorage.removeItem(USER_KEY)
    try { localStorage.removeItem(TOKEN_KEY) } catch {}
    try { localStorage.removeItem(REFRESH_TOKEN_KEY) } catch {}
    
    // Also clear any stale Supabase session data that might interfere
    try {
      // Clear Supabase auth storage keys if they exist
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.includes('supabase')) {
          localStorage.removeItem(key)
        }
      })
    } catch {}
    
    // Reset React state
    setToken(null)
    setRefreshTokenValue(null)
    setUser(null)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutSession()
    } catch {
      // Session cookies may already be expired/cleared.
    }
    clearSessionState()
  }, [clearSessionState])

  // Auto-refresh: called by apiClient when a 401 "Token has expired" is received
  const refreshSession = useCallback(async ({ logoutOnAuthFailure = true } = {}) => {
    // Get refresh token from state or localStorage (in case state is stale)
    const storedRefreshToken = refreshTokenValue || (() => {
      try { return localStorage.getItem(REFRESH_TOKEN_KEY) } catch { return null }
    })()
    
    try {
      // Pass the refresh token explicitly to work around third-party cookie blocking
      const res = await apiRefreshToken(storedRefreshToken)
      if (res.access_token) {
        setToken(res.access_token)
        try { localStorage.setItem(TOKEN_KEY, res.access_token) } catch {}
        // Also save the new refresh token if provided
        if (res.refresh_token) {
          setRefreshTokenValue(res.refresh_token)
          try { localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh_token) } catch {}
        }
        return res.access_token
      }
    } catch (err) {
      if (logoutOnAuthFailure && (err?.status === 401 || err?.status === 403)) {
        await logout()
        return null
      }
      throw err
    }
    return null
  }, [logout, refreshTokenValue])

  // Rehydrate in-memory access token from refresh token on app reload only.
  // Avoid refreshing immediately after login/verification when we already have a valid token.
  useEffect(() => {
    if (!user || token) return
    refreshSession({ logoutOnAuthFailure: true }).catch(() => {})
  }, [user, token, refreshSession])

  // Register the refresh callback so apiClient can trigger it
  useEffect(() => {
    setRefreshCallback(refreshSession)
    return () => setRefreshCallback(null)
  }, [refreshSession])

  return (
    <UserAuthContext.Provider value={{ token, user, saveSession, logout, refreshSession, isLoggedIn: Boolean(user) }}>
      {children}
    </UserAuthContext.Provider>
  )
}

export const useUserAuth = () => useContext(UserAuthContext)
