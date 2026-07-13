const { body, query } = require('express-validator')

const createCourseValidator = [
  body('title')
    .trim()
    .notEmpty().withMessage('Course title is required')
    .isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 5000 }).withMessage('Description cannot exceed 5000 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('level')
    .isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Level must be Beginner, Intermediate, or Advanced'),
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
]

const updateCourseValidator = [
  body('title').optional().trim().isLength({ max: 150 }).withMessage('Title cannot exceed 150 characters'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description too long'),
  body('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']).withMessage('Invalid level'),
]

const courseQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1–50'),
  query('level').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
  query('sort').optional().isIn(['newest', 'rating', 'popular']),
]

const sectionValidator = [
  body('title').trim().notEmpty().withMessage('Section title is required').isLength({ max: 200 }),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
]

const lectureValidator = [
  body('title').trim().notEmpty().withMessage('Lecture title is required').isLength({ max: 200 }),
  body('type').isIn(['video', 'pdf', 'quiz', 'text']).withMessage('Invalid lecture type'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
]

module.exports = {
  createCourseValidator,
  updateCourseValidator,
  courseQueryValidator,
  sectionValidator,
  lectureValidator,
}
