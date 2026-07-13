const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const Lecture = require('../models/Lecture')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')
const { sendEnrollmentConfirmation } = require('../services/emailService')

// POST /api/v1/courses/:slug/enroll
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, status: 'published', isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const existing = await Enrollment.findOne({ student: req.user._id, course: course._id })
  if (existing) throw new AppError('You are already enrolled in this course', 409, 'ALREADY_ENROLLED')

  const enrollment = await Enrollment.create({ student: req.user._id, course: course._id })
  course.enrollmentCount += 1
  await course.save({ validateBeforeSave: false })

  sendEnrollmentConfirmation(req.user, course)

  res.status(201).json({ success: true, data: { enrollment }, message: 'Enrolled successfully' })
})

// DELETE /api/v1/courses/:slug/enroll  (unenroll)
const unenrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const enrollment = await Enrollment.findOneAndDelete({ student: req.user._id, course: course._id })
  if (!enrollment) throw new AppError('You are not enrolled in this course', 404, 'NOT_ENROLLED')

  course.enrollmentCount = Math.max(0, course.enrollmentCount - 1)
  await course.save({ validateBeforeSave: false })

  res.json({ success: true, data: null, message: 'Unenrolled successfully' })
})

// GET /api/v1/student/enrollments
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .sort({ updatedAt: -1 })
    .populate({
      path: 'course',
      select: 'title slug thumbnail level category instructor enrollmentCount averageRating',
      populate: { path: 'instructor', select: 'name avatar' },
    })
  res.json({ success: true, data: { enrollments }, message: '' })
})

// PATCH /api/v1/enrollments/:id/progress  — update lecture progress
const updateProgress = asyncHandler(async (req, res) => {
  const { lectureId, completed, lastPosition, watchedSeconds } = req.body
  if (!lectureId) throw new AppError('lectureId is required', 400, 'VALIDATION_ERROR')

  const enrollment = await Enrollment.findOne({ _id: req.params.id, student: req.user._id })
  if (!enrollment) throw new AppError('Enrollment not found', 404, 'NOT_FOUND')

  const existing = enrollment.completedLectures.find((l) => String(l.lecture) === String(lectureId))
  if (existing) {
    if (lastPosition !== undefined) existing.lastPosition = lastPosition
    if (watchedSeconds !== undefined) existing.watchedSeconds = watchedSeconds
    if (completed && !existing.completed) { existing.completed = true; existing.completedAt = new Date() }
  } else {
    enrollment.completedLectures.push({
      lecture: lectureId,
      completed: !!completed,
      lastPosition: lastPosition || 0,
      watchedSeconds: watchedSeconds || 0,
      completedAt: completed ? new Date() : null,
    })
  }

  // Recalculate overall progress
  const totalLectures = await Lecture.countDocuments({ course: enrollment.course, isDeleted: false, type: { $ne: 'quiz' } })
  const completedCount = enrollment.completedLectures.filter((l) => l.completed).length
  enrollment.progress = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0

  if (enrollment.progress === 100 && !enrollment.isCompleted) {
    enrollment.isCompleted = true
    enrollment.completedAt = new Date()
  }

  await enrollment.save()
  res.json({ success: true, data: { progress: enrollment.progress, isCompleted: enrollment.isCompleted }, message: '' })
})

module.exports = { enrollCourse, unenrollCourse, getMyEnrollments, updateProgress }
