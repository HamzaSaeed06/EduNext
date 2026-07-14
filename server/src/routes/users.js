const express = require('express')
const router = express.Router()
const { getUsers, toggleBan, changeRole, getAdminStats, getStudentStats, getInstructorStats, getPlatformStats } = require('../controllers/userController')
const { protect, restrict } = require('../middlewares/auth')

router.get('/platform/stats', getPlatformStats)
router.get('/admin/users', protect, restrict('admin'), getUsers)
router.patch('/admin/users/:id/ban', protect, restrict('admin'), toggleBan)
router.patch('/admin/users/:id/role', protect, restrict('admin'), changeRole)
router.get('/admin/stats', protect, restrict('admin'), getAdminStats)
router.get('/student/stats', protect, restrict('student'), getStudentStats)
router.get('/instructor/stats', protect, restrict('instructor'), getInstructorStats)

module.exports = router
