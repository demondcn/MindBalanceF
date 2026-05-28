import { Router } from 'express'
import {
  login,
  register,
  requestPasswordReset,
  confirmPasswordReset,
} from '../controllers/authController.js'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/reset-password', requestPasswordReset)
router.post('/reset-password/confirm', confirmPasswordReset)

export default router
