const User = require('../models/User')
const Course = require('../models/Course')
const Enrollment = require('../models/Enrollment')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')

// GET /api/v1/admin/users?search=&role=&page=
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1 } = req.query
  const LIMIT = 20
  const skip = (Number(page) - 1) * LIMIT

  const filter = { isDeleted: false }
  if (role && ['student', 'instructor', 'admin'].includes(role)) filter.role = role
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .select('name email role avatar isEmailVerified isBanned lastActive createdAt'),
    User.countDocuments(filter),
  ])

  res.json({
    success: true,
    data: {
      users,
      pagination: { total, page: Number(page), limit: LIMIT, pages: Math.ceil(total / LIMIT) },
    },
    message: '',
  })
})

// PATCH /api/v1/admin/users/:id/ban
const toggleBan = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, isDeleted: false })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (user.role === 'admin') throw new AppError('Cannot ban an admin account', 403, 'FORBIDDEN')

  user.isBanned = !user.isBanned
  await user.save({ validateBeforeSave: false })

  res.json({
    success: true,
    data: { isBanned: user.isBanned },
    message: user.isBanned ? 'User banned' : 'User unbanned',
  })
})

// PATCH /api/v1/admin/users/:id/role
const changeRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  if (!['student', 'instructor'].includes(role)) {
    throw new AppError('Role must be student or instructor', 400, 'VALIDATION_ERROR')
  }

  const user = await User.findOne({ _id: req.params.id, isDeleted: false })
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND')
  if (user.role === 'admin') throw new AppError('Cannot change an admin\'s role', 403, 'FORBIDDEN')
  if (String(user._id) === String(req.user._id)) {
    throw new AppError('Cannot change your own role', 403, 'FORBIDDEN')
  }

  user.role = role
  await user.save({ validateBeforeSave: false })

  res.json({ success: true, data: { role: user.role }, message: `Role changed to ${role}` })
})

// GET /api/v1/admin/stats — platform-wide analytics for admin dashboard
const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, pendingReview, totalEnrollments] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Course.countDocuments({ isDeleted: false }),
    Course.countDocuments({ status: 'pending_review', isDeleted: false }),
    Enrollment.countDocuments(),
  ])

  res.json({
    success: true,
    data: { totalUsers, totalCourses, pendingReview, totalEnrollments },
    message: '',
  })
})

// GET /api/v1/student/stats — student dashboard analytics
const getStudentStats = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const [enrolledCourses, completedCourses, inProgressCourses, totalHoursLearned] = await Promise.all([
    Enrollment.countDocuments({ student: userId }),
    Enrollment.countDocuments({ student: userId, isCompleted: true }),
    Enrollment.countDocuments({ student: userId, isCompleted: false, progress: { $gt: 0 } }),
    Enrollment.aggregate([
      { $match: { student: userId } },
      { $group: { _id: null, totalHours: { $sum: '$watchedSeconds' } } },
    ]),
  ])

  const hours = totalHoursLearned[0]?.totalHours ? Math.round(totalHoursLearned[0].totalHours / 3600) : 0

  res.json({
    success: true,
    data: {
      enrolledCourses,
      completedCourses,
      inProgressCourses,
      totalHoursLearned: hours,
    },
    message: '',
  })
})

// GET /api/v1/instructor/stats — instructor dashboard analytics
const getInstructorStats = asyncHandler(async (req, res) => {
  const instructorId = req.user._id

  const [myCourses, totalStudents, totalEnrollments, totalReviews] = await Promise.all([
    Course.countDocuments({ instructor: instructorId, isDeleted: false }),
    User.aggregate([
      { $match: { _id: instructorId, isDeleted: false } },
      { $lookup: { from: 'enrollments', localField: 'courses', foreignField: 'course', as: 'allEnrollments' } },
    ]),
    Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      { $match: { 'courseData.instructor': instructorId } },
      { $count: 'total' },
    ]),
    Course.countDocuments({ instructor: instructorId, status: 'pending_review', isDeleted: false }),
  ])

  const students = totalStudents[0]?.allEnrollments?.length || 0
  const enrollments = totalEnrollments[0]?.total || 0

  res.json({
    success: true,
    data: {
      myCourses,
      totalStudents: students,
      totalEnrollments: enrollments,
      pendingReviews: totalReviews,
    },
    message: '',
  })
})

// GET /api/v1/platform/stats — public platform stats for homepage
const getPlatformStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalCourses, totalEnrollments, avgRating] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Course.countDocuments({ isDeleted: false, status: 'published' }),
    Enrollment.countDocuments(),
    Course.aggregate([
      { $match: { isDeleted: false, status: 'published', averageRating: { $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$averageRating' } } },
    ]),
  ])

  res.json({
    success: true,
    data: {
      activeUsers: totalUsers,
      coursesAvailable: totalCourses,
      totalEnrollments,
      averageRating: avgRating[0]?.avgRating?.toFixed(1) || 4.8,
    },
    message: '',
  })
})

module.exports = { getUsers, toggleBan, changeRole, getAdminStats, getStudentStats, getInstructorStats, getPlatformStats }
