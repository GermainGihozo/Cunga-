import jwt from 'jsonwebtoken'

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info to request — include tenantId for multi-tenant scoping
    req.user = {
      id:       decoded.id,
      username: decoded.username,
      role:     decoded.role,
      branchId: decoded.branchId,
      tenantId: decoded.tenantId,   // added: controllers need this for row-level isolation
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      })
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    })
  }
}

/**
 * Authorization middleware - checks user role
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please login.',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to access this resource.',
      })
    }

    next()
  }
}

/**
 * Branch access middleware - ensures user can only access their branch data
 */
export const checkBranchAccess = (req, res, next) => {
  const requestedBranchId = parseInt(req.params.branchId || req.body.branchId || req.query.branchId)
  
  // Admin can access all branches
  if (req.user.role === 'admin') {
    return next()
  }

  // Branch users can only access their own branch
  if (req.user.role === 'branch' && req.user.branchId !== requestedBranchId) {
    return res.status(403).json({
      success: false,
      message: 'You can only access data from your own branch.',
    })
  }

  next()
}

export default { authenticate, authorize, checkBranchAccess }
