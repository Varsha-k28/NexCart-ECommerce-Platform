import React, { useEffect } from 'react'
import './Toast.css'

const Toast = ({ message, type = 'info', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const icons = {
    success: 'fas fa-check-circle',
    error:   'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info:    'fas fa-info-circle',
  }

  return (
    <div className={`toast toast--${type}`} role="alert">
      <i className={icons[type]}></i>
      <span>{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">
        <i className="fas fa-times"></i>
      </button>
    </div>
  )
}

export default Toast
