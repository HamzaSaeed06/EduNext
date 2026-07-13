const mongoose = require('mongoose')

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

sectionSchema.index({ course: 1, order: 1 })

sectionSchema.virtual('lectures', {
  ref: 'Lecture',
  localField: '_id',
  foreignField: 'section',
})

module.exports = mongoose.model('Section', sectionSchema)
