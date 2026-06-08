import { beforeEach, describe, expect, it, vi } from 'vitest'

const habitLogRepoMocks = vi.hoisted(() => ({
  findHabitLogsByUser: vi.fn(),
  upsertHabitLog: vi.fn(),
}))

vi.mock('../src/repositories/habitLogRepository.js', () => habitLogRepoMocks)

import { getHabitLogs, toggleHabitLog } from '../src/services/habitLogService.js'

describe('habitLogService', () => {
  beforeEach(() => {
    Object.values(habitLogRepoMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it('lista seguimientos por usuario y fecha opcional', async () => {
    habitLogRepoMocks.findHabitLogsByUser.mockResolvedValue([{ id: 'hl-1' }])

    const result = await getHabitLogs('user-1', '2026-06-07')

    expect(result).toEqual([{ id: 'hl-1' }])
    expect(habitLogRepoMocks.findHabitLogsByUser).toHaveBeenCalledWith('user-1', '2026-06-07')
  })

  it('valida y guarda el cambio de estado del habito', async () => {
    expect(await toggleHabitLog('user-1', { habitId: '', date: '' }))
      .toEqual({ error: 'El ID del habito y la fecha son obligatorios.' })

    habitLogRepoMocks.upsertHabitLog.mockResolvedValue({ id: 'hl-1', completed: true })

    const result = await toggleHabitLog('user-1', {
      habitId: 'habit-1',
      date: '2026-06-07',
      completed: true,
    })

    expect(habitLogRepoMocks.upsertHabitLog).toHaveBeenCalledWith('user-1', {
      habitId: 'habit-1',
      date: '2026-06-07',
      status: true,
      notes: null,
    })
    expect(result).toEqual({ log: { id: 'hl-1', completed: true } })
  })
})
