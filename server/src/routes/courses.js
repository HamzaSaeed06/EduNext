const express = require('express')
const router = express.Router()
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  submitCourse, getInstructorCourses, uploadThumbnail,
  createSection, updateSection, deleteSection,
  createLecture, uploadLectureContent,
  getAdminCourses, reviewCourse,
  getUploadSignature, confirmUpload,
  getCourseSectionsEditor,
  deleteLecture,
  createCourseReview, getCourseReviews, getCourseReviewsSummary, deleteCourseReview,
} = require('../controllers/courseController')
const { enrollCourse, unenrollCourse, getMyEnrollments, updateProgress } = require('../controllers/enrollmentController')
const { protect, restrict, optionalAuth } = require('../middlewares/auth')
const { uploadLimiter } = require('../middlewares/rateLimiter')
const validate = require('../middlewares/validate')
const {
  createCourseValidator, updateCourseValidator, courseQueryValidator,
  sectionValidator, lectureValidator,
} = require('../validators/courseValidators')

// ── Public course browsing ─────────────────────────────────────────
router.get('/', courseQueryValidator, validate, optionalAuth, getCourses)
router.get('/:slug', optionalAuth, getCourse)

// ── Instructor: own courses ───────────────────────────────────────
router.get('/instructor/mine', protect, restrict('instructor', 'admin'), getInstructorCourses)
router.post('/', protect, restrict('instructor', 'admin'), createCourseValidator, validate, createCourse)
router.patch('/:id', protect, restrict('instructor', 'admin'), updateCourseValidator, validate, updateCourse)
router.delete('/:id', protect, restrict('instructor', 'admin'), deleteCourse)
router.post('/:id/submit', protect, restrict('instructor', 'admin'), submitCourse)
router.patch('/:id/thumbnail', protect, restrict('instructor', 'admin'), uploadThumbnail)

// ── Sections ──────────────────────────────────────────────────────
router.post('/:id/sections', protect, restrict('instructor', 'admin'), sectionValidator, validate, createSection)
router.patch('/sections/:id', protect, restrict('instructor', 'admin'), updateSection)
router.delete('/sections/:id', protect, restrict('instructor', 'admin'), deleteSection)
router.get('/:id/sections-editor', protect, restrict('instructor', 'admin'), getCourseSectionsEditor)

// ── Lectures ──────────────────────────────────────────────────────
router.post('/sections/:id/lectures', protect, restrict('instructor', 'admin'), lectureValidator, validate, createLecture)
router.post('/lectures/:id/upload', protect, restrict('instructor', 'admin'), uploadLectureContent)
router.post('/lectures/:id/upload-signature', protect, restrict('instructor', 'admin'), uploadLimiter, getUploadSignature)
router.post('/lectures/:id/confirm-upload', protect, restrict('instructor', 'admin'), confirmUpload)
router.delete('/lectures/:id', protect, restrict('instructor', 'admin'), deleteLecture)

// ── Enrollment ────────────────────────────────────────────────────
router.post('/:slug/enroll', protect, restrict('student'), enrollCourse)
router.delete('/:slug/enroll', protect, restrict('student'), unenrollCourse)

// ── Student enrollments ───────────────────────────────────────────
router.get('/student/enrollments', protect, getMyEnrollments)
router.patch('/enrollments/:id/progress', protect, updateProgress)

// ── Admin course approval ─────────────────────────────────────────
router.get('/admin/all', protect, restrict('admin'), getAdminCourses)
router.patch('/admin/:id/review', protect, restrict('admin'), reviewCourse)

// ── Course reviews ────────────────────────────────────────────────
router.get('/:slug/reviews', optionalAuth, getCourseReviews)
router.get('/:slug/reviews/summary', optionalAuth, getCourseReviewsSummary)
router.post('/:slug/reviews', protect, restrict('student'), createCourseReview)
router.delete('/:slug/reviews', protect, restrict('student'), deleteCourseReview)

module.exports = router
