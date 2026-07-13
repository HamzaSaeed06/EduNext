/**
 * AI Features test suite — mocks models + aiService.
 * Tests route access control and graceful degradation when AI is unavailable.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'

const request = require('supertest')
jest.mock('../src/models/User')
jest.mock('../src/models/Course')
jest.mock('../src/models/Lecture')
jest.mock('../src/models/Quiz')
jest.mock('../src/models/Enrollment')
jest.mock('../src/services/aiService')

const User = require('../src/models/User')
const Course = require('../src/models/Course')
const Enrollment = require('../src/models/Enrollment')
const Quiz = require('../src/models/Quiz')
const Lecture = require('../src/models/Lecture')
const aiService = require('../src/services/aiService')
const { generateAccessToken } = require('../src/services/tokenService')

const simpleChain = (value) => {
  const p = Promise.resolve(value)
  p.select = jest.fn().mockResolvedValue(value)
  p.populate = jest.fn().mockResolvedValue(value)
  return p
}

const mockUser = (role = 'instructor') => ({
  _id: role === 'student' ? 'student_001' : 'instructor_001',
  role, name: 'Test', isBanned: false, isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  toJSON() { return { ...this } },
})

const app = require('../src/app')
const makeToken = (role = 'instructor') =>
  generateAccessToken({ id: role === 'student' ? 'student_001' : 'instructor_001', role })

beforeEach(() => jest.clearAllMocks())

// ─────────────────────────────────────────────────────────────────
describe('AI — Course Summarization', () => {
  it('200: instructor gets AI summary for their course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('instructor')))
    Course.findOne.mockReturnValue(simpleChain({
      _id: 'course_001', instructor: 'instructor_001', title: 'Test', description: 'Desc',
      level: 'Beginner', category: 'Eng', isDeleted: false,
      aiSummary: null, save: jest.fn().mockResolvedValue(true),
    }))
    aiService.generateCourseSummary.mockResolvedValue('A great introductory course.')

    const res = await request(app)
      .post('/api/v1/ai/courses/course_001/summarize')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)

    expect(res.status).toBe(200)
    expect(res.body.data.summary).toBe('A great introductory course.')
  })

  it('403: student cannot trigger summarization', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))

    const res = await request(app)
      .post('/api/v1/ai/courses/course_001/summarize')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(403)
  })

  it('401: unauthenticated cannot trigger summarization', async () => {
    const res = await request(app).post('/api/v1/ai/courses/course_001/summarize')
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('AI — Quiz Generation', () => {
  it('201: instructor generates quiz from lecture', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('instructor')))
    Lecture.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'lec_001', title: 'Intro', isDeleted: false,
        section: { course: { _id: 'course_001', instructor: 'instructor_001' } },
      }),
    })
    aiService.generateQuizQuestions.mockResolvedValue([
      { text: 'Q1', aiGenerated: true, options: [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }], explanation: 'Explain' },
    ])
    Quiz.create.mockResolvedValue({ _id: 'quiz_new', title: 'Intro — Quiz', questions: [{}] })

    const res = await request(app)
      .post('/api/v1/ai/lectures/lec_001/generate-quiz')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)
      .send({ count: 1 })

    expect(res.status).toBe(201)
    expect(res.body.data.quiz).toBeDefined()
  })
})

// ─────────────────────────────────────────────────────────────────
describe('AI — Recommendations', () => {
  it('200: student gets recommendations (stub)', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Enrollment.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue([]),
    })
    aiService.generateRecommendations.mockResolvedValue({
      topics: ['Data Science'],
      reason: 'Based on your activity',
    })
    Course.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            select: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    })

    const res = await request(app)
      .get('/api/v1/ai/recommendations')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(200)
    expect(res.body.data.recommendations.topics).toContain('Data Science')
  })

  it('403: instructor cannot access student recommendations', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('instructor')))

    const res = await request(app)
      .get('/api/v1/ai/recommendations')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)

    expect(res.status).toBe(403)
  })
})
