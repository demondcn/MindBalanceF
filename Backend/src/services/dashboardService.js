import * as emotionLogRepo from '../repositories/emotionLogRepository.js'
import * as habitLogRepo from '../repositories/habitLogRepository.js'

export async function getDashboardInsights(userId) {
  const days = 7
  const emotionLogs = await emotionLogRepo.getEmotionLogsRange(userId, days)
  const habitLogs = await habitLogRepo.getHabitLogsRange(userId, days)

  const scores = emotionLogs.map(e => e.score)
  const average = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : null

  const today = new Date().toISOString().slice(0, 10)
  const todayLog = emotionLogs.find(e => e.date === today)

  const lowScores = scores.filter(s => s <= 2).length
  const riskAlert = scores.length >= 3 && lowScores >= 3

  const completedToday = habitLogs.filter(h => h.date === today && h.completed).length
  const totalToday = [...new Set(habitLogs.filter(h => h.date === today).map(h => h.habitId))].length

  let streak = 0
  if (scores.length > 0) {
    const sortedLogs = [...emotionLogs].sort((a, b) => b.date.localeCompare(a.date))

    for (const log of sortedLogs) {
      if (log.score >= 3) {
        streak++
      } else {
        break
      }
    }
  }

  return {
    average,
    streak,
    riskAlert,
    todayEmotion: todayLog ? { score: todayLog.score, note: todayLog.note } : null,
    habitsCompleted: completedToday,
    habitsTotal: totalToday,
    emotionSeries: emotionLogs.map(e => ({
      date: e.date,
      score: e.score,
    })),
    habitSeries: habitLogs.map(h => ({
      date: h.date,
      habitId: h.habitId,
      completed: h.completed,
    })),
  }
}
