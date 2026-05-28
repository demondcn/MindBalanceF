function toDateString(value) {
  if (!value) return value
  const d = value instanceof Date ? value : new Date(value)
  return d.toISOString().slice(0, 10)
}

export function toHabitLog(row) {
  return {
    id: row.id,
    habitId: row.habit_id,
    userId: row.user_id,
    date: toDateString(row.date),
    completed: row.status,
  }
}
