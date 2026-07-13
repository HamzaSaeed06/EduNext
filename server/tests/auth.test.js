/**
 * Auth routes test suite.
 * Mocks User model — no real MongoDB required.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'
process.env.JWT_ACCESS_EXPIRES = '15m'
process.env.JWT_REFRESH_EXPIRES = '7d'

const request = require('supertest')

jest.mock('../src/models/User')
const User = require('../src/models/User')

jest.mock('../src/services/emailService', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue({ messageId: 'test-verification-id' }),
  sendPasswordResetEmail: jest.fn().mockResolvedValue({ messageId: 'test-reset-id' }),
  sendWelcomeEmail: jest.fn().mockResolvedValue({ messageId: 'test-welcome-id' }),
}))
const { sendWelcomeEmail } = require('../src/services/emailService')

/**
 * Returns a chainable mock that works both as:
 *   await User.findOne(...)           → value
 *   await User.findOne(...).select()  → value
 *   await User.findById(...).select() → value
 */
const chainable = (value) => {
  const p = Promise.resolve(value)
  p.select = jest.fn().mockResolvedValue(value)
  return p
}

const mockUser = (overrides = {}) => ({
  _id: 'user_001',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'student',
  password: '$2b$12$hashedpasswordvalue', // needs a truthy value
  isBanned: false,
  isDeleted: false,
  isEmailVerified: false,
  refreshToken: null,
  lastActive: new Date(),
  comparePassword: jest.fn().mockResolvedValue(true),
  save: jest.fn().mockResolvedValue(true),
  toJSON() {
    const { password, refreshToken, comparePassword, save, toJSON, ...rest } = this
    return rest
  },
  ...overrides,
})

const app = require('../src/app')

afterAll(() => jest.clearAllMocks())
beforeEach(() => jest.clearAllMocks())

// ─────────────────────────────────────────────────────────────────
describe('Auth — Register', () => {
  it('201: creates account and returns accessToken', async () => {
    User.findOne.mockReturnValue(chainable(null))
    User.create.mockResolvedValue(mockUser())

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test Student', email: 'new@test.com', password: 'Password1' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.password).toBeUndefined()
    expect(sendWelcomeEmail).toHaveBeenCalled()
  })

  it('409: duplicate email', async () => {
    User.findOne.mockReturnValue(chainable(mockUser()))

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'dupe@test.com', password: 'Password1' })

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL')
  })

  it('400: missing name', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'x@x.com', password: 'Password1' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('400: weak password — no uppercase', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'x@x.com', password: 'password1' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('400: weak password — no number', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'x@x.com', password: 'PasswordNoNumber' })
    expect(res.status).toBe(400)
  })

  it('400: invalid email format', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Test', email: 'not-an-email', password: 'Password1' })
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Auth — Login', () => {
  it('200: valid credentials return accessToken + refresh cookie', async () => {
    const u = mockUser()
    u.comparePassword.mockResolvedValue(true)
    User.findOne.mockReturnValue(chainable(u))

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: 'Password1' })

    expect(res.status).toBe(200)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.headers['set-cookie']).toBeDefined()
  })

  it('401: wrong password', async () => {
    const u = mockUser()
    u.comparePassword.mockResolvedValue(false)
    User.findOne.mockReturnValue(chainable(u))

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com', password: 'WrongPass1' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('401: non-existent email', async () => {
    User.findOne.mockReturnValue(chainable(null))

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'Password1' })

    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS')
  })

  it('403: banned account', async () => {
    const u = mockUser({ isBanned: true })
    u.comparePassword.mockResolvedValue(true)
    User.findOne.mockReturnValue(chainable(u))

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'banned@test.com', password: 'Password1' })

    expect(res.status).toBe(403)
    expect(res.body.error.code).toBe('ACCOUNT_BANNED')
  })

  it('400: missing password field', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'student@test.com' })
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Auth — Protected route /me', () => {
  let token = ''

  beforeAll(() => {
    const { generateAccessToken } = require('../src/services/tokenService')
    token = generateAccessToken({ id: 'user_001', role: 'student' })
  })

  it('200: valid token returns user data', async () => {
    User.findById.mockReturnValue(chainable(mockUser()))

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.data.user).toBeDefined()
  })

  it('401: no Authorization header', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
    expect(res.body.error.code).toBe('UNAUTHENTICATED')
  })

  it('401: malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer tampered.jwt.value')
    expect(res.status).toBe(401)
  })

  it('401: deleted user', async () => {
    User.findById.mockReturnValue(chainable(mockUser({ isDeleted: true })))

    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Auth — Forgot / Reset Password', () => {
  it('200: forgot-password always succeeds (anti-enumeration)', async () => {
    User.findOne.mockReturnValue(chainable(null))

    const res = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'anyone@example.com' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })

  it('400: reset-password with invalid token', async () => {
    User.findOne.mockReturnValue(chainable(null)) // no match → 400

    const res = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({ token: 'invalidtoken', password: 'NewPass1' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('INVALID_TOKEN')
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Auth — Logout', () => {
  it('200: clears refresh cookie', async () => {
    User.findOne.mockReturnValue(chainable(null))

    const res = await request(app).post('/api/v1/auth/logout')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Auth — Google OAuth', () => {
  it('GET /api/v1/auth/google: redirects to google consent screen', async () => {
    const res = await request(app).get('/api/v1/auth/google')
    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('accounts.google.com')
  })

  it('GET /api/v1/auth/google/callback: registers and login mock user', async () => {
    User.findOne.mockReturnValue(chainable(null)) // New email
    User.create.mockResolvedValue(mockUser({
      name: 'Google Student',
      email: 'google_student@test.com',
      googleId: 'google_sub_12345',
      authProvider: 'google',
      isEmailVerified: true
    }))

    const res = await request(app)
      .get('/api/v1/auth/google/callback')
      .query({ code: 'mock_google_code' })

    expect(res.status).toBe(302)
    expect(res.headers.location).toContain('token=')
  })

  it('GET /api/v1/auth/google/callback: links existing local account', async () => {
    const existingUser = mockUser({ email: 'google_student@test.com', googleId: null })
    User.findOne.mockReturnValue(chainable(existingUser))

    const res = await request(app)
      .get('/api/v1/auth/google/callback')
      .query({ code: 'mock_google_code' })

    expect(res.status).toBe(302)
    expect(existingUser.save).toHaveBeenCalled()
    expect(existingUser.googleId).toBe('google_sub_12345')
  })

  it('GET /api/v1/auth/google/callback: 400 when code is missing', async () => {
    const res = await request(app).get('/api/v1/auth/google/callback')
    expect(res.status).toBe(400)
  })
})

