import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email) => {
    try {
      const token = `mock-token-${Date.now()}`
      localStorage.setItem('token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser({ email, id: 'user-1' })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  return { user, loading, login }
}
