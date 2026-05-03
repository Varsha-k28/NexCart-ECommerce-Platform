import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { resetPassword } from '../services/api'
import './Auth.css'

const ResetPassword = () => {
  const { token }   = useParams()
  const navigate    = useNavigate()
  const [form, setForm]     = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone]     = useState(false)
  const [showPass, setShowPass] = useState(false)

  const validate = () => {
    const e = {}
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await resetPassword(token, { password: form.password })
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Reset failed. Link may have expired.' })
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card fade-in-up" style={{ textAlign: 'center' }}>
          <div className="auth-card__logo" style={{ background: '#dcfce7', color: '#16a34a', margin: '0 auto 16px' }}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>Password Reset!</h2>
          <p style={{ color: 'var(--text-light)', marginTop: '8px' }}>
            Redirecting you to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <i className="fas fa-lock"></i>
          </div>
          <h2>Set New Password</h2>
          <p>Choose a strong password for your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="auth-error-banner">
              <i className="fas fa-exclamation-circle"></i> {errors.general}
            </div>
          )}

          <div className={`form-group ${errors.password ? 'form-group--error' : ''}`}>
            <label>New Password</label>
            <div className="input-icon-wrap">
              <i className="fas fa-lock"></i>
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(er => ({ ...er, password: '' })) }}
                placeholder="Min. 6 characters"
              />
              <button type="button" className="input-toggle-pass" onClick={() => setShowPass(s => !s)}>
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
                value={form.confirm}
                onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(er => ({ ...er, confirm: '' })) }}
                placeholder="Repeat password"
              />
            </div>
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</>
              : <><i className="fas fa-check"></i> Reset Password</>
            }
          </button>
        </form>

        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  )
}

export default ResetPassword
