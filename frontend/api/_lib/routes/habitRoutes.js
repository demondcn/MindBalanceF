import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.js'
import {
  listHabits,
  getHabit,
  createHabit,
  updateHabit,
  deleteHabit,
} from '../controllers/habitController.js'

const router = Router()

router.use(authenticate)

router.get('/', listHabits)
router.get('/:id', getHabit)
router.post('/', createHabit)
router.put('/:id', updateHabit)
router.delete('/:id', deleteHabit)

export default router
