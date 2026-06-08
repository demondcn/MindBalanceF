import { beforeEach, describe, expect, it, vi } from 'vitest'

const recommendationRepoMocks = vi.hoisted(() => ({
  findRecommendationsByEmotionLevel: vi.fn(),
  findAllRecommendations: vi.fn(),
}))

vi.mock('../src/repositories/recommendationRepository.js', () => recommendationRepoMocks)

import {
  getAllRecommendations,
  getRecommendations,
} from '../src/services/recommendationService.js'

describe('recommendationService', () => {
  beforeEach(() => {
    Object.values(recommendationRepoMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it('rechaza niveles emocionales fuera del rango esperado', async () => {
    await expect(getRecommendations('0')).resolves.toEqual({
      error: 'El nivel emocional debe ser un entero entre 1 y 5.',
    })
  })

  it('devuelve recomendaciones para el nivel solicitado y permite listarlas todas', async () => {
    recommendationRepoMocks.findRecommendationsByEmotionLevel.mockResolvedValue([{ id: 'rec-1' }])
    recommendationRepoMocks.findAllRecommendations.mockResolvedValue([{ id: 'rec-1' }, { id: 'rec-2' }])

    await expect(getRecommendations('2')).resolves.toEqual({
      recommendations: [{ id: 'rec-1' }],
    })
    await expect(getAllRecommendations()).resolves.toEqual({
      recommendations: [{ id: 'rec-1' }, { id: 'rec-2' }],
    })
  })
})
