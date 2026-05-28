import {
  loginUser,
  registerUser,
  resetPasswordRequest,
  resetPasswordConfirm,
} from '../services/authService.js'

export async function register(request, response, next) {
  try {
    const result = await registerUser(request.body)

    if (result.error) {
      return response.status(400).json({
        message: result.error,
      })
    }

    return response.status(201).json(result)
  } catch (error) {
    return next(error)
  }
}

export async function login(request, response, next) {
  try {
    const result = await loginUser(request.body)

    if (result.error) {
      return response.status(401).json({
        message: result.error,
      })
    }

    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

export async function requestPasswordReset(request, response, next) {
  try {
    const result = await resetPasswordRequest(request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json({ message: 'Si el correo existe, recibiras un enlace de recuperacion.' })
  } catch (error) {
    return next(error)
  }
}

export async function confirmPasswordReset(request, response, next) {
  try {
    const result = await resetPasswordConfirm(request.body)

    if (result.error) {
      return response.status(400).json({ message: result.error })
    }

    return response.json({ message: 'Contrasena actualizada correctamente.' })
  } catch (error) {
    return next(error)
  }
}
