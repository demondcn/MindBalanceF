import * as habitRepo from '../repositories/habitRepository.js'

export async function getHabits(userId, onlyActive = false) {
  if (onlyActive) {
    return await habitRepo.findActiveHabitsByUser(userId)
  }

  return await habitRepo.findHabitsByUser(userId)
}

export async function getHabitById(userId, habitId) {
  const habit = await habitRepo.findHabitById(habitId)

  if (!habit || habit.userId !== userId) {
    return { error: 'Habito no encontrado.' }
  }

  return { habit }
}

export async function createHabit(userId, { title, frequency, cue, color }) {
  if (!title || !title.trim()) {
    return { error: 'El titulo del habito es obligatorio.' }
  }

  if (!frequency) {
    return { error: 'La frecuencia es obligatoria.' }
  }

  const habit = await habitRepo.createHabit(userId, {
    title: title.trim(),
    frequency,
    cue: cue ?? null,
    color: color ?? null,
  })

  return { habit }
}

export async function updateHabit(userId, habitId, updates) {
  const habit = await habitRepo.findHabitById(habitId)

  if (!habit || habit.userId !== userId) {
    return { error: 'Habito no encontrado.' }
  }

  const updated = await habitRepo.updateHabit(habitId, userId, updates)

  if (!updated) {
    return { error: 'No se proporcionaron campos para actualizar.' }
  }

  return { habit: updated }
}

export async function removeHabit(userId, habitId) {
  const habit = await habitRepo.findHabitById(habitId)

  if (!habit || habit.userId !== userId) {
    return { error: 'Habito no encontrado.' }
  }

  await habitRepo.deleteHabit(habitId, userId)
  return { success: true }
}
