function toDateString(value) {
  if (!value) return value
  const d = value instanceof Date ? value : new Date(value)
  return d.toISOString().slice(0, 10)
}

export function toUser(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    avatarTone: row.avatar_tone,
    university: row.university,
    career: row.career,
    reminderEnabled: row.reminder_enabled,
    reminderTime: row.reminder_time,
    reminderFrequency: row.reminder_frequency,
    reminderChannel: row.reminder_channel,
    riskAlertDismissedUntil: row.risk_alert_dismissed_until ? toDateString(row.risk_alert_dismissed_until) : null,
    createdAt: row.created_at,
  }
}

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    avatarTone: user.avatarTone,
    university: user.university,
    career: user.career,
    reminderEnabled: user.reminderEnabled,
    reminderTime: user.reminderTime,
    reminderFrequency: user.reminderFrequency,
    reminderChannel: user.reminderChannel,
    riskAlertDismissedUntil: user.riskAlertDismissedUntil,
    createdAt: user.createdAt,
  }
}
