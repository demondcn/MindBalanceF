import * as habitLogService from '../services/habitLogService.js'

export async function listHabitLogs(request, response, next) {
  try {
    const date = request.query.date || null
    const logs = await habitLogService.getHabitLogs(request.user.id, date)
    return response.json({ logs })
  } catch (error) {
    return next(error)
  }
}

export async function toggleHabitLog(request, response, next) {
  try {
    const result = await habitLogService.toggleHabitLog(request.user.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}
