import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import {
  listEmotionLogs,
  getEmotionLog,
  getTodayEmotionLog,
  saveEmotionLog,
  deleteEmotionLog,
} from '../controllers/emotionLogController.js'

const router = Router()

router.use(authenticate)

router.get('/', listEmotionLogs)
router.get('/today', getTodayEmotionLog)
router.get('/:id', getEmotionLog)
router.post('/', saveEmotionLog)
router.delete('/:id', deleteEmotionLog)

export default router
