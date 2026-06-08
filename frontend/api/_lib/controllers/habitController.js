import * as habitService from '../services/habitService.js'

export async function listHabits(request, response, next) {
  try {
    const onlyActive = request.query.active === 'true'
    const habits = await habitService.getHabits(request.user.id, onlyActive)
    return response.json({ habits })
  } catch (error) {
    return next(error)
  }
}

export async function getHabit(request, response, next) {
  try {
    const result = await habitService.getHabitById(request.user.id, request.params.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function createHabit(request, response, next) {
  try {
    const result = await habitService.createHabit(request.user.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export async function updateHabit(request, response, next) {
  try {
    const result = await habitService.updateHabit(request.user.id, request.params.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function deleteHabit(request, response, next) {
  try {
    const result = await habitService.removeHabit(request.user.id, request.params.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}
