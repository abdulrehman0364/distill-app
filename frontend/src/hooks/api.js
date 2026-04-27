// src/hooks/useAuth.js

import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Optionally verify token
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email) => {
    try {
      // In a real app, this would verify the email magic link
      // For now, mock it
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

// src/hooks/useReels.js

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export function useReels(page = 1, limit = 20, category = null) {
  return useQuery({
    queryKey: ['reels', page, limit, category],
    queryFn: async () => {
      const { data } = await api.get('/reels', {
        params: { page, limit, category }
      })
      return data
    },
    staleTime: 5 * 60 * 1000
  })
}

export function useReelDetail(reelId) {
  return useQuery({
    queryKey: ['reel', reelId],
    queryFn: async () => {
      const { data } = await api.get(`/reels/${reelId}`)
      return data
    },
    enabled: !!reelId
  })
}

export function useAddReel() {
  return useMutation({
    mutationFn: async (url) => {
      const { data } = await api.post('/reels', { url })
      return data
    }
  })
}

// src/hooks/useCollections.js

import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '../services/api'

export function useCollections() {
  return useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data } = await api.get('/collections')
      return data.collections
    }
  })
}

export function useCreateCollection() {
  return useMutation({
    mutationFn: async (title, description) => {
      const { data } = await api.post('/collections', { title, description })
      return data
    }
  })
}

export function useAddReelToCollection() {
  return useMutation({
    mutationFn: async ({ collectionId, reelId }) => {
      const { data } = await api.post(`/collections/${collectionId}/reels`, {
        reel_id: reelId
      })
      return data
    }
  })
}

// src/hooks/useSearch.js

import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

export function useSearch(query) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query) return { results: [] }
      const { data } = await api.get('/search', {
        params: { q: query }
      })
      return data
    },
    enabled: !!query
  })
}
