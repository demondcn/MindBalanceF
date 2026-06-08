import * as habitLogRepo from '../repositories/habitLogRepository.js'

export async function getHabitLogs(userId, date = null) {
  return await habitLogRepo.findHabitLogsByUser(userId, date)
}

export async function toggleHabitLog(userId, { habitId, date, completed }) {
  if (!habitId || !date) {
    return { error: 'El ID del habito y la fecha son obligatorios.' }
  }

  const status = completed !== undefined ? Boolean(completed) : true

  const log = await habitLogRepo.upsertHabitLog(userId, {
    habitId,
    date,
    status,
    notes: null,
  })

  return { log }
}
