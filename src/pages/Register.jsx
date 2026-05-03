import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser } from '../services/api'
import GoogleLoginBtn from '../components/GoogleLoginBtn'
import './Auth.css'

const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await registerUser({ name: form.name, email: form.email, password: form.password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <i className="fas fa-user-plus"></i>
          </div>
          <h2>Create Account</h2>
          <p>Join NexCart and start shopping</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <GoogleLoginBtn label="Sign up with Google" />
        </div>

        <div className="auth-divider"><span>or register with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="auth-error-banner">
              <i className="fas fa-exclamation-circle"></i> {errors.general}
            </div>
          )}
          <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
            <label>Full Name</label>
            <div className="input-icon-wrap">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
            <label>Email Address</label>
            <div className="input-icon-wrap">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className={`form-group ${errors.password ? 'form-group--error' : ''}`}>
            <label>Password</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowPass(!showPass)}
                aria-label="Toggle password"
              >
                <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className={`form-group ${errors.confirm ? 'form-group--error' : ''}`}>
            <label>Confirm Password</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                type={showPass ? 'text' : 'password'}
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
            ) : (
              <><i className="fas fa-user-plus"></i> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>or sign up with</span></div>

        <div className="auth-social">
          <button className="auth-social-btn">
            <i className="fab fa-google"></i> Google
          </button>
          <button className="auth-social-btn">
            <i className="fab fa-facebook-f"></i> Facebook
          </button>
        </div>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
