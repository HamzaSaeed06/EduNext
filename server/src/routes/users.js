const express = require('express')
const router = express.Router()
const { getUsers, toggleBan, changeRole, getAdminStats } = require('../controllers/userController')
const { protect, restrict } = require('../middlewares/auth')

router.get('/admin/users', protect, restrict('admin'), getUsers)
router.patch('/admin/users/:id/ban', protect, restrict('admin'), toggleBan)
router.patch('/admin/users/:id/role', protect, restrict('admin'), changeRole)
router.get('/admin/stats', protect, restrict('admin'), getAdminStats)

module.exports = router
