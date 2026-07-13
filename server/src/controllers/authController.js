const crypto = require('crypto')
const User = require('../models/User')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/tokenService')
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

const CLEAR_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
}

const issueTokens = async (user, res) => {
  const accessToken = generateAccessToken({ id: user._id, role: user.role })
  const refreshToken = generateRefreshToken({ id: user._id })
  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS)
  return accessToken
}

// POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'student' } = req.body

  const existing = await User.findOne({ email })
  if (existing) throw new AppError('An account with this email already exists', 409, 'DUPLICATE_EMAIL')

  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  const user = await User.create({
    name,
    email,
    password,
    role,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
  })

  await sendVerificationEmail(email, verificationToken)

  const accessToken = await issueTokens(user, res)

  res.status(201).json({
    success: true,
    data: { user, accessToken },
    message: 'Account created. Please check your email to verify your account.',
  })
})

// POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email, isDeleted: false }).select('+password')
  if (!user || !user.password) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

  const isMatch = await user.comparePassword(password)
  if (!isMatch) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')

  if (user.isBanned) throw new AppError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_BANNED')

  user.lastActive = new Date()
  const accessToken = await issueTokens(user, res)

  res.json({
    success: true,
    data: { user, accessToken },
    message: 'Logged in successfully',
  })
})

// POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken
  if (token) {
    const user = await User.findOne({ refreshToken: token })
    if (user) {
      user.refreshToken = undefined
      await user.save({ validateBeforeSave: false })
    }
  }
  res.clearCookie('refreshToken', CLEAR_COOKIE_OPTS)
  res.json({ success: true, data: null, message: 'Logged out successfully' })
})

// POST /api/v1/auth/refresh-token
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) throw new AppError('No refresh token', 401, 'UNAUTHENTICATED')

  let decoded
  try {
    decoded = verifyRefreshToken(token)
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'INVALID_TOKEN')
  }

  const user = await User.findById(decoded.id).select('+refreshToken')
  if (!user || user.refreshToken !== token || user.isDeleted) {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN')
  }

  const accessToken = await issueTokens(user, res)
  res.json({ success: true, data: { accessToken }, message: 'Token refreshed' })
})

// GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user }, message: '' })
})

// POST /api/v1/auth/verify-email
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.body
  if (!token) throw new AppError('Verification token is required', 400, 'VALIDATION_ERROR')

  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires')

  if (!user) throw new AppError('Invalid or expired verification link', 400, 'INVALID_TOKEN')

  user.isEmailVerified = true
  user.emailVerificationToken = undefined
  user.emailVerificationExpires = undefined
  await user.save({ validateBeforeSave: false })

  res.json({ success: true, data: null, message: 'Email verified successfully' })
})

// POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body
  const user = await User.findOne({ email, isDeleted: false })

  // Always respond success to prevent email enumeration
  if (user) {
    const resetToken = crypto.randomBytes(32).toString('hex')
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save({ validateBeforeSave: false })
    await sendPasswordResetEmail(email, resetToken)
  }

  res.json({
    success: true,
    data: null,
    message: 'If an account with that email exists, a reset link has been sent.',
  })
})

// POST /api/v1/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires')

  if (!user) throw new AppError('Invalid or expired reset link. Please request a new one.', 400, 'INVALID_TOKEN')

  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined
  user.refreshToken = undefined
  await user.save()

  res.clearCookie('refreshToken', CLEAR_COOKIE_OPTS)
  res.json({ success: true, data: null, message: 'Password reset successfully. Please log in.' })
})

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword,
}
