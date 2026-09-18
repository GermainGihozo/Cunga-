import express from 'express'
import {
  getBranches, getBranch, createBranch, updateBranch,
  deleteBranch, getBranchStats,
} from '../controllers/branchController.js'
import { authenticate, authorize } from '../middlewares/auth.js'

const router = express.Router()

router.use(authenticate)

// Admin only — manage branches
router.get('/',          authorize('admin'), getBranches)
router.post('/',         authorize('admin'), createBranch)
router.put('/:id',       authorize('admin'), updateBranch)
router.delete('/:id',    authorize('admin'), deleteBranch)

// Admin + branch staff can read
router.get('/:id',       getBranch)
router.get('/:id/stats', getBranchStats)

export default router
