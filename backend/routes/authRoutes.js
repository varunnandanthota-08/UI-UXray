const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { login, register, getMe } = require('../controllers/authController')

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/me', authMiddleware, getMe)

module.exports = router