import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { forgotPassword, verifyOTP, resetPassword } from '../services/api'
import './Auth.css'
import './ForgotPassword.css'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step,    setStep]    = useState(1)
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState(['', '', '', '', '', ''])
  const [token,   setToken]   = useState('')
  const [pass,    setPass]    = useState({ password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [devOTP,  setDevOTP]  = useState('')
  const [timer,   setTimer]   = useState(0)
  const [showPass, setShowPass] = useState(false)
  const otpRefs = useRef([])

  useEffect(() => {
    if (timer <= 0) return
    const id = setInterval(() => setTimer(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [timer])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return setError('Please enter a valid email address')

    setLoading(true)
    setError('')
    try {
      const res = await forgotPassword({ email })
      setDevOTP(res.data.devOTP || '')
      setStep(2)
      setTimer(60)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus()
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setOtp(pasted.split(''))
      otpRefs.current[5]?.focus()
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length !== 6)
      return setError('Please enter the complete 6-digit OTP')

    setLoading(true)
    setError('')
    try {
      const res = await verifyOTP({ email, otp: otpString })
      setToken(res.data.resetToken)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (pass.password.length < 6)
      return setError('Password must be at least 6 characters')
    if (pass.password !== pass.confirm)
      return setError('Passwords do not match')

    setLoading(true)
    setError('')
    try {
      await resetPassword(token, { password: pass.password })
      setStep(4)
      setTimeout(() => navigate('/login'), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Email', 'OTP', 'Password']

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide fade-in-up">

        {step <= 3 && (
          <div className="otp-steps">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`otp-step ${step > i + 1 ? 'otp-step--done' : ''} ${step === i + 1 ? 'otp-step--active' : ''}`}>
                  <div className="otp-step__num">
                    {step > i + 1 ? <i className="fas fa-check"></i> : i + 1}
                  </div>
                  <span>{s}</span>
                </div>
                {i < 2 && <div className={`otp-step__line ${step > i + 1 ? 'otp-step__line--done' : ''}`}></div>}
              </React.Fragment>
            ))}
          </div>
        )}

        {step === 1 && (
          <>
            <div className="auth-card__header">
              <div className="auth-card__logo"><i className="fas fa-envelope"></i></div>
              <h2>Forgot Password?</h2>
              <p>Enter your email to receive a 6-digit OTP</p>
            </div>
            <form onSubmit={handleSendOTP} className="auth-form">
              {error && <div className="auth-error-banner"><i className="fas fa-exclamation-circle"></i> {error}</div>}
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Sending OTP...</> : <><i className="fas fa-paper-plane"></i> Send OTP</>}
              </button>
            </form>
            <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
          </>
        )}

        {step === 2 && (
          <>
            <div className="auth-card__header">
              <div className="auth-card__logo" style={{ background: '#fff8e1', color: '#f59e0b' }}>
                <i className="fas fa-shield-alt"></i>
              </div>
              <h2>Enter OTP</h2>
              <p>We sent a 6-digit code to <strong>{email}</strong></p>
            </div>

            {devOTP && (
              <div className="otp-dev-box">
                <i className="fas fa-code"></i>
                <div>
                  <strong>Dev Mode</strong> — Gmail not configured
                  <div className="otp-dev-code">{devOTP}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="auth-form">
              {error && <div className="auth-error-banner"><i className="fas fa-exclamation-circle"></i> {error}</div>}

              <div className="otp-inputs" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`otp-input ${digit ? 'otp-input--filled' : ''}`}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading || otp.join('').length !== 6}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Verifying...</> : <><i className="fas fa-check-circle"></i> Verify OTP</>}
              </button>
            </form>

            <div className="otp-resend">
              {timer > 0 ? (
                <span>Resend OTP in <strong>{timer}s</strong></span>
              ) : (
                <button
                  className="otp-resend-btn"
                  onClick={() => { setStep(1); setOtp(['','','','','','']); setError('') }}
                >
                  <i className="fas fa-redo"></i> Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="auth-card__header">
              <div className="auth-card__logo" style={{ background: '#f0eeff', color: '#6c63ff' }}>
                <i className="fas fa-lock"></i>
              </div>
              <h2>Set New Password</h2>
              <p>Choose a strong password for your account</p>
            </div>
            <form onSubmit={handleResetPassword} className="auth-form">
              {error && <div className="auth-error-banner"><i className="fas fa-exclamation-circle"></i> {error}</div>}

              <div className="form-group">
                <label>New Password</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={pass.password}
                    onChange={e => { setPass(p => ({ ...p, password: e.target.value })); setError('') }}
                    placeholder="Min. 6 characters"
                    autoFocus
                  />
                  <button type="button" className="input-toggle-pass" onClick={() => setShowPass(s => !s)}>
                    <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={pass.confirm}
                    onChange={e => { setPass(p => ({ ...p, confirm: e.target.value })); setError('') }}
                    placeholder="Repeat password"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Resetting...</> : <><i className="fas fa-check"></i> Reset Password</>}
              </button>
            </form>
          </>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="auth-card__logo" style={{ background: '#dcfce7', color: '#16a34a', margin: '0 auto 20px', width: '72px', height: '72px', fontSize: '2rem' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h2 style={{ color: 'var(--text-dark)', marginBottom: '8px' }}>Password Reset!</h2>
            <p style={{ color: 'var(--text-light)' }}>Redirecting to login...</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default ForgotPassword
