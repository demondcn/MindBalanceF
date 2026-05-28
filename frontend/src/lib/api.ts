import type { EmotionLog, Habit, HabitLog, UserProfile } from '../types'

const API_BASE = '/api'

function getToken(): string | null {
  return localStorage.getItem('mindbalance-token')
}

function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('mindbalance-token', token)
  } else {
    localStorage.removeItem('mindbalance-token')
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error del servidor' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const api = {
  setToken,
  getToken,
  clearToken: () => setToken(null),

  auth: {
    login: (email: string, password: string) =>
      request<{ user: Record<string, unknown>; token: string }>('POST', '/auth/login', { email, password }),

    register: (data: { displayName: string; email: string; password: string }) =>
      request<{ user: Record<string, unknown>; token: string }>('POST', '/auth/register', data),

    resetPassword: (email: string) =>
      request<{ message: string }>('POST', '/auth/reset-password', { email }),
  },

  emotionLogs: {
    list: async (days?: number): Promise<EmotionLog[]> => {
      const res = await request<{ logs: EmotionLog[] }>('GET', `/emotion-logs${days ? `?days=${days}` : ''}`)
      return res.logs ?? []
    },

    today: async (): Promise<EmotionLog | null> => {
      const res = await request<{ log: EmotionLog | null }>('GET', '/emotion-logs/today')
      return res.log
    },

    save: async (data: { date: string; score: number; note: string }): Promise<EmotionLog> => {
      const res = await request<{ log: EmotionLog }>('POST', '/emotion-logs', data)
      return res.log
    },

    delete: (id: string) =>
      request<{ success: boolean }>('DELETE', `/emotion-logs/${id}`),
  },

  habits: {
    list: async (activeOnly = false): Promise<Habit[]> => {
      const res = await request<{ habits: Habit[] }>('GET', `/habits${activeOnly ? '?active=true' : ''}`)
      return res.habits ?? []
    },

    create: async (data: { title: string; frequency: string; cue?: string; color?: string }): Promise<Habit> => {
      const res = await request<{ habit: Habit }>('POST', '/habits', data)
      return res.habit
    },

    update: async (id: string, data: Record<string, unknown>): Promise<Habit> => {
      const res = await request<{ habit: Habit }>('PUT', `/habits/${id}`, data)
      return res.habit
    },

    delete: (id: string) =>
      request<{ success: boolean }>('DELETE', `/habits/${id}`),
  },

  habitLogs: {
    list: async (date?: string): Promise<HabitLog[]> => {
      const res = await request<{ logs: HabitLog[] }>('GET', `/habit-logs${date ? `?date=${date}` : ''}`)
      return res.logs ?? []
    },

    toggle: async (data: { habitId: string; date: string; completed?: boolean }): Promise<HabitLog> => {
      const res = await request<{ log: HabitLog }>('POST', '/habit-logs', data)
      return res.log
    },
  },

  recommendations: {
    get: (emotionLevel: number) =>
      request<{ recommendations: Record<string, unknown>[] }>('GET', `/recommendations?emotion=${emotionLevel}`),
  },

  dashboard: {
    get: () =>
      request<Record<string, unknown>>('GET', '/dashboard'),
  },

  profile: {
    get: async (): Promise<UserProfile> => {
      const res = await request<{ user: UserProfile }>('GET', '/profile/me')
      return res.user
    },

    update: async (data: Record<string, unknown>): Promise<UserProfile> => {
      const res = await request<{ user: UserProfile }>('PUT', '/profile/me', data)
      return res.user
    },

    updateReminders: async (data: Record<string, unknown>): Promise<UserProfile> => {
      const res = await request<{ user: UserProfile }>('PUT', '/profile/me/reminders', data)
      return res.user
    },

    dismissAlert: async (): Promise<UserProfile> => {
      const res = await request<{ user: UserProfile }>('PUT', '/profile/me/dismiss-alert')
      return res.user
    },
  },
}
