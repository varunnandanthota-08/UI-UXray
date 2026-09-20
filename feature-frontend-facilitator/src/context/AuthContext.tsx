import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import api from '../lib/api'

export type Role = 'student' | 'facilitator'

export type UserProfile = {
  id: string
  name: string
  email: string
  role: Role
  createdAt?: string
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  name: string
  email: string
  password: string
  role: Role
}

type AuthContextValue = {
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'barabari_facilitator_token'
const USER_KEY = 'barabari_facilitator_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const fetchMe = useCallback(async (currentToken: string) => {
    const response = await api.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    })
    const nextUser = response.data.user as UserProfile
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await api.post('/api/auth/login', payload)
    const nextToken = response.data.token as string
    const nextUser = response.data.user as UserProfile
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setToken(nextToken)
    setUser(nextUser)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    await api.post('/api/auth/register', payload)
    await login({ email: payload.email, password: payload.password })
  }, [login])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    fetchMe(token)
      .catch(() => {
        logout()
      })
      .finally(() => {
        setLoading(false)
      })
  }, [fetchMe, logout, token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
    }),
    [login, logout, loading, token, user, register],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
