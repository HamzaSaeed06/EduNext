const rateLimit = require('express-rate-limit')

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many attempts. Please try again in 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please wait a moment before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = { authLimiter, aiLimiter, generalLimiter }
