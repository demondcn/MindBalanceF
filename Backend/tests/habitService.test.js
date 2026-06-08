import { beforeEach, describe, expect, it, vi } from 'vitest'

const habitRepoMocks = vi.hoisted(() => ({
  findHabitsByUser: vi.fn(),
  findActiveHabitsByUser: vi.fn(),
  findHabitById: vi.fn(),
  createHabit: vi.fn(),
  updateHabit: vi.fn(),
  deleteHabit: vi.fn(),
}))

vi.mock('../src/repositories/habitRepository.js', () => habitRepoMocks)

import {
  createHabit,
  getHabitById,
  getHabits,
  removeHabit,
  updateHabit,
} from '../src/services/habitService.js'

describe('habitService', () => {
  beforeEach(() => {
    Object.values(habitRepoMocks).forEach((mockFn) => mockFn.mockReset())
  })

  it('valida titulo y frecuencia al crear habitos', async () => {
    expect(await createHabit('user-1', { title: '', frequency: '', cue: '', color: '' }))
      .toEqual({ error: 'El titulo del habito es obligatorio.' })

    expect(await createHabit('user-1', { title: 'Respirar', frequency: '', cue: '', color: '' }))
      .toEqual({ error: 'La frecuencia es obligatoria.' })
  })

  it('lista habitos y valida la propiedad del recurso consultado', async () => {
    habitRepoMocks.findHabitsByUser.mockResolvedValue([{ id: 'habit-1' }])
    habitRepoMocks.findActiveHabitsByUser.mockResolvedValue([{ id: 'habit-2' }])
    habitRepoMocks.findHabitById.mockResolvedValue({ id: 'habit-2', userId: 'user-1' })

    await expect(getHabits('user-1')).resolves.toEqual([{ id: 'habit-1' }])
    await expect(getHabits('user-1', true)).resolves.toEqual([{ id: 'habit-2' }])
    await expect(getHabitById('user-1', 'habit-2')).resolves.toEqual({
      habit: { id: 'habit-2', userId: 'user-1' },
    })
  })

  it('crea un habito normalizando el titulo', async () => {
    habitRepoMocks.createHabit.mockResolvedValue({ id: 'habit-1', title: 'Respirar' })

    const result = await createHabit('user-1', {
      title: '  Respirar  ',
      frequency: 'Diario',
      cue: 'Antes de clase',
      color: '#0f766e',
    })

    expect(habitRepoMocks.createHabit).toHaveBeenCalledWith('user-1', {
      title: 'Respirar',
      frequency: 'Diario',
      cue: 'Antes de clase',
      color: '#0f766e',
    })
    expect(result).toEqual({ habit: { id: 'habit-1', title: 'Respirar' } })
  })

  it('informa errores cuando un habito no existe o no trae cambios', async () => {
    habitRepoMocks.findHabitById.mockResolvedValue(null)
    expect(await updateHabit('user-1', 'habit-1', { title: 'Nuevo' }))
      .toEqual({ error: 'Habito no encontrado.' })

    habitRepoMocks.findHabitById.mockResolvedValue({ id: 'habit-1', userId: 'user-1' })
    habitRepoMocks.updateHabit.mockResolvedValue(null)

    expect(await updateHabit('user-1', 'habit-1', {}))
      .toEqual({ error: 'No se proporcionaron campos para actualizar.' })
  })

  it('elimina habitos del usuario correcto', async () => {
    habitRepoMocks.findHabitById.mockResolvedValue({ id: 'habit-1', userId: 'user-1' })

    const result = await removeHabit('user-1', 'habit-1')

    expect(habitRepoMocks.deleteHabit).toHaveBeenCalledWith('habit-1', 'user-1')
    expect(result).toEqual({ success: true })
  })

  it('rechaza acceso a habitos de otros usuarios', async () => {
    habitRepoMocks.findHabitById.mockResolvedValue({ id: 'habit-1', userId: 'otro-usuario' })

    await expect(getHabitById('user-1', 'habit-1')).resolves.toEqual({
      error: 'Habito no encontrado.',
    })
    await expect(removeHabit('user-1', 'habit-1')).resolves.toEqual({
      error: 'Habito no encontrado.',
    })
  })
})
