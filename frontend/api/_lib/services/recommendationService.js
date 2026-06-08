import * as recommendationRepo from '../repositories/recommendationRepository.js'

export async function getRecommendations(emotionLevel) {
  const level = Number(emotionLevel)

  if (!Number.isInteger(level) || level < 1 || level > 5) {
    return { error: 'El nivel emocional debe ser un entero entre 1 y 5.' }
  }

  const recommendations = await recommendationRepo.findRecommendationsByEmotionLevel(level)
  return { recommendations }
}

export async function getAllRecommendations() {
  const recommendations = await recommendationRepo.findAllRecommendations()
  return { recommendations }
}
