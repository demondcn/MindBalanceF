import { pool } from '../config/database.js'
import { toHabitLog } from '../models/HabitLog.js'

export async function findHabitLogsByUser(userId, date = null) {
  let query = `SELECT id, habit_id, user_id, completed_at, date, status, notes
               FROM habit_logs
               WHERE user_id = $1`
  const params = [userId]

  if (date) {
    query += ` AND date = $2`
    params.push(date)
  }

  query += ` ORDER BY date DESC, completed_at DESC`

  const result = await pool.query(query, params)
  return result.rows.map(toHabitLog)
}

export async function findHabitLogsByHabit(habitId) {
  const result = await pool.query(
    `SELECT id, habit_id, user_id, completed_at, date, status, notes
     FROM habit_logs
     WHERE habit_id = $1
     ORDER BY date DESC`,
    [habitId],
  )

  return result.rows.map(toHabitLog)
}

export async function findHabitLogByHabitAndDate(habitId, date) {
  const result = await pool.query(
    `SELECT id, habit_id, user_id, completed_at, date, status, notes
     FROM habit_logs
     WHERE habit_id = $1 AND date = $2`,
    [habitId, date],
  )

  if (result.rowCount === 0) return null
  return toHabitLog(result.rows[0])
}

export async function upsertHabitLog(userId, { habitId, date, status, notes }) {
  const result = await pool.query(
    `INSERT INTO habit_logs (habit_id, user_id, date, status, notes)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (habit_id, date)
     DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, completed_at = now()
     RETURNING id, habit_id, user_id, completed_at, date, status, notes`,
    [habitId, userId, date, status, notes ?? null],
  )

  return toHabitLog(result.rows[0])
}

export async function getHabitLogsRange(userId, days) {
  const result = await pool.query(
    `SELECT hl.id, hl.habit_id, hl.user_id, hl.completed_at, hl.date, hl.status, hl.notes
     FROM habit_logs hl
     WHERE hl.user_id = $1 AND hl.date >= CURRENT_DATE - $2::integer
     ORDER BY hl.date ASC`,
    [userId, days],
  )

  return result.rows.map(toHabitLog)
}
