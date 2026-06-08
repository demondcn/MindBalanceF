import jwt from 'jsonwebtoken'
import { authConfig } from '../config/auth.js'

export function createToken(user) {
  if (!authConfig.jwtSecret) {
    throw new Error('JWT_SECRET no esta configurado.')
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
    },
    authConfig.jwtSecret,
    {
      expiresIn: authConfig.jwtExpiresIn,
    },
  )
}

export function verifyToken(token) {
  if (!authConfig.jwtSecret) {
    throw new Error('JWT_SECRET no esta configurado.')
  }

  return jwt.verify(token, authConfig.jwtSecret)
}
