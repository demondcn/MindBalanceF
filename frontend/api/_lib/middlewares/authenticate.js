import { findUserById } from '../repositories/userRepository.js'
import { verifyToken } from '../services/tokenService.js'

function getBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return null
  }

  return token
}

export async function authenticate(request, response, next) {
  try {
    const token = getBearerToken(request.headers.authorization)

    if (!token) {
      return response.status(401).json({
        message: 'Token de autenticacion requerido.',
      })
    }

    const payload = verifyToken(token)
    const user = await findUserById(payload.sub)

    if (!user) {
      return response.status(401).json({
        message: 'Usuario del token no encontrado.',
      })
    }

    request.user = {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    }

    return next()
  } catch (error) {
    return response.status(401).json({
      message: 'Token invalido o expirado.',
    })
  }
}
