import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { API_BASE_URL, apiFetch } from '@/services/api'

type User = {
  id: string
  email: string
  role: string
}

type AuthContextValue = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: false,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('triad-token'))
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Takes the token explicitly: right after login, the `token` state in this closure is still the old one.
  const loadProfile = async (activeToken: string | null) => {
    if (!activeToken) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const profile = await apiFetch<User>('/auth/me')
      setUser(profile)
    } catch (error) {
      console.error('Failed to fetch profile', error)
      localStorage.removeItem('triad-token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile(token)
  }, [token])

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: email, password }),
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}))
      throw new Error(payload.detail || 'Login failed')
    }
    const data = await response.json()
    localStorage.setItem('triad-token', data.access_token)
    setToken(data.access_token)
    await loadProfile(data.access_token)
  }

  const logout = () => {
    localStorage.removeItem('triad-token')
    setToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(user && token),
  }), [user, token, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
