const { verifyAccessToken } = require('../services/tokenService')
const { AppError } = require('./errorHandler')
const User = require('../models/User')

/**
 * Verifies the Bearer access token in the Authorization header.
 * Attaches the decoded user to req.user.
 */
const protect = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401, 'UNAUTHENTICATED'))
  }
  const token = header.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (!user || user.isDeleted) {
      return next(new AppError('User not found', 401, 'UNAUTHENTICATED'))
    }
    if (user.isBanned) {
      return next(new AppError('Your account has been suspended', 403, 'ACCOUNT_BANNED'))
    }
    req.user = user
    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Restrict route to specific roles.
 * Usage: restrict('admin') or restrict('admin', 'instructor')
 */
const restrict = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Authentication required', 401, 'UNAUTHENTICATED'))
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403, 'FORBIDDEN'))
  }
  next()
}

/**
 * Optional auth — attaches user if token present but doesn't reject if absent.
 */
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return next()
  const token = header.split(' ')[1]
  try {
    const decoded = verifyAccessToken(token)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (user && !user.isDeleted && !user.isBanned) req.user = user
  } catch {
    // silently ignore invalid/expired token
  }
  next()
}

module.exports = { protect, restrict, optionalAuth }
