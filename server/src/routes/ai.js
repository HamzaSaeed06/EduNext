const express = require('express')
const router = express.Router()
const { summarizeCourse, generateQuiz, getRecommendations } = require('../controllers/aiController')
const { protect, restrict } = require('../middlewares/auth')

router.post('/ai/courses/:id/summarize', protect, restrict('instructor', 'admin'), summarizeCourse)
router.post('/ai/lectures/:id/generate-quiz', protect, restrict('instructor', 'admin'), generateQuiz)
router.get('/ai/recommendations', protect, restrict('student'), getRecommendations)

module.exports = router
