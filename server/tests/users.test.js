/**
 * Admin user management routes test suite.
 * Mocks all Mongoose models — no real MongoDB required.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'
process.env.JWT_ACCESS_EXPIRES = '15m'
process.env.JWT_REFRESH_EXPIRES = '7d'

const request = require('supertest')

jest.mock('../src/models/User')
jest.mock('../src/models/Course')
jest.mock('../src/models/Enrollment')

const User = require('../src/models/User')
const Course = require('../src/models/Course')
const Enrollment = require('../src/models/Enrollment')

const jwt = require('jsonwebtoken')
const makeToken = (role = 'admin', id = 'admin_001') =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })

const mockUser = (overrides = {}) => ({
  _id: 'admin_001',
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin',
  isBanned: false,
  isDeleted: false,
  isEmailVerified: true,
  lastActive: new Date(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
})

const chainable = (value) => {
  const p = Promise.resolve(value)
  p.select = jest.fn().mockResolvedValue(value)
  return p
}

const app = require('../src/app')

beforeEach(() => {
  jest.clearAllMocks()
  User.findById = jest.fn().mockReturnValue(chainable(mockUser()))
})

afterAll(() => jest.clearAllMocks())

describe('GET /api/v1/admin/users', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/admin/users')
    expect(res.status).toBe(401)
  })

  it('returns 403 when student tries to access', async () => {
    User.findById = jest.fn().mockReturnValue(chainable(mockUser({ role: 'student' })))
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${makeToken('student')}`)
    expect(res.status).toBe(403)
  })

  it('returns 200 with user list for admin', async () => {
    const users = [
      mockUser(),
      mockUser({ _id: 'user_002', name: 'Student', role: 'student', email: 's@test.com' }),
    ]
    User.find = jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockResolvedValue(users),
    })
    User.countDocuments = jest.fn().mockResolvedValue(2)

    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data.users)).toBe(true)
    expect(res.body.data.pagination.total).toBe(2)
  })
})

describe('PATCH /api/v1/admin/users/:id/ban', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).patch('/api/v1/admin/users/user_001/ban')
    expect(res.status).toBe(401)
  })

  it('toggles ban status for a student', async () => {
    const adminUser = mockUser()
    const targetUser = mockUser({
      _id: 'student_001',
      role: 'student',
      email: 'student@test.com',
      isBanned: false,
    })
    // findById: first call is auth middleware (admin), second is the target user
    User.findById = jest.fn()
      .mockReturnValueOnce(chainable(adminUser))
    User.findOne = jest.fn().mockResolvedValue(targetUser)

    const res = await request(app)
      .patch('/api/v1/admin/users/student_001/ban')
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('isBanned')
    expect(targetUser.save).toHaveBeenCalled()
  })

  it('returns 403 when trying to ban another admin', async () => {
    const adminUser = mockUser()
    const otherAdmin = mockUser({ _id: 'admin_002', email: 'admin2@test.com' })
    User.findById = jest.fn().mockReturnValue(chainable(adminUser))
    User.findOne = jest.fn().mockResolvedValue(otherAdmin)

    const res = await request(app)
      .patch('/api/v1/admin/users/admin_002/ban')
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(403)
  })
})

describe('PATCH /api/v1/admin/users/:id/role', () => {
  it('returns 400 with invalid role', async () => {
    const adminUser = mockUser()
    User.findById = jest.fn().mockReturnValue(chainable(adminUser))

    const res = await request(app)
      .patch('/api/v1/admin/users/user_001/role')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ role: 'superuser' })

    expect(res.status).toBe(400)
  })

  it('changes role from student to instructor', async () => {
    const adminUser = mockUser()
    const targetUser = mockUser({
      _id: 'student_001',
      role: 'student',
      email: 'student@test.com',
      save: jest.fn().mockResolvedValue(true),
    })
    User.findById = jest.fn().mockReturnValue(chainable(adminUser))
    User.findOne = jest.fn().mockResolvedValue(targetUser)

    const res = await request(app)
      .patch('/api/v1/admin/users/student_001/role')
      .set('Authorization', `Bearer ${makeToken('admin')}`)
      .send({ role: 'instructor' })

    expect(res.status).toBe(200)
    expect(res.body.data.role).toBe('instructor')
    expect(targetUser.save).toHaveBeenCalled()
  })
})

describe('GET /api/v1/admin/stats', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/admin/stats')
    expect(res.status).toBe(401)
  })

  it('returns platform stats for admin', async () => {
    User.findById = jest.fn().mockReturnValue(chainable(mockUser()))
    User.countDocuments = jest.fn().mockResolvedValue(42)
    Course.countDocuments = jest.fn()
      .mockResolvedValueOnce(10) // total courses
      .mockResolvedValueOnce(2)  // pending review
    Enrollment.countDocuments = jest.fn().mockResolvedValue(150)

    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${makeToken('admin')}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      totalUsers: 42,
      totalCourses: 10,
      pendingReview: 2,
      totalEnrollments: 150,
    })
  })
})
