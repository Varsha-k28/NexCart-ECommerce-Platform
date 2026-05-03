import React, { useEffect, useRef, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { googleLogin } from '../services/api'

const GoogleLoginBtn = () => {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const btnRef      = useRef(null)
  const clientId    = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const [ready,   setReady]   = useState(false)
  const [gError,  setGError]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true)
    setGError('')
    try {
      const res = await googleLogin({ credential: response.credential })
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setGError(err.response?.data?.message || 'Google login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }, [login, navigate])

  useEffect(() => {
    if (!clientId) return

    let attempts = 0
    const tryInit = () => {
      attempts++
      if (window.google?.accounts?.id) {
        setReady(true)
      } else if (attempts < 30) {
        setTimeout(tryInit, 100)
      } else {
        setGError('Google script failed to load. Check internet connection.')
      }
    }
    tryInit()
  }, [clientId])

  useEffect(() => {
    if (!ready || !clientId || !btnRef.current) return
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback:  handleCredentialResponse,
        ux_mode:   'popup',
      })
      window.google.accounts.id.renderButton(btnRef.current, {
        theme:          'outline',
        size:           'large',
        width:          360,
        text:           'signin_with',
        shape:          'rectangular',
        logo_alignment: 'left',
      })
    } catch (err) {
      setGError('Google init error: ' + err.message)
    }
  }, [ready, clientId, handleCredentialResponse])

  if (!clientId) {
    return (
      <div className="google-not-configured">
        <i className="fab fa-google"></i>
        <div>
          <strong>Restart required</strong>
          <span>Stop Vite and run <code>npm run dev</code> again to load .env</span>
        </div>
      </div>
    )
  }

  if (gError) {
    return (
      <div className="google-error">
        <i className="fas fa-exclamation-circle"></i> {gError}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="google-loading">
        <i className="fas fa-spinner fa-spin"></i> Signing in with Google...
      </div>
    )
  }

  return (
    <div className="google-btn-wrap">
      {!ready && (
        <div className="google-loading">
          <i className="fas fa-spinner fa-spin"></i> Loading Google...
        </div>
      )}
      <div
        ref={btnRef}
        style={{ width: '100%', minHeight: ready ? '44px' : '0' }}
      ></div>
    </div>
  )
}

export default GoogleLoginBtn
