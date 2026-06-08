export function toRecommendation(row) {
  return {
    id: row.id,
    score: row.emotion_level,
    title: row.title,
    description: row.content,
    action: row.action ?? '',
    category: row.category,
  }
}
