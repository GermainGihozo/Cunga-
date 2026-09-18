import express from 'express'
import * as productController from '../controllers/productController.js'
import { authenticate } from '../middlewares/auth.js'
import { validate } from '../middlewares/validate.js'
import { uploadProduct } from '../middlewares/upload.js'
import * as productValidator from '../validators/productValidator.js'

const router = express.Router()

router.get('/',               authenticate, productValidator.getProducts,    validate, productController.getProducts)
router.get('/categories/list',authenticate, productController.getCategories)
router.get('/:id',            authenticate, productController.getProductById)

router.post('/',              authenticate, uploadProduct, productValidator.createProduct, validate, productController.createProduct)
router.post('/categories',    authenticate, productValidator.createCategory, validate, productController.createCategory)

router.put('/:id',            authenticate, uploadProduct, productValidator.updateProduct, validate, productController.updateProduct)

router.delete('/:id',         authenticate, productController.deleteProduct)

router.patch('/:id/stock',    authenticate, productValidator.updateStock, validate, productController.updateStock)

export default router
