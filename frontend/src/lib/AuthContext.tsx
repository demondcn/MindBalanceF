import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { api } from './api'
import type { UserProfile } from '../types'

interface AuthState {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<string | null>
  register: (values: { displayName: string; email: string; password: string }) => Promise<string | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapUser(raw: Record<string, unknown>): UserProfile {
  return {
    id: raw.id as string,
    email: raw.email as string,
    password: '',
    displayName: raw.displayName as string,
    avatarTone: (raw.avatarTone as string) || '#0f766e',
    university: (raw.university as string) || 'Corporación Universitaria Iberoamericana',
    career: (raw.career as string) || 'Estudiante',
    reminderEnabled: (raw.reminderEnabled as boolean) ?? true,
    reminderTime: (raw.reminderTime as string) || '20:00',
    reminderFrequency: (raw.reminderFrequency as UserProfile['reminderFrequency']) || 'Diario',
    reminderChannel: (raw.reminderChannel as UserProfile['reminderChannel']) || 'Push',
    riskAlertDismissedUntil: raw.riskAlertDismissedUntil as string | undefined,
    createdAt: raw.createdAt as string,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = api.getToken()
    return { user: null, token, isLoading: !!token }
  })

  useEffect(() => {
    if (!state.token || state.user) {
      return
    }

    api.profile.get()
      .then((profile) => {
        setState({ user: profile, token: state.token, isLoading: false })
      })
      .catch(() => {
        api.clearToken()
        setState({ user: null, token: null, isLoading: false })
      })
  }, [state.token, state.user])

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    try {
      const result = await api.auth.login(email, password)
      api.setToken(result.token)
      setState({ user: mapUser(result.user), token: result.token, isLoading: false })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Error al iniciar sesion'
    }
  }, [])

  const register = useCallback(async (values: { displayName: string; email: string; password: string }): Promise<string | null> => {
    try {
      const result = await api.auth.register(values)
      api.setToken(result.token)
      setState({ user: mapUser(result.user), token: result.token, isLoading: false })
      return null
    } catch (error) {
      return error instanceof Error ? error.message : 'Error al registrarse'
    }
  }, [])

  const logout = useCallback(() => {
    api.clearToken()
    setState({ user: null, token: null, isLoading: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
