/**
 * Discussion/Q&A routes test suite.
 * Mocks all Mongoose models — no real MongoDB required.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'
process.env.JWT_ACCESS_EXPIRES = '15m'
process.env.JWT_REFRESH_EXPIRES = '7d'

const request = require('supertest')

jest.mock('../src/models/Discussion')
jest.mock('../src/models/Course')
jest.mock('../src/models/Enrollment')
jest.mock('../src/models/User')

const DiscussionPost = require('../src/models/Discussion')
const Course = require('../src/models/Course')
const Enrollment = require('../src/models/Enrollment')
const User = require('../src/models/User')

// Helper to create a JWT
const jwt = require('jsonwebtoken')
const makeToken = (role = 'student') =>
  jwt.sign(
    { id: 'user_001', role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  )

const mockUser = (overrides = {}) => ({
  _id: 'user_001',
  name: 'Test User',
  email: 'user@test.com',
  role: 'student',
  isBanned: false,
  isDeleted: false,
  isEmailVerified: true,
  lastActive: new Date(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
})

const mockCourse = (overrides = {}) => ({
  _id: 'course_001',
  title: 'Test Course',
  slug: 'test-course',
  instructor: 'instructor_001',
  isDeleted: false,
  ...overrides,
})

const mockPost = (overrides = {}) => ({
  _id: 'post_001',
  course: 'course_001',
  lecture: null,
  author: { _id: 'user_001', name: 'Test User', avatar: null, role: 'student' },
  content: 'This is a test question',
  parentPost: null,
  isInstructorReply: false,
  isDeleted: false,
  createdAt: new Date().toISOString(),
  toObject: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
})

const app = require('../src/app')

beforeEach(() => {
  jest.clearAllMocks()

  const user = mockUser()
  const chainable = (value) => {
    const p = Promise.resolve(value)
    p.select = jest.fn().mockResolvedValue(value)
    return p
  }

  User.findById = jest.fn().mockReturnValue(chainable(user))
})

afterAll(() => jest.clearAllMocks())

describe('GET /api/v1/courses/:courseId/discussions', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/courses/course_001/discussions')
    expect(res.status).toBe(401)
  })

  it('returns 200 with posts array when authenticated', async () => {
    const posts = [mockPost()]
    DiscussionPost.find = jest.fn()
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(posts),
      })
      .mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([]),
      })
    DiscussionPost.countDocuments = jest.fn().mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/courses/course_001/discussions')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.data.posts)).toBe(true)
    expect(res.body.data.total).toBe(1)
  })
})

describe('POST /api/v1/courses/:courseId/discussions', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/v1/courses/course_001/discussions')
      .send({ content: 'test question' })
    expect(res.status).toBe(401)
  })

  it('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/api/v1/courses/course_001/discussions')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({})
    expect(res.status).toBe(400)
  })

  it('returns 201 when enrolled student posts', async () => {
    const course = mockCourse()
    const post = mockPost()

    Course.findOne = jest.fn().mockResolvedValue(course)
    Enrollment.findOne = jest.fn().mockResolvedValue({ _id: 'enroll_001', student: 'user_001', course: 'course_001' })
    DiscussionPost.create = jest.fn().mockResolvedValue({
      ...post,
      populate: jest.fn().mockResolvedValue(post),
    })

    const res = await request(app)
      .post('/api/v1/courses/course_001/discussions')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ content: 'How does this work?' })

    expect(res.status).toBe(201)
    expect(res.body.data.post).toBeDefined()
  })

  it('returns 403 when student is not enrolled', async () => {
    const course = mockCourse()
    Course.findOne = jest.fn().mockResolvedValue(course)
    Enrollment.findOne = jest.fn().mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/courses/course_001/discussions')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ content: 'Question from non-enrolled student' })

    expect(res.status).toBe(403)
  })

  it('returns 201 when instructor posts on their own course', async () => {
    const instructor = mockUser({ _id: 'instructor_001', role: 'instructor' })
    const course = mockCourse({ instructor: 'instructor_001' })
    const post = mockPost({ isInstructorReply: true })

    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(instructor),
    })
    Course.findOne = jest.fn().mockResolvedValue(course)
    DiscussionPost.create = jest.fn().mockResolvedValue({
      ...post,
      populate: jest.fn().mockResolvedValue(post),
    })

    const token = jwt.sign({ id: 'instructor_001', role: 'instructor' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })
    const res = await request(app)
      .post('/api/v1/courses/course_001/discussions')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Instructor reply here' })

    expect(res.status).toBe(201)
  })
})

describe('DELETE /api/v1/discussions/:id', () => {
  it('returns 401 when not authenticated', async () => {
    const res = await request(app).delete('/api/v1/discussions/post_001')
    expect(res.status).toBe(401)
  })

  it('returns 200 when author deletes their own post', async () => {
    const post = mockPost({ author: 'user_001' })
    DiscussionPost.findOne = jest.fn().mockResolvedValue(post)

    const res = await request(app)
      .delete('/api/v1/discussions/post_001')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(200)
    expect(post.save).toHaveBeenCalled()
  })

  it('returns 403 when another user tries to delete', async () => {
    const post = mockPost({ author: 'other_user_999' })
    DiscussionPost.findOne = jest.fn().mockResolvedValue(post)

    const res = await request(app)
      .delete('/api/v1/discussions/post_001')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(403)
  })

  it('returns 404 when post does not exist', async () => {
    DiscussionPost.findOne = jest.fn().mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/discussions/nonexistent')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(404)
  })
})
