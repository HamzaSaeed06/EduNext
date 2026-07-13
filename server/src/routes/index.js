const express = require('express')
const router = express.Router()

router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
    message: 'EduNext API is running',
  })
})

module.exports = router
