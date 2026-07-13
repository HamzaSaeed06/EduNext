const Quiz = require('../models/Quiz')
const Lecture = require('../models/Lecture')
const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')

// ── Instructor: Quiz CRUD ─────────────────────────────────────────

// POST /api/v1/lectures/:lectureId/quiz
const createQuiz = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findOne({ _id: req.params.lectureId, isDeleted: false })
    .populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')
  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const quiz = await Quiz.create({
    title: req.body.title,
    lecture: lecture._id,
    course: lecture.section.course._id,
    questions: req.body.questions || [],
    passingScore: req.body.passingScore ?? 70,
    timeLimit: req.body.timeLimit ?? null,
  })

  res.status(201).json({ success: true, data: { quiz }, message: 'Quiz created' })
})

// GET /api/v1/quizzes/:id  — instructor or enrolled student
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false })
  if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND')

  // Students get the quiz without correct answer flags
  if (req.user.role === 'student') {
    const safeQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((o) => ({ _id: o._id, text: o.text })),
      })),
    }
    return res.json({ success: true, data: { quiz: safeQuiz }, message: '' })
  }

  res.json({ success: true, data: { quiz }, message: '' })
})

// PATCH /api/v1/quizzes/:id
const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false })
    .populate({ path: 'lecture', populate: { path: 'section', populate: 'course' } })
  if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND')
  if (String(quiz.lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const allowed = ['title', 'questions', 'passingScore', 'timeLimit', 'isPublished']
  allowed.forEach((k) => { if (req.body[k] !== undefined) quiz[k] = req.body[k] })
  await quiz.save()
  res.json({ success: true, data: { quiz }, message: 'Quiz updated' })
})

// DELETE /api/v1/quizzes/:id
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false })
    .populate({ path: 'lecture', populate: { path: 'section', populate: 'course' } })
  if (!quiz) throw new AppError('Quiz not found', 404, 'NOT_FOUND')
  if (String(quiz.lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  quiz.isDeleted = true
  await quiz.save()
  res.json({ success: true, data: null, message: 'Quiz deleted' })
})

// ── Student: Quiz Submission ──────────────────────────────────────

// POST /api/v1/quizzes/:id/submit
const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, isDeleted: false, isPublished: true })
  if (!quiz) throw new AppError('Quiz not found or not published', 404, 'NOT_FOUND')

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: quiz.course })
  if (!enrollment) throw new AppError('You are not enrolled in this course', 403, 'FORBIDDEN')

  const { answers = [] } = req.body // [{ questionId, selectedOptionId }]

  let earned = 0
  const feedback = quiz.questions.map((q) => {
    const answer = answers.find((a) => String(a.questionId) === String(q._id))
    const selectedOption = q.options.find((o) => String(o._id) === String(answer?.selectedOptionId))
    const correct = selectedOption?.isCorrect ?? false
    if (correct) earned++
    return {
      questionId: q._id,
      correct,
      explanation: q.explanation,
      correctOptionId: q.options.find((o) => o.isCorrect)?._id,
    }
  })

  const totalQuestions = quiz.questions.length
  const score = totalQuestions > 0 ? Math.round((earned / totalQuestions) * 100) : 0
  const passed = score >= quiz.passingScore

  res.json({
    success: true,
    data: { score, passed, earned, totalQuestions, passingScore: quiz.passingScore, feedback },
    message: passed ? 'Congratulations! You passed.' : `You scored ${score}%. Keep practicing!`,
  })
})

module.exports = { createQuiz, getQuiz, updateQuiz, deleteQuiz, submitQuiz }
