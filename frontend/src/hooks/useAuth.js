import { create } from 'zustand'
import { supabase } from '../services/supabase'
import { api } from '../services/api'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading })
}))

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()

  const refreshUser = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      setUser(session.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      localStorage.setItem('token', session.access_token)
    } else {
      setUser(null)
      setLoading(false)
    }
  }

  const login = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin
        }
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('token')
    setUser(null)
  }

  // Handle auth state changes
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      setUser(session.user)
      api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`
      localStorage.setItem('token', session.access_token)
    } else {
      setUser(null)
    }
    setLoading(false)
  })

  return { user, loading, login, logout, refreshUser }
}
