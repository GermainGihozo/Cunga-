import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure upload directories exist
const uploadDirs = ['products', 'reports', 'receipts']
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '../../uploads', dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
})

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.uploadType || 'products' // Default to products
    const uploadPath = path.join(__dirname, '../../uploads', uploadType)
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
})

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_IMAGE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false)
  }
}

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  }
})

// Upload middleware for different types
export const uploadProduct = (req, res, next) => {
  req.uploadType = 'products'
  upload.single('image')(req, res, next)
}

export const uploadReport = (req, res, next) => {
  req.uploadType = 'reports'
  upload.single('image')(req, res, next)
}

export const uploadReceipt = (req, res, next) => {
  req.uploadType = 'receipts'
  upload.single('receipt')(req, res, next)
}

export default { uploadProduct, uploadReport, uploadReceipt }
