const mongoose = require('mongoose')
const { randomUUID } = require('crypto')

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      default: () => randomUUID(),
    },
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
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    studentName: {
      type: String,
      required: true,
    },
    courseTitle: {
      type: String,
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
)

certificateSchema.index({ student: 1, course: 1 }, { unique: true })

module.exports = mongoose.model('Certificate', certificateSchema)
