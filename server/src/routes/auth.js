const express = require('express')
const router = express.Router()
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController')
const { protect } = require('../middlewares/auth')
const { authLimiter } = require('../middlewares/rateLimiter')
const validate = require('../middlewares/validate')
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/authValidators')

router.post('/register', authLimiter, registerValidator, validate, register)
router.post('/login', authLimiter, loginValidator, validate, login)
router.post('/logout', logout)
router.post('/refresh-token', refreshToken)
router.get('/me', protect, getMe)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, forgotPassword)
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, resetPassword)

module.exports = router
