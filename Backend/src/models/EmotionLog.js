function toDateString(value) {
  if (!value) return value
  const d = value instanceof Date ? value : new Date(value)
  return d.toISOString().slice(0, 10)
}

export function toEmotionLog(row) {
  return {
    id: row.id,
    userId: row.user_id,
    date: toDateString(row.date),
    score: row.emotion_score,
    note: row.notes ?? '',
  }
}
