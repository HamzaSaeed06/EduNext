const Course = require('../models/Course')
const Section = require('../models/Section')
const Lecture = require('../models/Lecture')
const Enrollment = require('../models/Enrollment')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')
const { uploadFile } = require('../services/uploadService')

// ── Public ─────────────────────────────────────────────────────────

// GET /api/v1/courses
const getCourses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, level, sort = 'newest', search } = req.query
  const skip = (Number(page) - 1) * Number(limit)

  const filter = { status: 'published', isDeleted: false }
  if (category) filter.category = category
  if (level) filter.level = level
  if (search) filter.$text = { $search: search }

  const sortMap = { newest: { createdAt: -1 }, rating: { averageRating: -1 }, popular: { enrollmentCount: -1 } }
  const sortQuery = sortMap[sort] || sortMap.newest

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit))
      .select('-aiSummary -adminFeedback')
      .populate('instructor', 'name avatar'),
    Course.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: {
      courses,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    },
    message: '',
  })
})

// GET /api/v1/courses/:slug
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
    .populate('instructor', 'name avatar bio')

  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (course.status !== 'published' && req.user?.id !== String(course.instructor._id) && req.user?.role !== 'admin') {
    throw new AppError('Course not found', 404, 'NOT_FOUND')
  }

  const sections = await Section.find({ course: course._id, isDeleted: false })
    .sort('order')
    .populate({
      path: 'lectures',
      match: { isDeleted: false },
      options: { sort: { order: 1 } },
      select: 'title type duration order isFree',
    })

  res.json({ success: true, data: { course, sections }, message: '' })
})

// ── Instructor: Course CRUD ─────────────────────────────────────────

// POST /api/v1/courses
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category, level, tags } = req.body
  const course = await Course.create({
    title, description, category, level, tags,
    instructor: req.user._id,
    status: 'draft',
  })
  res.status(201).json({ success: true, data: { course }, message: 'Course created' })
})

// PATCH /api/v1/courses/:id
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You do not own this course', 403, 'FORBIDDEN')
  }
  if (course.status === 'published' && req.user.role !== 'admin') {
    throw new AppError('Published courses cannot be edited. Unpublish first.', 400, 'BAD_REQUEST')
  }

  const allowed = ['title', 'description', 'category', 'level', 'tags']
  allowed.forEach((k) => { if (req.body[k] !== undefined) course[k] = req.body[k] })
  await course.save()
  res.json({ success: true, data: { course }, message: 'Course updated' })
})

// DELETE /api/v1/courses/:id  (soft delete)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You do not own this course', 403, 'FORBIDDEN')
  }
  course.isDeleted = true
  await course.save()
  res.json({ success: true, data: null, message: 'Course deleted' })
})

// POST /api/v1/courses/:id/submit  — draft → pending_review
const submitCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (course.status !== 'draft') throw new AppError(`Cannot submit a course with status "${course.status}"`, 400, 'BAD_REQUEST')
  course.status = 'pending_review'
  await course.save()
  res.json({ success: true, data: { course }, message: 'Course submitted for review' })
})

// GET /api/v1/instructor/courses — instructor's own courses
const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id, isDeleted: false })
    .sort({ updatedAt: -1 })
    .select('-aiSummary')
  res.json({ success: true, data: { courses }, message: '' })
})

// ── Thumbnail upload ───────────────────────────────────────────────

// PATCH /api/v1/courses/:id/thumbnail
const uploadThumbnail = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE')
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const { url } = await uploadFile(req.file, 'thumbnails')
  course.thumbnail = url
  await course.save()
  res.json({ success: true, data: { thumbnail: url }, message: 'Thumbnail updated' })
})

// ── Sections ──────────────────────────────────────────────────────

// POST /api/v1/courses/:id/sections
const createSection = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, instructor: req.user._id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  const section = await Section.create({ title: req.body.title, course: course._id, order: req.body.order })
  res.status(201).json({ success: true, data: { section }, message: 'Section created' })
})

// PATCH /api/v1/sections/:id
const updateSection = asyncHandler(async (req, res) => {
  const section = await Section.findOne({ _id: req.params.id, isDeleted: false }).populate('course')
  if (!section) throw new AppError('Section not found', 404, 'NOT_FOUND')
  if (String(section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  if (req.body.title) section.title = req.body.title
  if (req.body.order !== undefined) section.order = req.body.order
  await section.save()
  res.json({ success: true, data: { section }, message: 'Section updated' })
})

// DELETE /api/v1/sections/:id
const deleteSection = asyncHandler(async (req, res) => {
  const section = await Section.findOne({ _id: req.params.id, isDeleted: false }).populate('course')
  if (!section) throw new AppError('Section not found', 404, 'NOT_FOUND')
  if (String(section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  section.isDeleted = true
  await section.save()
  res.json({ success: true, data: null, message: 'Section deleted' })
})

// ── Lectures ──────────────────────────────────────────────────────

// POST /api/v1/sections/:id/lectures
const createLecture = asyncHandler(async (req, res) => {
  const section = await Section.findOne({ _id: req.params.id, isDeleted: false }).populate('course')
  if (!section) throw new AppError('Section not found', 404, 'NOT_FOUND')
  if (String(section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const lecture = await Lecture.create({
    title: req.body.title,
    type: req.body.type,
    order: req.body.order,
    section: section._id,
    course: section.course._id,
    isFree: req.body.isFree || false,
    description: req.body.description || '',
  })
  res.status(201).json({ success: true, data: { lecture }, message: 'Lecture created' })
})

// POST /api/v1/lectures/:id/upload  — video/pdf upload
const uploadLectureContent = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file uploaded', 400, 'NO_FILE')
  const lecture = await Lecture.findOne({ _id: req.params.id, isDeleted: false }).populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')
  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const folder = lecture.type === 'video' ? 'video' : 'pdf'
  const { url } = await uploadFile(req.file, folder)
  lecture.contentUrl = url
  await lecture.save()
  res.json({ success: true, data: { contentUrl: url }, message: 'Content uploaded' })
})

// ── Admin: Course Approval ─────────────────────────────────────────

// GET /api/v1/admin/courses
const getAdminCourses = asyncHandler(async (req, res) => {
  const { status } = req.query
  const filter = { isDeleted: false }
  if (status) filter.status = status
  const courses = await Course.find(filter)
    .sort({ updatedAt: -1 })
    .populate('instructor', 'name email')
  res.json({ success: true, data: { courses }, message: '' })
})

// PATCH /api/v1/admin/courses/:id/review
const reviewCourse = asyncHandler(async (req, res) => {
  const { action, feedback } = req.body
  if (!['approve', 'reject'].includes(action)) throw new AppError('Action must be approve or reject', 400, 'VALIDATION_ERROR')
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')
  course.status = action === 'approve' ? 'published' : 'rejected'
  if (feedback) course.adminFeedback = feedback
  await course.save()

  // Real-time notification to instructor
  try {
    const { notifyUser } = require('../config/socket')
    const msg = action === 'approve'
      ? `Your course "${course.title}" has been approved and is now live!`
      : `Your course "${course.title}" was not approved. ${feedback ? `Feedback: ${feedback}` : ''}`
    notifyUser(course.instructor, action === 'approve' ? 'course_approved' : 'course_rejected', msg, { courseId: course._id })
  } catch { /* Socket.io not available in test/stub environments */ }

  res.json({ success: true, data: { course }, message: `Course ${action}d` })
})

// POST /api/v1/lectures/:id/upload-signature
const getUploadSignature = asyncHandler(async (req, res) => {
  const { fileSize, fileType } = req.body
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
  const MAX_VIDEO_BYTES = 500 * 1024 * 1024  // 500 MB

  if (fileType && !ALLOWED_VIDEO_TYPES.includes(fileType)) {
    throw new AppError('Invalid file type. Only MP4, WebM, and QuickTime videos are allowed.', 400, 'VALIDATION_ERROR')
  }
  if (fileSize && fileSize > MAX_VIDEO_BYTES) {
    throw new AppError('File size exceeds the 500MB limit.', 400, 'VALIDATION_ERROR')
  }

  const lecture = await Lecture.findOne({ _id: req.params.id, isDeleted: false }).populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')

  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const timestamp = Math.round(new Date().getTime() / 1000)
  const folder = `edunext/video`
  const paramsToSign = {
    timestamp,
    folder,
  }

  let signature = 'mock_signature'
  const apiKey = process.env.CLOUDINARY_API_KEY || 'mock_api_key'
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'mock_cloud'

  if (process.env.CLOUDINARY_API_SECRET) {
    const cloudinary = require('cloudinary').v2
    signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET)
  }

  res.json({
    success: true,
    data: {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    }
  })
})

// POST /api/v1/lectures/:id/confirm-upload
const confirmUpload = asyncHandler(async (req, res) => {
  const { url, duration, videoThumbnail } = req.body
  if (!url) throw new AppError('Upload URL is required', 400, 'VALIDATION_ERROR')

  const lecture = await Lecture.findOne({ _id: req.params.id, isDeleted: false }).populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')

  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  lecture.contentUrl = url
  lecture.duration = duration || 0
  lecture.videoThumbnail = videoThumbnail || null
  lecture.uploadStatus = 'success'
  await lecture.save()

  res.json({
    success: true,
    data: lecture,
    message: 'Upload confirmed successfully'
  })
})

// GET /api/v1/courses/:id/sections-editor
const getCourseSectionsEditor = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ _id: req.params.id, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  if (String(course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const sections = await Section.find({ course: course._id, isDeleted: false })
    .sort({ order: 1 })
    .populate('lectures')

  res.json({ success: true, data: { sections } })
})

// DELETE /api/v1/courses/lectures/:id
const deleteLecture = asyncHandler(async (req, res) => {
  const lecture = await Lecture.findOne({ _id: req.params.id, isDeleted: false }).populate({ path: 'section', populate: 'course' })
  if (!lecture) throw new AppError('Lecture not found', 404, 'NOT_FOUND')

  if (String(lecture.section.course.instructor) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  lecture.isDeleted = true
  await lecture.save()
  res.json({ success: true, data: null, message: 'Lecture deleted' })
})

// POST /api/v1/courses/:slug/reviews — submit or update review
const createCourseReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body
  
  if (!rating || rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR')
  }

  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
  if (!enrollment) throw new AppError('You must be enrolled to review this course', 403, 'FORBIDDEN')

  enrollment.rating = rating
  enrollment.review = comment || ''
  await enrollment.save()

  // Recalculate
  const allReviews = await Enrollment.find({ course: course._id, rating: { $ne: null } })
  const ratingCount = allReviews.length
  const totalRating = allReviews.reduce((sum, e) => sum + e.rating, 0)
  const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : 0

  course.averageRating = averageRating
  course.ratingCount = ratingCount
  await course.save({ validateBeforeSave: false })

  res.status(201).json({
    success: true,
    data: { enrollment },
    message: 'Review submitted successfully',
  })
})

// GET /api/v1/courses/:slug/reviews — paginated reviews for a course
const getCourseReviews = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const page = parseInt(req.query.page || '1', 10)
  const limit = parseInt(req.query.limit || '10', 10)
  const skip = (page - 1) * limit

  const query = { course: course._id, rating: { $ne: null } }
  
  const reviews = await Enrollment.find(query)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('student', 'name avatar')

  const totalReviews = await Enrollment.countDocuments(query)

  res.json({
    success: true,
    data: {
      reviews: reviews.map(r => ({
        id: r._id,
        student: r.student,
        rating: r.rating,
        comment: r.review,
        createdAt: r.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total: totalReviews,
        pages: Math.ceil(totalReviews / limit),
      }
    },
    message: '',
  })
})

// GET /api/v1/courses/:slug/reviews/summary — summary of ratings
const getCourseReviewsSummary = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const allReviews = await Enrollment.find({ course: course._id, rating: { $ne: null } })
  
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  allReviews.forEach(r => {
    if (breakdown[r.rating] !== undefined) {
      breakdown[r.rating]++
    }
  })

  res.json({
    success: true,
    data: {
      averageRating: course.averageRating || 0,
      ratingCount: course.ratingCount || 0,
      breakdown,
    },
    message: '',
  })
})

// DELETE /api/v1/courses/:slug/reviews — remove review
const deleteCourseReview = asyncHandler(async (req, res) => {
  const course = await Course.findOne({ slug: req.params.slug, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
  if (!enrollment) throw new AppError('Enrollment not found', 404, 'NOT_FOUND')

  enrollment.rating = null
  enrollment.review = null
  await enrollment.save()

  // Recalculate
  const allReviews = await Enrollment.find({ course: course._id, rating: { $ne: null } })
  const ratingCount = allReviews.length
  const totalRating = allReviews.reduce((sum, e) => sum + e.rating, 0)
  const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : 0

  course.averageRating = averageRating
  course.ratingCount = ratingCount
  await course.save({ validateBeforeSave: false })

  res.json({
    success: true,
    data: null,
    message: 'Review deleted successfully',
  })
})

module.exports = {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  submitCourse, getInstructorCourses, uploadThumbnail,
  createSection, updateSection, deleteSection,
  createLecture, uploadLectureContent,
  getAdminCourses, reviewCourse,
  getUploadSignature, confirmUpload,
  getCourseSectionsEditor,
  deleteLecture,
  createCourseReview,
  getCourseReviews,
  getCourseReviewsSummary,
  deleteCourseReview,
}
