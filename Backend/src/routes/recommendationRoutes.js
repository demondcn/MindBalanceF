import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import { getRecommendations } from '../controllers/recommendationController.js'

const router = Router()

router.use(authenticate)

router.get('/', getRecommendations)

export default router
