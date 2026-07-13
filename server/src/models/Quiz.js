const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 1000 },
    options: [
      {
        text: { type: String, required: true, maxlength: 500 },
        isCorrect: { type: Boolean, default: false },
      },
    ],
    explanation: { type: String, default: '' },
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: true },
)

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      maxlength: 200,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lecture',
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },
    timeLimit: {
      type: Number,
      default: null,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    aiGenerated: {
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

quizSchema.index({ course: 1 })
quizSchema.index({ lecture: 1 })

module.exports = mongoose.model('Quiz', quizSchema)
