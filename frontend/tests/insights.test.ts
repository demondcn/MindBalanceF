import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildHabitSeries,
  buildMoodSeries,
  getAverageMood,
  getCheckInStreak,
  getHistoryRangeLabel,
  getRecommendation,
  getTodayHabitStatus,
  getUserEmotionLogs,
  getUserHabits,
  getVisibleRiskAlert,
  getWeeklyHabitCompletionRate,
  toDateKey,
} from '../src/lib/insights'
import type { EmotionLog, Habit, HabitLog, UserProfile } from '../src/types'

describe('insights helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07T12:00:00.000Z'))
  })

  it('filtra y ordena registros emocionales del usuario', () => {
    const logs: EmotionLog[] = [
      { id: '1', userId: 'user-1', date: '2026-06-06', score: 3, note: '' },
      { id: '2', userId: 'user-2', date: '2026-06-07', score: 5, note: '' },
      { id: '3', userId: 'user-1', date: '2026-06-07', score: 4, note: '' },
    ]

    expect(getUserEmotionLogs(logs, 'user-1').map((log) => log.id)).toEqual(['3', '1'])
  })

  it('construye series de emocion y habitos para los ultimos dias', () => {
    const habits: Habit[] = [
      {
        id: 'habit-1',
        userId: 'user-1',
        title: 'Respirar',
        frequency: 'Diario',
        cue: 'Antes de clase',
        color: '#0f766e',
        isArchived: false,
        createdAt: '2026-06-01T08:00:00.000Z',
      },
    ]
    const moodLogs: EmotionLog[] = [
      { id: 'emo-1', userId: 'user-1', date: '2026-06-07', score: 4, note: '' },
      { id: 'emo-2', userId: 'user-1', date: '2026-06-06', score: 2, note: '' },
    ]
    const habitLogs: HabitLog[] = [
      { id: 'hl-1', habitId: 'habit-1', userId: 'user-1', date: '2026-06-07', completed: true },
    ]

    const moodSeries = buildMoodSeries(moodLogs, 'user-1', 2)
    const habitSeries = buildHabitSeries(habits, habitLogs, 'user-1', 2)

    expect(moodSeries).toHaveLength(2)
    expect(moodSeries.at(-1)?.score).toBe(4)
    expect(habitSeries.at(-1)?.completed).toBe(1)
    expect(getUserHabits(habits, 'user-1')).toHaveLength(1)
  })

  it('calcula promedio, racha y tasa semanal', () => {
    const habits: Habit[] = [
      {
        id: 'habit-1',
        userId: 'user-1',
        title: 'Respirar',
        frequency: 'Diario',
        cue: 'Antes de clase',
        color: '#0f766e',
        isArchived: false,
        createdAt: '2026-06-01T08:00:00.000Z',
      },
    ]
    const logs: EmotionLog[] = [
      { id: '1', userId: 'user-1', date: '2026-06-07', score: 4, note: '' },
      { id: '2', userId: 'user-1', date: '2026-06-06', score: 3, note: '' },
      { id: '3', userId: 'user-1', date: '2026-06-05', score: 2, note: '' },
    ]
    const habitLogs: HabitLog[] = [
      { id: 'hl-1', habitId: 'habit-1', userId: 'user-1', date: '2026-06-07', completed: true },
      { id: 'hl-2', habitId: 'habit-1', userId: 'user-1', date: '2026-06-06', completed: true },
    ]

    expect(getAverageMood(logs, 'user-1', 3)).toBe(3)
    expect(getCheckInStreak(logs, 'user-1')).toBe(3)
    expect(getWeeklyHabitCompletionRate(habits, habitLogs, 'user-1')).toBe(29)
    expect(getAverageMood([], 'user-1')).toBe(0)
    expect(getWeeklyHabitCompletionRate([], habitLogs, 'user-1')).toBe(0)
  })

  it('arma el estado de habitos de hoy y detecta alertas de riesgo', () => {
    const user: UserProfile = {
      id: 'user-1',
      email: 'laura@correo.edu.co',
      password: '',
      displayName: 'Laura',
      avatarTone: '#0f766e',
      university: 'Iberoamericana',
      career: 'Psicologia',
      reminderEnabled: true,
      reminderTime: '20:00',
      reminderFrequency: 'Diario',
      reminderChannel: 'Push',
      createdAt: '2026-06-01T08:00:00.000Z',
    }
    const habits: Habit[] = [
      {
        id: 'habit-1',
        userId: 'user-1',
        title: 'Respirar',
        frequency: 'Diario',
        cue: 'Antes de clase',
        color: '#0f766e',
        isArchived: false,
        createdAt: '2026-06-01T08:00:00.000Z',
      },
    ]
    const habitLogs: HabitLog[] = [
      { id: 'hl-1', habitId: 'habit-1', userId: 'user-1', date: toDateKey(), completed: true },
    ]
    const lowMoodLogs: EmotionLog[] = [
      { id: '1', userId: 'user-1', date: '2026-06-07', score: 2, note: '' },
      { id: '2', userId: 'user-1', date: '2026-06-06', score: 2, note: '' },
      { id: '3', userId: 'user-1', date: '2026-06-05', score: 1, note: '' },
    ]

    const todayHabits = getTodayHabitStatus(habits, habitLogs, 'user-1')
    const riskAlert = getVisibleRiskAlert(lowMoodLogs, 'user-1', user)
    const dismissedRiskAlert = getVisibleRiskAlert(lowMoodLogs, 'user-1', {
      ...user,
      riskAlertDismissedUntil: '2026-06-08',
    })

    expect(todayHabits[0]?.completed).toBe(true)
    expect(riskAlert?.title).toMatch(/Patrón|Patr/)
    expect(dismissedRiskAlert).toBeNull()
    expect(getHistoryRangeLabel('week')).toContain('7')
    expect(getHistoryRangeLabel('day')).toContain('día')
    expect(getHistoryRangeLabel('month')).toContain('30')
    expect(getRecommendation(2).title.length).toBeGreaterThan(0)
  })
})
