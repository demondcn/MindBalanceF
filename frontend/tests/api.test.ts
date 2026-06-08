import { beforeEach, describe, expect, it, vi } from 'vitest'
import { api } from '../src/lib/api'

describe('frontend api client', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('envia credenciales de login y devuelve la respuesta JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({
        user: { id: 'user-1', email: 'laura@correo.edu.co', displayName: 'Laura' },
        token: 'jwt-demo',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    const result = await api.auth.login('laura@correo.edu.co', 'mindbalance123')

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'laura@correo.edu.co',
        password: 'mindbalance123',
      }),
    })
    expect(result.token).toBe('jwt-demo')
  })

  it('incluye el token en peticiones autenticadas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ average: 4 }),
    })

    vi.stubGlobal('fetch', fetchMock)
    api.setToken('token-activo')

    await api.dashboard.get()

    expect(fetchMock).toHaveBeenCalledWith('/api/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token-activo',
      },
      body: undefined,
    })
  })

  it('muestra un mensaje claro cuando la ruta no existe y responde HTML', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => 'text/html' },
      json: async () => ({}),
    }))

    await expect(api.auth.register({
      displayName: 'Cris',
      email: 'cris@correo.edu.co',
      password: 'mindbalance123',
    })).rejects.toThrow('Servicio no disponible. Verifica la URL del backend o su despliegue.')
  })

  it('propaga el mensaje JSON de error cuando la API responde con detalle', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ message: 'Credenciales invalidas.' }),
    }))

    await expect(api.auth.login('laura@correo.edu.co', 'incorrecta'))
      .rejects.toThrow('Credenciales invalidas.')
  })

  it('puede limpiar el token y reporta errores HTTP genericos', async () => {
    api.setToken('token-temporal')
    api.clearToken()
    expect(api.getToken()).toBeNull()

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => 'text/plain' },
      json: async () => ({}),
    }))

    await expect(api.dashboard.get()).rejects.toThrow('HTTP 500')
  })

  it('usa un fallback cuando la respuesta declara JSON pero no puede parsearse', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => {
        throw new Error('json roto')
      },
    }))

    await expect(api.auth.resetPassword('laura@correo.edu.co'))
      .rejects.toThrow('Error del servidor')
  })

  it('expone los metodos principales de dominios con su mapeo esperado', async () => {
    const responses = [
      { logs: [{ id: 'emo-1', userId: 'user-1', date: '2026-06-07', score: 4, note: '' }] },
      { log: { id: 'emo-1', userId: 'user-1', date: '2026-06-07', score: 4, note: '' } },
      { log: { id: 'emo-2', userId: 'user-1', date: '2026-06-07', score: 5, note: 'ok' } },
      { success: true },
      { habits: [{ id: 'habit-1', userId: 'user-1', title: 'Respirar', frequency: 'Diario', cue: '', color: '#0f766e', isArchived: false, createdAt: '2026-06-07T12:00:00.000Z' }] },
      { habit: { id: 'habit-2', userId: 'user-1', title: 'Pausa', frequency: 'Diario', cue: '', color: '#f97316', isArchived: false, createdAt: '2026-06-07T12:00:00.000Z' } },
      { habit: { id: 'habit-2', userId: 'user-1', title: 'Pausa activa', frequency: 'Diario', cue: '', color: '#f97316', isArchived: false, createdAt: '2026-06-07T12:00:00.000Z' } },
      { success: true },
      { logs: [{ id: 'hl-1', habitId: 'habit-2', userId: 'user-1', date: '2026-06-07', completed: true }] },
      { log: { id: 'hl-2', habitId: 'habit-2', userId: 'user-1', date: '2026-06-08', completed: false } },
      { recommendations: [{ id: 'rec-1' }] },
      { user: { id: 'user-1', email: 'laura@correo.edu.co', password: '', displayName: 'Laura', avatarTone: '#0f766e', university: 'Iberoamericana', career: 'Psicologia', reminderEnabled: true, reminderTime: '20:00', reminderFrequency: 'Diario', reminderChannel: 'Push', createdAt: '2026-06-07T12:00:00.000Z' } },
      { user: { id: 'user-1', email: 'laura@correo.edu.co', password: '', displayName: 'Laura 2', avatarTone: '#0f766e', university: 'Iberoamericana', career: 'Psicologia', reminderEnabled: true, reminderTime: '20:00', reminderFrequency: 'Diario', reminderChannel: 'Push', createdAt: '2026-06-07T12:00:00.000Z' } },
      { user: { id: 'user-1', email: 'laura@correo.edu.co', password: '', displayName: 'Laura 2', avatarTone: '#0f766e', university: 'Iberoamericana', career: 'Psicologia', reminderEnabled: false, reminderTime: '21:00', reminderFrequency: 'Diario', reminderChannel: 'Push', createdAt: '2026-06-07T12:00:00.000Z' } },
      { user: { id: 'user-1', email: 'laura@correo.edu.co', password: '', displayName: 'Laura 2', avatarTone: '#0f766e', university: 'Iberoamericana', career: 'Psicologia', reminderEnabled: false, reminderTime: '21:00', reminderFrequency: 'Diario', reminderChannel: 'Push', createdAt: '2026-06-07T12:00:00.000Z' } },
      { message: 'Solicitud registrada.' },
    ]

    const fetchMock = vi.fn()
    for (const payload of responses) {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: async () => payload,
      })
    }
    vi.stubGlobal('fetch', fetchMock)

    expect(await api.emotionLogs.list(7)).toHaveLength(1)
    expect(await api.emotionLogs.today()).toEqual(expect.objectContaining({ id: 'emo-1' }))
    expect(await api.emotionLogs.save({ date: '2026-06-07', score: 5, note: 'ok' })).toEqual(expect.objectContaining({ id: 'emo-2' }))
    await expect(api.emotionLogs.delete('emo-2')).resolves.toEqual({ success: true })
    expect(await api.habits.list(true)).toHaveLength(1)
    expect(await api.habits.create({ title: 'Pausa', frequency: 'Diario' })).toEqual(expect.objectContaining({ id: 'habit-2' }))
    expect(await api.habits.update('habit-2', { title: 'Pausa activa' })).toEqual(expect.objectContaining({ title: 'Pausa activa' }))
    await expect(api.habits.delete('habit-2')).resolves.toEqual({ success: true })
    expect(await api.habitLogs.list('2026-06-07')).toHaveLength(1)
    expect(await api.habitLogs.toggle({ habitId: 'habit-2', date: '2026-06-08', completed: false })).toEqual(expect.objectContaining({ id: 'hl-2' }))
    await expect(api.recommendations.get(2)).resolves.toEqual({ recommendations: [{ id: 'rec-1' }] })
    expect(await api.profile.get()).toEqual(expect.objectContaining({ displayName: 'Laura' }))
    expect(await api.profile.update({ displayName: 'Laura 2' })).toEqual(expect.objectContaining({ displayName: 'Laura 2' }))
    expect(await api.profile.updateReminders({ reminderEnabled: false })).toEqual(expect.objectContaining({ reminderEnabled: false }))
    expect(await api.profile.dismissAlert()).toEqual(expect.objectContaining({ displayName: 'Laura 2' }))
    await expect(api.auth.resetPassword('laura@correo.edu.co')).resolves.toEqual({ message: 'Solicitud registrada.' })
  })
})
