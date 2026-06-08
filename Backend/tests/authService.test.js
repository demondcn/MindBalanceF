import bcrypt from 'bcryptjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const repoMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  savePasswordResetToken: vi.fn(),
  findPasswordResetToken: vi.fn(),
  markResetTokenUsed: vi.fn(),
  updatePassword: vi.fn(),
}))

const tokenServiceMocks = vi.hoisted(() => ({
  createToken: vi.fn(),
}))

vi.mock('../src/repositories/userRepository.js', () => repoMocks)
vi.mock('../src/services/tokenService.js', () => tokenServiceMocks)

import {
  loginUser,
  registerUser,
  resetPasswordConfirm,
  resetPasswordRequest,
} from '../src/services/authService.js'

function buildUser(overrides = {}) {
  return {
    id: 'user-1',
    email: 'laura@correo.edu.co',
    passwordHash: 'hash-demo',
    displayName: 'Laura Gomez',
    avatarUrl: null,
    avatarTone: '#0f766e',
    university: 'Iberoamericana',
    career: 'Psicologia',
    reminderEnabled: true,
    reminderTime: '20:00',
    reminderFrequency: 'Diario',
    reminderChannel: 'Push',
    riskAlertDismissedUntil: null,
    createdAt: '2026-06-07T12:00:00.000Z',
    ...overrides,
  }
}

describe('authService', () => {
  beforeEach(() => {
    Object.values(repoMocks).forEach((mockFn) => mockFn.mockReset())
    Object.values(tokenServiceMocks).forEach((mockFn) => mockFn.mockReset())
    tokenServiceMocks.createToken.mockReturnValue('jwt-demo')
  })

  it('valida campos obligatorios y correos duplicados al registrar', async () => {
    expect(await registerUser({ email: '', password: 'mindbalance123', displayName: '' }))
      .toEqual({ error: 'El correo y el nombre son obligatorios.' })

    repoMocks.findUserByEmail.mockResolvedValue(buildUser())

    expect(await registerUser({
      email: 'laura@correo.edu.co',
      password: 'mindbalance123',
      displayName: 'Laura',
    })).toEqual({ error: 'Ese correo ya esta registrado.' })
  })

  it('normaliza email, crea usuario y emite token', async () => {
    repoMocks.findUserByEmail.mockResolvedValue(null)
    repoMocks.createUser.mockResolvedValue(buildUser())

    const result = await registerUser({
      email: '  Laura@Correo.edu.co ',
      password: 'mindbalance123',
      displayName: '  Laura Gomez ',
    })

    expect(repoMocks.createUser).toHaveBeenCalledWith(expect.objectContaining({
      email: 'laura@correo.edu.co',
      displayName: 'Laura Gomez',
    }))
    expect(tokenServiceMocks.createToken).toHaveBeenCalled()
    expect(result.token).toBe('jwt-demo')
    expect(result.user.displayName).toBe('Laura Gomez')
  })

  it('valida credenciales al iniciar sesion', async () => {
    repoMocks.findUserByEmail.mockResolvedValue(null)
    expect(await loginUser({ email: 'laura@correo.edu.co', password: 'fallida123' }))
      .toEqual({ error: 'Credenciales invalidas.' })

    const passwordHash = await bcrypt.hash('mindbalance123', 10)
    repoMocks.findUserByEmail.mockResolvedValue(buildUser({ passwordHash }))

    const result = await loginUser({ email: 'laura@correo.edu.co', password: 'mindbalance123' })

    expect(result.token).toBe('jwt-demo')
    expect(result.user.email).toBe('laura@correo.edu.co')
  })

  it('genera y almacena un token de recuperacion', async () => {
    repoMocks.findUserByEmail.mockResolvedValue(buildUser())

    const result = await resetPasswordRequest({ email: 'laura@correo.edu.co' })

    expect(result.token).toMatch(/^[a-f0-9]{64}$/)
    expect(repoMocks.savePasswordResetToken).toHaveBeenCalledWith(
      'user-1',
      expect.any(String),
      expect.any(Date),
    )
  })

  it('confirma la recuperacion de contrasena cuando el token es valido', async () => {
    repoMocks.findPasswordResetToken.mockResolvedValue({ user_id: 'user-1' })

    const result = await resetPasswordConfirm({
      token: 'token-demo',
      newPassword: 'nuevaClave123',
    })

    expect(result).toEqual({ success: true })
    expect(repoMocks.updatePassword).toHaveBeenCalledWith('user-1', expect.any(String))
    expect(repoMocks.markResetTokenUsed).toHaveBeenCalledWith('token-demo')
  })
})
