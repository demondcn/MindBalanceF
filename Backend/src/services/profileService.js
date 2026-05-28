import { toPublicUser } from '../models/User.js'
import * as userRepo from '../repositories/userRepository.js'

export async function getProfile(userId) {
  const user = await userRepo.findUserById(userId)

  if (!user) {
    return { error: 'Usuario no encontrado.' }
  }

  return { user: toPublicUser(user) }
}

export async function updateProfile(userId, updates) {
  const allowedFields = [
    'displayName',
    'avatarUrl',
    'avatarTone',
    'university',
    'career',
  ]

  const filtered = {}
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filtered[field] = updates[field]
    }
  }

  if (Object.keys(filtered).length === 0) {
    return { error: 'No se proporcionaron campos validos para actualizar.' }
  }

  const user = await userRepo.updateUser(userId, filtered)

  if (!user) {
    return { error: 'Usuario no encontrado.' }
  }

  return { user: toPublicUser(user) }
}

export async function updateReminders(userId, reminderSettings) {
  const allowedFields = [
    'reminderEnabled',
    'reminderTime',
    'reminderFrequency',
    'reminderChannel',
  ]

  const filtered = {}
  for (const field of allowedFields) {
    if (reminderSettings[field] !== undefined) {
      filtered[field] = reminderSettings[field]
    }
  }

  if (Object.keys(filtered).length === 0) {
    return { error: 'No se proporcionaron campos de recordatorio.' }
  }

  const user = await userRepo.updateUser(userId, filtered)

  if (!user) {
    return { error: 'Usuario no encontrado.' }
  }

  return { user: toPublicUser(user) }
}

export async function dismissRiskAlert(userId) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const dateStr = tomorrow.toISOString().slice(0, 10)

  const user = await userRepo.updateUser(userId, {
    riskAlertDismissedUntil: dateStr,
  })

  if (!user) {
    return { error: 'Usuario no encontrado.' }
  }

  return { user: toPublicUser(user) }
}
