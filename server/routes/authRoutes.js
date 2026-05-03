const express = require('express')
const router  = express.Router()
const {
  register, login, googleLogin,
  getProfile, updateProfile, changePassword,
  forgotPassword, verifyOTP, resetPassword,
} = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

router.post('/register',               register)
router.post('/login',                  login)
router.post('/google',                 googleLogin)
router.post('/forgot-password',        forgotPassword)
router.post('/verify-otp',             verifyOTP)
router.post('/reset-password/:token',  resetPassword)

router.get('/profile',                 protect, getProfile)
router.put('/profile',                 protect, updateProfile)
router.put('/change-password',         protect, changePassword)

module.exports = router
