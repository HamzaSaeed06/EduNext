const express = require('express')
const router = express.Router()
const { createQuiz, getQuiz, updateQuiz, deleteQuiz, submitQuiz } = require('../controllers/quizController')
const { issueCertificate, verifyCertificate, getMyCertificates, downloadCertificate } = require('../controllers/certificateController')
const { protect, restrict } = require('../middlewares/auth')

// Quiz CRUD
router.post('/lectures/:lectureId/quiz', protect, restrict('instructor', 'admin'), createQuiz)
router.get('/quizzes/:id', protect, getQuiz)
router.patch('/quizzes/:id', protect, restrict('instructor', 'admin'), updateQuiz)
router.delete('/quizzes/:id', protect, restrict('instructor', 'admin'), deleteQuiz)

// Quiz submission
router.post('/quizzes/:id/submit', protect, restrict('student'), submitQuiz)

// Certificates
router.post('/courses/:slug/certificate', protect, restrict('student'), issueCertificate)
router.get('/certificates/verify/:certId', verifyCertificate)
router.get('/certificates/:certId/download', protect, downloadCertificate)
router.get('/student/certificates', protect, getMyCertificates)

module.exports = router
