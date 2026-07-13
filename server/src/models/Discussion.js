const mongoose = require('mongoose')

/**
 * Discussion/Q&A posts — linked to a course and optionally a lecture.
 * Top-level posts + one level of replies (parentPost non-null = reply).
 */
const discussionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
    },
    parentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DiscussionPost',
      default: null,
    },
    isInstructorReply: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

discussionSchema.index({ course: 1, lecture: 1, createdAt: -1 })
discussionSchema.index({ parentPost: 1 })
discussionSchema.index({ author: 1 })

module.exports = mongoose.model('DiscussionPost', discussionSchema)
