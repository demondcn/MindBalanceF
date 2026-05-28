export function toHabit(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    frequency: row.frequency,
    cue: row.cue ?? '',
    color: row.color ?? '#0f766e',
    isArchived: row.is_archived,
    createdAt: row.created_at,
  }
}
