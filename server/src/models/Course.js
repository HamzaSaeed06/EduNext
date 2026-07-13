const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    thumbnail: {
      type: String,
      default: null,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published', 'rejected'],
      default: 'draft',
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
      default: null,
    },
    adminFeedback: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

courseSchema.index({ instructor: 1 })
courseSchema.index({ status: 1, isDeleted: 1 })
courseSchema.index({ category: 1 })
courseSchema.index({ tags: 1 })

courseSchema.pre('save', function (next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }
  next()
})

courseSchema.virtual('sections', {
  ref: 'Section',
  localField: '_id',
  foreignField: 'course',
})

module.exports = mongoose.model('Course', courseSchema)
