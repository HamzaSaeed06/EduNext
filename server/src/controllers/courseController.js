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
  res.json({ success: true, data: { course }, message: `Course ${action}d` })
})

module.exports = {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  submitCourse, getInstructorCourses, uploadThumbnail,
  createSection, updateSection, deleteSection,
  createLecture, uploadLectureContent,
  getAdminCourses, reviewCourse,
}
