import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import {
  listHabitLogs,
  toggleHabitLog,
} from '../controllers/habitLogController.js'

const router = Router()

router.use(authenticate)

router.get('/', listHabitLogs)
router.post('/', toggleHabitLog)

export default router
