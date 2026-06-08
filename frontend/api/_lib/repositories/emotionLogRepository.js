import { pool } from '../config/database.js'
import { toEmotionLog } from '../models/EmotionLog.js'

export async function findEmotionLogsByUser(userId, limit = null) {
  let query = `SELECT id, user_id, emotion_score, notes, date
               FROM emotion_logs
               WHERE user_id = $1
               ORDER BY date DESC`
  const params = [userId]

  if (limit) {
    query += ` LIMIT $2`
    params.push(limit)
  }

  const result = await pool.query(query, params)
  return result.rows.map(toEmotionLog)
}

export async function findEmotionLogById(id) {
  const result = await pool.query(
    `SELECT id, user_id, emotion_score, notes, date
     FROM emotion_logs
     WHERE id = $1`,
    [id],
  )

  if (result.rowCount === 0) return null
  return toEmotionLog(result.rows[0])
}

export async function findEmotionLogByUserAndDate(userId, date) {
  const result = await pool.query(
    `SELECT id, user_id, emotion_score, notes, date
     FROM emotion_logs
     WHERE user_id = $1 AND date = $2`,
    [userId, date],
  )

  if (result.rowCount === 0) return null
  return toEmotionLog(result.rows[0])
}

export async function upsertEmotionLog(userId, { date, emotionScore, notes }) {
  const result = await pool.query(
    `INSERT INTO emotion_logs (user_id, date, emotion_score, notes)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, date)
     DO UPDATE SET emotion_score = EXCLUDED.emotion_score, notes = EXCLUDED.notes
     RETURNING id, user_id, emotion_score, notes, date`,
    [userId, date, emotionScore, notes ?? null],
  )

  return toEmotionLog(result.rows[0])
}

export async function deleteEmotionLog(id) {
  const result = await pool.query(
    `DELETE FROM emotion_logs WHERE id = $1 RETURNING id`,
    [id],
  )

  return result.rowCount > 0
}

export async function getEmotionLogsRange(userId, days) {
  const result = await pool.query(
    `SELECT id, user_id, emotion_score, notes, date
     FROM emotion_logs
     WHERE user_id = $1 AND date >= CURRENT_DATE - $2::integer
     ORDER BY date ASC`,
    [userId, days],
  )

  return result.rows.map(toEmotionLog)
}
