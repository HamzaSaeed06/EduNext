const crypto = require('crypto')
const User = require('../models/User')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../services/tokenService')
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../services/emailService')
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
  sendWelcomeEmail(user)

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

// GET /api/v1/auth/google
const google = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || 'fake_client_id'
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback'
  const scope = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`
  res.redirect(authUrl)
})

// GET /api/v1/auth/google/callback
const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query
  if (!code) {
    throw new AppError('Authorization code is missing', 400, 'VALIDATION_ERROR')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || 'fake_client_id'
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'fake_client_secret'
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/v1/auth/google/callback'

  // Mock response setup for test environment or when API keys are not provided
  if (process.env.NODE_ENV === 'test' || (!process.env.GOOGLE_CLIENT_ID && code === 'mock_google_code')) {
    const mockEmail = req.query.mock_email || 'google_student@test.com'
    const mockName = req.query.mock_name || 'Google Student'
    const mockSub = req.query.mock_sub || 'google_sub_12345'
    
    let user = await User.findOne({ email: mockEmail })
    if (user) {
      if (!user.googleId) {
        user.googleId = mockSub
        user.authProvider = 'google'
        await user.save({ validateBeforeSave: false })
      }
    } else {
      user = await User.create({
        name: mockName,
        email: mockEmail,
        googleId: mockSub,
        authProvider: 'google',
        isEmailVerified: true,
      })
      sendWelcomeEmail(user)
    }

    if (user.isBanned) {
      return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5000'}/login?error=ACCOUNT_BANNED`)
    }

    const accessToken = await issueTokens(user, res)
    const clientRedirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5000'}/login?token=${accessToken}`
    return res.redirect(clientRedirectUrl)
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text()
      throw new Error(`Google token exchange failed: ${errorText}`)
    }

    const tokenData = await tokenRes.json()
    const { access_token } = tokenData

    // Get user profile
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!userinfoRes.ok) {
      throw new Error('Google userinfo request failed')
    }

    const profile = await userinfoRes.json()
    const { sub: googleId, email, name, picture: avatar, email_verified } = profile

    if (!email_verified) {
      throw new AppError('Google email is not verified', 400, 'UNVERIFIED_EMAIL')
    }

    let user = await User.findOne({ email })
    if (user) {
      if (!user.googleId) {
        user.googleId = googleId
        user.authProvider = 'google'
        await user.save({ validateBeforeSave: false })
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        authProvider: 'google',
        avatar,
        isEmailVerified: true,
      })
      sendWelcomeEmail(user)
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5000'}/login?error=ACCOUNT_BANNED`)
    }

    const accessToken = await issueTokens(user, res)
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5000'}/login?token=${accessToken}`)
  } catch (err) {
    res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5000'}/login?error=oauth_failed`)
  }
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
  google,
  googleCallback,
}
