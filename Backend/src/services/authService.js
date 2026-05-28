import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import {
  createUser,
  findUserByEmail,
  findUserById,
  savePasswordResetToken,
  findPasswordResetToken,
  markResetTokenUsed,
  updatePassword,
} from '../repositories/userRepository.js'
import { createToken } from './tokenService.js'
import { toPublicUser } from '../models/User.js'

const PASSWORD_MIN_LENGTH = 8

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

export async function registerUser({ email, password, displayName, avatarUrl, avatarTone, university, career }) {
  const normalizedEmail = normalizeEmail(email)
  const cleanDisplayName = String(displayName ?? '').trim()

  if (!normalizedEmail || !cleanDisplayName) {
    return { error: 'El correo y el nombre son obligatorios.' }
  }

  if (String(password ?? '').length < PASSWORD_MIN_LENGTH) {
    return { error: `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` }
  }

  const existingUser = await findUserByEmail(normalizedEmail)

  if (existingUser) {
    return { error: 'Ese correo ya esta registrado.' }
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await createUser({
    email: normalizedEmail,
    passwordHash,
    displayName: cleanDisplayName,
    avatarUrl,
    avatarTone,
    university,
    career,
  })

  return {
    user: toPublicUser(user),
    token: createToken(user),
  }
}

export async function loginUser({ email, password }) {
  const normalizedEmail = normalizeEmail(email)
  const user = await findUserByEmail(normalizedEmail)

  if (!user) {
    return { error: 'Credenciales invalidas.' }
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)

  if (!passwordMatches) {
    return { error: 'Credenciales invalidas.' }
  }

  return {
    user: toPublicUser(user),
    token: createToken(user),
  }
}

export async function resetPasswordRequest({ email }) {
  const normalizedEmail = normalizeEmail(email)
  const user = await findUserByEmail(normalizedEmail)

  if (!user) {
    return { error: 'Ese correo no esta registrado.' }
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await savePasswordResetToken(user.id, token, expiresAt)

  return { token }
}

export async function resetPasswordConfirm({ token, newPassword }) {
  if (!token || !newPassword) {
    return { error: 'Token y nueva contrasena son obligatorios.' }
  }

  if (String(newPassword).length < PASSWORD_MIN_LENGTH) {
    return { error: `La contrasena debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.` }
  }

  const resetToken = await findPasswordResetToken(token)

  if (!resetToken) {
    return { error: 'Token invalido o expirado.' }
  }

  const passwordHash = await bcrypt.hash(newPassword, 10)
  await updatePassword(resetToken.user_id, passwordHash)
  await markResetTokenUsed(token)

  return { success: true }
}
