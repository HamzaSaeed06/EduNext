const express = require('express')
const router = express.Router()
const {
  getCourses, getCourse, createCourse, updateCourse, deleteCourse,
  submitCourse, getInstructorCourses, uploadThumbnail,
  createSection, updateSection, deleteSection,
  createLecture, uploadLectureContent,
  getAdminCourses, reviewCourse,
} = require('../controllers/courseController')
const { enrollCourse, unenrollCourse, getMyEnrollments, updateProgress } = require('../controllers/enrollmentController')
const { protect, restrict, optionalAuth } = require('../middlewares/auth')
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

// ── Lectures ──────────────────────────────────────────────────────
router.post('/sections/:id/lectures', protect, restrict('instructor', 'admin'), lectureValidator, validate, createLecture)
router.post('/lectures/:id/upload', protect, restrict('instructor', 'admin'), uploadLectureContent)

// ── Enrollment ────────────────────────────────────────────────────
router.post('/:slug/enroll', protect, restrict('student'), enrollCourse)
router.delete('/:slug/enroll', protect, restrict('student'), unenrollCourse)

// ── Student enrollments ───────────────────────────────────────────
router.get('/student/enrollments', protect, getMyEnrollments)
router.patch('/enrollments/:id/progress', protect, updateProgress)

// ── Admin course approval ─────────────────────────────────────────
router.get('/admin/all', protect, restrict('admin'), getAdminCourses)
router.patch('/admin/:id/review', protect, restrict('admin'), reviewCourse)

module.exports = router
