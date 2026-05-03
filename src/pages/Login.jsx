import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser } from '../services/api'
import GoogleLoginBtn from '../components/GoogleLoginBtn'
import './Auth.css'

const Login = () => {
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
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
      const res = await loginUser({ email: form.email, password: form.password })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Login failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your NexCart account</p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <GoogleLoginBtn label="Sign in with Google" />
        </div>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {errors.general && (
            <div className="auth-error-banner">
              <i className="fas fa-exclamation-circle"></i> {errors.general}
            </div>
          )}

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
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-toggle-pass"
                onClick={() => setShowPass(s => !s)}
                aria-label="Toggle password"
              >
                <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="auth-form__options">
            <label className="auth-remember">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
              : <><i className="fas fa-sign-in-alt"></i> Sign In</>
            }
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
