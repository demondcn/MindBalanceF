import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../src/lib/AuthContext'

const apiMock = vi.hoisted(() => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
  auth: {
    login: vi.fn(),
    register: vi.fn(),
    resetPassword: vi.fn(),
  },
  profile: {
    get: vi.fn(),
    update: vi.fn(),
    updateReminders: vi.fn(),
    dismissAlert: vi.fn(),
  },
}))

vi.mock('../src/lib/api', () => ({
  api: apiMock,
}))

function AuthProbe() {
  const { user, token, isLoading, login, register, logout } = useAuth()

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="token">{token ?? 'sin-token'}</span>
      <span data-testid="user">{user?.displayName ?? 'anonimo'}</span>
      <button onClick={() => login('laura@correo.edu.co', 'mindbalance123')} type="button">
        login
      </button>
      <button
        onClick={() => register({
          displayName: 'Laura Gomez',
          email: 'laura@correo.edu.co',
          password: 'mindbalance123',
        })}
        type="button"
      >
        register
      </button>
      <button onClick={() => logout()} type="button">
        logout
      </button>
    </div>
  )
}

function InvalidAuthProbe() {
  useAuth()
  return null
}

describe('AuthContext', () => {
  beforeEach(() => {
    apiMock.getToken.mockReset()
    apiMock.setToken.mockReset()
    apiMock.clearToken.mockReset()
    apiMock.auth.login.mockReset()
    apiMock.auth.register.mockReset()
    apiMock.profile.get.mockReset()
    apiMock.getToken.mockReturnValue(null)
  })

  it('recupera el perfil cuando existe un token persistido', async () => {
    apiMock.getToken.mockReturnValue('persisted-token')
    apiMock.profile.get.mockResolvedValue({
      id: 'user-1',
      email: 'laura@correo.edu.co',
      password: '',
      displayName: 'Laura Gomez',
      avatarTone: '#0f766e',
      university: 'Iberoamericana',
      career: 'Psicologia',
      reminderEnabled: true,
      reminderTime: '20:00',
      reminderFrequency: 'Diario',
      reminderChannel: 'Push',
      createdAt: '2026-06-07T12:00:00.000Z',
    })

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Laura Gomez')
    })
    expect(screen.getByTestId('token')).toHaveTextContent('persisted-token')
  })

  it('actualiza el estado despues de iniciar sesion', async () => {
    apiMock.auth.login.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'laura@correo.edu.co',
        displayName: 'Laura Gomez',
        createdAt: '2026-06-07T12:00:00.000Z',
      },
      token: 'jwt-login',
    })

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Laura Gomez')
    })
    expect(apiMock.setToken).toHaveBeenCalledWith('jwt-login')
    expect(screen.getByTestId('token')).toHaveTextContent('jwt-login')
  })

  it('permite registrar y luego cerrar la sesion', async () => {
    apiMock.auth.register.mockResolvedValue({
      user: {
        id: 'user-2',
        email: 'cris@correo.edu.co',
        displayName: 'Cris',
        avatarTone: '#0f766e',
        university: 'Iberoamericana',
        career: 'Estudiante',
        reminderEnabled: true,
        reminderTime: '20:00',
        reminderFrequency: 'Diario',
        reminderChannel: 'Push',
        createdAt: '2026-06-07T12:00:00.000Z',
      },
      token: 'jwt-register',
    })

    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'register' }))
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Cris')
    })

    await user.click(screen.getByRole('button', { name: 'logout' }))

    expect(apiMock.clearToken).toHaveBeenCalled()
    expect(screen.getByTestId('user')).toHaveTextContent('anonimo')
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token')
  })

  it('limpia el token si la recuperacion de perfil falla', async () => {
    apiMock.getToken.mockReturnValue('persisted-token')
    apiMock.profile.get.mockRejectedValue(new Error('sin autorizacion'))

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
    expect(apiMock.clearToken).toHaveBeenCalled()
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token')
  })

  it('devuelve mensajes de error de login y exige el provider', async () => {
    apiMock.auth.login.mockRejectedValue('error-crudo-login')
    apiMock.auth.register.mockRejectedValue('error-crudo-register')
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('anonimo')
    })

    await user.click(screen.getByRole('button', { name: 'register' }))

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('anonimo')
    })

    expect(() => render(<InvalidAuthProbe />)).toThrow('useAuth debe usarse dentro de un AuthProvider')
  })
})
