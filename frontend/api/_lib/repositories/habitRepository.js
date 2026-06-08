import { pool } from '../config/database.js'
import { toHabit } from '../models/Habit.js'

export async function findHabitsByUser(userId) {
  const result = await pool.query(
    `SELECT id, user_id, title, frequency, cue, color, is_active, is_archived, created_at
     FROM habits
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  )

  return result.rows.map(toHabit)
}

export async function findActiveHabitsByUser(userId) {
  const result = await pool.query(
    `SELECT id, user_id, title, frequency, cue, color, is_active, is_archived, created_at
     FROM habits
     WHERE user_id = $1 AND is_archived = false
     ORDER BY created_at DESC`,
    [userId],
  )

  return result.rows.map(toHabit)
}

export async function findHabitById(id) {
  const result = await pool.query(
    `SELECT id, user_id, title, frequency, cue, color, is_active, is_archived, created_at
     FROM habits
     WHERE id = $1`,
    [id],
  )

  if (result.rowCount === 0) return null
  return toHabit(result.rows[0])
}

export async function createHabit(userId, { title, frequency, cue, color }) {
  const result = await pool.query(
    `INSERT INTO habits (user_id, title, frequency, cue, color)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, title, frequency, cue, color, is_active, is_archived, created_at`,
    [userId, title, frequency, cue ?? null, color ?? null],
  )

  return toHabit(result.rows[0])
}

export async function updateHabit(id, userId, { title, frequency, cue, color, isArchived }) {
  const fields = []
  const params = []
  let index = 1

  if (title !== undefined) { fields.push(`title = $${index++}`); params.push(title) }
  if (frequency !== undefined) { fields.push(`frequency = $${index++}`); params.push(frequency) }
  if (cue !== undefined) { fields.push(`cue = $${index++}`); params.push(cue) }
  if (color !== undefined) { fields.push(`color = $${index++}`); params.push(color) }
  if (isArchived !== undefined) { fields.push(`is_archived = $${index++}`); params.push(isArchived) }

  if (fields.length === 0) return null

  params.push(id, userId)

  const result = await pool.query(
    `UPDATE habits
     SET ${fields.join(', ')}
     WHERE id = $${index++} AND user_id = $${index}
     RETURNING id, user_id, title, frequency, cue, color, is_active, is_archived, created_at`,
    params,
  )

  if (result.rowCount === 0) return null
  return toHabit(result.rows[0])
}

export async function deleteHabit(id, userId) {
  const result = await pool.query(
    `DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  )

  return result.rowCount > 0
}
