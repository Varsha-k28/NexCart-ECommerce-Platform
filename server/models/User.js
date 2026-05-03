const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    phone: { type: String, default: '' },

    provider: {
      type:    String,
      enum:    ['local', 'google'],
      default: 'local',
    },
    googleId: { type: String, default: '' },
    avatar:   { type: String, default: '' },

    otp:        { type: String },
    otpExpires: { type: Date },

    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false
  return bcrypt.compare(entered, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.otp
  delete obj.otpExpires
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

module.exports = mongoose.model('User', userSchema)
