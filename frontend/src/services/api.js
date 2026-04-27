// src/services/api.js

import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// src/utils/formatters.js

export function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString()
}

export function getCategoryIcon(category) {
  const icons = {
    fitness: '💪',
    finance: '💰',
    food: '🍽️',
    travel: '✈️',
    fashion: '👗',
    mindset: '🧠',
    tech: '💻',
    music: '🎵',
    film: '🎬',
    general: '📚'
  }
  return icons[category] || '📚'
}

export function getCategoryColor(category) {
  const colors = {
    fitness: 'from-red-500 to-orange-500',
    finance: 'from-green-500 to-emerald-500',
    food: 'from-orange-500 to-yellow-500',
    travel: 'from-blue-500 to-cyan-500',
    fashion: 'from-pink-500 to-rose-500',
    mindset: 'from-purple-500 to-indigo-500',
    tech: 'from-cyan-500 to-blue-500',
    music: 'from-purple-500 to-pink-500',
    film: 'from-indigo-500 to-purple-500',
    general: 'from-slate-500 to-slate-700'
  }
  return colors[category] || 'from-slate-500 to-slate-700'
}
