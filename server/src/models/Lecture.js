const mongoose = require('mongoose')

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'pdf', 'quiz', 'text'],
      required: true,
    },
    contentUrl: {
      type: String,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    videoThumbnail: {
      type: String,
      default: null,
    },
    uploadStatus: {
      type: String,
      enum: ['pending', 'processing', 'success', 'failed'],
      default: 'pending',
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    transcript: {
      type: String,
      default: null,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

lectureSchema.index({ course: 1, section: 1, order: 1 })

module.exports = mongoose.model('Lecture', lectureSchema)
