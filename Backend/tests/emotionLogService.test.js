import { beforeEach, describe, expect, it, vi } from 'vitest'

const emotionLogRepoMocks = vi.hoisted(() => ({
  findEmotionLogsByUser: vi.fn(),
  getEmotionLogsRange: vi.fn(),
  findEmotionLogById: vi.fn(),
  findEmotionLogByUserAndDate: vi.fn(),
  upsertEmotionLog: vi.fn(),
  deleteEmotionLog: vi.fn(),
}))

vi.mock('../src/repositories/emotionLogRepository.js', () => emotionLogRepoMocks)

import {
  getEmotionLogs,
  getEmotionLogById,
  getTodayEmotionLog,
  removeEmotionLog,
  saveEmotionLog,
} from '../src/services/emotionLogService.js'

describe('emotionLogService', () => {
  beforeEach(() => {
    Object.values(emotionLogRepoMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it('usa la consulta por rango cuando se solicita un numero de dias', async () => {
    emotionLogRepoMocks.getEmotionLogsRange.mockResolvedValue([{ id: 'emo-1' }])
    emotionLogRepoMocks.findEmotionLogsByUser.mockResolvedValue([{ id: 'emo-2' }])

    const result = await getEmotionLogs('user-1', 7)
    const allResult = await getEmotionLogs('user-1')

    expect(result).toEqual([{ id: 'emo-1' }])
    expect(allResult).toEqual([{ id: 'emo-2' }])
    expect(emotionLogRepoMocks.getEmotionLogsRange).toHaveBeenCalledWith('user-1', 7)
  })

  it('valida la puntuacion antes de guardar un check-in', async () => {
    expect(await saveEmotionLog('user-1', { date: '', score: 0, note: '' }))
      .toEqual({ error: 'La fecha y la puntuacion son obligatorias.' })

    expect(await saveEmotionLog('user-1', { date: '2026-06-07', score: 7, note: '' }))
      .toEqual({ error: 'La puntuacion debe ser un entero entre 1 y 5.' })
  })

  it('guarda el registro emocional con el formato esperado', async () => {
    emotionLogRepoMocks.upsertEmotionLog.mockResolvedValue({ id: 'emo-1', score: 4 })

    const result = await saveEmotionLog('user-1', {
      date: '2026-06-07',
      score: '4',
      note: 'Mas tranquila',
    })

    expect(emotionLogRepoMocks.upsertEmotionLog).toHaveBeenCalledWith('user-1', {
      date: '2026-06-07',
      emotionScore: 4,
      notes: 'Mas tranquila',
    })
    expect(result).toEqual({ log: { id: 'emo-1', score: 4 } })
  })

  it('consulta y elimina registros solo del usuario autenticado', async () => {
    emotionLogRepoMocks.findEmotionLogById.mockResolvedValue(null)

    expect(await getEmotionLogById('user-1', 'emo-1'))
      .toEqual({ error: 'Registro emocional no encontrado.' })
    expect(await removeEmotionLog('user-1', 'emo-1'))
      .toEqual({ error: 'Registro emocional no encontrado.' })

    emotionLogRepoMocks.findEmotionLogById.mockResolvedValue({
      id: 'emo-1',
      userId: 'user-1',
    })
    emotionLogRepoMocks.findEmotionLogByUserAndDate.mockResolvedValue({
      id: 'emo-hoy',
      userId: 'user-1',
      date: '2026-06-07',
    })

    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-07T12:00:00.000Z'))

    expect(await getEmotionLogById('user-1', 'emo-1'))
      .toEqual({ log: { id: 'emo-1', userId: 'user-1' } })
    expect(await getTodayEmotionLog('user-1'))
      .toEqual({ log: { id: 'emo-hoy', userId: 'user-1', date: '2026-06-07' } })
    expect(await removeEmotionLog('user-1', 'emo-1'))
      .toEqual({ success: true })
    expect(emotionLogRepoMocks.deleteEmotionLog).toHaveBeenCalledWith('emo-1')
  })
})
