const express = require('express')
const router  = express.Router()

const { login, getMe, register, changePassword } = require('../controllers/authController')
const { protect, superAdmin }                    = require('../middleware/auth')
const { authLimiter }                            = require('../middleware/rateLimiter')

router.post('/login',           authLimiter,          login)
router.get('/me',               protect,              getMe)
router.post('/register',        protect, superAdmin,  register)   // superadmin only
router.patch('/change-password', protect,             changePassword)

module.exports = router
