import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from '../components/Toast/Toast'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(t => t.filter(toast => toast.id !== id))
  }, [])

  const toast = {
    success: (msg, dur)  => showToast(msg, 'success', dur),
    error:   (msg, dur)  => showToast(msg, 'error',   dur),
    warning: (msg, dur)  => showToast(msg, 'warning', dur),
    info:    (msg, dur)  => showToast(msg, 'info',    dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast
            key={t.id}
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
