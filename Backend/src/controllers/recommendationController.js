import * as recommendationService from '../services/recommendationService.js'

export async function getRecommendations(request, response, next) {
  try {
    const emotionLevel = request.query.emotion || request.query.emotionLevel
    const result = await recommendationService.getRecommendations(emotionLevel)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}
