import { pool } from '../config/database.js'
import { toUser } from '../models/User.js'

export async function findUserByEmail(email) {
  const result = await pool.query(
    `SELECT id, email, password_hash, display_name, avatar_url, avatar_tone,
            university, career, reminder_enabled, reminder_time,
            reminder_frequency, reminder_channel, risk_alert_dismissed_until, created_at
     FROM app_users
     WHERE email = $1`,
    [email],
  )

  if (result.rowCount === 0) return null
  return toUser(result.rows[0])
}

export async function findUserById(id) {
  const result = await pool.query(
    `SELECT id, email, password_hash, display_name, avatar_url, avatar_tone,
            university, career, reminder_enabled, reminder_time,
            reminder_frequency, reminder_channel, risk_alert_dismissed_until, created_at
     FROM app_users
     WHERE id = $1`,
    [id],
  )

  if (result.rowCount === 0) return null
  return toUser(result.rows[0])
}

export async function createUser({
  email,
  passwordHash,
  displayName,
  avatarUrl = null,
  avatarTone = null,
  university = null,
  career = null,
}) {
  const result = await pool.query(
    `INSERT INTO app_users (email, password_hash, display_name, avatar_url, avatar_tone, university, career)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, password_hash, display_name, avatar_url, avatar_tone,
               university, career, reminder_enabled, reminder_time,
               reminder_frequency, reminder_channel, risk_alert_dismissed_until, created_at`,
    [email, passwordHash, displayName, avatarUrl, avatarTone, university, career],
  )

  return toUser(result.rows[0])
}

export async function updateUser(id, fields) {
  const setClauses = []
  const params = []
  let index = 1

  const fieldMap = {
    displayName: 'display_name',
    avatarUrl: 'avatar_url',
    avatarTone: 'avatar_tone',
    university: 'university',
    career: 'career',
    reminderEnabled: 'reminder_enabled',
    reminderTime: 'reminder_time',
    reminderFrequency: 'reminder_frequency',
    reminderChannel: 'reminder_channel',
    riskAlertDismissedUntil: 'risk_alert_dismissed_until',
  }

  for (const [key, column] of Object.entries(fieldMap)) {
    if (fields[key] !== undefined) {
      setClauses.push(`${column} = $${index++}`)
      params.push(fields[key])
    }
  }

  if (setClauses.length === 0) return null

  params.push(id)

  const result = await pool.query(
    `UPDATE app_users
     SET ${setClauses.join(', ')}
     WHERE id = $${index}
     RETURNING id, email, password_hash, display_name, avatar_url, avatar_tone,
               university, career, reminder_enabled, reminder_time,
               reminder_frequency, reminder_channel, risk_alert_dismissed_until, created_at`,
    params,
  )

  if (result.rowCount === 0) return null
  return toUser(result.rows[0])
}

export async function savePasswordResetToken(userId, token, expiresAt) {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt],
  )
}

export async function findPasswordResetToken(token) {
  const result = await pool.query(
    `SELECT prt.id, prt.user_id, prt.token, prt.expires_at, prt.used,
            u.email, u.display_name
     FROM password_reset_tokens prt
     JOIN app_users u ON u.id = prt.user_id
     WHERE prt.token = $1 AND prt.used = false AND prt.expires_at > now()`,
    [token],
  )

  if (result.rowCount === 0) return null
  return result.rows[0]
}

export async function markResetTokenUsed(token) {
  await pool.query(
    `UPDATE password_reset_tokens SET used = true WHERE token = $1`,
    [token],
  )
}

export async function updatePassword(userId, passwordHash) {
  await pool.query(
    `UPDATE app_users SET password_hash = $1 WHERE id = $2`,
    [passwordHash, userId],
  )
}
