const mongoose = require('mongoose')

const passedQuizSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, required: true },
    passed: { type: Boolean, default: false },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const lectureProgressSchema = new mongoose.Schema(
  {
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      required: true,
    },
    completed: { type: Boolean, default: false },
    watchedSeconds: { type: Number, default: 0 },
    lastPosition: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
)

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedLectures: [lectureProgressSchema],
    passedQuizzes: [passedQuizSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: null,
    },
  },
  { timestamps: true },
)

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })
enrollmentSchema.index({ course: 1 })
enrollmentSchema.index({ student: 1 })

module.exports = mongoose.model('Enrollment', enrollmentSchema)
