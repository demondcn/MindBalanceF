import { beforeEach, describe, expect, it, vi } from 'vitest'

const emotionLogRepoMocks = vi.hoisted(() => ({
  getEmotionLogsRange: vi.fn(),
}))

const habitLogRepoMocks = vi.hoisted(() => ({
  getHabitLogsRange: vi.fn(),
}))

vi.mock('../src/repositories/emotionLogRepository.js', () => emotionLogRepoMocks)
vi.mock('../src/repositories/habitLogRepository.js', () => habitLogRepoMocks)

import { getDashboardInsights } from '../src/services/dashboardService.js'

describe('dashboardService', () => {
  beforeEach(() => {
    Object.values(emotionLogRepoMocks).forEach((mockFn) => mockFn.mockReset())
    Object.values(habitLogRepoMocks).forEach((mockFn) => mockFn.mockReset())
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07T12:00:00.000Z'))
  })

  it('construye el resumen principal del dashboard', async () => {
    emotionLogRepoMocks.getEmotionLogsRange.mockResolvedValue([
      { date: '2026-06-07', score: 4, note: 'Buen dia' },
      { date: '2026-06-06', score: 3, note: 'Normal' },
      { date: '2026-06-05', score: 2, note: 'Pesado' },
    ])
    habitLogRepoMocks.getHabitLogsRange.mockResolvedValue([
      { date: '2026-06-07', habitId: 'habit-1', completed: true },
      { date: '2026-06-07', habitId: 'habit-2', completed: false },
    ])

    const result = await getDashboardInsights('user-1')

    expect(result.average).toBe(3)
    expect(result.streak).toBe(2)
    expect(result.riskAlert).toBe(false)
    expect(result.habitsCompleted).toBe(1)
    expect(result.habitsTotal).toBe(2)
    expect(result.todayEmotion).toEqual({ score: 4, note: 'Buen dia' })
  })
})
