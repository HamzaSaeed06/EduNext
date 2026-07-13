/**
 * Quiz + Certificate test suite — mocks all Mongoose models.
 */
process.env.NODE_ENV = 'test'
process.env.JWT_ACCESS_SECRET = 'test_access_secret_32_chars_long!'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_32_chars_long!'

const request = require('supertest')
jest.mock('../src/models/User')
jest.mock('../src/models/Quiz')
jest.mock('../src/models/Lecture')
jest.mock('../src/models/Section')
jest.mock('../src/models/Course')
jest.mock('../src/models/Enrollment')
jest.mock('../src/models/Certificate')

const User = require('../src/models/User')
const Quiz = require('../src/models/Quiz')
const Enrollment = require('../src/models/Enrollment')
const Certificate = require('../src/models/Certificate')
const Course = require('../src/models/Course')
const { generateAccessToken } = require('../src/services/tokenService')

const simpleChain = (value) => {
  const p = Promise.resolve(value)
  p.select = jest.fn().mockResolvedValue(value)
  p.populate = jest.fn().mockResolvedValue(value)
  return p
}

const mockUser = (role = 'student') => ({
  _id: role === 'student' ? 'student_001' : 'instructor_001',
  name: 'Test User',
  role,
  isBanned: false,
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  toJSON() { return { ...this } },
})

const mockQuiz = (overrides = {}) => {
  const q = {
    _id: 'quiz_001',
    title: 'Test Quiz',
    course: 'course_001',
    passingScore: 70,
    isPublished: true,
    isDeleted: false,
    questions: [
      {
        _id: 'q1',
        text: 'What is 2+2?',
        explanation: 'Basic arithmetic',
        options: [
          { _id: 'o1', text: '3', isCorrect: false },
          { _id: 'o2', text: '4', isCorrect: true },
        ],
      },
    ],
    save: jest.fn().mockResolvedValue(true),
    toObject: jest.fn().mockReturnValue({ _id: 'quiz_001', questions: [] }),
    ...overrides,
  }
  return q
}

const app = require('../src/app')
const makeToken = (role = 'student') =>
  generateAccessToken({ id: role === 'student' ? 'student_001' : 'instructor_001', role })

beforeEach(() => jest.clearAllMocks())

// ─────────────────────────────────────────────────────────────────
describe('Quiz — Retrieval', () => {
  it('200: enrolled student can get quiz (without correct answers)', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Quiz.findOne.mockReturnValue(simpleChain(mockQuiz()))

    const res = await request(app)
      .get('/api/v1/quizzes/quiz_001')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    // Correct answers should be stripped from student response
    const options = res.body.data.quiz.questions?.[0]?.options || []
    options.forEach((o) => expect(o.isCorrect).toBeUndefined())
  })

  it('401: unauthenticated cannot access quiz', async () => {
    const res = await request(app).get('/api/v1/quizzes/quiz_001')
    expect(res.status).toBe(401)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Quiz — Submission', () => {
  it('200: student submits correct answer, scores 100%', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Quiz.findOne.mockReturnValue(simpleChain(mockQuiz()))
    Enrollment.findOne.mockResolvedValue({ _id: 'enroll_001', student: 'student_001', course: 'course_001' })

    const res = await request(app)
      .post('/api/v1/quizzes/quiz_001/submit')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ answers: [{ questionId: 'q1', selectedOptionId: 'o2' }] })

    expect(res.status).toBe(200)
    expect(res.body.data.score).toBe(100)
    expect(res.body.data.passed).toBe(true)
  })

  it('200: student submits wrong answer, fails quiz', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Quiz.findOne.mockReturnValue(simpleChain(mockQuiz()))
    Enrollment.findOne.mockResolvedValue({ _id: 'enroll_001', student: 'student_001', course: 'course_001' })

    const res = await request(app)
      .post('/api/v1/quizzes/quiz_001/submit')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ answers: [{ questionId: 'q1', selectedOptionId: 'o1' }] }) // wrong answer

    expect(res.status).toBe(200)
    expect(res.body.data.score).toBe(0)
    expect(res.body.data.passed).toBe(false)
  })

  it('403: non-enrolled student cannot submit', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Quiz.findOne.mockReturnValue(simpleChain(mockQuiz()))
    Enrollment.findOne.mockResolvedValue(null) // not enrolled

    const res = await request(app)
      .post('/api/v1/quizzes/quiz_001/submit')
      .set('Authorization', `Bearer ${makeToken('student')}`)
      .send({ answers: [] })

    expect(res.status).toBe(403)
  })

  it('403: instructor cannot submit a quiz (student-only route)', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('instructor')))

    const res = await request(app)
      .post('/api/v1/quizzes/quiz_001/submit')
      .set('Authorization', `Bearer ${makeToken('instructor')}`)
      .send({ answers: [] })

    expect(res.status).toBe(403)
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Certificate — Verification', () => {
  it('200: valid certificate verifies correctly', async () => {
    Certificate.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({
          certificateId: 'cert-uuid-123',
          studentName: 'Alice',
          courseTitle: 'Test Course',
          instructorName: 'Bob',
          issuedAt: new Date(),
          course: { title: 'Test Course', level: 'Beginner' },
          toJSON() { return this },
        }),
      }),
    })

    const res = await request(app).get('/api/v1/certificates/verify/cert-uuid-123')
    expect(res.status).toBe(200)
    expect(res.body.data.certificate.studentName).toBe('Alice')
  })

  it('404: invalid certificate ID', async () => {
    Certificate.findOne.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      }),
    })

    const res = await request(app).get('/api/v1/certificates/verify/not-a-real-cert')
    expect(res.status).toBe(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})

// ─────────────────────────────────────────────────────────────────
describe('Certificate — Issuance', () => {
  it('400: cannot issue certificate for incomplete course', async () => {
    User.findById.mockReturnValue(simpleChain(mockUser('student')))
    Course.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue({
        _id: 'course_001', title: 'Test Course', instructor: { name: 'Bob' }, isDeleted: false,
      }),
    })
    Enrollment.findOne.mockResolvedValue({ _id: 'enroll_001', isCompleted: false })

    const res = await request(app)
      .post('/api/v1/courses/test-course/certificate')
      .set('Authorization', `Bearer ${makeToken('student')}`)

    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('NOT_COMPLETE')
  })
})
