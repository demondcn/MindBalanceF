import * as emotionLogRepo from '../repositories/emotionLogRepository.js'

export async function getEmotionLogs(userId, days = null) {
  if (days) {
    return await emotionLogRepo.getEmotionLogsRange(userId, days)
  }

  return await emotionLogRepo.findEmotionLogsByUser(userId)
}

export async function getEmotionLogById(userId, logId) {
  const log = await emotionLogRepo.findEmotionLogById(logId)

  if (!log || log.userId !== userId) {
    return { error: 'Registro emocional no encontrado.' }
  }

  return { log }
}

export async function getTodayEmotionLog(userId) {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10)
  const log = await emotionLogRepo.findEmotionLogByUserAndDate(userId, dateStr)

  return { log }
}

export async function saveEmotionLog(userId, { date, score, note }) {
  if (!date || !score) {
    return { error: 'La fecha y la puntuacion son obligatorias.' }
  }

  const parsedScore = Number(score)
  if (!Number.isInteger(parsedScore) || parsedScore < 1 || parsedScore > 5) {
    return { error: 'La puntuacion debe ser un entero entre 1 y 5.' }
  }

  const log = await emotionLogRepo.upsertEmotionLog(userId, {
    date,
    emotionScore: parsedScore,
    notes: note ?? null,
  })

  return { log }
}

export async function removeEmotionLog(userId, logId) {
  const log = await emotionLogRepo.findEmotionLogById(logId)

  if (!log || log.userId !== userId) {
    return { error: 'Registro emocional no encontrado.' }
  }

  await emotionLogRepo.deleteEmotionLog(logId)
  return { success: true }
}
