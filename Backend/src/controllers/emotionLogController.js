import * as emotionLogService from '../services/emotionLogService.js'

export async function listEmotionLogs(request, response, next) {
  try {
    const days = request.query.days ? Number(request.query.days) : null
    const logs = await emotionLogService.getEmotionLogs(request.user.id, days)
    return response.json({ logs })
  } catch (error) {
    return next(error)
  }
}

export async function getEmotionLog(request, response, next) {
  try {
    const result = await emotionLogService.getEmotionLogById(request.user.id, request.params.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function getTodayEmotionLog(request, response, next) {
  try {
    const result = await emotionLogService.getTodayEmotionLog(request.user.id)
    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function saveEmotionLog(request, response, next) {
  try {
    const result = await emotionLogService.saveEmotionLog(request.user.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export async function deleteEmotionLog(request, response, next) {
  try {
    const result = await emotionLogService.removeEmotionLog(request.user.id, request.params.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}
