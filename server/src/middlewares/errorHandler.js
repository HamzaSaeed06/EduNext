const logger = require('../config/logger')

class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message)
    this.statusCode = statusCode
    this.code = code || 'INTERNAL_ERROR'
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'
  let code = err.code || 'INTERNAL_ERROR'

  if (err.name === 'ValidationError') {
    statusCode = 400
    code = 'VALIDATION_ERROR'
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ')
  }

  if (err.code === 11000) {
    statusCode = 409
    code = 'DUPLICATE_FIELD'
    const field = Object.keys(err.keyValue || {})[0]
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already in use`
  }

  if (err.name === 'CastError') {
    statusCode = 400
    code = 'INVALID_ID'
    message = 'Invalid resource ID'
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    code = 'INVALID_TOKEN'
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    code = 'TOKEN_EXPIRED'
    message = 'Token expired'
  }

  if (statusCode === 500) {
    logger.error(err.message, { stack: err.stack, url: req.originalUrl, method: req.method })
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Something went wrong. Please try again.'
        : message,
    },
  })
}

module.exports = { AppError, asyncHandler, errorHandler }
