import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import {
  getCurrentProfile,
  updateProfile,
  updateReminders,
  dismissRiskAlert,
} from '../controllers/profileController.js'

const router = Router()

router.use(authenticate)

router.get('/me', getCurrentProfile)
router.put('/me', updateProfile)
router.put('/me/reminders', updateReminders)
router.put('/me/dismiss-alert', dismissRiskAlert)

export default router
