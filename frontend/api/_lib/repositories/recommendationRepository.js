import { pool } from '../config/database.js'
import { toRecommendation } from '../models/Recommendation.js'

export async function findRecommendationsByEmotionLevel(emotionLevel) {
  const result = await pool.query(
    `SELECT id, emotion_level, title, content, action, category, is_active
     FROM recommendations
     WHERE emotion_level = $1 AND is_active = true
     ORDER BY category ASC`,
    [emotionLevel],
  )

  return result.rows.map(toRecommendation)
}

export async function findAllRecommendations() {
  const result = await pool.query(
    `SELECT id, emotion_level, title, content, action, category, is_active
     FROM recommendations
     ORDER BY emotion_level ASC, category ASC`,
  )

  return result.rows.map(toRecommendation)
}

export async function createRecommendation({ emotionLevel, title, content, action, category }) {
  const result = await pool.query(
    `INSERT INTO recommendations (emotion_level, title, content, action, category)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, emotion_level, title, content, action, category, is_active`,
    [emotionLevel, title, content, action ?? null, category],
  )

  return toRecommendation(result.rows[0])
}
