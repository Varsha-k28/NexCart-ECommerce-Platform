const jwt                = require('jsonwebtoken')
const crypto             = require('crypto')
const { OAuth2Client }   = require('google-auth-library')
const User               = require('../models/User')
const { sendOTPEmail, sendWelcomeEmail } = require('../utils/sendEmail')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

const getGoogleClient = () => new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString()

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill all fields' })

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' })

    const user  = await User.create({ name, email, password, provider: 'local' })
    const token = generateToken(user._id)

    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      sendWelcomeEmail(email, name).catch(err =>
        console.log('[Email] Welcome email failed (non-critical):', err.message)
      )
    }

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message)[0]
      return res.status(400).json({ message: msg })
    }
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' })

    const user = await User.findOne({ email }).select('+password')
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' })

    if (user.provider !== 'local')
      return res.status(400).json({ message: `This account uses ${user.provider} login. Please use that instead.` })

    const isMatch = await user.matchPassword(password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = generateToken(user._id)
    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential)
      return res.status(400).json({ message: 'Google credential is required' })

    if (!process.env.GOOGLE_CLIENT_ID)
      return res.status(500).json({ message: 'Google Client ID not configured in .env' })

    const googleClient = getGoogleClient()
    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    const { sub: googleId, email, name, picture } = payload

    let user = await User.findOne({ email })

    if (user) {
      if (user.provider === 'local') {
        user.googleId = googleId
        user.avatar   = picture || user.avatar
        await user.save({ validateBeforeSave: false })
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar:   picture || '',
        provider: 'google',
      })
    }

    const token = generateToken(user._id)
    res.json({
      message: 'Google login successful',
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    })
  } catch (err) {
    console.error('[Google Auth] Error:', err.message)
    res.status(401).json({
      message: 'Google authentication failed',
      error:   err.message,
      hint:    err.message.includes('audience')
        ? 'Client ID mismatch between frontend and backend .env'
        : err.message.includes('expired')
        ? 'Token expired — try signing in again'
        : 'Check server console for details'
    })
  }
}

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (req.body.email && req.body.email !== user.email) {
      const exists = await User.findOne({ email: req.body.email })
      if (exists) return res.status(400).json({ message: 'Email already in use' })
    }

    user.name  = req.body.name  || user.name
    user.email = req.body.email || user.email
    user.phone = req.body.phone !== undefined ? req.body.phone : user.phone

    const updated = await user.save()
    res.json({
      message: 'Profile updated successfully',
      user: { _id: updated._id, name: updated.name, email: updated.email, phone: updated.phone, role: updated.role, avatar: updated.avatar },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both passwords are required' })
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' })

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.provider !== 'local')
      return res.status(400).json({ message: 'Social login accounts cannot change password here' })

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch)
      return res.status(401).json({ message: 'Current password is incorrect' })

    if (currentPassword === newPassword)
      return res.status(400).json({ message: 'New password must be different from current' })

    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required' })

    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ message: 'If that email is registered, an OTP has been sent.' })
    }

    if (user.provider !== 'local')
      return res.status(400).json({ message: `This account uses ${user.provider} login. No password to reset.` })

    const otp = generateOTP()
    user.otp        = crypto.createHash('sha256').update(otp).digest('hex')
    user.otpExpires = Date.now() + 10 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    const emailConfigured = process.env.GMAIL_USER &&
      process.env.GMAIL_APP_PASSWORD &&
      !process.env.GMAIL_USER.includes('your_gmail')

    if (emailConfigured) {
      try {
        await sendOTPEmail(email, otp, user.name)
        console.log(`[OTP] Sent to ${email}`)
        res.json({ message: `OTP sent to ${email}. Check your inbox.` })
      } catch (emailErr) {
        console.error('[OTP] Email failed:', emailErr.message)
        res.json({
          message: 'Email sending failed. Use dev OTP below.',
          devOTP: otp,
        })
      }
    } else {
      console.log(`[OTP DEV] OTP for ${email}: ${otp}`)
      res.json({
        message: 'Gmail not configured. OTP shown below (dev mode only).',
        devOTP: otp,
      })
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp)
      return res.status(400).json({ message: 'Email and OTP are required' })

    const hashedOTP = crypto.createHash('sha256').update(otp.trim()).digest('hex')

    const user = await User.findOne({
      email,
      otp:        hashedOTP,
      otpExpires: { $gt: Date.now() },
    })

    if (!user)
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' })

    const resetToken  = crypto.randomBytes(32).toString('hex')
    const tokenHashed = crypto.createHash('sha256').update(resetToken).digest('hex')

    user.otp                  = undefined
    user.otpExpires           = undefined
    user.resetPasswordToken   = tokenHashed
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save({ validateBeforeSave: false })

    res.json({
      message: 'OTP verified successfully',
      resetToken,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { token }    = req.params
    const { password } = req.body

    if (!password || password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const tokenHashed = crypto.createHash('sha256').update(token).digest('hex')

    const user = await User.findOne({
      resetPasswordToken:   tokenHashed,
      resetPasswordExpires: { $gt: Date.now() },
    })

    if (!user)
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })

    user.password             = password
    user.resetPasswordToken   = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successfully. You can now login.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  register, login, googleLogin,
  getProfile, updateProfile, changePassword,
  forgotPassword, verifyOTP, resetPassword,
}
