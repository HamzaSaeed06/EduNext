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

  // Record quiz attempt in enrollment
  const existingAttempt = enrollment.passedQuizzes?.find(
    (pq) => String(pq.quiz) === String(quiz._id),
  )
  if (existingAttempt) {
    existingAttempt.score = score
    existingAttempt.passed = existingAttempt.passed || passed
    existingAttempt.attemptedAt = new Date()
  } else {
    if (!enrollment.passedQuizzes) enrollment.passedQuizzes = []
    enrollment.passedQuizzes.push({ quiz: quiz._id, score, passed, attemptedAt: new Date() })
  }

  // If passed, mark the quiz lecture as completed and recalculate progress
  if (passed && quiz.lecture) {
    const lp = enrollment.completedLectures?.find(
      (l) => String(l.lecture) === String(quiz.lecture),
    )
    if (lp) {
      lp.completed = true
      lp.completedAt = new Date()
    } else {
      if (!enrollment.completedLectures) enrollment.completedLectures = []
      enrollment.completedLectures.push({
        lecture: quiz.lecture,
        completed: true,
        completedAt: new Date(),
        watchedSeconds: 0,
        lastPosition: 0,
      })
    }

    // Recalculate overall progress — same denominator (all lecture types,
    // including quizzes) as enrollmentController.updateProgress, and clamped
    // to 100 so the two endpoints can never disagree on completion.
    const Lecture = require('../models/Lecture')
    const totalLectures = await Lecture.countDocuments({ course: quiz.course, isDeleted: false })
    const completedCount = enrollment.completedLectures.filter((l) => l.completed).length
    enrollment.progress = totalLectures > 0 ? Math.min(100, Math.round((completedCount / totalLectures) * 100)) : 0
    enrollment.isCompleted = enrollment.progress >= 100
    if (enrollment.isCompleted && !enrollment.completedAt) enrollment.completedAt = new Date()
  }

  await enrollment.save()

  res.json({
    success: true,
    data: {
      score, passed, earned, totalQuestions,
      passingScore: quiz.passingScore, feedback,
      progress: enrollment.progress,
    },
    message: passed ? 'Congratulations! You passed.' : `You scored ${score}%. Keep practicing!`,
  })
})

// GET /api/v1/lectures/:lectureId/quiz  — enrolled student or instructor
const getLectureQuiz = asyncHandler(async (req, res) => {
  const lecture = await require('../models/Lecture')
    .findOne({ _id: req.params.lectureId, isDeleted: false })
    .populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')

  const isInstructor = String(lecture.section.course.instructor) === String(req.user._id)
  const isAdmin = req.user.role === 'admin'

  if (!isInstructor && !isAdmin) {
    const enroll = await require('../models/Enrollment').findOne({
      student: req.user._id,
      course: lecture.section.course._id,
    })
    if (!enroll) throw new AppError('Not enrolled', 403, 'FORBIDDEN')
  }

  const quiz = await Quiz.findOne({ lecture: lecture._id, isDeleted: false })
  if (!quiz) return res.json({ success: true, data: { quiz: null }, message: '' })

  // Students don't see correct-answer flags
  if (req.user.role === 'student') {
    const safeQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((o) => ({ _id: o._id, text: o.text })),
        explanation: '',
      })),
    }
    return res.json({ success: true, data: { quiz: safeQuiz }, message: '' })
  }

  res.json({ success: true, data: { quiz }, message: '' })
})

module.exports = { createQuiz, getQuiz, updateQuiz, deleteQuiz, submitQuiz, getLectureQuiz }
