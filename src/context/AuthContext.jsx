import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const BACKEND_URL = 'https://soundbridg-backend.onrender.com'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sb_token')
    const savedUser = localStorage.getItem('sb_user')
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('sb_token', data.token)
    localStorage.setItem('sb_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const register = async (email, password, name) => {
    // Backend requires `username`. If the register form only gave us a display
    // name, derive a username from it (or fall back to the email prefix).
    const username = (name || '').trim() || (email.split('@')[0] || '').trim()
    const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username, name: name || username })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('sb_token', data.token)
    localStorage.setItem('sb_user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('sb_token')
    localStorage.removeItem('sb_user')
    setUser(null)
  }

  const getToken = () => localStorage.getItem('sb_token')

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, getToken, BACKEND_URL }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
