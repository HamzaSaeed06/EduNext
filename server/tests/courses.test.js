/**
 * Course management test suite — mocks all Mongoose models.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'

const request = require('supertest')
jest.mock('../src/models/User')
jest.mock('../src/models/Course')
jest.mock('../src/models/Section')
jest.mock('../src/models/Lecture')
jest.mock('../src/models/Enrollment')

const User = require('../src/models/User')
const Course = require('../src/models/Course')
const Enrollment = require('../src/models/Enrollment')
const { generateAccessToken } = require('../src/services/tokenService')

// ── Mock helpers ──────────────────────────────────────────────────

/**
 * Simple chainable for `Model.findX(...).select(...)` → resolves to value.
 * Used for auth middleware's User.findById().select().
 */
const simpleChain = (value) => {
  const p = Promise.resolve(value)
  p.select = jest.fn().mockResolvedValue(value)
  return p
}

/**
 * Full query chain mock for Course.find().sort().skip().limit().select().populate()
 */
const courseQueryChain = (docs) => ({
  sort: jest.fn().mockReturnValue({
    skip: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(docs),
        }),
      }),
    }),
  }),
})

const mockUserDoc = (role = 'instructor') => ({
  _id: role === 'student' ? 'student_001' : 'instructor_001',
  name: 'Test User',
  email: 'user@test.com',
  role,
  isBanned: false,
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  toJSON() { const { save, toJSON, ...rest } = this; return rest },
})

const mockCourseDoc = (overrides = {}) => ({
  _id: 'course_001',
  title: 'Test Course',
  slug: 'test-course',
  description: 'A test course',
  category: 'Engineering',
  level: 'Beginner',
  status: 'draft',
  instructor: 'instructor_001',
  isDeleted: false,
  enrollmentCount: 0,
  save: jest.fn().mockResolvedValue(true),
  toJSON() { const { save, toJSON, ...rest } = this; return rest },
  ...overrides,
})

const app = require('../src/app')

const makeToken = (role = 'instructor') =>
  generateAccessToken({ id: role === 'student' ? 'student_001' : 'instructor_001', role })

beforeEach(() => jest.clearAllMocks())

// ─────────────────────────────────────────────────────────────────
describe('Courses — Public listing', () => {
  it('200: returns published courses', async () => {
    Course.find.mockReturnValue(courseQueryChain([mockCourseDoc({ status: 'published' })]))
    Course.countDocuments.mockResolvedValue(1)

    const res = await request(app).get('/api/v1/courses')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.courses)).toBe(true)
  })

  it('400: invalid pagination params', async () => {
    const res = await request(app).get('/api/v1/courses?page=abc')
    expect(res.status).toBe(400)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Courses — Instructor CRUD', () => {
  it('201: instructor can create a course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('instructor')))
    Course.create.mockResolvedValue(mockCourseDoc())

    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)
      .send({ title: 'New Course', description: 'Desc', category: 'Eng', level: 'Beginner' })

    expect(res.status).toBe(201)
    expect(res.body.data.course.title).toBe('Test Course')
  })

  it('403: student cannot create a course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('student')))

    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ title: 'New Course', description: 'Desc', category: 'Eng', level: 'Beginner' })

    expect(res.status).toBe(403)
  })

  it('401: unauthenticated cannot create a course', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .send({ title: 'New Course', description: 'Desc', category: 'Eng', level: 'Beginner' })
    expect(res.status).toBe(401)
  })

  it('400: missing required fields (description)', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('instructor')))

    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)
      .send({ title: 'Only Title' })

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('403: instructor cannot edit another instructor\'s course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('instructor')))
    Course.findOne.mockReturnValue(simpleChain(mockCourseDoc({ instructor: 'other_instructor_999' })))

    const res = await request(app)
      .patch('/api/v1/courses/course_001')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)
      .send({ title: 'Updated' })

    expect(res.status).toBe(403)
  })

  it('instructor can soft-delete own course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('instructor')))
    Course.findOne.mockReturnValue(simpleChain(mockCourseDoc()))

    const res = await request(app)
      .delete('/api/v1/courses/course_001')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Courses — Enrollment', () => {
  it('201: student can enroll in a published course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('student')))
    Course.findOne.mockReturnValue(simpleChain(mockCourseDoc({ status: 'published' })))
    Enrollment.findOne.mockResolvedValue(null)
    Enrollment.create.mockResolvedValue({ _id: 'enroll_001', student: 'student_001', course: 'course_001', progress: 0 })

    const res = await request(app)
      .post('/api/v1/courses/test-course/enroll')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('409: student cannot double-enroll', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('student')))
    Course.findOne.mockReturnValue(simpleChain(mockCourseDoc({ status: 'published' })))
    Enrollment.findOne.mockResolvedValue({ _id: 'enroll_001' })

    const res = await request(app)
      .post('/api/v1/courses/test-course/enroll')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(409)
    expect(res.body.error.code).toBe('ALREADY_ENROLLED')
  })

  it('403: instructor cannot use the student enroll route', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('instructor')))

    const res = await request(app)
      .post('/api/v1/courses/test-course/enroll')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)

    expect(res.status).toBe(403)
  })

  it('401: unauthenticated cannot enroll', async () => {
    const res = await request(app).post('/api/v1/courses/test-course/enroll')
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Courses — Role escalation check', () => {
  it('403: student cannot reach admin course review route', async () => {
    User.findById.mockReturnValue(simpleChain(mockUserDoc('student')))

    const res = await request(app)
      .patch('/api/v1/courses/admin/course_001/review')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ action: 'approve' })

    expect(res.status).toBe(403)
  })
})
