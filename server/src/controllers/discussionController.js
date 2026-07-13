const DiscussionPost = require('../models/Discussion')
const Enrollment = require('../models/Enrollment')
const Course = require('../models/Course')
const { AppError, asyncHandler } = require('../middlewares/errorHandler')

// GET /api/v1/courses/:courseId/discussions?lectureId=&page=
const getDiscussions = asyncHandler(async (req, res) => {
  const { lectureId, page = 1 } = req.query
  const LIMIT = 20
  const skip = (Number(page) - 1) * LIMIT

  const filter = { course: req.params.courseId, parentPost: null, isDeleted: false }
  if (lectureId) filter.lecture = lectureId

  const [posts, total] = await Promise.all([
    DiscussionPost.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(LIMIT)
      .populate('author', 'name avatar role'),
    DiscussionPost.countDocuments(filter),
  ])

  // Attach replies for this page of posts
  const postIds = posts.map((p) => p._id)
  const replies = await DiscussionPost.find({ parentPost: { $in: postIds }, isDeleted: false })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatar role')

  const postsWithReplies = posts.map((post) => ({
    ...post.toObject(),
    replies: replies.filter((r) => String(r.parentPost) === String(post._id)),
  }))

  res.json({
    success: true,
    data: { posts: postsWithReplies, total, page: Number(page) },
    message: '',
  })
})

// POST /api/v1/courses/:courseId/discussions
const createPost = asyncHandler(async (req, res) => {
  const { content, lectureId, parentPostId } = req.body

  const course = await Course.findOne({ _id: req.params.courseId, isDeleted: false })
  if (!course) throw new AppError('Course not found', 404, 'NOT_FOUND')

  const isInstructor = String(course.instructor) === String(req.user._id)
  const isAdmin = req.user.role === 'admin'

  if (!isInstructor && !isAdmin) {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id })
    if (!enrollment) throw new AppError('You must be enrolled to post in discussions', 403, 'FORBIDDEN')
  }

  if (parentPostId) {
    const parent = await DiscussionPost.findOne({ _id: parentPostId, isDeleted: false })
    if (!parent || String(parent.course) !== String(course._id)) {
      throw new AppError('Parent post not found', 404, 'NOT_FOUND')
    }
    if (parent.parentPost) throw new AppError('Cannot reply to a reply', 400, 'BAD_REQUEST')
  }

  const post = await DiscussionPost.create({
    course: course._id,
    lecture: lectureId || null,
    author: req.user._id,
    content: content.trim(),
    parentPost: parentPostId || null,
    isInstructorReply: isInstructor || isAdmin,
  })

  await post.populate('author', 'name avatar role')

  res.status(201).json({ success: true, data: { post }, message: 'Posted successfully' })
})

// DELETE /api/v1/discussions/:id  — author or admin only
const deletePost = asyncHandler(async (req, res) => {
  const post = await DiscussionPost.findOne({ _id: req.params.id, isDeleted: false })
  if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND')

  const isAuthor = String(post.author) === String(req.user._id)
  const isAdmin = req.user.role === 'admin'
  if (!isAuthor && !isAdmin) throw new AppError('Forbidden', 403, 'FORBIDDEN')

  post.isDeleted = true
  await post.save()
  res.json({ success: true, data: null, message: 'Post deleted' })
})

module.exports = { getDiscussions, createPost, deletePost }
