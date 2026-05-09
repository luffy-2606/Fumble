import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi, type MeUser } from '../services/api'

interface AuthContextValue {
  user: MeUser | null
  token: string | null
  loading: boolean
  login: (token: string, user: MeUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeUser | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('fmbl_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('fmbl_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    authApi
      .me()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('fmbl_token')
        localStorage.removeItem('fmbl_user')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  function login(newToken: string, userData: MeUser) {
    localStorage.setItem('fmbl_token', newToken)
    localStorage.setItem('fmbl_user', JSON.stringify(userData))
    setToken(newToken)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('fmbl_token')
    localStorage.removeItem('fmbl_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAuthenticated: !!token && !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
