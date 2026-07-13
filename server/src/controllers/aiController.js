const { AppError, asyncHandler } = require('../middlewares/errorHandler')
const { generateCourseSummary, generateQuizQuestions, generateRecommendations } = require('../services/aiService')
const Course = require('../models/Course')
const Lecture = require('../models/Lecture')
const Quiz = require('../models/Quiz')
const Enrollment = require('../models/Enrollment')

// POST /api/v1/ai/courses/:id/summarize  — instructor/admin
const summarizeCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const summary = await generateCourseSummary(course)
  course.aiSummary = summary
  await course.save({ validateBeforeSave: false })

  res.json({ success: true, data: { summary }, message: 'Summary generated' })
})

// POST /api/v1/ai/lectures/:id/generate-quiz  — instructor/admin
const generateQuiz = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findOne({ _id: req.params.id, isDeleted: false })
    .populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')
  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const { count = 5, contentHint = '' } = req.body
  const questions = await generateQuizQuestions(lecture.title, contentHint, Math.min(Number(count), 20))

  const quiz = await Quiz.create({
    title: `${lecture.title} — Quiz`,
    lecture: lecture._id,
    course: lecture.section.course._id,
    questions,
    aiGenerated: true,
    isPublished: false,
  })

  res.status(201).json({ success: true, data: { quiz }, message: `Quiz created with ${questions.length} questions` })
})

// GET /api/v1/ai/recommendations  — student
const getRecommendations = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course', 'title category')

  const completedCourses = enrollments.filter((e) => e.isCompleted).map((e) => e.course?.title || '')
  const enrolledCategories = [...new Set(enrollments.map((e) => e.course?.category || '').filter(Boolean))]

  const recommendations = await generateRecommendations(completedCourses, enrolledCategories)

  // Fetch matching courses from the DB
  const courses = await Course.find({
    status: 'published',
    isDeleted: false,
    category: { $in: recommendations.topics },
    _id: { $nin: enrollments.map((e) => e.course?._id).filter(Boolean) },
  })
    .sort({ enrollmentCount: -1 })
    .limit(6)
    .populate('instructor', 'name avatar')
    .select('-aiSummary')

  res.json({
    success: true,
    data: { recommendations, courses },
    message: '',
  })
})

module.exports = { summarizeCourse, generateQuiz, getRecommendations }
