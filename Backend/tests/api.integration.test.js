import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const userRepoMocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  savePasswordResetToken: vi.fn(),
  findPasswordResetToken: vi.fn(),
  markResetTokenUsed: vi.fn(),
  updatePassword: vi.fn(),
  updateUser: vi.fn(),
}))

const emotionLogRepoMocks = vi.hoisted(() => ({
  findEmotionLogsByUser: vi.fn(),
  getEmotionLogsRange: vi.fn(),
  findEmotionLogById: vi.fn(),
  findEmotionLogByUserAndDate: vi.fn(),
  upsertEmotionLog: vi.fn(),
  deleteEmotionLog: vi.fn(),
}))

const habitRepoMocks = vi.hoisted(() => ({
  findHabitsByUser: vi.fn(),
  findActiveHabitsByUser: vi.fn(),
  findHabitById: vi.fn(),
  createHabit: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
}))

const habitLogRepoMocks = vi.hoisted(() => ({
  findHabitLogsByUser: vi.fn(),
  findHabitLogsByHabit: vi.fn(),
  findHabitLogByHabitAndDate: vi.fn(),
  upsertHabitLog: vi.fn(),
  getHabitLogsRange: vi.fn(),
}))

const recommendationRepoMocks = vi.hoisted(() => ({
  findRecommendationsByEmotionLevel: vi.fn(),
  findAllRecommendations: vi.fn(),
}))

const tokenServiceMocks = vi.hoisted(() => ({
  createToken: vi.fn(),
  verifyToken: vi.fn(),
}))

vi.mock('../src/repositories/userRepository.js', () => userRepoMocks)
vi.mock('../src/repositories/emotionLogRepository.js', () => emotionLogRepoMocks)
vi.mock('../src/repositories/habitRepository.js', () => habitRepoMocks)
vi.mock('../src/repositories/habitLogRepository.js', () => habitLogRepoMocks)
vi.mock('../src/repositories/recommendationRepository.js', () => recommendationRepoMocks)
vi.mock('../src/services/tokenService.js', () => tokenServiceMocks)

import app from '../src/app.js'

function buildUser(overrides = {}) {
  return {
    id: 'user-123',
    email: 'laura@correo.edu.co',
    passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
    displayName: 'Laura Gomez',
    avatarUrl: null,
    avatarTone: '#0f766e',
    university: 'Iberoamericana',
    career: 'Psicologia',
    reminderEnabled: true,
    reminderTime: '20:00',
    reminderFrequency: 'Diario',
    reminderChannel: 'Push',
    riskAlertDismissedUntil: null,
    createdAt: '2026-06-07T12:00:00.000Z',
    ...overrides,
  }
}

describe('API integration', () => {
  beforeEach(() => {
    ;[
      ...Object.values(userRepoMocks),
      ...Object.values(emotionLogRepoMocks),
      ...Object.values(habitRepoMocks),
      ...Object.values(habitLogRepoMocks),
      ...Object.values(recommendationRepoMocks),
      ...Object.values(tokenServiceMocks),
    ].forEach((mockFn) => mockFn.mockReset())

    tokenServiceMocks.createToken.mockReturnValue('jwt-integracion')
    tokenServiceMocks.verifyToken.mockReturnValue({ sub: 'user-123' })
    userRepoMocks.findUserById.mockResolvedValue(buildUser())
  })

  it('registra usuarios por la ruta publica de autenticacion', async () => {
    userRepoMocks.findUserByEmail.mockResolvedValue(null)
    userRepoMocks.createUser.mockResolvedValue(buildUser())

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        displayName: 'Laura Gomez',
        email: 'laura@correo.edu.co',
        password: 'mindbalance123',
      })

    expect(response.status).toBe(201)
    expect(response.body.token).toBe('jwt-integracion')
    expect(response.body.user.email).toBe('laura@correo.edu.co')
  })

  it('guarda registros emocionales autenticados', async () => {
    emotionLogRepoMocks.upsertEmotionLog.mockResolvedValue({
      id: 'emo-123',
      userId: 'user-123',
      date: '2026-06-07',
      score: 4,
      note: 'Mas tranquila',
    })

    const response = await request(app)
      .post('/api/emotion-logs')
      .set('Authorization', 'Bearer jwt-demo')
      .send({
        date: '2026-06-07',
        score: 4,
        note: 'Mas tranquila',
      })

    expect(response.status).toBe(201)
    expect(response.body.log.score).toBe(4)
  })

  it('actualiza el seguimiento de habitos y consulta recomendaciones', async () => {
    habitLogRepoMocks.upsertHabitLog.mockResolvedValue({
      id: 'hl-123',
      habitId: 'habit-1',
      userId: 'user-123',
      date: '2026-06-07',
      completed: true,
    })
    recommendationRepoMocks.findRecommendationsByEmotionLevel.mockResolvedValue([
      { id: 'rec-1', title: 'Pide una pausa breve' },
    ])

    const habitResponse = await request(app)
      .post('/api/habit-logs')
      .set('Authorization', 'Bearer jwt-demo')
      .send({
        habitId: 'habit-1',
        date: '2026-06-07',
        completed: true,
      })

    const recommendationResponse = await request(app)
      .get('/api/recommendations?emotion=2')
      .set('Authorization', 'Bearer jwt-demo')

    expect(habitResponse.status).toBe(201)
    expect(habitResponse.body.log.completed).toBe(true)
    expect(recommendationResponse.status).toBe(200)
    expect(recommendationResponse.body.recommendations).toHaveLength(1)
  })

  it('expone el endpoint de diagnostico de salud', async () => {
    const response = await request(app).get('/api/health')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      ok: true,
      service: 'MindBalance API',
    })
  })

  it('expone Swagger UI y el documento OpenAPI', async () => {
    const docsResponse = await request(app).get('/api-docs/')
    const openApiResponse = await request(app).get('/openapi.json')

    expect(docsResponse.status).toBe(200)
    expect(openApiResponse.status).toBe(200)
    expect(openApiResponse.body.info.title).toBe('MindBalance API')
  })
})
