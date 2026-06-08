import { Router } from 'express'
import authRoutes from './authRoutes.js'
import databaseHealthRoutes from './databaseHealthRoutes.js'
import dashboardRoutes from './dashboardRoutes.js'
import emotionLogRoutes from './emotionLogRoutes.js'
import habitRoutes from './habitRoutes.js'
import habitLogRoutes from './habitLogRoutes.js'
import healthRoutes from './healthRoutes.js'
import profileRoutes from './profileRoutes.js'
import recommendationRoutes from './recommendationRoutes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/db', databaseHealthRoutes)
router.use('/health', healthRoutes)
router.use('/profile', profileRoutes)
router.use('/emotion-logs', emotionLogRoutes)
router.use('/habits', habitRoutes)
router.use('/habit-logs', habitLogRoutes)
router.use('/recommendations', recommendationRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
