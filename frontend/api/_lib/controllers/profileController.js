import * as profileService from '../services/profileService.js'

export async function getCurrentProfile(request, response, next) {
  try {
    const result = await profileService.getProfile(request.user.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function updateProfile(request, response, next) {
  try {
    const result = await profileService.updateProfile(request.user.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function updateReminders(request, response, next) {
  try {
    const result = await profileService.updateReminders(request.user.id, request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function dismissRiskAlert(request, response, next) {
  try {
    const result = await profileService.dismissRiskAlert(request.user.id)

    if (result.error) {
      return response.status(404).json({ message: result.error })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}
