import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { loginUser, registerUser } from '../services/api'
import GoogleLoginBtn from '../components/GoogleLoginBtn'
import './Auth.css'

const Auth = () => {
  const { login, user } = useAuth()
  const navigate        = useNavigate()
  const location        = useLocation()

  const [mode, setMode]       = useState(location.pathname === '/register' ? 'signup' : 'login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]  = useState(false)
  const [errors, setErrors]    = useState({})

  const [loginForm, setLoginForm]   = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' })

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  useEffect(() => {
    const target = mode === 'login' ? '/login' : '/register'
    if (location.pathname !== target) {
      window.history.replaceState(null, '', target)
    }
  }, [mode])

  const switchMode = (newMode) => {
    setMode(newMode)
    setErrors({})
    setShowPass(false)
  }

  const validateLogin = () => {
    const e = {}
    if (!loginForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Enter a valid email'
    if (loginForm.password.length < 6)
      e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateLogin()) return
    setLoading(true)
    try {
      const res = await loginUser({ email: loginForm.email, password: loginForm.password })
      login(res.data.user, res.data.token)
      navigate(location.state?.from || '/')
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Login failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const validateSignup = () => {
    const e = {}
    if (!signupForm.name.trim() || signupForm.name.length < 2)
      e.name = 'Name must be at least 2 characters'
    if (!signupForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      e.email = 'Enter a valid email'
    if (signupForm.password.length < 6)
      e.password = 'Password must be at least 6 characters'
    if (signupForm.password !== signupForm.confirm)
      e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    if (!validateSignup()) return
    setLoading(true)
    try {
      const res = await registerUser({
        name:     signupForm.name,
        email:    signupForm.email,
        password: signupForm.password,
      })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (setter) => (e) => {
    setter(f => ({ ...f, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(er => ({ ...er, [e.target.name]: '' }))
    if (errors.general)        setErrors(er => ({ ...er, general: '' }))
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">

        <div className="auth-card__logo-wrap">
          <Link to="/" className="auth-card__brand">
            <i className="fas fa-shopping-bag"></i>
            <span>NexCart</span>
          </Link>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('login')}
          >
            Login
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => switchMode('signup')}
          >
            Create Account
          </button>
        </div>

        <div className="auth-heading">
          {mode === 'login' ? (
            <>
              <h2>Login to your account</h2>
              <p>Welcome back! Enter your details below.</p>
            </>
          ) : (
            <>
              <h2>Create your account</h2>
              <p>Join NexCart — it's free and takes 30 seconds.</p>
            </>
          )}
        </div>

        <GoogleLoginBtn />

        <div className="auth-divider">
          <span>{mode === 'login' ? 'or login with email' : 'or sign up with email'}</span>
        </div>

        {errors.general && (
          <div className="auth-error-banner">
            <i className="fas fa-exclamation-circle"></i> {errors.general}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form" noValidate>
            <div className={`form-group ${errors.email ? 'form-group--error' : ''}`}>
              <label>Email Address</label>
              <div className="input-icon-wrap">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleChange(setLoginForm)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className={`form-group ${errors.password ? 'form-group--error' : ''}`}>
              <div className="form-group__label-row">
                <label>Password</label>
                <Link to="/forgot-password" className="auth-forgot">Forgot password?</Link>
              </div>
              <div className="input-icon-wrap">
                <i className="fas fa-lock"></i>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={loginForm.password}
                  onChange={handleChange(setLoginForm)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" className="input-toggle-pass" onClick={() => setShowPass(s => !s)}>
                  <i className={`fas fa-eye${showPass ? '-slash' : ''}`}></i>
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Signing in...</>
                : <><i className="fas fa-sign-in-alt"></i> Sign In</>
              }
            </button>
          </form>
        )}

        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="auth-form" noValidate>
            <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
              <label>Full Name</label>
              <div className="input-icon-wrap">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  name="name"
                  value={signupForm.name}
                  onChange={handleChange(setSignupForm)}
                  placeholder="Your full name"
                  autoComplete="name"
                  autoFocus
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
                  value={signupForm.email}
                  onChange={handleChange(setSignupForm)}
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
                  value={signupForm.password}
                  onChange={handleChange(setSignupForm)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
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
                  name="confirm"
                  value={signupForm.confirm}
                  onChange={handleChange(setSignupForm)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                />
              </div>
              {errors.confirm && <span className="form-error">{errors.confirm}</span>}
            </div>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading
                ? <><i className="fas fa-spinner fa-spin"></i> Creating account...</>
                : <><i className="fas fa-user-plus"></i> Create Account</>
              }
            </button>
          </form>
        )}

        <p className="auth-switch">
          {mode === 'login'
            ? <>New to NexCart? <button className="auth-switch-btn" onClick={() => switchMode('signup')}>Create Account</button></>
            : <>Already have an account? <button className="auth-switch-btn" onClick={() => switchMode('login')}>Login</button></>
          }
        </p>

      </div>
    </div>
  )
}

export default Auth
