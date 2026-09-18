import express from 'express'
import {
  getUsers, getUser, createUser, updateUser,
  deleteUser, toggleUserStatus, resetUserPassword,
} from '../controllers/userController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = express.Router()

// All user routes require authentication + admin role
router.use(authenticate, authorize('admin'))

router.get('/',                      getUsers)
router.get('/:id',                   getUser)
router.post('/',                     createUser)
router.put('/:id',                   updateUser)
router.delete('/:id',                deleteUser)
router.patch('/:id/toggle',          toggleUserStatus)
router.patch('/:id/reset-password',  resetUserPassword)

export default router
