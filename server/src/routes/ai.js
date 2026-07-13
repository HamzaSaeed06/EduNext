const express = require('express')
const router = express.Router()
const { summarizeCourse, generateQuiz, getRecommendations, chat } = require('../controllers/aiController')
const { protect, restrict } = require('../middlewares/auth')
const { aiLimiter } = require('../middlewares/rateLimiter')

router.post('/ai/courses/:id/summarize', protect, restrict('instructor', 'admin'), aiLimiter, summarizeCourse)
router.post('/ai/lectures/:id/generate-quiz', protect, restrict('instructor', 'admin'), aiLimiter, generateQuiz)
router.get('/ai/recommendations', protect, restrict('student'), aiLimiter, getRecommendations)
router.post('/ai/chat', protect, aiLimiter, chat)

module.exports = router
