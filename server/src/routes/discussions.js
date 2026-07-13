const express = require('express')
const router = express.Router()
const { getDiscussions, createPost, deletePost } = require('../controllers/discussionController')
const { protect } = require('../middlewares/auth')
const { body } = require('express-validator')
const validate = require('../middlewares/validate')

const postValidator = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
]

// Per-course discussion threads (optionally scoped to a lecture via ?lectureId=)
router.get('/courses/:courseId/discussions', protect, getDiscussions)
router.post('/courses/:courseId/discussions', protect, postValidator, validate, createPost)

// Single post actions
router.delete('/discussions/:id', protect, deletePost)

module.exports = router
