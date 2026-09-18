import express from 'express'
import * as salesController from '../controllers/salesController.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import * as salesValidator from '../validators/salesValidator.js'

const router = express.Router()

router.get('/',         authenticate, salesValidator.getSales,     validate, salesController.getSales)
router.get('/summary',  authenticate, salesController.getSalesSummary)
router.get('/:id',      authenticate, salesValidator.getSaleById,  validate, salesController.getSaleById)
router.get('/:id/receipt', authenticate, salesValidator.getSaleById, validate, salesController.getReceipt)
router.post('/',        authenticate, salesValidator.createSale,   validate, salesController.createSale)

export default router
