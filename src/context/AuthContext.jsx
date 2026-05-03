import React, { createContext, useContext, useState, useEffect, useRef } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)
  const reloadCartRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (token) localStorage.setItem('token', token)
    setTimeout(() => reloadCartRef.current?.(), 100)
  }

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    setUser(merged)
    localStorage.setItem('user', JSON.stringify(merged))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setTimeout(() => reloadCartRef.current?.(), 100)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, reloadCartRef }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
